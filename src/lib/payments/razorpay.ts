import Razorpay from "razorpay";

if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  console.warn("Razorpay keys not configured. Payment features will be unavailable.");
}

export const razorpay =
  process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET
    ? new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
      })
    : null;

export const PLANS = {
  CITIZEN_PREMIUM: {
    name: "Citizen Premium",
    monthlyAmount: 9900, // paise (Rs. 99)
    yearlyAmount: 99900, // paise (Rs. 999)
    currency: "INR",
  },
  LAWYER_PRO: {
    name: "Lawyer Pro",
    monthlyAmount: 49900, // paise (Rs. 499)
    yearlyAmount: 499900, // paise (Rs. 4,999)
    currency: "INR",
  },
} as const;

export type PlanKey = keyof typeof PLANS;
export type BillingCycle = "monthly" | "yearly";
