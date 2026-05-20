import { razorpay, PLANS, type PlanKey, type BillingCycle } from "@/lib/payments/razorpay";
import { authRequired, apiError, apiResponse } from "@/lib/api/helpers";
import { rateLimit } from "@/lib/api/rate-limiter";
import type { DecodedIdToken } from "firebase-admin/auth";

export async function POST(req: Request) {
  try {
    const auth = await authRequired(req);
    if (auth instanceof Response) return auth;
    const decoded = auth as DecodedIdToken;

    // Rate limit: max 3 payment order creations per minute per user
    const { allowed } = rateLimit(`payments-create-order-${decoded.uid}`, 3);
    if (!allowed) return apiError("Too many requests", 429);

    if (!razorpay) {
      return apiError("Payment service is not configured", 503);
    }

    const body = await req.json();
    const { plan, billing } = body as { plan: string; billing: string };

    if (!plan || !billing) {
      return apiError("Plan and billing cycle are required");
    }

    if (!(plan in PLANS)) {
      return apiError("Invalid plan. Choose CITIZEN_PREMIUM or LAWYER_PRO");
    }

    if (billing !== "monthly" && billing !== "yearly") {
      return apiError("Invalid billing cycle. Choose monthly or yearly");
    }

    const planKey = plan as PlanKey;
    const billingCycle = billing as BillingCycle;
    const planConfig = PLANS[planKey];
    const amount =
      billingCycle === "monthly" ? planConfig.monthlyAmount : planConfig.yearlyAmount;

    const order = await razorpay.orders.create({
      amount,
      currency: planConfig.currency,
      receipt: `${decoded.uid}_${planKey}_${Date.now()}`,
      notes: {
        userId: decoded.uid,
        plan: planKey,
        billing: billingCycle,
      },
    });

    return apiResponse({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error("Create order error:", error);
    return apiError("Failed to create payment order", 500);
  }
}
