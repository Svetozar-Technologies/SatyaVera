"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n/context";
import { useAuth } from "@/contexts/auth-context";
import { assetPath } from "@/lib/assets";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icons";
import { Field } from "@/components/ui/field";

export default function LoginPage() {
  const { t } = useI18n();
  const { user, loading, error, clearError, signInEmail, signInGoogle } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setSubmitting(true);
    try {
      await signInEmail(email, password);
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogle = async () => {
    clearError();
    setSubmitting(true);
    try {
      await signInGoogle();
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
            <Image
              src={assetPath("/logo.svg")}
              alt="SatyaVera"
              width={36}
              height={36}
              className="object-contain brightness-0 invert"
              unoptimized
            />
            <span className="font-serif font-semibold text-xl tracking-[0.2px]">
              Satya<span className="text-saffron-400">Vera</span>
            </span>
          </Link>

          <h1 className="font-serif text-4xl font-semibold leading-[1.15] mb-4">
            {t("auth.justiceBegins")}
          </h1>
          <p className="text-white/70 text-base leading-relaxed max-w-sm mb-10">
            {t("auth.joinUsers")}
          </p>

          {/* Trust Badges */}
          <div className="flex flex-col gap-3 mb-12">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                <Icon name="shield" size={16} className="text-saffron-400" />
              </div>
              <span className="text-sm text-white/80">{t("auth.isoCertified")}</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                <Icon name="flag" size={16} className="text-saffron-400" />
              </div>
              <span className="text-sm text-white/80">{t("auth.dataHosted")}</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                <Icon name="info" size={16} className="text-saffron-400" />
              </div>
              <span className="text-sm text-white/80">{t("auth.noLegalAdvice")}</span>
            </div>
          </div>
        </div>

        {/* Testimonial */}
        <div className="border-t border-white/10 pt-6">
          <p className="text-white/60 text-sm italic leading-relaxed mb-3">
            {t("auth.testimonial")}
          </p>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-saffron-600 flex items-center justify-center text-xs font-bold">
              PM
            </div>
            <div>
              <div className="text-sm font-semibold">{t("auth.testimonialAuthor")}</div>
              <div className="text-xs text-white/50">Pune, Maharashtra</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-[1.1] bg-white px-8 lg:px-16 py-12 lg:py-16 flex items-center justify-center">
        <div className="max-w-md w-full">
          <h2 className="font-serif text-[28px] font-semibold text-navy-900 mb-1">
            {t("auth.loginTitle")}
          </h2>
          <p className="text-sm text-ink-500 mb-10">
            Sign in to your SatyaVera account to continue.
          </p>

          <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
            <Field
              label={t("auth.email")}
              placeholder="you@example.com or +91 98765 43210"
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <div className="flex flex-col gap-1">
              <Field
                label={t("auth.password")}
                placeholder="Enter your password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <div className="flex justify-end mt-1">
                <Link href="/forgot-password" className="text-xs text-navy-700 font-medium hover:underline">
                  Forgot password?
                </Link>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <Button
              variant="primary"
              size="lg"
              className="w-full justify-center mt-2"
              type="submit"
              disabled={submitting}
            >
              <Icon name="lock" size={16} />
              {submitting ? t("common.loading") : t("auth.loginBtn")}
            </Button>

            <div className="flex items-center gap-3 my-1">
              <div className="flex-1 h-px bg-ink-100" />
              <span className="text-xs text-ink-400 uppercase tracking-wider font-medium">or</span>
              <div className="flex-1 h-px bg-ink-100" />
            </div>

            <Button
              variant="ghost"
              size="lg"
              className="w-full justify-center"
              type="button"
              onClick={handleGoogle}
              disabled={submitting}
            >
              <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              {t("auth.continueGoogle")}
            </Button>

            <p className="text-sm text-ink-500 text-center mt-6">
              {t("auth.noAccount")}{" "}
              <Link href="/signup" className="text-navy-700 font-semibold hover:underline">
                {t("common.signUp")}
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
