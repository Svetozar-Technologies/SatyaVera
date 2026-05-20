import { validateWebhookSignature } from "razorpay/dist/utils/razorpay-utils";
import { adminDb } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";

export async function POST(req: Request) {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error("RAZORPAY_WEBHOOK_SECRET not configured");
      return Response.json({ error: "Webhook not configured" }, { status: 503 });
    }

    const rawBody = await req.text();
    const signature = req.headers.get("x-razorpay-signature");

    if (!signature) {
      return Response.json({ error: "Missing signature" }, { status: 400 });
    }

    // Verify webhook signature using Razorpay's official utility
    const isValid = validateWebhookSignature(rawBody, signature, webhookSecret);

    if (!isValid) {
      console.error("Webhook signature verification failed");
      return Response.json({ error: "Invalid signature" }, { status: 400 });
    }

    const event = JSON.parse(rawBody);
    const eventType = event.event as string;
    const payload = event.payload;

    switch (eventType) {
      case "payment.captured": {
        const payment = payload.payment?.entity;
        if (!payment) break;

        const notes = payment.notes as Record<string, string> | undefined;
        const userId = notes?.userId;
        if (!userId) {
          console.warn("payment.captured: no userId in notes, skipping");
          break;
        }

        const planKey = notes.plan;
        const billing = notes.billing || "monthly";

        const now = new Date();
        const periodEnd = new Date(now);
        if (billing === "yearly") {
          periodEnd.setFullYear(periodEnd.getFullYear() + 1);
        } else {
          periodEnd.setMonth(periodEnd.getMonth() + 1);
        }

        await adminDb
          .collection("subscriptions")
          .doc(userId)
          .set(
            {
              plan: planKey,
              status: "active",
              razorpaySubscriptionId: payment.id,
              razorpayOrderId: payment.order_id,
              currentPeriodStart: FieldValue.serverTimestamp(),
              currentPeriodEnd: periodEnd,
              billingCycle: billing,
              updatedAt: FieldValue.serverTimestamp(),
            },
            { merge: true }
          );

        console.log(`payment.captured: activated ${planKey} for user ${userId}`);
        break;
      }

      case "payment.failed": {
        const payment = payload.payment?.entity;
        if (!payment) break;

        const notes = payment.notes as Record<string, string> | undefined;
        const userId = notes?.userId;
        if (!userId) break;

        await adminDb
          .collection("subscriptions")
          .doc(userId)
          .set(
            {
              status: "past_due",
              updatedAt: FieldValue.serverTimestamp(),
            },
            { merge: true }
          );

        console.log(`payment.failed: marked past_due for user ${userId}`);
        break;
      }

      case "subscription.cancelled": {
        const subscription = payload.subscription?.entity;
        if (!subscription) break;

        const notes = subscription.notes as Record<string, string> | undefined;
        const userId = notes?.userId;
        if (!userId) break;

        await adminDb
          .collection("subscriptions")
          .doc(userId)
          .set(
            {
              status: "cancelled",
              cancelledAt: FieldValue.serverTimestamp(),
              updatedAt: FieldValue.serverTimestamp(),
            },
            { merge: true }
          );

        console.log(`subscription.cancelled: cancelled for user ${userId}`);
        break;
      }

      default:
        console.log(`Unhandled webhook event: ${eventType}`);
    }

    return Response.json({ status: "ok" });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return Response.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
