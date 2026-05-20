"use client";

import { useI18n } from "@/lib/i18n/context";
import { useProfile } from "@/hooks/use-profile";
import { useSubscription } from "@/hooks/use-subscription";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { Icon } from "@/components/ui/icons";
import { Field } from "@/components/ui/field";
import { useState, useEffect } from "react";

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
  const { profile: serverProfile, loading, saving, updateProfile: saveProfile } = useProfile();
  const { plan, isPremium, queriesUsed, queryLimit, loading: subLoading } = useSubscription();

  const [activeSection, setActiveSection] = useState("profile");
  const [profileForm, setProfileForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    city: "",
    state: "",
    pincode: "",
    gender: "",
    dob: "",
  });
  const [language, setLanguage] = useState("en");
  const [emergency, setEmergency] = useState({
    name: "",
    relation: "",
    phone: "",
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

  // Populate local state from server profile when it arrives
  useEffect(() => {
    if (serverProfile) {
      setProfileForm({
        fullName: serverProfile.name || "",
        email: serverProfile.email || "",
        phone: serverProfile.phone || "",
        city: serverProfile.city || "",
        state: serverProfile.state || "",
        pincode: serverProfile.pincode || "",
        gender: "",
        dob: "",
      });
      setLanguage(serverProfile.language || "en");
      if (serverProfile.emergencyContact) {
        setEmergency({
          name: serverProfile.emergencyContact.name || "",
          relation: serverProfile.emergencyContact.relation || "",
          phone: serverProfile.emergencyContact.phone || "",
          altPhone: serverProfile.emergencyContact.altPhone || "",
        });
      }
      if (serverProfile.notifications) {
        setNotifications({
          email: serverProfile.notifications.email ?? true,
          sms: serverProfile.notifications.sms ?? true,
          push: serverProfile.notifications.push ?? false,
          newsletter: serverProfile.notifications.newsletter ?? true,
          quizReminders: serverProfile.notifications.quizReminders ?? true,
          lawyerUpdates: serverProfile.notifications.lawyerUpdates ?? false,
        });
      }
    }
  }, [serverProfile]);

  const handleUpdateProfileField =
    (field: string) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      setProfileForm((prev) => ({ ...prev, [field]: e.target.value }));
    };

  const handleUpdateEmergency =
    (field: string) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      setEmergency((prev) => ({ ...prev, [field]: e.target.value }));
    };

  const handleSaveProfile = async () => {
    await saveProfile({
      name: profileForm.fullName,
      email: profileForm.email,
      phone: profileForm.phone,
      city: profileForm.city,
      state: profileForm.state,
      pincode: profileForm.pincode,
    });
  };

  const handleSaveLanguage = async () => {
    await saveProfile({ language });
  };

  const handleSaveEmergency = async () => {
    await saveProfile({ emergencyContact: emergency });
  };

  const handleSaveNotifications = async () => {
    await saveProfile({ notifications });
  };

  const displayName = serverProfile?.name || "";
  const initials = displayName ? displayName.charAt(0).toUpperCase() : "?";
  const planLabel =
    plan === "CITIZEN_PREMIUM"
      ? "Citizen Premium"
      : plan === "LAWYER_PRO"
      ? "Lawyer Pro"
      : "Free Plan";

  // Loading skeleton
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-6 w-32 bg-ink-100 rounded animate-pulse" />
        <div className="h-4 w-64 bg-ink-50 rounded animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-5 mt-6">
          <div className="lg:col-span-1 space-y-3">
            <Card className="p-3 space-y-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-8 bg-ink-50 rounded animate-pulse" />
              ))}
            </Card>
          </div>
          <div className="lg:col-span-3">
            <Card className="p-6 space-y-4">
              <div className="h-5 w-48 bg-ink-100 rounded animate-pulse" />
              <div className="h-4 w-72 bg-ink-50 rounded animate-pulse" />
              <div className="space-y-3 mt-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-10 bg-ink-50 rounded animate-pulse" />
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
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
                {initials}
              </div>
              <div>
                <p className="font-semibold text-sm text-ink-900">
                  {displayName || "Loading..."}
                </p>
                <p className="text-[11px] text-ink-400">{planLabel}</p>
              </div>
            </div>
            {(profileForm.city || profileForm.state) && (
              <div className="flex items-center gap-2 text-[11px] text-ink-400">
                <Icon name="pin" size={10} />
                <span>
                  {[profileForm.city, profileForm.state].filter(Boolean).join(", ") || "India"}
                </span>
              </div>
            )}
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
                {serverProfile?.verified && (
                  <Chip variant="green" className="text-[10px]">
                    <Icon name="check" size={10} /> Verified
                  </Chip>
                )}
              </div>

              {/* Avatar */}
              <div className="flex items-center gap-4 mb-6 pb-5 border-b border-ink-100">
                <div className="w-20 h-20 rounded-full bg-saffron-100 text-saffron-700 font-bold text-2xl flex items-center justify-center">
                  {initials}
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
                    value={profileForm.fullName}
                    onChange={handleUpdateProfileField("fullName")}
                  />
                  <Field
                    label="Email Address"
                    type="email"
                    value={profileForm.email}
                    onChange={handleUpdateProfileField("email")}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Field
                    label="Phone Number"
                    type="tel"
                    value={profileForm.phone}
                    onChange={handleUpdateProfileField("phone")}
                  />
                  <Field
                    label="Gender"
                    options={["Male", "Female", "Other", "Prefer not to say"]}
                    value={profileForm.gender}
                    onChange={handleUpdateProfileField("gender")}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Field
                    label="Date of Birth"
                    type="date"
                    value={profileForm.dob}
                    onChange={handleUpdateProfileField("dob")}
                  />
                  <Field
                    label="City"
                    value={profileForm.city}
                    onChange={handleUpdateProfileField("city")}
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
                    value={profileForm.state}
                    onChange={handleUpdateProfileField("state")}
                  />
                  <Field
                    label="PIN Code"
                    value={profileForm.pincode}
                    onChange={handleUpdateProfileField("pincode")}
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6 pt-4 border-t border-ink-100">
                <Button variant="primary" size="sm" onClick={handleSaveProfile} disabled={saving}>
                  {saving ? "Saving..." : "Save Changes"}
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
                    { code: "hi", label: "Hindi", native: "\u0939\u093F\u0928\u094D\u0926\u0940" },
                    { code: "ta", label: "Tamil", native: "\u0BA4\u0BAE\u0BBF\u0BB4\u0BCD" },
                    { code: "bn", label: "Bengali", native: "\u09AC\u09BE\u0982\u09B2\u09BE" },
                    { code: "mr", label: "Marathi", native: "\u092E\u0930\u093E\u0920\u0940" },
                    { code: "te", label: "Telugu", native: "\u0C24\u0C46\u0C32\u0C41\u0C17\u0C41" },
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
                    value={profileForm.state || "Delhi"}
                    onChange={handleUpdateProfileField("state")}
                    hint="This helps us show state-specific laws and legal aid centres"
                  />
                  <Field
                    label="District"
                    value=""
                    onChange={() => {}}
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6 pt-4 border-t border-ink-100">
                <Button variant="primary" size="sm" onClick={handleSaveLanguage} disabled={saving}>
                  {saving ? "Saving..." : "Save Preferences"}
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
                    onChange={handleUpdateEmergency("name")}
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
                    onChange={handleUpdateEmergency("relation")}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Field
                    label="Primary Phone"
                    type="tel"
                    value={emergency.phone}
                    onChange={handleUpdateEmergency("phone")}
                  />
                  <Field
                    label="Alternate Phone (Optional)"
                    type="tel"
                    value={emergency.altPhone}
                    onChange={handleUpdateEmergency("altPhone")}
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
                <Button variant="primary" size="sm" onClick={handleSaveEmergency} disabled={saving}>
                  {saving ? "Saving..." : "Save Emergency Contact"}
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
                <Button variant="primary" size="sm" onClick={handleSaveNotifications} disabled={saving}>
                  {saving ? "Saving..." : "Save Preferences"}
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
                      {planLabel}
                    </h3>
                  </div>
                  <p className="text-2xl font-bold text-ink-400">
                    {isPremium ? (
                      <>
                        Rs. 149<span className="text-xs font-normal">/month</span>
                      </>
                    ) : (
                      <>
                        Rs. 0<span className="text-xs font-normal">/month</span>
                      </>
                    )}
                  </p>
                </div>
                <div className="text-[12px] text-ink-500 space-y-1 mb-4">
                  <p className="flex items-center gap-2">
                    <Icon name="check" size={12} className="text-green-600" />
                    {queryLimit === -1
                      ? "Unlimited GandhiAI queries"
                      : `${queryLimit} GandhiAI queries per day (${queriesUsed} used today)`}
                  </p>
                  <p className="flex items-center gap-2">
                    <Icon name="check" size={12} className="text-green-600" />
                    {isPremium ? "All document templates" : "Basic document templates"}
                  </p>
                  <p className="flex items-center gap-2">
                    <Icon name="check" size={12} className="text-green-600" />
                    Rights guides and quizzes
                  </p>
                </div>
                {!isPremium && (
                  <Button variant="saffron" size="sm">
                    <Icon name="bolt" size={13} />
                    Upgrade to Pro &mdash; Rs. 149/month
                  </Button>
                )}
              </Card>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}
