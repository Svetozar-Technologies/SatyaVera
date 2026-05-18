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

const settingsNav = [
  { id: "profile", label: "Profile", icon: "user" as const },
  { id: "language", label: "Language & Region", icon: "book" as const },
  { id: "emergency", label: "Emergency Contact", icon: "siren" as const },
  { id: "notifications", label: "Notifications", icon: "bell" as const },
  { id: "privacy", label: "Privacy & Data", icon: "lock" as const },
  { id: "subscription", label: "Subscription", icon: "star" as const },
];

export default function SettingsPage() {
  const { t } = useI18n();
  const [activeSection, setActiveSection] = useState("profile");
  const [profile, setProfile] = useState({
    fullName: "Aarav Sharma",
    email: "aarav.sharma@gmail.com",
    phone: "+91 98765 43210",
    city: "New Delhi",
    state: "Delhi",
    pincode: "110057",
    gender: "Male",
    dob: "1995-03-15",
  });
  const [language, setLanguage] = useState("en");
  const [emergency, setEmergency] = useState({
    name: "Meera Sharma",
    relation: "Mother",
    phone: "+91 98765 12345",
    altPhone: "",
  });
  const [notifications, setNotifications] = useState({
    email: true,
    sms: true,
    push: false,
    newsletter: true,
    quizReminders: true,
    lawyerUpdates: false,
  });

  const updateProfile = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setProfile((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const updateEmergency = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setEmergency((prev) => ({ ...prev, [field]: e.target.value }));
  };

  return (
    <div className="min-h-screen bg-bone">
      <AppNav role="citizen" name="Aarav" />
      <div className="flex min-h-[calc(100vh-64px)]">
        <Sidebar items={citizenSidebar} active="set" />
        <main className="flex-1 p-7 md:px-10 bg-bone overflow-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-xl font-serif font-bold text-navy-900 mb-1">
              Settings
            </h1>
            <p className="text-sm text-ink-500">
              Manage your profile, preferences, and account settings
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
            {/* Settings Nav Sidebar */}
            <div className="lg:col-span-1">
              <Card className="p-3">
                <div className="space-y-0.5">
                  {settingsNav.map((item) => (
                    <button
                      key={item.id}
                      className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-md text-[13px] font-medium cursor-pointer transition-colors ${
                        activeSection === item.id
                          ? "bg-navy-50 text-navy-800 font-semibold"
                          : "text-ink-600 hover:bg-ink-50"
                      }`}
                      onClick={() => setActiveSection(item.id)}
                    >
                      <Icon name={item.icon} size={15} />
                      {item.label}
                    </button>
                  ))}
                </div>
              </Card>

              {/* Account Info */}
              <Card className="p-4 mt-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full bg-saffron-100 text-saffron-700 font-bold text-lg flex items-center justify-center">
                    A
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-ink-900">Aarav Sharma</p>
                    <p className="text-[11px] text-ink-400">Free Plan</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-ink-400">
                  <Icon name="pin" size={10} />
                  <span>New Delhi, India</span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-ink-400 mt-1">
                  <Icon name="doc" size={10} />
                  <span>Member since May 2026</span>
                </div>
              </Card>
            </div>

            {/* Settings Content */}
            <div className="lg:col-span-3">
              {/* Profile Section */}
              {activeSection === "profile" && (
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <h2 className="font-semibold text-base text-ink-900">
                        Profile Information
                      </h2>
                      <p className="text-xs text-ink-400 mt-0.5">
                        Update your personal details and contact information
                      </p>
                    </div>
                    <Chip variant="green" className="text-[10px]">
                      <Icon name="check" size={10} /> Verified
                    </Chip>
                  </div>

                  {/* Avatar */}
                  <div className="flex items-center gap-4 mb-6 pb-5 border-b border-ink-100">
                    <div className="w-20 h-20 rounded-full bg-saffron-100 text-saffron-700 font-bold text-2xl flex items-center justify-center">
                      A
                    </div>
                    <div>
                      <Button variant="ghost" size="sm">
                        <Icon name="upload" size={13} />
                        Upload Photo
                      </Button>
                      <p className="text-[10px] text-ink-400 mt-1">
                        JPG, PNG or GIF. Max 2MB.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <Field
                        label="Full Name"
                        value={profile.fullName}
                        onChange={updateProfile("fullName")}
                      />
                      <Field
                        label="Email Address"
                        type="email"
                        value={profile.email}
                        onChange={updateProfile("email")}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <Field
                        label="Phone Number"
                        type="tel"
                        value={profile.phone}
                        onChange={updateProfile("phone")}
                      />
                      <Field
                        label="Gender"
                        options={["Male", "Female", "Other", "Prefer not to say"]}
                        value={profile.gender}
                        onChange={updateProfile("gender")}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <Field
                        label="Date of Birth"
                        type="date"
                        value={profile.dob}
                        onChange={updateProfile("dob")}
                      />
                      <Field
                        label="City"
                        value={profile.city}
                        onChange={updateProfile("city")}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <Field
                        label="State"
                        options={[
                          "Delhi",
                          "Maharashtra",
                          "Karnataka",
                          "Tamil Nadu",
                          "Uttar Pradesh",
                          "Rajasthan",
                          "Gujarat",
                          "West Bengal",
                          "Other",
                        ]}
                        value={profile.state}
                        onChange={updateProfile("state")}
                      />
                      <Field
                        label="PIN Code"
                        value={profile.pincode}
                        onChange={updateProfile("pincode")}
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 mt-6 pt-4 border-t border-ink-100">
                    <Button variant="primary" size="sm">
                      Save Changes
                    </Button>
                    <Button variant="ghost" size="sm">
                      Cancel
                    </Button>
                  </div>
                </Card>
              )}

              {/* Language Section */}
              {activeSection === "language" && (
                <Card className="p-6">
                  <h2 className="font-semibold text-base text-ink-900 mb-1">
                    Language & Regional Preferences
                  </h2>
                  <p className="text-xs text-ink-400 mb-5">
                    Choose your preferred language for the interface and legal content
                  </p>

                  <div className="mb-6">
                    <h3 className="text-xs font-semibold text-ink-700 mb-3">
                      Interface Language
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {[
                        { code: "en", label: "English", native: "English" },
                        { code: "hi", label: "Hindi", native: "हिन्दी" },
                        { code: "ta", label: "Tamil", native: "தமிழ்" },
                        { code: "bn", label: "Bengali", native: "বাংলা" },
                        { code: "mr", label: "Marathi", native: "मराठी" },
                        { code: "te", label: "Telugu", native: "తెలుగు" },
                      ].map((lang) => (
                        <button
                          key={lang.code}
                          className={`p-3 rounded-lg border-2 text-left cursor-pointer transition-colors ${
                            language === lang.code
                              ? "border-navy-500 bg-navy-50"
                              : "border-ink-100 hover:border-ink-200"
                          }`}
                          onClick={() => setLanguage(lang.code)}
                        >
                          <p className="font-semibold text-sm text-ink-900">
                            {lang.native}
                          </p>
                          <p className="text-[11px] text-ink-400">{lang.label}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-ink-100 pt-5 mb-6">
                    <h3 className="text-xs font-semibold text-ink-700 mb-3">
                      Legal Content Language
                    </h3>
                    <p className="text-[12px] text-ink-500 mb-3">
                      GandhiAI will try to respond in this language and show legal
                      explanations accordingly
                    </p>
                    <Field
                      label="Preferred Language for Legal Content"
                      options={["English", "Hindi", "Bilingual (Hindi + English)"]}
                      value="Bilingual (Hindi + English)"
                      onChange={() => {}}
                    />
                  </div>

                  <div className="border-t border-ink-100 pt-5">
                    <h3 className="text-xs font-semibold text-ink-700 mb-3">
                      Region
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <Field
                        label="State / Union Territory"
                        options={[
                          "Delhi",
                          "Maharashtra",
                          "Karnataka",
                          "Tamil Nadu",
                          "Uttar Pradesh",
                          "Rajasthan",
                        ]}
                        value="Delhi"
                        onChange={() => {}}
                        hint="This helps us show state-specific laws and legal aid centres"
                      />
                      <Field
                        label="District"
                        value="South West Delhi"
                        onChange={() => {}}
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 mt-6 pt-4 border-t border-ink-100">
                    <Button variant="primary" size="sm">
                      Save Preferences
                    </Button>
                    <Button variant="ghost" size="sm">
                      Cancel
                    </Button>
                  </div>
                </Card>
              )}

              {/* Emergency Contact Section */}
              {activeSection === "emergency" && (
                <Card className="p-6">
                  <h2 className="font-semibold text-base text-ink-900 mb-1">
                    Emergency Contact
                  </h2>
                  <p className="text-xs text-ink-400 mb-5">
                    This person will be contacted when you use the Emergency SOS feature
                  </p>

                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                    <div className="flex items-start gap-2">
                      <Icon name="siren" size={14} className="text-red-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-[12px] font-semibold text-red-800 mb-0.5">
                          Important
                        </p>
                        <p className="text-[11px] text-red-700 leading-relaxed">
                          When you trigger Emergency SOS, SatyaVera will send your live
                          location and a distress message to your emergency contact via SMS.
                          Make sure these details are up to date.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <Field
                        label="Contact Name"
                        value={emergency.name}
                        onChange={updateEmergency("name")}
                        placeholder="Full name of emergency contact"
                      />
                      <Field
                        label="Relationship"
                        options={[
                          "Mother",
                          "Father",
                          "Spouse",
                          "Sibling",
                          "Friend",
                          "Other",
                        ]}
                        value={emergency.relation}
                        onChange={updateEmergency("relation")}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <Field
                        label="Primary Phone"
                        type="tel"
                        value={emergency.phone}
                        onChange={updateEmergency("phone")}
                      />
                      <Field
                        label="Alternate Phone (Optional)"
                        type="tel"
                        value={emergency.altPhone}
                        onChange={updateEmergency("altPhone")}
                        placeholder="+91 XXXXX XXXXX"
                      />
                    </div>
                  </div>

                  <div className="border-t border-ink-100 mt-6 pt-5">
                    <h3 className="text-xs font-semibold text-ink-700 mb-3">
                      Emergency Helplines
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        {
                          name: "Women Helpline",
                          number: "181",
                          desc: "24/7 toll-free",
                        },
                        {
                          name: "Police Emergency",
                          number: "112",
                          desc: "All emergencies",
                        },
                        {
                          name: "National Commission for Women",
                          number: "7827-170-170",
                          desc: "WhatsApp",
                        },
                        {
                          name: "Legal Aid (NALSA)",
                          number: "15100",
                          desc: "Free legal help",
                        },
                      ].map((helpline) => (
                        <Card key={helpline.name} className="p-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-[12px] font-semibold text-ink-800">
                                {helpline.name}
                              </p>
                              <p className="text-[10px] text-ink-400">{helpline.desc}</p>
                            </div>
                            <a
                              href={`tel:${helpline.number}`}
                              className="flex items-center gap-1 text-[12px] font-bold text-navy-700 hover:underline"
                            >
                              <Icon name="phone" size={11} />
                              {helpline.number}
                            </a>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-3 mt-6 pt-4 border-t border-ink-100">
                    <Button variant="primary" size="sm">
                      Save Emergency Contact
                    </Button>
                    <Button variant="ghost" size="sm">
                      Cancel
                    </Button>
                  </div>
                </Card>
              )}

              {/* Notifications Section */}
              {activeSection === "notifications" && (
                <Card className="p-6">
                  <h2 className="font-semibold text-base text-ink-900 mb-1">
                    Notification Preferences
                  </h2>
                  <p className="text-xs text-ink-400 mb-5">
                    Control how and when you receive notifications
                  </p>

                  <div className="space-y-4">
                    {[
                      {
                        key: "email",
                        label: "Email Notifications",
                        desc: "Receive updates about your queries and documents via email",
                      },
                      {
                        key: "sms",
                        label: "SMS Notifications",
                        desc: "Get important alerts and OTPs via text message",
                      },
                      {
                        key: "push",
                        label: "Push Notifications",
                        desc: "Browser notifications for real-time updates",
                      },
                      {
                        key: "newsletter",
                        label: "Weekly Legal Newsletter",
                        desc: "Curated legal news and rights awareness articles",
                      },
                      {
                        key: "quizReminders",
                        label: "Quiz Reminders",
                        desc: "Daily reminders to maintain your quiz streak",
                      },
                      {
                        key: "lawyerUpdates",
                        label: "Lawyer Consultation Updates",
                        desc: "Notifications about consultation bookings and messages",
                      },
                    ].map((notif) => (
                      <div
                        key={notif.key}
                        className="flex items-center justify-between py-3 border-b border-ink-50"
                      >
                        <div>
                          <p className="text-[13px] font-medium text-ink-800">
                            {notif.label}
                          </p>
                          <p className="text-[11px] text-ink-400">{notif.desc}</p>
                        </div>
                        <button
                          className={`w-10 h-5 rounded-full cursor-pointer transition-colors relative ${
                            notifications[notif.key as keyof typeof notifications]
                              ? "bg-navy-600"
                              : "bg-ink-200"
                          }`}
                          onClick={() =>
                            setNotifications((prev) => ({
                              ...prev,
                              [notif.key]: !prev[notif.key as keyof typeof prev],
                            }))
                          }
                        >
                          <div
                            className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                              notifications[notif.key as keyof typeof notifications]
                                ? "translate-x-5"
                                : "translate-x-0.5"
                            }`}
                          />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-3 mt-6 pt-4 border-t border-ink-100">
                    <Button variant="primary" size="sm">
                      Save Preferences
                    </Button>
                  </div>
                </Card>
              )}

              {/* Privacy Section */}
              {activeSection === "privacy" && (
                <Card className="p-6">
                  <h2 className="font-semibold text-base text-ink-900 mb-1">
                    Privacy & Data
                  </h2>
                  <p className="text-xs text-ink-400 mb-5">
                    Control your data and privacy settings
                  </p>

                  <div className="space-y-5">
                    <div className="flex items-center justify-between py-3 border-b border-ink-50">
                      <div>
                        <p className="text-[13px] font-medium text-ink-800">
                          Save Chat History
                        </p>
                        <p className="text-[11px] text-ink-400">
                          Store your GandhiAI conversations for future reference
                        </p>
                      </div>
                      <button className="w-10 h-5 rounded-full cursor-pointer bg-navy-600 relative">
                        <div className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow translate-x-5" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between py-3 border-b border-ink-50">
                      <div>
                        <p className="text-[13px] font-medium text-ink-800">
                          Analytics & Improvement
                        </p>
                        <p className="text-[11px] text-ink-400">
                          Allow anonymized data to improve GandhiAI responses
                        </p>
                      </div>
                      <button className="w-10 h-5 rounded-full cursor-pointer bg-navy-600 relative">
                        <div className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow translate-x-5" />
                      </button>
                    </div>

                    <div>
                      <h3 className="text-xs font-semibold text-ink-700 mb-3">
                        Data Management
                      </h3>
                      <div className="space-y-3">
                        <Card className="p-3 flex items-center justify-between">
                          <div>
                            <p className="text-[12px] font-medium text-ink-800">
                              Download My Data
                            </p>
                            <p className="text-[10px] text-ink-400">
                              Export all your data in JSON format
                            </p>
                          </div>
                          <Button variant="ghost" size="sm">
                            <Icon name="download" size={13} />
                            Export
                          </Button>
                        </Card>
                        <Card className="p-3 flex items-center justify-between">
                          <div>
                            <p className="text-[12px] font-medium text-ink-800">
                              Clear Chat History
                            </p>
                            <p className="text-[10px] text-ink-400">
                              Delete all conversations with GandhiAI
                            </p>
                          </div>
                          <Button variant="danger" size="sm">
                            <Icon name="fire" size={13} />
                            Clear
                          </Button>
                        </Card>
                        <Card className="p-3 flex items-center justify-between border-red-100">
                          <div>
                            <p className="text-[12px] font-medium text-red-700">
                              Delete Account
                            </p>
                            <p className="text-[10px] text-ink-400">
                              Permanently delete your account and all data
                            </p>
                          </div>
                          <Button variant="danger" size="sm">
                            Delete Account
                          </Button>
                        </Card>
                      </div>
                    </div>
                  </div>
                </Card>
              )}

              {/* Subscription Section */}
              {activeSection === "subscription" && (
                <Card className="p-6">
                  <h2 className="font-semibold text-base text-ink-900 mb-1">
                    Subscription
                  </h2>
                  <p className="text-xs text-ink-400 mb-5">
                    Manage your plan and billing
                  </p>

                  <Card className="p-5 border-2 border-ink-200 mb-5">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <Chip variant="default" className="text-[10px] mb-1">
                          Current Plan
                        </Chip>
                        <h3 className="font-serif font-bold text-lg text-ink-900">
                          Free Plan
                        </h3>
                      </div>
                      <p className="text-2xl font-bold text-ink-400">
                        Rs. 0<span className="text-xs font-normal">/month</span>
                      </p>
                    </div>
                    <div className="text-[12px] text-ink-500 space-y-1 mb-4">
                      <p className="flex items-center gap-2">
                        <Icon name="check" size={12} className="text-green-600" />5
                        GandhiAI queries per day
                      </p>
                      <p className="flex items-center gap-2">
                        <Icon name="check" size={12} className="text-green-600" />
                        Basic document templates
                      </p>
                      <p className="flex items-center gap-2">
                        <Icon name="check" size={12} className="text-green-600" />
                        Rights guides and quizzes
                      </p>
                    </div>
                    <Button variant="saffron" size="sm">
                      <Icon name="bolt" size={13} />
                      Upgrade to Pro &mdash; Rs. 149/month
                    </Button>
                  </Card>
                </Card>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
