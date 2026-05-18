"use client";

import { useI18n } from "@/lib/i18n/context";
import { AppNav } from "@/components/layout/app-nav";
import { Sidebar, citizenSidebar } from "@/components/layout/sidebar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { Icon } from "@/components/ui/icons";
import { Field } from "@/components/ui/field";
import { useState } from "react";

const steps = [
  { id: 1, label: "Choose Type" },
  { id: 2, label: "Fill Details" },
  { id: 3, label: "AI Review" },
  { id: 4, label: "Download" },
];

const documentTypes = [
  { label: "FIR (First Information Report)", value: "fir", icon: "flag" as const },
  { label: "RTI Application", value: "rti", icon: "eye" as const },
  { label: "Consumer Complaint", value: "consumer", icon: "scale" as const },
  { label: "Legal Notice", value: "notice", icon: "doc" as const },
  { label: "Police Complaint", value: "police", icon: "siren" as const },
  { label: "Affidavit", value: "affidavit", icon: "paper" as const },
];

export default function DrafterPage() {
  const { t } = useI18n();
  const [currentStep, setCurrentStep] = useState(2);
  const [docType, setDocType] = useState("fir");
  const [formData, setFormData] = useState({
    complainantName: "Aarav Sharma",
    fatherName: "Rajesh Sharma",
    address: "B-42, Vasant Vihar, New Delhi - 110057",
    phone: "9876543210",
    policeStation: "Vasant Vihar Police Station",
    incidentDate: "2026-05-15",
    incidentTime: "22:30",
    incidentPlace: "Near B-Block Market, Vasant Vihar",
    accusedName: "Unknown persons (2 males)",
    description:
      "On the night of 15th May 2026, at approximately 10:30 PM, while I was returning home from the market, two unknown males snatched my mobile phone (iPhone 15, IMEI: 123456789012345) and wallet containing Rs. 5,000 cash, 2 credit cards, and my Aadhaar card near B-Block Market, Vasant Vihar. The accused fled on a black motorcycle.",
  });

  const updateField = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
  };

  return (
    <div className="min-h-screen bg-bone">
      <AppNav role="citizen" name="Aarav" />
      <div className="flex min-h-[calc(100vh-64px)]">
        <Sidebar items={citizenSidebar} active="docs" />
        <main className="flex-1 p-7 md:px-10 bg-bone overflow-auto">
          {/* Header */}
          <div className="mb-5">
            <h1 className="text-xl font-serif font-bold text-navy-900 mb-1">
              Document Drafter
            </h1>
            <p className="text-sm text-ink-500">
              AI-powered drafting for FIRs, RTIs, complaints, and legal notices
            </p>
          </div>

          {/* Stepper */}
          <div className="flex items-center gap-1 mb-7 max-w-xl">
            {steps.map((step, idx) => (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                      step.id < currentStep
                        ? "bg-green-600 text-white"
                        : step.id === currentStep
                        ? "bg-navy-700 text-white"
                        : "bg-ink-100 text-ink-400"
                    }`}
                  >
                    {step.id < currentStep ? (
                      <Icon name="check" size={14} />
                    ) : (
                      step.id
                    )}
                  </div>
                  <span
                    className={`text-xs font-medium whitespace-nowrap ${
                      step.id === currentStep
                        ? "text-navy-700 font-semibold"
                        : step.id < currentStep
                        ? "text-green-700"
                        : "text-ink-400"
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
                {idx < steps.length - 1 && (
                  <div
                    className={`flex-1 h-[2px] mx-3 rounded ${
                      step.id < currentStep ? "bg-green-400" : "bg-ink-100"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Document Type Pills (Step 1 visible) */}
          <div className="flex gap-2 flex-wrap mb-5">
            {documentTypes.map((dt) => (
              <Chip
                key={dt.value}
                variant={docType === dt.value ? "navy" : "default"}
                className="cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => setDocType(dt.value)}
              >
                <Icon name={dt.icon} size={12} />
                {dt.label}
              </Chip>
            ))}
          </div>

          {/* Two-column: Form + Preview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Form */}
            <Card className="p-5">
              <h2 className="font-semibold text-sm text-ink-900 mb-4 flex items-center gap-2">
                <Icon name="edit" size={14} className="text-navy-700" />
                FIR Details
              </h2>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <Field
                    label="Complainant Name"
                    value={formData.complainantName}
                    onChange={updateField("complainantName")}
                  />
                  <Field
                    label="Father's / Husband's Name"
                    value={formData.fatherName}
                    onChange={updateField("fatherName")}
                  />
                </div>

                <Field
                  label="Address"
                  value={formData.address}
                  onChange={updateField("address")}
                />

                <div className="grid grid-cols-2 gap-3">
                  <Field
                    label="Phone Number"
                    type="tel"
                    value={formData.phone}
                    onChange={updateField("phone")}
                  />
                  <Field
                    label="Police Station"
                    value={formData.policeStation}
                    onChange={updateField("policeStation")}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Field
                    label="Date of Incident"
                    type="date"
                    value={formData.incidentDate}
                    onChange={updateField("incidentDate")}
                  />
                  <Field
                    label="Time of Incident"
                    type="time"
                    value={formData.incidentTime}
                    onChange={updateField("incidentTime")}
                  />
                </div>

                <Field
                  label="Place of Incident"
                  value={formData.incidentPlace}
                  onChange={updateField("incidentPlace")}
                />

                <Field
                  label="Name/Description of Accused"
                  value={formData.accusedName}
                  onChange={updateField("accusedName")}
                />

                <Field
                  label="Description of Incident"
                  textarea
                  rows={5}
                  value={formData.description}
                  onChange={updateField("description")}
                  hint="Be as detailed as possible. Include items stolen/damaged, vehicle details, etc."
                />
              </div>

              <div className="flex gap-3 mt-5 pt-4 border-t border-ink-100">
                <Button variant="ghost" size="sm" onClick={() => setCurrentStep(1)}>
                  Back
                </Button>
                <Button variant="primary" size="sm" onClick={() => setCurrentStep(3)}>
                  <Icon name="sparkles" size={14} />
                  Generate with AI
                </Button>
              </div>
            </Card>

            {/* Live Preview */}
            <div>
              <Card className="p-5 sticky top-24">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold text-sm text-ink-900 flex items-center gap-2">
                    <Icon name="eye" size={14} className="text-saffron-600" />
                    Live Preview
                  </h2>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm">
                      <Icon name="download" size={13} />
                      PDF
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Icon name="paper" size={13} />
                      Word
                    </Button>
                  </div>
                </div>

                {/* FIR Preview Document */}
                <div className="bg-white border border-ink-200 rounded-lg p-6 font-serif text-[12.5px] leading-relaxed">
                  <div className="text-center mb-4">
                    <p className="font-bold text-sm uppercase tracking-wide">
                      First Information Report (FIR)
                    </p>
                    <p className="text-[11px] text-ink-500">
                      Under Section 154 of the Code of Criminal Procedure, 1973
                    </p>
                  </div>

                  <div className="border-t border-ink-200 pt-3 space-y-2">
                    <div className="grid grid-cols-2 gap-x-3">
                      <p>
                        <strong>Police Station:</strong> {formData.policeStation}
                      </p>
                      <p>
                        <strong>Date:</strong>{" "}
                        {new Date(formData.incidentDate).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </p>
                    </div>

                    <div className="border-t border-ink-100 pt-2">
                      <p className="font-bold text-[11px] uppercase text-ink-500 mb-1">
                        Complainant Details
                      </p>
                      <p>
                        <strong>Name:</strong> {formData.complainantName}
                      </p>
                      <p>
                        <strong>S/o / D/o / W/o:</strong> {formData.fatherName}
                      </p>
                      <p>
                        <strong>Address:</strong> {formData.address}
                      </p>
                      <p>
                        <strong>Phone:</strong> {formData.phone}
                      </p>
                    </div>

                    <div className="border-t border-ink-100 pt-2">
                      <p className="font-bold text-[11px] uppercase text-ink-500 mb-1">
                        Incident Details
                      </p>
                      <p>
                        <strong>Date & Time:</strong>{" "}
                        {new Date(formData.incidentDate).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}{" "}
                        at {formData.incidentTime}
                      </p>
                      <p>
                        <strong>Place:</strong> {formData.incidentPlace}
                      </p>
                      <p>
                        <strong>Accused:</strong> {formData.accusedName}
                      </p>
                    </div>

                    <div className="border-t border-ink-100 pt-2">
                      <p className="font-bold text-[11px] uppercase text-ink-500 mb-1">
                        Statement
                      </p>
                      <p className="whitespace-pre-wrap">{formData.description}</p>
                    </div>

                    <div className="border-t border-ink-100 pt-3 mt-3">
                      <div className="grid grid-cols-2 gap-3 text-[11px]">
                        <div>
                          <p className="text-ink-400">Signature of Complainant</p>
                          <div className="border-b border-ink-300 mt-6 w-32" />
                        </div>
                        <div>
                          <p className="text-ink-400">Signature of SHO</p>
                          <div className="border-b border-ink-300 mt-6 w-32" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* AI Suggestions */}
                <div className="bg-saffron-50 border border-saffron-100 rounded-lg p-3 mt-4">
                  <p className="text-[11px] text-saffron-700 flex items-start gap-2">
                    <Icon name="sparkles" size={13} className="flex-shrink-0 mt-0.5" />
                    <span>
                      <strong>AI Tip:</strong> Consider mentioning the IMEI number of the
                      phone separately and any CCTV cameras in the area. This will help
                      police trace the device.
                    </span>
                  </p>
                </div>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
