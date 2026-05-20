import type { Metadata } from "next";
import "./globals.css";
import { I18nProvider } from "@/lib/i18n/context";
import { AuthProvider } from "@/contexts/auth-context";

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      name: "SatyaVera",
      url: "https://satyavera.in",
      logo: "https://satyavera.in/logo.png",
      description:
        "AI-powered legal assistant for India that explains rights in plain Hindi and English with cited law sections.",
    },
    {
      "@type": "WebApplication",
      name: "SatyaVera",
      url: "https://satyavera.in",
      applicationCategory: "LegalService",
      operatingSystem: "Any",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "INR",
        description: "Free tier with limited queries per day",
      },
      inLanguage: ["en", "hi"],
    },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL("https://satyavera.in"),
  title: {
    default: "SatyaVera — AI Legal Assistant for India",
    template: "%s | SatyaVera",
  },
  description:
    "Know Your Rights. Protect Your Future. AI-powered legal assistant that explains your rights in plain Hindi and English with cited law sections and case references.",
  keywords: [
    "legal aid india", "AI lawyer", "know your rights", "GandhiAI",
    "Indian law", "BNSS", "BNS", "BSA", "legal assistant",
    "FIR draft", "RTI", "bail application", "tenant rights",
    "consumer rights", "women rights india", "free legal aid",
  ],
  manifest: "/manifest.json",
  openGraph: {
    title: "SatyaVera — AI Legal Assistant for India",
    description: "Every Indian has rights. Most don't know them. SatyaVera explains your rights in plain Hindi & English with cited law sections.",
    url: "https://satyavera.in",
    siteName: "SatyaVera",
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SatyaVera — AI Legal Assistant for India",
    description: "Know Your Rights. Protect Your Future. Ask GandhiAI any legal question in Hindi or English.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-bone text-ink-900 font-sans">
        <AuthProvider>
          <I18nProvider>{children}</I18nProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
