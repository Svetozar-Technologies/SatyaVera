import { validatePaymentVerification } from "razorpay/dist/utils/razorpay-utils";
import { razorpay, PLANS, type PlanKey } from "@/lib/payments/razorpay";
import { adminDb } from "@/lib/firebase/admin";
import { authRequired, apiError, apiResponse } from "@/lib/api/helpers";
import { FieldValue } from "firebase-admin/firestore";
import type { DecodedIdToken } from "firebase-admin/auth";

export async function POST(req: Request) {
  try {
    const auth = await authRequired(req);
    if (auth instanceof Response) return auth;
    const decoded = auth as DecodedIdToken;

    if (!razorpay || !process.env.RAZORPAY_KEY_SECRET) {
      return apiError("Payment service is not configured", 503);
    }

    const body = await req.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body as {
      razorpay_order_id: string;
      razorpay_payment_id: string;
      razorpay_signature: string;
    };

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return apiError("Missing payment verification parameters");
    }

    // Verify signature using Razorpay's official utility
    const isValid = validatePaymentVerification(
      { order_id: razorpay_order_id, payment_id: razorpay_payment_id },
      razorpay_signature,
      process.env.RAZORPAY_KEY_SECRET
    );

    if (!isValid) {
      return apiError("Payment verification failed: invalid signature", 400);
    }

    // Fetch the order to get plan details from notes
    const order = await razorpay.orders.fetch(razorpay_order_id);
    const notes = order.notes as Record<string, string>;
    const planKey = notes.plan as PlanKey;
    const billing = notes.billing as "monthly" | "yearly";

    if (!planKey || !(planKey in PLANS)) {
      return apiError("Invalid plan in order", 400);
    }

    // Calculate subscription period
    const now = new Date();
    const periodEnd = new Date(now);
    if (billing === "yearly") {
      periodEnd.setFullYear(periodEnd.getFullYear() + 1);
    } else {
      periodEnd.setMonth(periodEnd.getMonth() + 1);
    }

    // Update Firestore subscription
    await adminDb
      .collection("subscriptions")
      .doc(decoded.uid)
      .set(
        {
          plan: planKey,
          status: "active",
          razorpaySubscriptionId: razorpay_payment_id,
          razorpayOrderId: razorpay_order_id,
          currentPeriodStart: FieldValue.serverTimestamp(),
          currentPeriodEnd: periodEnd,
          billingCycle: billing,
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true }
      );

    return apiResponse({ success: true, plan: planKey });
  } catch (error) {
    console.error("Payment verification error:", error);
    return apiError("Failed to verify payment", 500);
  }
}
