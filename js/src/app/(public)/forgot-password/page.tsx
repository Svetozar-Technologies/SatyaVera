"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { resetPassword } from "@/lib/firebase/auth";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icons";
import { Field } from "@/components/ui/field";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setSubmitting(true);
    try {
      await resetPassword(email);
      setSuccess(true);
    } catch (err: unknown) {
      const code = (err as { code?: string }).code;
      if (code === "auth/user-not-found") {
        setError("No account found with this email address.");
      } else if (code === "auth/invalid-email") {
        setError("Please enter a valid email address.");
      } else {
        setError((err as Error).message || "Failed to send reset email.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Panel */}
      <div className="flex-1 bg-gradient-to-br from-navy-900 to-navy-700 text-white px-10 py-16 flex flex-col justify-between min-h-screen">
        <div>
          <Link href="/" className="flex items-center gap-2.5 mb-16">
            <Image src="/logo.png" alt="SatyaVera" width={36} height={36} className="object-contain brightness-0 invert" />
            <span className="font-serif font-semibold text-xl tracking-[0.2px]">
              Satya<span className="text-saffron-400">Vera</span>
            </span>
          </Link>

          <h1 className="font-serif text-4xl font-semibold leading-[1.15] mb-4">
            Justice begins
            <br />
            with knowing.
          </h1>
          <p className="text-white/70 text-base leading-relaxed max-w-sm mb-10">
            Join 47,000+ citizens and advocates using AI-powered legal awareness across India.
          </p>

          {/* Trust Badges */}
          <div className="flex flex-col gap-3 mb-12">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                <Icon name="shield" size={16} className="text-saffron-400" />
              </div>
              <span className="text-sm text-white/80">ISO 27001 Certified Security</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                <Icon name="flag" size={16} className="text-saffron-400" />
              </div>
              <span className="text-sm text-white/80">Data stored exclusively in India</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                <Icon name="info" size={16} className="text-saffron-400" />
              </div>
              <span className="text-sm text-white/80">No legal advice &mdash; information only</span>
            </div>
          </div>
        </div>

        {/* Testimonial */}
        <div className="border-t border-white/10 pt-6">
          <p className="text-white/60 text-sm italic leading-relaxed mb-3">
            &ldquo;SatyaVera helped me understand my tenant rights when my landlord refused
            to return my deposit. I knew exactly what to say at the consumer forum.&rdquo;
          </p>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-saffron-600 flex items-center justify-center text-xs font-bold">
              PM
            </div>
            <div>
              <div className="text-sm font-semibold">Priya M.</div>
              <div className="text-xs text-white/50">Pune, Maharashtra</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-[1.1] bg-white px-8 lg:px-16 py-12 lg:py-16 flex items-center justify-center">
        <div className="max-w-md w-full">
          <h2 className="font-serif text-[28px] font-semibold text-navy-900 mb-1">
            Reset your password
          </h2>
          <p className="text-sm text-ink-500 mb-10">
            Enter your email address and we&apos;ll send you a link to reset your password.
          </p>

          <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
            <Field
              label="Email"
              placeholder="you@example.com"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 text-sm text-green-700">
                Password reset email sent. Check your inbox.
              </div>
            )}

            <Button
              variant="primary"
              size="lg"
              className="w-full justify-center mt-2"
              type="submit"
              disabled={submitting}
            >
              <Icon name="mail" size={16} />
              {submitting ? "Sending..." : "Send Reset Link"}
            </Button>

            <p className="text-sm text-ink-500 text-center mt-6">
              Remember your password?{" "}
              <Link href="/login" className="text-navy-700 font-semibold hover:underline">
                Back to Login
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
