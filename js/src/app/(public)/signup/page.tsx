"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n/context";
import { useAuth } from "@/contexts/auth-context";
import { assetPath } from "@/lib/assets";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { Icon } from "@/components/ui/icons";
import { Field } from "@/components/ui/field";

const specializations = [
  "Criminal",
  "Civil",
  "Family",
  "Corporate",
  "Property",
  "Consumer",
  "Tax",
  "Labour",
  "Constitutional",
  "Cyber",
  "IP",
];

const defaultSelected = ["Criminal", "Family", "Property"];

export default function SignUpPage() {
  const { t } = useI18n();
  const { user, loading, error, clearError, signUpEmail, signInGoogle } = useAuth();
  const router = useRouter();

  const [tab, setTab] = useState<"citizen" | "advocate">("citizen");
  const [submitting, setSubmitting] = useState(false);

  // Citizen form fields
  const [citizenName, setCitizenName] = useState("");
  const [citizenMobile, setCitizenMobile] = useState("");
  const [citizenEmail, setCitizenEmail] = useState("");
  const [citizenPassword, setCitizenPassword] = useState("");
  const [citizenLanguage, setCitizenLanguage] = useState("English");
  const [citizenState, setCitizenState] = useState("Select State");
  const [citizenCity, setCitizenCity] = useState("Select City");

  // Advocate form fields
  const [advName, setAdvName] = useState("");
  const [advEmail, setAdvEmail] = useState("");
  const [advPassword, setAdvPassword] = useState("");
  const [advMobile, setAdvMobile] = useState("");
  const [advBarCouncil, setAdvBarCouncil] = useState("");
  const [advStateBarCouncil, setAdvStateBarCouncil] = useState("Select Bar Council");
  const [advYears, setAdvYears] = useState("Select Years");
  const [selectedSpecs, setSelectedSpecs] = useState<string[]>(defaultSelected);
  const [advCity, setAdvCity] = useState("Select City");
  const [advCourt, setAdvCourt] = useState("Select Court");

  useEffect(() => {
    if (!loading && user) {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  const toggleSpec = (spec: string) => {
    setSelectedSpecs((prev) =>
      prev.includes(spec) ? prev.filter((s) => s !== spec) : [...prev, spec]
    );
  };

  const handleCitizenSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setSubmitting(true);
    try {
      await signUpEmail(citizenEmail, citizenPassword, citizenName, {
        role: "CITIZEN",
        language: citizenLanguage,
        state: citizenState === "Select State" ? undefined : citizenState,
        city: citizenCity === "Select City" ? undefined : citizenCity,
        phone: citizenMobile,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleAdvocateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setSubmitting(true);
    try {
      await signUpEmail(advEmail, advPassword, advName, {
        role: "ADVOCATE",
        barCouncilNumber: advBarCouncil,
        yearsOfPractice: advYears !== "Select Years" ? parseInt(advYears) : undefined,
        specializations: selectedSpecs,
        city: advCity === "Select City" ? undefined : advCity,
        phone: advMobile,
      });
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
      <div className="flex-[1.1] bg-white px-8 lg:px-16 py-12 lg:py-16 overflow-y-auto">
        <div className="max-w-lg mx-auto">
          <h2 className="font-serif text-[28px] font-semibold text-navy-900 mb-1">
            {t("auth.createAccount")}
          </h2>
          <p className="text-sm text-ink-500 mb-8">
            {t("auth.alreadyHaveAccount")}{" "}
            <Link href="/login" className="text-navy-700 font-semibold hover:underline">
              {t("common.login")}
            </Link>
          </p>

          {/* Tab Switcher */}
          <div className="bg-ink-50 rounded-lg p-1 flex mb-8">
            <button
              onClick={() => { setTab("citizen"); clearError(); }}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-md transition-colors ${
                tab === "citizen"
                  ? "bg-white text-navy-900 shadow-sm"
                  : "text-ink-500 hover:text-ink-700"
              }`}
            >
              {t("auth.imCitizen")}
            </button>
            <button
              onClick={() => { setTab("advocate"); clearError(); }}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-md transition-colors ${
                tab === "advocate"
                  ? "bg-white text-navy-900 shadow-sm"
                  : "text-ink-500 hover:text-ink-700"
              }`}
            >
              {t("auth.imAdvocate")}
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700 mb-5">
              {error}
            </div>
          )}

          {/* Citizen Form */}
          {tab === "citizen" && (
            <form className="flex flex-col gap-5" onSubmit={handleCitizenSubmit}>
              <Field
                label={t("auth.fullName")}
                placeholder="Enter your full name"
                value={citizenName}
                onChange={(e) => setCitizenName(e.target.value)}
              />

              <Field
                label={t("auth.email")}
                placeholder="you@example.com"
                type="email"
                value={citizenEmail}
                onChange={(e) => setCitizenEmail(e.target.value)}
              />

              <Field
                label={t("auth.password")}
                placeholder="At least 6 characters"
                type="password"
                value={citizenPassword}
                onChange={(e) => setCitizenPassword(e.target.value)}
              />

              <div className="flex gap-3">
                <Field
                  label={t("auth.mobile")}
                  placeholder="+91 98765 43210"
                  prefix="+91"
                  className="flex-1"
                  value={citizenMobile}
                  onChange={(e) => setCitizenMobile(e.target.value)}
                />
                <div className="flex flex-col justify-end">
                  <Button variant="ghost" size="md" className="whitespace-nowrap mt-auto" type="button">
                    Send OTP
                  </Button>
                </div>
              </div>

              <div className="flex gap-3">
                <Field
                  label={t("settings.language")}
                  options={["English", "Hindi", "Marathi", "Tamil", "Bengali", "Kannada", "Telugu"]}
                  className="flex-1"
                  value={citizenLanguage}
                  onChange={(e) => setCitizenLanguage(e.target.value)}
                />
                <Field
                  label={t("auth.state")}
                  options={["Select State", "Maharashtra", "Delhi", "Karnataka", "Tamil Nadu", "Uttar Pradesh", "West Bengal"]}
                  className="flex-1"
                  value={citizenState}
                  onChange={(e) => setCitizenState(e.target.value)}
                />
                <Field
                  label={t("auth.city")}
                  options={["Select City", "Mumbai", "Delhi", "Bangalore", "Chennai", "Kolkata", "Pune"]}
                  className="flex-1"
                  value={citizenCity}
                  onChange={(e) => setCitizenCity(e.target.value)}
                />
              </div>

              <Button
                variant="primary"
                size="lg"
                className="w-full justify-center mt-2"
                type="submit"
                disabled={submitting}
              >
                {submitting ? t("common.loading") : t("auth.createCitizenAccount")}
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

              <p className="text-[11px] text-ink-400 text-center leading-relaxed mt-1">
                {t("auth.termsAgree")} {t("common.disclaimer")}
              </p>
            </form>
          )}

          {/* Advocate Form */}
          {tab === "advocate" && (
            <form className="flex flex-col gap-5" onSubmit={handleAdvocateSubmit}>
              <div className="flex gap-3">
                <Field
                  label={t("auth.fullName")}
                  placeholder="Adv. Full Name"
                  className="flex-1"
                  value={advName}
                  onChange={(e) => setAdvName(e.target.value)}
                />
                <Field
                  label={t("auth.email")}
                  placeholder="advocate@example.com"
                  type="email"
                  className="flex-1"
                  value={advEmail}
                  onChange={(e) => setAdvEmail(e.target.value)}
                />
              </div>

              <Field
                label={t("auth.password")}
                placeholder="At least 6 characters"
                type="password"
                value={advPassword}
                onChange={(e) => setAdvPassword(e.target.value)}
              />

              <div className="flex gap-3">
                <Field
                  label={t("auth.mobile")}
                  placeholder="+91 98765 43210"
                  prefix="+91"
                  className="flex-1"
                  value={advMobile}
                  onChange={(e) => setAdvMobile(e.target.value)}
                />
                <div className="flex flex-col justify-end">
                  <Button variant="ghost" size="md" className="whitespace-nowrap mt-auto" type="button">
                    Send OTP
                  </Button>
                </div>
              </div>

              <div className="flex gap-3">
                <Field
                  label={t("auth.barCouncil")}
                  placeholder="MH/1234/2020"
                  className="flex-1"
                  value={advBarCouncil}
                  onChange={(e) => setAdvBarCouncil(e.target.value)}
                />
                <Field
                  label={t("auth.stateBarCouncil")}
                  options={["Select Bar Council", "Bar Council of Maharashtra & Goa", "Bar Council of Delhi", "Bar Council of Karnataka", "Bar Council of Tamil Nadu", "Bar Council of UP"]}
                  className="flex-1"
                  value={advStateBarCouncil}
                  onChange={(e) => setAdvStateBarCouncil(e.target.value)}
                />
              </div>

              <Field
                label={t("auth.yearsOfPractice")}
                options={["Select Years", "0-2 years", "2-5 years", "5-10 years", "10-20 years", "20+ years"]}
                value={advYears}
                onChange={(e) => setAdvYears(e.target.value)}
              />

              {/* Specializations */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-ink-700">{t("auth.specializations")}</label>
                <div className="flex flex-wrap gap-2">
                  {specializations.map((spec) => (
                    <Chip
                      key={spec}
                      variant={selectedSpecs.includes(spec) ? "navy" : "default"}
                      className="cursor-pointer select-none"
                      onClick={() => toggleSpec(spec)}
                    >
                      {selectedSpecs.includes(spec) && (
                        <Icon name="check" size={12} />
                      )}
                      {spec}
                    </Chip>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <Field
                  label={t("auth.city")}
                  options={["Select City", "Mumbai", "Delhi", "Bangalore", "Chennai", "Kolkata", "Pune", "Hyderabad"]}
                  className="flex-1"
                  value={advCity}
                  onChange={(e) => setAdvCity(e.target.value)}
                />
                <Field
                  label={t("auth.courtOfPractice")}
                  options={["Select Court", "Supreme Court", "High Court", "District Court", "Sessions Court", "Tribunal", "Consumer Forum"]}
                  className="flex-1"
                  value={advCourt}
                  onChange={(e) => setAdvCourt(e.target.value)}
                />
              </div>

              {/* Upload Areas */}
              <div className="flex gap-3">
                <div className="flex-1 flex flex-col gap-1">
                  <label className="text-xs font-semibold text-ink-700">{t("auth.barCouncilUpload")}</label>
                  <div className="border-2 border-dashed border-ink-200 rounded-lg p-6 flex flex-col items-center gap-2 hover:border-navy-300 transition-colors cursor-pointer">
                    <Icon name="upload" size={24} className="text-ink-400" />
                    <span className="text-xs text-ink-500">Click to upload or drag & drop</span>
                    <span className="text-[10px] text-ink-400">{t("auth.uploadHint")}</span>
                  </div>
                </div>
                <div className="flex-1 flex flex-col gap-1">
                  <label className="text-xs font-semibold text-ink-700">{t("auth.govIdUpload")}</label>
                  <div className="border-2 border-dashed border-ink-200 rounded-lg p-6 flex flex-col items-center gap-2 hover:border-navy-300 transition-colors cursor-pointer">
                    <Icon name="upload" size={24} className="text-ink-400" />
                    <span className="text-xs text-ink-500">Click to upload or drag & drop</span>
                    <span className="text-[10px] text-ink-400">{t("auth.uploadHint")}</span>
                  </div>
                </div>
              </div>

              {/* Verification Note */}
              <div className="bg-saffron-50 border border-saffron-100 rounded-lg px-4 py-3 flex items-start gap-3">
                <Icon name="info" size={16} className="text-saffron-600 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-saffron-700 leading-relaxed">
                  {t("auth.verificationNote")}
                </p>
              </div>

              <Button
                variant="primary"
                size="lg"
                className="w-full justify-center mt-1"
                type="submit"
                disabled={submitting}
              >
                {submitting ? t("common.loading") : t("auth.submitVerification")}
              </Button>

              <p className="text-[11px] text-ink-400 text-center leading-relaxed mt-1">
                {t("auth.termsAgree")}
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
