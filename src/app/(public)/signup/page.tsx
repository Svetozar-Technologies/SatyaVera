"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useI18n } from "@/lib/i18n/context";
import { PublicNav } from "@/components/layout/public-nav";
import { Card } from "@/components/ui/card";
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
  const [tab, setTab] = useState<"citizen" | "advocate">("citizen");
  const [selectedSpecs, setSelectedSpecs] = useState<string[]>(defaultSelected);

  const toggleSpec = (spec: string) => {
    setSelectedSpecs((prev) =>
      prev.includes(spec) ? prev.filter((s) => s !== spec) : [...prev, spec]
    );
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
      <div className="flex-[1.1] bg-white px-8 lg:px-16 py-12 lg:py-16 overflow-y-auto">
        <div className="max-w-lg mx-auto">
          <h2 className="font-serif text-[28px] font-semibold text-navy-900 mb-1">
            Create your account
          </h2>
          <p className="text-sm text-ink-500 mb-8">
            Already have one?{" "}
            <Link href="/login" className="text-navy-700 font-semibold hover:underline">
              Login
            </Link>
          </p>

          {/* Tab Switcher */}
          <div className="bg-ink-50 rounded-lg p-1 flex mb-8">
            <button
              onClick={() => setTab("citizen")}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-md transition-colors ${
                tab === "citizen"
                  ? "bg-white text-navy-900 shadow-sm"
                  : "text-ink-500 hover:text-ink-700"
              }`}
            >
              I&apos;m a Citizen
            </button>
            <button
              onClick={() => setTab("advocate")}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-md transition-colors ${
                tab === "advocate"
                  ? "bg-white text-navy-900 shadow-sm"
                  : "text-ink-500 hover:text-ink-700"
              }`}
            >
              I&apos;m an Advocate
            </button>
          </div>

          {/* Citizen Form */}
          {tab === "citizen" && (
            <form className="flex flex-col gap-5" onSubmit={(e) => e.preventDefault()}>
              <Field label="Full Name" placeholder="Enter your full name" />

              <div className="flex gap-3">
                <Field label="Mobile Number" placeholder="+91 98765 43210" prefix="+91" className="flex-1" />
                <div className="flex flex-col justify-end">
                  <Button variant="ghost" size="md" className="whitespace-nowrap mt-auto">
                    Send OTP
                  </Button>
                </div>
              </div>

              <Field label="Email (optional)" placeholder="you@example.com" type="email" />

              <div className="flex gap-3">
                <Field
                  label="Language"
                  options={["English", "Hindi", "Marathi", "Tamil", "Bengali", "Kannada", "Telugu"]}
                  className="flex-1"
                />
                <Field
                  label="State"
                  options={["Select State", "Maharashtra", "Delhi", "Karnataka", "Tamil Nadu", "Uttar Pradesh", "West Bengal"]}
                  className="flex-1"
                />
                <Field
                  label="City"
                  options={["Select City", "Mumbai", "Delhi", "Bangalore", "Chennai", "Kolkata", "Pune"]}
                  className="flex-1"
                />
              </div>

              <Button variant="primary" size="lg" className="w-full justify-center mt-2">
                Create Citizen Account
              </Button>

              <div className="flex items-center gap-3 my-1">
                <div className="flex-1 h-px bg-ink-100" />
                <span className="text-xs text-ink-400 uppercase tracking-wider font-medium">or</span>
                <div className="flex-1 h-px bg-ink-100" />
              </div>

              <Button variant="ghost" size="lg" className="w-full justify-center">
                <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Continue with Google
              </Button>

              <p className="text-[11px] text-ink-400 text-center leading-relaxed mt-1">
                By creating an account, you agree to our{" "}
                <Link href="#" className="text-navy-700 underline">Terms of Service</Link> and{" "}
                <Link href="#" className="text-navy-700 underline">Privacy Policy</Link>.
                SatyaVera provides legal information, not legal advice.
              </p>
            </form>
          )}

          {/* Advocate Form */}
          {tab === "advocate" && (
            <form className="flex flex-col gap-5" onSubmit={(e) => e.preventDefault()}>
              <div className="flex gap-3">
                <Field label="Full Name" placeholder="Adv. Full Name" className="flex-1" />
                <Field label="Email" placeholder="advocate@example.com" type="email" className="flex-1" />
              </div>

              <div className="flex gap-3">
                <Field label="Mobile Number" placeholder="+91 98765 43210" prefix="+91" className="flex-1" />
                <div className="flex flex-col justify-end">
                  <Button variant="ghost" size="md" className="whitespace-nowrap mt-auto">
                    Send OTP
                  </Button>
                </div>
              </div>

              <div className="flex gap-3">
                <Field label="Bar Council Enrollment No." placeholder="MH/1234/2020" className="flex-1" />
                <Field
                  label="State Bar Council"
                  options={["Select Bar Council", "Bar Council of Maharashtra & Goa", "Bar Council of Delhi", "Bar Council of Karnataka", "Bar Council of Tamil Nadu", "Bar Council of UP"]}
                  className="flex-1"
                />
              </div>

              <Field
                label="Years of Practice"
                options={["Select Years", "0-2 years", "2-5 years", "5-10 years", "10-20 years", "20+ years"]}
              />

              {/* Specializations */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-ink-700">Specializations</label>
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
                  label="City"
                  options={["Select City", "Mumbai", "Delhi", "Bangalore", "Chennai", "Kolkata", "Pune", "Hyderabad"]}
                  className="flex-1"
                />
                <Field
                  label="Court of Practice"
                  options={["Select Court", "Supreme Court", "High Court", "District Court", "Sessions Court", "Tribunal", "Consumer Forum"]}
                  className="flex-1"
                />
              </div>

              {/* Upload Areas */}
              <div className="flex gap-3">
                <div className="flex-1 flex flex-col gap-1">
                  <label className="text-xs font-semibold text-ink-700">Bar Council ID Card</label>
                  <div className="border-2 border-dashed border-ink-200 rounded-lg p-6 flex flex-col items-center gap-2 hover:border-navy-300 transition-colors cursor-pointer">
                    <Icon name="upload" size={24} className="text-ink-400" />
                    <span className="text-xs text-ink-500">Click to upload or drag & drop</span>
                    <span className="text-[10px] text-ink-400">PDF, JPG, PNG (max 5MB)</span>
                  </div>
                </div>
                <div className="flex-1 flex flex-col gap-1">
                  <label className="text-xs font-semibold text-ink-700">Certificate of Practice</label>
                  <div className="border-2 border-dashed border-ink-200 rounded-lg p-6 flex flex-col items-center gap-2 hover:border-navy-300 transition-colors cursor-pointer">
                    <Icon name="upload" size={24} className="text-ink-400" />
                    <span className="text-xs text-ink-500">Click to upload or drag & drop</span>
                    <span className="text-[10px] text-ink-400">PDF, JPG, PNG (max 5MB)</span>
                  </div>
                </div>
              </div>

              {/* Verification Note */}
              <div className="bg-saffron-50 border border-saffron-100 rounded-lg px-4 py-3 flex items-start gap-3">
                <Icon name="info" size={16} className="text-saffron-600 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-saffron-700 leading-relaxed">
                  Your Bar Council credentials will be verified within 24&ndash;48 hours.
                  You&apos;ll receive full access to Lawyer Pro features once verification is complete.
                </p>
              </div>

              <Button variant="primary" size="lg" className="w-full justify-center mt-1">
                Submit for Verification
              </Button>

              <p className="text-[11px] text-ink-400 text-center leading-relaxed mt-1">
                By creating an account, you agree to our{" "}
                <Link href="#" className="text-navy-700 underline">Terms of Service</Link> and{" "}
                <Link href="#" className="text-navy-700 underline">Privacy Policy</Link>.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
