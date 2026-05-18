"use client";

import { useI18n } from "@/lib/i18n/context";
import { AppNav } from "@/components/layout/app-nav";
import { Sidebar, citizenSidebar } from "@/components/layout/sidebar";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icons";
import { Chip } from "@/components/ui/chip";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";

export default function LegalAidPage() {
  const { t } = useI18n();

  const helplines = [
    { label: "NALSA", num: "15100" },
    { label: "Women", num: "181" },
    { label: "Distress", num: "1091" },
    { label: "Emergency", num: "112" },
    { label: "Tele-Law", num: "1516" },
  ];

  const centers = [
    { name: "South East District Legal Services Authority", type: "DLSA", addr: "Saket District Court Complex, New Delhi 110017", ph: "011-2956-3411", hr: "Mon–Fri · 10:00–17:00", dist: "2.4 km" },
    { name: "Tele-Law Clinic — CSC Lajpat Nagar", type: "Tele-Law", addr: "Common Service Centre, Lajpat Nagar Market", ph: "1516", hr: "Daily · 09:00–18:00", dist: "0.8 km", selected: true },
    { name: "Lok Adalat — Saket Court", type: "Lok Adalat", addr: "Saket Court Complex, Hall 4", ph: "011-2952-9210", hr: "2nd Saturday", dist: "2.5 km" },
    { name: "NLSIU Free Legal Aid Cell", type: "Legal Aid Clinic", addr: "Lawyers' Chamber Block, Tis Hazari", ph: "011-2391-2222", hr: "Tue / Thu · 16:00–18:00", dist: "9.1 km" },
  ];

  return (
    <div className="min-h-screen bg-bone">
      <AppNav role="citizen" name="Aarav" />
      <div className="flex min-h-[calc(100vh-64px)]">
        <Sidebar items={citizenSidebar} active="aid" />
        <main className="flex-1 p-7 md:px-10 bg-bone overflow-auto">
          <div className="flex flex-col gap-1 mb-4">
            <h2 className="font-serif text-[22px] font-semibold text-navy-900">Find Free Legal Aid Near You</h2>
            <p className="text-ink-500 text-sm">Government-run District Legal Services Authorities, Lok Adalats, and Tele-Law clinics.</p>
          </div>

          {/* Helpline Strip */}
          <Card className="p-3.5 mb-[18px] !bg-navy-900 !text-white !border-navy-900">
            <div className="flex gap-4 flex-wrap">
              {helplines.map((h, i) => (
                <div key={i} className={`flex items-center gap-2 ${i < helplines.length - 1 ? "pr-4 border-r border-white/15" : ""}`}>
                  <Icon name="phone" size={14} className="text-saffron-400" />
                  <div className="flex flex-col leading-tight">
                    <span className="text-[11px] text-white/65">{h.label}</span>
                    <span className="font-bold">{h.num}</span>
                  </div>
                </div>
              ))}
              <span className="text-[11px] text-white/55 ml-auto self-center">Tap to call · Toll-free</span>
            </div>
          </Card>

          <div className="flex gap-4">
            {/* Filters + List */}
            <div className="flex-[1.2] flex flex-col gap-3">
              <Card className="p-3.5">
                <div className="flex gap-2">
                  <Field label="State" options={["Delhi", "Maharashtra", "Tamil Nadu"]} className="flex-1" />
                  <Field label="District" options={["South East", "Central", "North"]} className="flex-1" />
                  <Field label="Type" options={["All", "DLSA", "Legal Aid Clinic", "Lok Adalat", "Tele-Law"]} className="flex-1" />
                </div>
              </Card>

              {centers.map((c, i) => (
                <Card key={i} className={`p-4 ${c.selected ? "!border-saffron-600 !shadow-[0_0_0_2px_var(--color-saffron-100)]" : ""}`}>
                  <div className="flex justify-between mb-1.5">
                    <Chip variant="navy">{c.type}</Chip>
                    <span className="text-[11px] text-ink-500">{c.dist} away</span>
                  </div>
                  <div className="font-bold text-navy-900 mb-1">{c.name}</div>
                  <div className="text-ink-500 text-sm mb-2">{c.addr}</div>
                  <div className="flex gap-3 text-sm text-ink-700">
                    <span className="flex items-center gap-1"><Icon name="phone" size={12} /> {c.ph}</span>
                    <span className="flex items-center gap-1"><Icon name="info" size={12} /> {c.hr}</span>
                  </div>
                </Card>
              ))}
            </div>

            {/* Map + Selected */}
            <Card className="flex-1 !p-0 overflow-hidden self-start sticky top-20">
              <div className="h-[280px] bg-ink-50 flex items-center justify-center text-ink-500 text-sm font-mono border-b border-ink-100">
                map view · 4 results · centred on Lajpat Nagar
              </div>
              <div className="p-[18px]">
                <div className="eyebrow mb-1.5">Selected</div>
                <h3 className="font-serif text-base font-semibold mb-1">Tele-Law Clinic — CSC Lajpat Nagar</h3>
                <div className="text-ink-500 text-sm mb-3">Common Service Centre, Lajpat Nagar Market</div>
                <div className="flex flex-col gap-1.5 text-sm mb-3.5">
                  <div className="flex items-center gap-2"><Icon name="phone" size={12} className="text-ink-500" /> 1516</div>
                  <div className="flex items-center gap-2"><Icon name="info" size={12} className="text-ink-500" /> Daily · 09:00–18:00</div>
                  <div className="flex items-center gap-2"><Icon name="users" size={12} className="text-ink-500" /> Free phone consultation with empaneled lawyers</div>
                </div>
                <div className="flex gap-2">
                  <Button variant="primary" size="sm" className="flex-1 justify-center"><Icon name="phone" size={12} className="text-white" /> Call</Button>
                  <Button variant="ghost" size="sm" className="flex-1 justify-center"><Icon name="map" size={12} /> Directions</Button>
                </div>
              </div>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
