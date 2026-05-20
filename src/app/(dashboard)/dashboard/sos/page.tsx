"use client";

import { useI18n } from "@/lib/i18n/context";
import { Icon } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";

export default function EmergencySOSPage() {
  const { t } = useI18n();

  const helplines = [
    { num: "112", label: "Emergency", tone: "red" },
    { num: "181", label: "Women's Helpline", tone: "saffron" },
    { num: "1091", label: "Women in Distress", tone: "saffron" },
    { num: "15100", label: "NALSA Legal Aid", tone: "navy" },
    { num: "1516", label: "Tele-Law", tone: "navy" },
    { num: "1098", label: "Childline", tone: "saffron" },
  ];

  const toneStyles = {
    red: { bg: "bg-red-100", border: "border-[#f1c5c1]", text: "text-red-600" },
    saffron: { bg: "bg-saffron-50", border: "border-saffron-100", text: "text-saffron-700" },
    navy: { bg: "bg-navy-50", border: "border-navy-100", text: "text-navy-700" },
  };

  return (
    <div className="flex items-start justify-center">
      <div className="w-full max-w-xl bg-white rounded-[14px] shadow-sh-3 overflow-hidden">
        {/* Red header */}
        <div className="p-6 bg-red-600 text-white">
          <div className="flex items-center gap-3">
            <Icon name="siren" size={28} className="text-white" />
            <div>
              <h1 className="text-2xl font-bold">Emergency Legal Help</h1>
              <p className="text-[13px] opacity-85">Tap any number to call · all toll-free</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Helpline buttons */}
          <div className="flex flex-col gap-2.5 mb-6">
            {helplines.map((h) => {
              const s = toneStyles[h.tone as keyof typeof toneStyles];
              return (
                <a key={h.num} href={`tel:${h.num}`} className={`flex items-center gap-3 px-4 py-3.5 rounded-[10px] ${s.bg} border ${s.border} no-underline`}>
                  <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center flex-shrink-0">
                    <span className={`text-sm font-extrabold ${s.text}`}>{h.num}</span>
                  </div>
                  <div className="flex-1">
                    <span className="font-bold text-navy-900">{h.label}</span>
                    <span className="block text-[11px] text-ink-500">Tap to call · 24/7</span>
                  </div>
                  <Icon name="phone" size={18} className={s.text} />
                </a>
              );
            })}
          </div>

          {/* Rights reminder */}
          <div className="p-[18px] bg-ink-50 rounded-[10px] border border-ink-100 mb-[18px]">
            <div className="eyebrow mb-2">If you are being detained by police</div>
            <ul className="list-disc pl-[18px] text-[13px] leading-relaxed space-y-1">
              <li>You have the right to know the reason for arrest — <span className="lref">Article 22(1)</span></li>
              <li>You can inform a family member — <span className="lref">S. 48 BNSS</span></li>
              <li>You have the right to a lawyer.</li>
              <li>You must be produced before a magistrate within 24 hours — <span className="lref">Article 22(2)</span></li>
              <li>Police cannot use force or torture.</li>
            </ul>
          </div>

          <Button variant="danger" size="lg" className="w-full justify-center">
            <Icon name="pin" size={16} className="text-white" />
            Share my GPS location with emergency contact
          </Button>
          <p className="text-[11px] text-ink-500 text-center mt-2">
            Sends an SMS to: Mohan Sharma (+91-98XXXXXX10)
          </p>
        </div>
      </div>
    </div>
  );
}
