#!/usr/bin/env npx tsx
/**
 * SatyaVera — Seed Legal Rights Guides
 *
 * Creates 15 comprehensive bilingual legal rights guides in Firestore.
 *
 * Usage:
 *   npx tsx scripts/seed-guides.ts [options]
 *
 * Options:
 *   --dry-run   Parse and report but don't write to Firestore
 *   --force     Overwrite existing guides
 */

import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import * as dotenv from "dotenv";
dotenv.config();

// ── Firebase Admin Init ──

if (getApps().length === 0) {
  const projectId =
    process.env.FIREBASE_ADMIN_PROJECT_ID ||
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(
    /\\n/g,
    "\n",
  );

  if (clientEmail && privateKey) {
    initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
  } else {
    console.log(
      "⚠ No service account credentials — using Application Default Credentials",
    );
    initializeApp({ projectId });
  }
}

const db = getFirestore();

// ── CLI Flags ──

const args = process.argv.slice(2);
const DRY_RUN = args.includes("--dry-run");
const FORCE = args.includes("--force");

// ── Guide Data ──

interface GuideSeed {
  title: string;
  titleHi: string;
  slug: string;
  category: string;
  description: string;
  descriptionHi: string;
  icon: string;
  tags: string[];
  readTime: string;
  content: string;
  contentHi: string;
  rights: string[];
  rightsHi: string[];
  steps: { title: string; titleHi: string; description: string; descriptionHi: string }[];
  relatedLawSections: string[];
  readCount: number;
  featured: boolean;
  order: number;
}

const guides: GuideSeed[] = [
  {
    title: "Your Rights When Arrested",
    titleHi: "गिरफ्तारी के समय आपके अधिकार",
    slug: "rights-when-arrested",
    category: "criminal",
    description:
      "Know your fundamental rights during arrest. Learn about the constitutional safeguards and procedural protections that every citizen is entitled to under Indian law.",
    descriptionHi:
      "गिरफ्तारी के दौरान अपने मौलिक अधिकारों को जानें। भारतीय कानून के तहत प्रत्येक नागरिक को प्राप्त संवैधानिक सुरक्षा और प्रक्रियागत संरक्षण के बारे में जानें।",
    icon: "shield",
    tags: ["arrest", "criminal", "fundamental rights", "BNSS", "police"],
    readTime: "8 min",
    content:
      "Being arrested can be a frightening experience, but the Indian Constitution and the Bharatiya Nagarik Suraksha Sanhita (BNSS), 2023 provide robust safeguards to protect your rights. Understanding these rights is crucial — the police are bound by law to follow specific procedures, and any violation can be challenged in court. This guide covers everything from the moment of arrest to your production before a magistrate, including your right to legal counsel, the prohibition on unnecessary restraint, and the protections against custodial violence.",
    contentHi:
      "गिरफ्तार होना एक भयावह अनुभव हो सकता है, लेकिन भारतीय संविधान और भारतीय नागरिक सुरक्षा संहिता (BNSS), 2023 आपके अधिकारों की रक्षा के लिए मजबूत सुरक्षा उपाय प्रदान करते हैं। इन अधिकारों को समझना महत्वपूर्ण है — पुलिस कानून द्वारा विशिष्ट प्रक्रियाओं का पालन करने के लिए बाध्य है, और किसी भी उल्लंघन को अदालत में चुनौती दी जा सकती है। यह गाइड गिरफ्तारी के क्षण से लेकर मजिस्ट्रेट के समक्ष पेशी तक सब कुछ शामिल करती है, जिसमें कानूनी सलाह का अधिकार, अनावश्यक बंधन पर प्रतिबंध और हिरासत में हिंसा के विरुद्ध सुरक्षा शामिल है।",
    rights: [
      "Right to know the grounds of arrest — Article 22(1) of the Constitution mandates that every arrested person must be informed of the reasons for arrest.",
      "Right to legal counsel — Article 22(1) guarantees the right to consult and be defended by a legal practitioner of your choice.",
      "Right to be produced before a magistrate within 24 hours — Article 22(2) requires production before the nearest magistrate within 24 hours excluding travel time.",
      "Right against self-incrimination — Article 20(3) protects you from being compelled to be a witness against yourself.",
      "Right to inform a friend or relative — Section 36 of BNSS requires the police to inform a nominated person about the arrest.",
    ],
    rightsHi: [
      "गिरफ्तारी का कारण जानने का अधिकार — संविधान का अनुच्छेद 22(1) अनिवार्य करता है कि प्रत्येक गिरफ्तार व्यक्ति को गिरफ्तारी के कारण बताए जाएं।",
      "कानूनी सलाह का अधिकार — अनुच्छेद 22(1) आपकी पसंद के कानूनी व्यवसायी से परामर्श करने और बचाव कराने का अधिकार देता है।",
      "24 घंटे के भीतर मजिस्ट्रेट के समक्ष पेश होने का अधिकार — अनुच्छेद 22(2) के अनुसार यात्रा समय को छोड़कर 24 घंटे के भीतर निकटतम मजिस्ट्रेट के समक्ष पेशी आवश्यक है।",
      "आत्म-अभिशंसन के विरुद्ध अधिकार — अनुच्छेद 20(3) आपको स्वयं के विरुद्ध गवाह बनने के लिए बाध्य किए जाने से बचाता है।",
      "मित्र या रिश्तेदार को सूचित करने का अधिकार — BNSS की धारा 36 पुलिस को गिरफ्तारी के बारे में एक नामित व्यक्ति को सूचित करने का आदेश देती है।",
    ],
    steps: [
      {
        title: "Stay Calm and Note Details",
        titleHi: "शांत रहें और विवरण नोट करें",
        description:
          "Do not resist arrest as it may lead to additional charges. Note the officer's name, badge number, time, and place of arrest. Ask for the reason for your arrest.",
        descriptionHi:
          "गिरफ्तारी का विरोध न करें क्योंकि इससे अतिरिक्त आरोप लग सकते हैं। अधिकारी का नाम, बैज नंबर, समय और गिरफ्तारी का स्थान नोट करें। अपनी गिरफ्तारी का कारण पूछें।",
      },
      {
        title: "Exercise Your Right to a Phone Call",
        titleHi: "फोन कॉल के अधिकार का प्रयोग करें",
        description:
          "Under Section 36 of BNSS, the police must allow you to inform a family member or friend. Use this call to contact a lawyer as well.",
        descriptionHi:
          "BNSS की धारा 36 के तहत, पुलिस को आपको परिवार के किसी सदस्य या मित्र को सूचित करने की अनुमति देनी चाहिए। इस कॉल का उपयोग वकील से संपर्क करने के लिए भी करें।",
      },
      {
        title: "Request Legal Aid if Needed",
        titleHi: "आवश्यकता होने पर कानूनी सहायता का अनुरोध करें",
        description:
          "If you cannot afford a lawyer, you are entitled to free legal aid under Section 304 of BNSS and the Legal Services Authorities Act, 1987. The magistrate is obligated to inform you of this right.",
        descriptionHi:
          "यदि आप वकील का खर्च वहन नहीं कर सकते, तो आप BNSS की धारा 304 और विधिक सेवा प्राधिकरण अधिनियम, 1987 के तहत मुफ्त कानूनी सहायता के हकदार हैं। मजिस्ट्रेट इस अधिकार के बारे में आपको सूचित करने के लिए बाध्य है।",
      },
      {
        title: "Ensure Proper Documentation",
        titleHi: "उचित दस्तावेजीकरण सुनिश्चित करें",
        description:
          "The arrest memo must be prepared as per Section 35 of BNSS, countersigned by a witness, and include the date and time. A medical examination must be conducted within 24 hours.",
        descriptionHi:
          "गिरफ्तारी ज्ञापन BNSS की धारा 35 के अनुसार तैयार किया जाना चाहिए, जिसमें एक गवाह के हस्ताक्षर हों और तारीख व समय शामिल हो। 24 घंटे के भीतर चिकित्सा परीक्षण किया जाना चाहिए।",
      },
    ],
    relatedLawSections: [
      "Article 22(1) — Constitution of India",
      "Article 22(2) — Constitution of India",
      "Section 35 — BNSS (Procedure of arrest and duties of officer making arrest)",
      "Section 36 — BNSS (Information of arrest to nominated person)",
      "Section 41 — BNSS (When police may arrest without warrant)",
    ],
    readCount: 1847,
    featured: true,
    order: 1,
  },
  {
    title: "Filing an FIR",
    titleHi: "एफआईआर दर्ज करना",
    slug: "filing-an-fir",
    category: "criminal",
    description:
      "A step-by-step guide on filing a First Information Report (FIR) at a police station, including zero FIR provisions and online filing.",
    descriptionHi:
      "थाने में प्रथम सूचना रिपोर्ट (एफआईआर) दर्ज करने की चरणबद्ध गाइड, जिसमें जीरो एफआईआर प्रावधान और ऑनलाइन फाइलिंग शामिल है।",
    icon: "flag",
    tags: ["FIR", "police", "criminal", "BNSS", "complaint"],
    readTime: "6 min",
    content:
      "Filing a First Information Report (FIR) is the first step in setting the criminal justice system in motion. Under Section 173 of the Bharatiya Nagarik Suraksha Sanhita (BNSS), 2023, every person has the right to have their complaint registered when it relates to a cognizable offence. The police cannot refuse to register an FIR for a cognizable offence — this was reinforced by the Supreme Court in Lalita Kumari v. Government of Uttar Pradesh (2014). The introduction of Zero FIR means you can file at any police station regardless of jurisdiction.",
    contentHi:
      "प्रथम सूचना रिपोर्ट (एफआईआर) दर्ज करना आपराधिक न्याय प्रणाली को गति देने का पहला कदम है। भारतीय नागरिक सुरक्षा संहिता (BNSS), 2023 की धारा 173 के तहत, प्रत्येक व्यक्ति को संज्ञेय अपराध से संबंधित शिकायत दर्ज कराने का अधिकार है। पुलिस संज्ञेय अपराध की एफआईआर दर्ज करने से इनकार नहीं कर सकती — यह ललिता कुमारी बनाम उत्तर प्रदेश सरकार (2014) में सर्वोच्च न्यायालय द्वारा पुष्ट किया गया है। जीरो एफआईआर की शुरूआत का अर्थ है कि आप क्षेत्राधिकार की परवाह किए बिना किसी भी थाने में एफआईआर दर्ज करा सकते हैं।",
    rights: [
      "Right to register FIR for cognizable offences — Section 173 BNSS mandates mandatory registration.",
      "Right to a free copy of the FIR — Section 173(4) BNSS entitles the informant to a free copy immediately.",
      "Right to Zero FIR — You can file at any police station; it will be transferred to the correct jurisdiction.",
      "Right to file online FIR — Many states allow e-FIR for certain categories of offences.",
    ],
    rightsHi: [
      "संज्ञेय अपराधों के लिए एफआईआर दर्ज कराने का अधिकार — BNSS की धारा 173 अनिवार्य पंजीकरण का आदेश देती है।",
      "एफआईआर की मुफ्त प्रति प्राप्त करने का अधिकार — BNSS की धारा 173(4) सूचनादाता को तुरंत मुफ्त प्रति का अधिकार देती है।",
      "जीरो एफआईआर का अधिकार — आप किसी भी थाने में एफआईआर दर्ज करा सकते हैं; इसे सही क्षेत्राधिकार में स्थानांतरित किया जाएगा।",
      "ऑनलाइन एफआईआर दर्ज करने का अधिकार — कई राज्य कुछ श्रेणियों के अपराधों के लिए ई-एफआईआर की अनुमति देते हैं।",
    ],
    steps: [
      {
        title: "Visit the Nearest Police Station",
        titleHi: "निकटतम थाने में जाएं",
        description:
          "Go to the nearest police station. Under the Zero FIR provision, any police station must accept your FIR regardless of where the crime occurred.",
        descriptionHi:
          "निकटतम थाने में जाएं। जीरो एफआईआर प्रावधान के तहत, कोई भी थाना आपकी एफआईआर स्वीकार करने के लिए बाध्य है, चाहे अपराध कहीं भी हुआ हो।",
      },
      {
        title: "Provide a Written or Oral Complaint",
        titleHi: "लिखित या मौखिक शिकायत दें",
        description:
          "Narrate the incident clearly with facts — date, time, place, description of accused if known. The SHO must reduce oral statements to writing.",
        descriptionHi:
          "घटना के तथ्य स्पष्ट रूप से बताएं — तारीख, समय, स्थान, आरोपी का विवरण यदि ज्ञात हो। SHO को मौखिक बयान लिखित रूप में दर्ज करना चाहिए।",
      },
      {
        title: "Sign and Collect Your Copy",
        titleHi: "हस्ताक्षर करें और अपनी प्रति प्राप्त करें",
        description:
          "Read the FIR carefully before signing. Collect your free copy immediately — it is your legal right under Section 173(4) BNSS.",
        descriptionHi:
          "हस्ताक्षर करने से पहले एफआईआर ध्यान से पढ़ें। तुरंत अपनी मुफ्त प्रति प्राप्त करें — यह BNSS की धारा 173(4) के तहत आपका कानूनी अधिकार है।",
      },
      {
        title: "If Police Refuse, Escalate",
        titleHi: "यदि पुलिस इनकार करे, तो शिकायत बढ़ाएं",
        description:
          "If the police refuse to register your FIR, you can send a written complaint to the Superintendent of Police (SP), approach the magistrate under Section 175(3) BNSS, or file an online complaint.",
        descriptionHi:
          "यदि पुलिस आपकी एफआईआर दर्ज करने से इनकार करती है, तो आप पुलिस अधीक्षक (SP) को लिखित शिकायत भेज सकते हैं, BNSS की धारा 175(3) के तहत मजिस्ट्रेट से संपर्क कर सकते हैं, या ऑनलाइन शिकायत दर्ज कर सकते हैं।",
      },
    ],
    relatedLawSections: [
      "Section 173 — BNSS (Information in cognizable cases)",
      "Section 175 — BNSS (Procedure by Magistrate on complaint)",
      "Lalita Kumari v. Govt of UP (2014) — Supreme Court",
    ],
    readCount: 1623,
    featured: true,
    order: 2,
  },
  {
    title: "RTI Application Guide",
    titleHi: "आरटीआई आवेदन गाइड",
    slug: "rti-application-guide",
    category: "rti",
    description:
      "Learn how to file a Right to Information application to obtain information from any public authority in India.",
    descriptionHi:
      "भारत में किसी भी सार्वजनिक प्राधिकरण से सूचना प्राप्त करने के लिए सूचना का अधिकार आवेदन दाखिल करना सीखें।",
    icon: "eye",
    tags: ["RTI", "transparency", "government", "information", "public authority"],
    readTime: "7 min",
    content:
      "The Right to Information Act, 2005 empowers every citizen of India to seek information from public authorities, promoting transparency and accountability in governance. The Act covers all constitutional bodies, including the Central and State governments, local bodies, and any entity substantially financed by the government. With a simple application and a fee of Rs. 10, you can request any information that the public authority holds. The Act mandates a response within 30 days, and appeals can be filed if you are unsatisfied or denied information.",
    contentHi:
      "सूचना का अधिकार अधिनियम, 2005 भारत के प्रत्येक नागरिक को सार्वजनिक प्राधिकरणों से सूचना प्राप्त करने का अधिकार देता है, जो शासन में पारदर्शिता और जवाबदेही को बढ़ावा देता है। यह अधिनियम केंद्र और राज्य सरकारों, स्थानीय निकायों और सरकार द्वारा पर्याप्त रूप से वित्तपोषित किसी भी संस्था सहित सभी संवैधानिक निकायों को शामिल करता है। एक सरल आवेदन और 10 रुपये के शुल्क के साथ, आप किसी भी ऐसी सूचना का अनुरोध कर सकते हैं जो सार्वजनिक प्राधिकरण के पास उपलब्ध है। अधिनियम 30 दिनों के भीतर उत्तर देने का आदेश देता है, और यदि आप असंतुष्ट हैं या सूचना से वंचित किए गए हैं तो अपील दायर की जा सकती है।",
    rights: [
      "Right to seek information from any public authority — Section 3 of the RTI Act, 2005.",
      "Right to receive a response within 30 days — Section 7(1), or 48 hours if life or liberty is involved.",
      "Right to first appeal within 30 days — Section 19(1) to the appellate authority within the public authority.",
      "Right to second appeal to Information Commission — Section 19(3) to the State or Central Information Commission.",
    ],
    rightsHi: [
      "किसी भी सार्वजनिक प्राधिकरण से सूचना प्राप्त करने का अधिकार — RTI अधिनियम, 2005 की धारा 3।",
      "30 दिनों के भीतर उत्तर प्राप्त करने का अधिकार — धारा 7(1), या जीवन और स्वतंत्रता से संबंधित होने पर 48 घंटे।",
      "30 दिनों के भीतर प्रथम अपील का अधिकार — धारा 19(1) सार्वजनिक प्राधिकरण के भीतर अपीलीय प्राधिकारी को।",
      "सूचना आयोग में द्वितीय अपील का अधिकार — धारा 19(3) राज्य या केंद्रीय सूचना आयोग को।",
    ],
    steps: [
      {
        title: "Identify the Public Authority",
        titleHi: "सार्वजनिक प्राधिकरण की पहचान करें",
        description:
          "Determine which government department or body holds the information you need. Check their website for the designated Public Information Officer (PIO).",
        descriptionHi:
          "यह निर्धारित करें कि आपको जो सूचना चाहिए वह किस सरकारी विभाग या निकाय के पास है। उनकी वेबसाइट पर नामित लोक सूचना अधिकारी (PIO) की जानकारी देखें।",
      },
      {
        title: "Draft Your Application",
        titleHi: "अपना आवेदन तैयार करें",
        description:
          "Write a clear application addressed to the PIO. Mention 'Under Section 6 of RTI Act, 2005.' Be specific about what information you need — dates, file numbers, subject matter.",
        descriptionHi:
          "PIO को संबोधित एक स्पष्ट आवेदन लिखें। 'RTI अधिनियम, 2005 की धारा 6 के तहत' का उल्लेख करें। आपको जो सूचना चाहिए उसके बारे में विशिष्ट रहें — तिथियां, फ़ाइल नंबर, विषय।",
      },
      {
        title: "Pay the Fee and Submit",
        titleHi: "शुल्क भुगतान करें और जमा करें",
        description:
          "Pay Rs. 10 via postal order, demand draft, or cash. BPL cardholders are exempt. Submit by post or in person, or use the RTI online portal (rtionline.gov.in) for central departments.",
        descriptionHi:
          "10 रुपये का भुगतान पोस्टल ऑर्डर, डिमांड ड्राफ्ट या नकद द्वारा करें। BPL कार्डधारक शुल्क से मुक्त हैं। डाक या व्यक्तिगत रूप से जमा करें, या केंद्रीय विभागों के लिए RTI ऑनलाइन पोर्टल (rtionline.gov.in) का उपयोग करें।",
      },
      {
        title: "Follow Up and Appeal if Needed",
        titleHi: "अनुवर्ती कार्रवाई करें और आवश्यकतानुसार अपील करें",
        description:
          "If no response within 30 days or the response is unsatisfactory, file a first appeal with the appellate authority. If still unsatisfied, file a second appeal with the Information Commission.",
        descriptionHi:
          "यदि 30 दिनों में कोई उत्तर नहीं मिलता या उत्तर संतोषजनक नहीं है, तो अपीलीय प्राधिकारी के पास प्रथम अपील दायर करें। फिर भी असंतुष्ट होने पर सूचना आयोग में द्वितीय अपील दायर करें।",
      },
    ],
    relatedLawSections: [
      "Section 3 — RTI Act, 2005 (Right to information)",
      "Section 6 — RTI Act, 2005 (Request for obtaining information)",
      "Section 7 — RTI Act, 2005 (Disposal of request)",
      "Section 19 — RTI Act, 2005 (Appeal)",
    ],
    readCount: 1456,
    featured: true,
    order: 3,
  },
  {
    title: "Tenant Rights in India",
    titleHi: "भारत में किरायेदार के अधिकार",
    slug: "tenant-rights-india",
    category: "property",
    description:
      "Understand your rights as a tenant, including protection against arbitrary eviction, rent control, and the Model Tenancy Act provisions.",
    descriptionHi:
      "एक किरायेदार के रूप में अपने अधिकारों को समझें, जिसमें मनमानी बेदखली से सुरक्षा, किराया नियंत्रण और मॉडल किरायेदारी अधिनियम के प्रावधान शामिल हैं।",
    icon: "home",
    tags: ["tenant", "rent", "property", "eviction", "rental agreement"],
    readTime: "7 min",
    content:
      "Tenant rights in India are governed by a combination of central and state laws. The Transfer of Property Act, 1882 provides the foundational framework, while individual state Rent Control Acts offer additional protections. The Model Tenancy Act, 2021 introduced by the central government aims to standardize rental laws across India. Key protections include the right against arbitrary eviction, the right to essential services, and the right to a written rental agreement. Understanding these rights helps tenants protect themselves from exploitation and illegal practices by landlords.",
    contentHi:
      "भारत में किरायेदार के अधिकार केंद्रीय और राज्य कानूनों के संयोजन द्वारा शासित होते हैं। संपत्ति हस्तांतरण अधिनियम, 1882 मूलभूत ढांचा प्रदान करता है, जबकि व्यक्तिगत राज्य किराया नियंत्रण अधिनियम अतिरिक्त सुरक्षा प्रदान करते हैं। केंद्र सरकार द्वारा प्रस्तुत मॉडल किरायेदारी अधिनियम, 2021 का उद्देश्य पूरे भारत में किराया कानूनों को मानकीकृत करना है। प्रमुख सुरक्षाओं में मनमानी बेदखली के विरुद्ध अधिकार, आवश्यक सेवाओं का अधिकार और लिखित किराया समझौते का अधिकार शामिल है।",
    rights: [
      "Right against arbitrary eviction — A landlord must provide valid grounds and due notice before eviction under the Rent Control Acts.",
      "Right to essential services — Landlords cannot cut off water, electricity, or other essential services to force eviction.",
      "Right to a written rent agreement — The Model Tenancy Act, 2021 mandates written agreements with clear terms.",
      "Right to privacy — A landlord must give reasonable notice before entering the rented premises.",
    ],
    rightsHi: [
      "मनमानी बेदखली के विरुद्ध अधिकार — किराया नियंत्रण अधिनियमों के तहत मकान मालिक को बेदखली से पहले वैध कारण और उचित नोटिस देना चाहिए।",
      "आवश्यक सेवाओं का अधिकार — मकान मालिक बेदखली के लिए मजबूर करने हेतु पानी, बिजली या अन्य आवश्यक सेवाएं बंद नहीं कर सकते।",
      "लिखित किराया समझौते का अधिकार — मॉडल किरायेदारी अधिनियम, 2021 स्पष्ट शर्तों के साथ लिखित समझौतों को अनिवार्य करता है।",
      "निजता का अधिकार — मकान मालिक को किराए के परिसर में प्रवेश करने से पहले उचित नोटिस देना चाहिए।",
    ],
    steps: [
      {
        title: "Get a Written Rent Agreement",
        titleHi: "लिखित किराया समझौता प्राप्त करें",
        description:
          "Always insist on a written agreement that specifies rent amount, duration, security deposit terms, maintenance responsibilities, and notice period for vacating.",
        descriptionHi:
          "हमेशा एक लिखित समझौते पर जोर दें जिसमें किराये की राशि, अवधि, सुरक्षा जमा की शर्तें, रखरखाव जिम्मेदारियां और खाली करने की नोटिस अवधि निर्दिष्ट हो।",
      },
      {
        title: "Register the Agreement",
        titleHi: "समझौते का पंजीकरण कराएं",
        description:
          "Get the agreement registered at the local sub-registrar office. Unregistered agreements for periods over 11 months are not admissible as evidence under the Registration Act, 1908.",
        descriptionHi:
          "स्थानीय उप-पंजीयक कार्यालय में समझौते का पंजीकरण कराएं। पंजीकरण अधिनियम, 1908 के तहत 11 महीने से अधिक अवधि के अपंजीकृत समझौते साक्ष्य के रूप में स्वीकार्य नहीं हैं।",
      },
      {
        title: "Know Your State's Rent Control Law",
        titleHi: "अपने राज्य का किराया नियंत्रण कानून जानें",
        description:
          "Each state has its own Rent Control Act with specific provisions on rent increase limits, eviction grounds, and tenant protections. Check your state-specific provisions.",
        descriptionHi:
          "प्रत्येक राज्य का अपना किराया नियंत्रण अधिनियम है जिसमें किराया वृद्धि सीमा, बेदखली के आधार और किरायेदार सुरक्षा पर विशिष्ट प्रावधान हैं। अपने राज्य-विशिष्ट प्रावधान जांचें।",
      },
    ],
    relatedLawSections: [
      "Section 106 — Transfer of Property Act, 1882 (Duration of lease)",
      "Section 108 — Transfer of Property Act, 1882 (Rights and liabilities of lessor and lessee)",
      "Model Tenancy Act, 2021",
    ],
    readCount: 1289,
    featured: false,
    order: 4,
  },
  {
    title: "Consumer Complaint Process",
    titleHi: "उपभोक्ता शिकायत प्रक्रिया",
    slug: "consumer-complaint-process",
    category: "consumer",
    description:
      "How to file a consumer complaint under the Consumer Protection Act, 2019, including district, state, and national commission procedures.",
    descriptionHi:
      "उपभोक्ता संरक्षण अधिनियम, 2019 के तहत उपभोक्ता शिकायत कैसे दर्ज करें, जिसमें जिला, राज्य और राष्ट्रीय आयोग की प्रक्रियाएं शामिल हैं।",
    icon: "scale",
    tags: ["consumer", "complaint", "refund", "deficiency", "commission"],
    readTime: "6 min",
    content:
      "The Consumer Protection Act, 2019 is a landmark legislation that empowers consumers with strong redressal mechanisms. It replaces the older 1986 Act and introduces modern provisions like e-filing, mediation, product liability, and the Central Consumer Protection Authority (CCPA). Complaints can be filed at the District Commission (up to Rs. 1 crore), State Commission (Rs. 1-10 crore), or National Commission (above Rs. 10 crore). The Act covers goods, services, and e-commerce transactions, making it relevant in today's digital economy.",
    contentHi:
      "उपभोक्ता संरक्षण अधिनियम, 2019 एक ऐतिहासिक कानून है जो उपभोक्ताओं को मजबूत निवारण तंत्र प्रदान करता है। यह पुराने 1986 अधिनियम की जगह लेता है और ई-फाइलिंग, मध्यस्थता, उत्पाद दायित्व और केंद्रीय उपभोक्ता संरक्षण प्राधिकरण (CCPA) जैसे आधुनिक प्रावधान प्रस्तुत करता है। शिकायतें जिला आयोग (1 करोड़ रुपये तक), राज्य आयोग (1-10 करोड़ रुपये), या राष्ट्रीय आयोग (10 करोड़ रुपये से ऊपर) में दर्ज की जा सकती हैं।",
    rights: [
      "Right to seek redressal — Section 35 allows any consumer to file a complaint against deficiency in service or defective goods.",
      "Right to compensation — Consumers can claim compensation for loss or injury caused by defective products or deficient services.",
      "Right to e-filing — Complaints can be filed electronically through edaakhil.nic.in.",
      "Right to product liability — Section 84 holds manufacturers, sellers, and service providers liable for defective products.",
    ],
    rightsHi: [
      "निवारण का अधिकार — धारा 35 किसी भी उपभोक्ता को सेवा में कमी या दोषपूर्ण सामान के विरुद्ध शिकायत दर्ज करने की अनुमति देती है।",
      "क्षतिपूर्ति का अधिकार — उपभोक्ता दोषपूर्ण उत्पादों या अपर्याप्त सेवाओं से हुई हानि या चोट के लिए मुआवजे का दावा कर सकते हैं।",
      "ई-फाइलिंग का अधिकार — शिकायतें edaakhil.nic.in के माध्यम से इलेक्ट्रॉनिक रूप से दर्ज की जा सकती हैं।",
      "उत्पाद दायित्व का अधिकार — धारा 84 निर्माताओं, विक्रेताओं और सेवा प्रदाताओं को दोषपूर्ण उत्पादों के लिए उत्तरदायी ठहराती है।",
    ],
    steps: [
      {
        title: "Gather Evidence",
        titleHi: "साक्ष्य एकत्र करें",
        description:
          "Collect all relevant documents — bills, receipts, warranty cards, correspondence with the seller/service provider, photographs of defective goods.",
        descriptionHi:
          "सभी संबंधित दस्तावेज एकत्र करें — बिल, रसीदें, वारंटी कार्ड, विक्रेता/सेवा प्रदाता के साथ पत्राचार, दोषपूर्ण सामान की तस्वीरें।",
      },
      {
        title: "Send a Legal Notice",
        titleHi: "कानूनी नोटिस भेजें",
        description:
          "Before filing a complaint, send a written notice to the seller/service provider demanding resolution. Keep proof of dispatch.",
        descriptionHi:
          "शिकायत दर्ज करने से पहले, विक्रेता/सेवा प्रदाता को समाधान की मांग करते हुए लिखित नोटिस भेजें। भेजने का प्रमाण रखें।",
      },
      {
        title: "File the Complaint",
        titleHi: "शिकायत दर्ज करें",
        description:
          "File at the appropriate commission based on the claim amount. Use edaakhil.nic.in for e-filing. Include the complaint form, affidavit, documents, and nominal fee.",
        descriptionHi:
          "दावे की राशि के आधार पर उचित आयोग में शिकायत दर्ज करें। ई-फाइलिंग के लिए edaakhil.nic.in का उपयोग करें। शिकायत पत्र, शपथपत्र, दस्तावेज और मामूली शुल्क शामिल करें।",
      },
      {
        title: "Attend Hearings",
        titleHi: "सुनवाई में उपस्थित हों",
        description:
          "Attend the hearing dates. The commission may order mediation first. If mediation fails, the case proceeds to adjudication. Orders are typically passed within 3-5 months.",
        descriptionHi:
          "सुनवाई की तिथियों पर उपस्थित हों। आयोग पहले मध्यस्थता का आदेश दे सकता है। यदि मध्यस्थता विफल होती है, तो मामला न्यायनिर्णयन के लिए आगे बढ़ता है। आदेश आमतौर पर 3-5 महीनों के भीतर पारित होते हैं।",
      },
    ],
    relatedLawSections: [
      "Section 2(7) — Consumer Protection Act, 2019 (Definition of Consumer)",
      "Section 35 — Consumer Protection Act, 2019 (Jurisdiction of District Commission)",
      "Section 84 — Consumer Protection Act, 2019 (Product Liability)",
    ],
    readCount: 1134,
    featured: false,
    order: 5,
  },
  {
    title: "Domestic Violence Protection",
    titleHi: "घरेलू हिंसा से सुरक्षा",
    slug: "domestic-violence-protection",
    category: "women",
    description:
      "A comprehensive guide on seeking protection under the Protection of Women from Domestic Violence Act, 2005, including protection orders and support.",
    descriptionHi:
      "घरेलू हिंसा से महिलाओं की सुरक्षा अधिनियम, 2005 के तहत सुरक्षा प्राप्त करने की व्यापक गाइड, जिसमें सुरक्षा आदेश और सहायता शामिल है।",
    icon: "heart",
    tags: ["domestic violence", "women", "protection order", "DV Act", "safety"],
    readTime: "8 min",
    content:
      "The Protection of Women from Domestic Violence Act, 2005 (DV Act) provides comprehensive civil remedies for women subjected to domestic violence. The Act covers physical, sexual, verbal, emotional, and economic abuse. It recognizes the right of a woman to reside in the shared household regardless of her ownership rights. Relief available includes protection orders, residence orders, monetary relief, custody orders, and compensation. The Act applies to wives, live-in partners, mothers, sisters, and any woman residing in the household. Complaints can be filed with a Protection Officer, police, or directly before the Magistrate.",
    contentHi:
      "घरेलू हिंसा से महिलाओं की सुरक्षा अधिनियम, 2005 (DV अधिनियम) घरेलू हिंसा से पीड़ित महिलाओं को व्यापक नागरिक उपचार प्रदान करता है। यह अधिनियम शारीरिक, यौन, मौखिक, भावनात्मक और आर्थिक शोषण को शामिल करता है। यह महिला के स्वामित्व अधिकारों की परवाह किए बिना साझा घर में निवास करने के उसके अधिकार को मान्यता देता है। उपलब्ध राहतों में सुरक्षा आदेश, निवास आदेश, आर्थिक राहत, अभिरक्षा आदेश और मुआवजा शामिल है। यह अधिनियम पत्नियों, लिव-इन साथियों, माताओं, बहनों और घर में रहने वाली किसी भी महिला पर लागू होता है।",
    rights: [
      "Right to reside in the shared household — Section 17 guarantees the right to reside regardless of ownership.",
      "Right to protection orders — Section 18 provides orders restraining the respondent from acts of domestic violence.",
      "Right to monetary relief — Section 20 allows claims for expenses, loss of earnings, and maintenance.",
      "Right to file under multiple laws — DV Act remedies are in addition to criminal remedies under BNS Section 85-86.",
      "Right to free legal aid — Section 304 BNSS and NALSA provide free legal assistance.",
    ],
    rightsHi: [
      "साझा घर में निवास का अधिकार — धारा 17 स्वामित्व की परवाह किए बिना निवास के अधिकार की गारंटी देती है।",
      "सुरक्षा आदेश का अधिकार — धारा 18 प्रतिवादी को घरेलू हिंसा के कृत्यों से रोकने के आदेश प्रदान करती है।",
      "आर्थिक राहत का अधिकार — धारा 20 खर्चों, आय की हानि और भरणपोषण के दावों की अनुमति देती है।",
      "अनेक कानूनों के तहत शिकायत का अधिकार — DV अधिनियम उपचार BNS धारा 85-86 के तहत आपराधिक उपचारों के अतिरिक्त हैं।",
      "मुफ्त कानूनी सहायता का अधिकार — BNSS की धारा 304 और NALSA मुफ्त कानूनी सहायता प्रदान करते हैं।",
    ],
    steps: [
      {
        title: "Reach Out for Help",
        titleHi: "मदद के लिए संपर्क करें",
        description:
          "Call Women Helpline 181 or National Commission for Women helpline 7827-170-170. Contact the nearest Protection Officer appointed under the DV Act.",
        descriptionHi:
          "महिला हेल्पलाइन 181 या राष्ट्रीय महिला आयोग हेल्पलाइन 7827-170-170 पर कॉल करें। DV अधिनियम के तहत नियुक्त निकटतम संरक्षण अधिकारी से संपर्क करें।",
      },
      {
        title: "File a Domestic Incident Report",
        titleHi: "घरेलू घटना रिपोर्ट दर्ज करें",
        description:
          "The Protection Officer will help you fill out Form I (Domestic Incident Report) documenting the abuse. This report is crucial evidence.",
        descriptionHi:
          "संरक्षण अधिकारी आपको फॉर्म I (घरेलू घटना रिपोर्ट) भरने में मदद करेगा जिसमें दुर्व्यवहार का दस्तावेजीकरण होगा। यह रिपोर्ट महत्वपूर्ण साक्ष्य है।",
      },
      {
        title: "Apply for Protection Order",
        titleHi: "सुरक्षा आदेश के लिए आवेदन करें",
        description:
          "File an application before the Magistrate under Section 12 of the DV Act. The court must hear the case within 3 days and endeavour to dispose of it within 60 days.",
        descriptionHi:
          "DV अधिनियम की धारा 12 के तहत मजिस्ट्रेट के समक्ष आवेदन दायर करें। अदालत को 3 दिनों के भीतर मामले की सुनवाई करनी चाहिए और 60 दिनों के भीतर निपटाने का प्रयास करना चाहिए।",
      },
      {
        title: "Seek Shelter if Needed",
        titleHi: "आवश्यकता होने पर आश्रय लें",
        description:
          "If you need immediate safety, approach a shelter home. The Protection Officer can facilitate admission. One Stop Centres (Sakhi Centres) provide integrated support.",
        descriptionHi:
          "यदि आपको तत्काल सुरक्षा की आवश्यकता है, तो आश्रय गृह में जाएं। संरक्षण अधिकारी प्रवेश में सहायता कर सकता है। वन स्टॉप सेंटर (सखी केंद्र) एकीकृत सहायता प्रदान करते हैं।",
      },
    ],
    relatedLawSections: [
      "Section 3 — DV Act, 2005 (Definition of domestic violence)",
      "Section 12 — DV Act, 2005 (Application to Magistrate)",
      "Section 17 — DV Act, 2005 (Right to reside in shared household)",
      "Section 18 — DV Act, 2005 (Protection orders)",
      "Section 20 — DV Act, 2005 (Monetary relief)",
    ],
    readCount: 987,
    featured: false,
    order: 6,
  },
  {
    title: "Workplace Harassment (POSH)",
    titleHi: "कार्यस्थल पर यौन उत्पीड़न (POSH)",
    slug: "workplace-harassment-posh",
    category: "women",
    description:
      "Your rights under the Prevention of Sexual Harassment (POSH) Act, 2013, including complaint procedures, ICC responsibilities, and employer obligations.",
    descriptionHi:
      "यौन उत्पीड़न की रोकथाम (POSH) अधिनियम, 2013 के तहत आपके अधिकार, जिसमें शिकायत प्रक्रिया, ICC जिम्मेदारियां और नियोक्ता दायित्व शामिल हैं।",
    icon: "users",
    tags: ["POSH", "workplace", "sexual harassment", "ICC", "women"],
    readTime: "7 min",
    content:
      "The Sexual Harassment of Women at Workplace (Prevention, Prohibition and Redressal) Act, 2013 (POSH Act) mandates every employer with 10 or more employees to constitute an Internal Complaints Committee (ICC). The Act defines sexual harassment broadly to include unwelcome physical contact, demands for sexual favours, sexually coloured remarks, showing pornography, and any other unwelcome physical, verbal or non-verbal conduct of sexual nature. The landmark Vishaka v. State of Rajasthan (1997) judgment laid the foundation for this legislation.",
    contentHi:
      "कार्यस्थल पर महिलाओं का यौन उत्पीड़न (रोकथाम, निषेध और निवारण) अधिनियम, 2013 (POSH अधिनियम) 10 या अधिक कर्मचारियों वाले प्रत्येक नियोक्ता को आंतरिक शिकायत समिति (ICC) गठित करने का आदेश देता है। अधिनियम यौन उत्पीड़न को व्यापक रूप से परिभाषित करता है जिसमें अवांछित शारीरिक संपर्क, यौन अनुग्रह की मांग, यौन रंगत वाली टिप्पणियां, अश्लील सामग्री दिखाना और यौन प्रकृति का कोई अन्य अवांछित शारीरिक, मौखिक या गैर-मौखिक आचरण शामिल है। विशाखा बनाम राजस्थान राज्य (1997) के ऐतिहासिक निर्णय ने इस कानून की नींव रखी।",
    rights: [
      "Right to a safe workplace — Every woman has the right to a workplace free from sexual harassment.",
      "Right to file a complaint — Section 9 allows filing within 3 months of the incident with the ICC.",
      "Right to confidentiality — Section 16 prohibits disclosure of the complainant's identity.",
      "Right to interim relief — Section 12 allows the ICC to recommend transfer, leave, or other interim measures.",
    ],
    rightsHi: [
      "सुरक्षित कार्यस्थल का अधिकार — प्रत्येक महिला को यौन उत्पीड़न से मुक्त कार्यस्थल का अधिकार है।",
      "शिकायत दर्ज करने का अधिकार — धारा 9 ICC के पास घटना के 3 महीने के भीतर शिकायत दर्ज करने की अनुमति देती है।",
      "गोपनीयता का अधिकार — धारा 16 शिकायतकर्ता की पहचान के प्रकटीकरण पर रोक लगाती है।",
      "अंतरिम राहत का अधिकार — धारा 12 ICC को स्थानांतरण, छुट्टी या अन्य अंतरिम उपायों की सिफारिश करने की अनुमति देती है।",
    ],
    steps: [
      {
        title: "Document the Harassment",
        titleHi: "उत्पीड़न का दस्तावेजीकरण करें",
        description:
          "Record dates, times, places, and details of every incident. Save any messages, emails, or evidence. Note names of witnesses.",
        descriptionHi:
          "प्रत्येक घटना की तिथियां, समय, स्थान और विवरण दर्ज करें। कोई भी संदेश, ईमेल या साक्ष्य सहेजें। गवाहों के नाम नोट करें।",
      },
      {
        title: "File a Written Complaint with ICC",
        titleHi: "ICC में लिखित शिकायत दर्ज करें",
        description:
          "Submit a written complaint to the Internal Complaints Committee within 3 months of the incident (extendable by 3 months in exceptional circumstances).",
        descriptionHi:
          "घटना के 3 महीने के भीतर आंतरिक शिकायत समिति को लिखित शिकायत जमा करें (असाधारण परिस्थितियों में 3 महीने और बढ़ाई जा सकती है)।",
      },
      {
        title: "Inquiry Process",
        titleHi: "जांच प्रक्रिया",
        description:
          "The ICC must complete its inquiry within 90 days. Both parties get a fair hearing. The principles of natural justice apply. The ICC submits its report to the employer.",
        descriptionHi:
          "ICC को 90 दिनों के भीतर अपनी जांच पूरी करनी चाहिए। दोनों पक्षों को निष्पक्ष सुनवाई मिलती है। प्राकृतिक न्याय के सिद्धांत लागू होते हैं। ICC नियोक्ता को अपनी रिपोर्ट प्रस्तुत करती है।",
      },
      {
        title: "Action and Appeal",
        titleHi: "कार्रवाई और अपील",
        description:
          "The employer must act on ICC recommendations within 60 days. If unsatisfied with the outcome, you can appeal to a court or tribunal within 90 days.",
        descriptionHi:
          "नियोक्ता को 60 दिनों के भीतर ICC की सिफारिशों पर कार्रवाई करनी चाहिए। यदि परिणाम से असंतुष्ट हैं, तो आप 90 दिनों के भीतर अदालत या ट्रिब्यूनल में अपील कर सकते हैं।",
      },
    ],
    relatedLawSections: [
      "Section 2(n) — POSH Act, 2013 (Definition of sexual harassment)",
      "Section 4 — POSH Act, 2013 (Constitution of ICC)",
      "Section 9 — POSH Act, 2013 (Complaint of sexual harassment)",
      "Vishaka v. State of Rajasthan (1997) — Supreme Court",
    ],
    readCount: 856,
    featured: false,
    order: 7,
  },
  {
    title: "Wrongful Termination",
    titleHi: "गलत बर्खास्तगी",
    slug: "wrongful-termination",
    category: "employment",
    description:
      "Know your rights when unfairly dismissed from employment, including protections under the Industrial Disputes Act and remedies available.",
    descriptionHi:
      "रोजगार से अनुचित बर्खास्तगी के समय अपने अधिकारों को जानें, जिसमें औद्योगिक विवाद अधिनियम के तहत सुरक्षा और उपलब्ध उपचार शामिल हैं।",
    icon: "flag",
    tags: ["employment", "termination", "retrenchment", "labour", "Industrial Disputes Act"],
    readTime: "6 min",
    content:
      "Indian labour law provides significant protections against arbitrary termination. The Industrial Disputes Act, 1947 requires employers with 100 or more workers to obtain government permission before retrenchment. Even for smaller establishments, specific procedures must be followed — proper notice, retrenchment compensation, and the principle of 'last come, first go.' If you have been terminated without following due process, you may be entitled to reinstatement, back wages, and compensation. The Act also protects workers who participate in lawful strikes or union activities from victimization.",
    contentHi:
      "भारतीय श्रम कानून मनमानी बर्खास्तगी के विरुद्ध महत्वपूर्ण सुरक्षा प्रदान करता है। औद्योगिक विवाद अधिनियम, 1947 के अनुसार 100 या अधिक श्रमिकों वाले नियोक्ताओं को छंटनी से पहले सरकार की अनुमति लेनी होती है। छोटे प्रतिष्ठानों के लिए भी विशिष्ट प्रक्रियाओं का पालन करना आवश्यक है — उचित नोटिस, छंटनी मुआवजा, और 'अंतिम आने वाला, पहले जाएगा' का सिद्धांत। यदि आपको उचित प्रक्रिया का पालन किए बिना बर्खास्त किया गया है, तो आप पुनर्स्थापन, पिछले वेतन और मुआवजे के हकदार हो सकते हैं।",
    rights: [
      "Right to notice before retrenchment — Section 25F requires one month's notice or wages in lieu of notice.",
      "Right to retrenchment compensation — 15 days' average pay for every completed year of service under Section 25F.",
      "Right to government approval — Section 25N requires prior government permission for retrenchment in establishments with 100+ workers.",
      "Right to raise an industrial dispute — Section 2A allows individual workers to raise disputes before labour courts.",
    ],
    rightsHi: [
      "छंटनी से पहले नोटिस का अधिकार — धारा 25F एक महीने के नोटिस या नोटिस के बदले वेतन की आवश्यकता रखती है।",
      "छंटनी मुआवजे का अधिकार — धारा 25F के तहत प्रत्येक पूर्ण सेवा वर्ष के लिए 15 दिन का औसत वेतन।",
      "सरकारी अनुमोदन का अधिकार — धारा 25N 100+ श्रमिकों वाले प्रतिष्ठानों में छंटनी के लिए पूर्व सरकारी अनुमति आवश्यक करती है।",
      "औद्योगिक विवाद उठाने का अधिकार — धारा 2A व्यक्तिगत श्रमिकों को श्रम न्यायालयों के समक्ष विवाद उठाने की अनुमति देती है।",
    ],
    steps: [
      {
        title: "Review Your Termination Letter",
        titleHi: "अपना बर्खास्तगी पत्र समीक्षा करें",
        description:
          "Check whether proper procedure was followed — notice period, stated reasons, and whether retrenchment compensation was offered as required by law.",
        descriptionHi:
          "जांचें कि क्या उचित प्रक्रिया का पालन किया गया — नोटिस अवधि, बताए गए कारण, और क्या कानून द्वारा आवश्यक छंटनी मुआवजा दिया गया।",
      },
      {
        title: "File a Complaint with Labour Department",
        titleHi: "श्रम विभाग में शिकायत दर्ज करें",
        description:
          "Approach the local Labour Commissioner or Assistant Labour Commissioner for conciliation. This is often the fastest path to resolution.",
        descriptionHi:
          "सुलह के लिए स्थानीय श्रम आयुक्त या सहायक श्रम आयुक्त से संपर्क करें। यह अक्सर समाधान का सबसे तेज मार्ग होता है।",
      },
      {
        title: "Raise an Industrial Dispute",
        titleHi: "औद्योगिक विवाद उठाएं",
        description:
          "If conciliation fails, the matter can be referred to the Labour Court or Industrial Tribunal under Section 10 of the Industrial Disputes Act.",
        descriptionHi:
          "यदि सुलह विफल होती है, तो मामले को औद्योगिक विवाद अधिनियम की धारा 10 के तहत श्रम न्यायालय या औद्योगिक अधिकरण के पास भेजा जा सकता है।",
      },
    ],
    relatedLawSections: [
      "Section 2A — Industrial Disputes Act, 1947 (Dismissal of individual workman as dispute)",
      "Section 25F — Industrial Disputes Act, 1947 (Conditions for retrenchment)",
      "Section 25N — Industrial Disputes Act, 1947 (Conditions for retrenchment in certain establishments)",
    ],
    readCount: 743,
    featured: false,
    order: 8,
  },
  {
    title: "Property Inheritance Rights",
    titleHi: "संपत्ति उत्तराधिकार अधिकार",
    slug: "property-inheritance-rights",
    category: "property",
    description:
      "Understand your inheritance rights under Indian law, including the Hindu Succession Act amendments granting equal rights to daughters.",
    descriptionHi:
      "भारतीय कानून के तहत अपने उत्तराधिकार अधिकारों को समझें, जिसमें हिंदू उत्तराधिकार अधिनियम संशोधन शामिल है जो बेटियों को समान अधिकार प्रदान करता है।",
    icon: "home",
    tags: ["inheritance", "property", "succession", "will", "Hindu Succession Act"],
    readTime: "8 min",
    content:
      "Property inheritance in India is governed by personal laws based on religion. For Hindus, Buddhists, Jains, and Sikhs, the Hindu Succession Act, 1956 is the primary legislation. The landmark 2005 amendment (effective from September 9, 2005) gave daughters equal coparcenary rights in ancestral property — the same as sons. The Supreme Court in Vineeta Sharma v. Rakesh Sharma (2020) clarified that this right is by birth and does not depend on whether the father was alive on the date of the amendment. For Muslims, the Muslim Personal Law (Shariat) governs inheritance with prescribed shares. Indian Succession Act, 1925 applies to Christians and Parsis.",
    contentHi:
      "भारत में संपत्ति उत्तराधिकार धर्म के आधार पर व्यक्तिगत कानूनों द्वारा शासित होता है। हिंदुओं, बौद्धों, जैनों और सिखों के लिए हिंदू उत्तराधिकार अधिनियम, 1956 प्राथमिक कानून है। 2005 के ऐतिहासिक संशोधन ने बेटियों को पैतृक संपत्ति में बेटों के समान सहदायिक अधिकार प्रदान किए। सर्वोच्च न्यायालय ने विनीता शर्मा बनाम राकेश शर्मा (2020) में स्पष्ट किया कि यह अधिकार जन्म से है और इस पर निर्भर नहीं करता कि संशोधन की तारीख पर पिता जीवित थे या नहीं। मुसलमानों के लिए मुस्लिम व्यक्तिगत कानून (शरीयत) निर्धारित हिस्सों के साथ उत्तराधिकार को नियंत्रित करता है। भारतीय उत्तराधिकार अधिनियम, 1925 ईसाइयों और पारसियों पर लागू होता है।",
    rights: [
      "Daughters have equal coparcenary rights in ancestral property — Hindu Succession (Amendment) Act, 2005.",
      "Right to inherit self-acquired property of parents if they die intestate — Governed by personal law.",
      "Right to execute a Will for distribution of self-acquired property — Indian Succession Act, 1925.",
      "Widow's right to husband's property — Share varies based on applicable personal law.",
      "Right to challenge an unfair Will — Wills can be contested on grounds of undue influence, fraud, or incapacity.",
    ],
    rightsHi: [
      "पैतृक संपत्ति में बेटियों को समान सहदायिक अधिकार — हिंदू उत्तराधिकार (संशोधन) अधिनियम, 2005।",
      "माता-पिता की बिना वसीयत मृत्यु होने पर स्वअर्जित संपत्ति उत्तराधिकार का अधिकार — व्यक्तिगत कानून द्वारा शासित।",
      "स्वअर्जित संपत्ति के वितरण के लिए वसीयत बनाने का अधिकार — भारतीय उत्तराधिकार अधिनियम, 1925।",
      "विधवा का पति की संपत्ति पर अधिकार — हिस्सा लागू व्यक्तिगत कानून पर निर्भर करता है।",
      "अनुचित वसीयत को चुनौती देने का अधिकार — अनुचित प्रभाव, धोखाधड़ी या अक्षमता के आधार पर वसीयत पर विवाद किया जा सकता है।",
    ],
    steps: [
      {
        title: "Identify the Type of Property",
        titleHi: "संपत्ति का प्रकार पहचानें",
        description:
          "Determine whether the property is ancestral (inherited for four generations undivided) or self-acquired. Different rules apply to each type.",
        descriptionHi:
          "निर्धारित करें कि संपत्ति पैतृक है (चार पीढ़ियों से अविभाजित विरासत) या स्वअर्जित। प्रत्येक प्रकार पर अलग नियम लागू होते हैं।",
      },
      {
        title: "Check for a Valid Will",
        titleHi: "वैध वसीयत की जांच करें",
        description:
          "If the deceased left a Will, it must be probated (for property in Kolkata, Mumbai, Chennai) or produced before the revenue authority. Verify its validity.",
        descriptionHi:
          "यदि मृतक ने वसीयत छोड़ी है, तो इसे प्रोबेट कराना होगा (कोलकाता, मुंबई, चेन्नई में संपत्ति के लिए) या राजस्व प्राधिकरण के समक्ष प्रस्तुत करना होगा। इसकी वैधता सत्यापित करें।",
      },
      {
        title: "Apply for Mutation and Transfer",
        titleHi: "नामांतरण और हस्तांतरण के लिए आवेदन करें",
        description:
          "Apply for mutation of the property records at the local revenue office. Submit the death certificate, succession certificate or legal heir certificate, and identity proof.",
        descriptionHi:
          "स्थानीय राजस्व कार्यालय में संपत्ति अभिलेखों के नामांतरण के लिए आवेदन करें। मृत्यु प्रमाणपत्र, उत्तराधिकार प्रमाणपत्र या कानूनी वारिस प्रमाणपत्र, और पहचान प्रमाण जमा करें।",
      },
      {
        title: "Resolve Disputes if Any",
        titleHi: "यदि विवाद हो तो समाधान करें",
        description:
          "If there is a dispute among heirs, try mediation first. If unresolved, file a civil suit for partition in the civil court of competent jurisdiction.",
        descriptionHi:
          "यदि वारिसों के बीच विवाद है, तो पहले मध्यस्थता का प्रयास करें। यदि समाधान नहीं होता, तो सक्षम क्षेत्राधिकार के सिविल न्यायालय में बंटवारे का सिविल वाद दायर करें।",
      },
    ],
    relatedLawSections: [
      "Section 6 — Hindu Succession Act, 1956 (Devolution of interest of coparcenary property)",
      "Hindu Succession (Amendment) Act, 2005",
      "Vineeta Sharma v. Rakesh Sharma (2020) — Supreme Court",
      "Indian Succession Act, 1925",
    ],
    readCount: 1567,
    featured: false,
    order: 9,
  },
  {
    title: "Bail Application Guide",
    titleHi: "जमानत आवेदन गाइड",
    slug: "bail-application-guide",
    category: "criminal",
    description:
      "Understand the types of bail in India and how to apply for regular, anticipatory, and default bail under the BNSS.",
    descriptionHi:
      "भारत में जमानत के प्रकारों को समझें और BNSS के तहत नियमित, अग्रिम और डिफ़ॉल्ट जमानत के लिए आवेदन कैसे करें।",
    icon: "lock",
    tags: ["bail", "criminal", "BNSS", "anticipatory bail", "court"],
    readTime: "7 min",
    content:
      "Bail is a fundamental right rooted in the principle that every person is presumed innocent until proven guilty. The Bharatiya Nagarik Suraksha Sanhita (BNSS), 2023 provides for different types of bail — regular bail (Sections 478-479), anticipatory bail (Section 482), and default bail (Section 479(2)) when the chargesheet is not filed within the prescribed period. The Supreme Court has consistently held that bail is the rule and jail is the exception. The landmark judgment in Satender Kumar Antil v. CBI (2022) laid down comprehensive guidelines for granting bail.",
    contentHi:
      "जमानत एक मौलिक अधिकार है जो इस सिद्धांत पर आधारित है कि प्रत्येक व्यक्ति को दोषी सिद्ध होने तक निर्दोष माना जाता है। भारतीय नागरिक सुरक्षा संहिता (BNSS), 2023 विभिन्न प्रकार की जमानत प्रदान करती है — नियमित जमानत (धारा 478-479), अग्रिम जमानत (धारा 482), और डिफ़ॉल्ट जमानत (धारा 479(2)) जब निर्धारित अवधि के भीतर आरोपपत्र दाखिल नहीं किया जाता। सर्वोच्च न्यायालय ने लगातार माना है कि जमानत नियम है और जेल अपवाद। सतेंद्र कुमार अंतिल बनाम CBI (2022) के ऐतिहासिक निर्णय ने जमानत देने के लिए व्यापक दिशानिर्देश निर्धारित किए।",
    rights: [
      "Right to apply for bail — Available at any stage of the proceedings to any accused person.",
      "Right to anticipatory bail — Section 482 BNSS allows applying before arrest if you reasonably believe you may be arrested.",
      "Right to default bail — Section 479(2) BNSS grants bail if the investigation is not completed within 60/90 days.",
      "Right to legal representation — Bail applications can be filed through a lawyer before the appropriate court.",
    ],
    rightsHi: [
      "जमानत के लिए आवेदन करने का अधिकार — कार्यवाही के किसी भी चरण में किसी भी आरोपी को उपलब्ध।",
      "अग्रिम जमानत का अधिकार — BNSS की धारा 482 गिरफ्तारी से पहले आवेदन करने की अनुमति देती है यदि आप उचित रूप से विश्वास करते हैं कि आप गिरफ्तार हो सकते हैं।",
      "डिफ़ॉल्ट जमानत का अधिकार — BNSS की धारा 479(2) जमानत प्रदान करती है यदि जांच 60/90 दिनों के भीतर पूरी नहीं होती।",
      "कानूनी प्रतिनिधित्व का अधिकार — जमानत आवेदन उपयुक्त अदालत के समक्ष वकील के माध्यम से दाखिल किए जा सकते हैं।",
    ],
    steps: [
      {
        title: "Determine the Type of Bail",
        titleHi: "जमानत का प्रकार निर्धारित करें",
        description:
          "Assess your situation: regular bail (already arrested), anticipatory bail (apprehend arrest), or default bail (chargesheet not filed in time).",
        descriptionHi:
          "अपनी स्थिति का आकलन करें: नियमित जमानत (पहले से गिरफ्तार), अग्रिम जमानत (गिरफ्तारी की आशंका), या डिफ़ॉल्ट जमानत (समय पर आरोपपत्र दाखिल नहीं)।",
      },
      {
        title: "Engage a Lawyer",
        titleHi: "वकील नियुक्त करें",
        description:
          "A criminal lawyer will draft the bail application citing relevant grounds — nature of offence, likelihood of flight risk, health conditions, and available sureties.",
        descriptionHi:
          "एक आपराधिक वकील संबंधित आधारों का हवाला देते हुए जमानत आवेदन तैयार करेगा — अपराध की प्रकृति, भागने का खतरा, स्वास्थ्य स्थिति और उपलब्ध जमानतदार।",
      },
      {
        title: "File Before the Appropriate Court",
        titleHi: "उपयुक्त अदालत के समक्ष दाखिल करें",
        description:
          "Regular bail can be filed before the Sessions Court or High Court. Anticipatory bail must be filed in the Sessions Court or High Court. Include supporting documents and surety details.",
        descriptionHi:
          "नियमित जमानत सत्र न्यायालय या उच्च न्यायालय के समक्ष दाखिल की जा सकती है। अग्रिम जमानत सत्र न्यायालय या उच्च न्यायालय में दाखिल की जानी चाहिए। सहायक दस्तावेज और जमानतदार विवरण शामिल करें।",
      },
      {
        title: "Comply with Bail Conditions",
        titleHi: "जमानत शर्तों का पालन करें",
        description:
          "If bail is granted, strictly comply with all conditions — surrender passport, regular reporting to police station, not leaving jurisdiction without permission.",
        descriptionHi:
          "यदि जमानत मिल जाती है, तो सभी शर्तों का कड़ाई से पालन करें — पासपोर्ट जमा करना, थाने में नियमित हाजिरी, बिना अनुमति क्षेत्राधिकार न छोड़ना।",
      },
    ],
    relatedLawSections: [
      "Section 478 — BNSS (When bail may be taken in case of non-bailable offence)",
      "Section 479 — BNSS (Amount of bond and reduction thereof)",
      "Section 482 — BNSS (Direction for grant of bail to person apprehending arrest)",
      "Satender Kumar Antil v. CBI (2022) — Supreme Court",
    ],
    readCount: 1345,
    featured: false,
    order: 10,
  },
  {
    title: "Filing a Consumer Complaint Online",
    titleHi: "ऑनलाइन उपभोक्ता शिकायत दर्ज करना",
    slug: "consumer-complaint-online",
    category: "consumer",
    description:
      "Step-by-step guide to filing consumer complaints through the e-Daakhil portal (edaakhil.nic.in) and other digital platforms.",
    descriptionHi:
      "ई-दाखिल पोर्टल (edaakhil.nic.in) और अन्य डिजिटल प्लेटफॉर्म के माध्यम से उपभोक्ता शिकायत दर्ज करने की चरणबद्ध गाइड।",
    icon: "doc",
    tags: ["consumer", "e-filing", "edaakhil", "online complaint", "digital"],
    readTime: "5 min",
    content:
      "The e-Daakhil portal (edaakhil.nic.in) is the official platform for filing consumer complaints online across India. Launched by the Department of Consumer Affairs, it enables consumers to file complaints, upload documents, pay fees, and track case status from anywhere. This eliminates the need to physically visit consumer commissions. The portal supports complaints at District, State, and National Consumer Disputes Redressal Commissions. Additionally, the National Consumer Helpline (1800-11-4000) and the INGRAM portal provide alternative avenues for grievance redressal.",
    contentHi:
      "ई-दाखिल पोर्टल (edaakhil.nic.in) पूरे भारत में उपभोक्ता शिकायत ऑनलाइन दर्ज करने का आधिकारिक मंच है। उपभोक्ता मामलों के विभाग द्वारा शुरू किया गया, यह उपभोक्ताओं को कहीं से भी शिकायत दर्ज करने, दस्तावेज अपलोड करने, शुल्क भुगतान करने और केस की स्थिति ट्रैक करने में सक्षम बनाता है। इससे उपभोक्ता आयोगों में शारीरिक रूप से जाने की आवश्यकता समाप्त हो जाती है। पोर्टल जिला, राज्य और राष्ट्रीय उपभोक्ता विवाद निवारण आयोगों में शिकायतों का समर्थन करता है।",
    rights: [
      "Right to e-file complaints from anywhere in India — Available through edaakhil.nic.in.",
      "Right to track case status online — Real-time updates on complaint progress.",
      "Right to call the National Consumer Helpline — Toll-free number 1800-11-4000 for guidance.",
    ],
    rightsHi: [
      "भारत में कहीं से भी ई-फाइल शिकायत का अधिकार — edaakhil.nic.in के माध्यम से उपलब्ध।",
      "ऑनलाइन केस स्थिति ट्रैक करने का अधिकार — शिकायत प्रगति पर रीयल-टाइम अपडेट।",
      "राष्ट्रीय उपभोक्ता हेल्पलाइन पर कॉल करने का अधिकार — मार्गदर्शन के लिए टोल-फ्री नंबर 1800-11-4000।",
    ],
    steps: [
      {
        title: "Register on e-Daakhil",
        titleHi: "ई-दाखिल पर पंजीकरण करें",
        description:
          "Visit edaakhil.nic.in and create an account using your mobile number and email. Verify your identity through OTP.",
        descriptionHi:
          "edaakhil.nic.in पर जाएं और अपने मोबाइल नंबर और ईमेल से खाता बनाएं। OTP के माध्यम से अपनी पहचान सत्यापित करें।",
      },
      {
        title: "Fill the Complaint Form",
        titleHi: "शिकायत फॉर्म भरें",
        description:
          "Select the appropriate commission (District/State/National) based on claim amount. Fill in details of the opposite party, nature of complaint, and relief sought.",
        descriptionHi:
          "दावे की राशि के आधार पर उपयुक्त आयोग (जिला/राज्य/राष्ट्रीय) चुनें। विपक्षी पार्टी का विवरण, शिकायत की प्रकृति और मांगी गई राहत भरें।",
      },
      {
        title: "Upload Documents and Pay Fee",
        titleHi: "दस्तावेज अपलोड करें और शुल्क भुगतान करें",
        description:
          "Upload all supporting documents — bills, receipts, notices sent, photographs. Pay the prescribed fee online (ranges from Rs. 100 to Rs. 5,000 based on claim amount).",
        descriptionHi:
          "सभी सहायक दस्तावेज अपलोड करें — बिल, रसीदें, भेजे गए नोटिस, तस्वीरें। निर्धारित शुल्क ऑनलाइन भुगतान करें (दावे की राशि के आधार पर 100 से 5,000 रुपये)।",
      },
      {
        title: "Track and Attend Hearings",
        titleHi: "ट्रैक करें और सुनवाई में उपस्थित हों",
        description:
          "Monitor your case status on the portal. Attend virtual or physical hearings as scheduled. Respond to any notices within the given timeline.",
        descriptionHi:
          "पोर्टल पर अपने केस की स्थिति की निगरानी करें। निर्धारित समय पर आभासी या भौतिक सुनवाई में उपस्थित हों। दिए गए समय के भीतर किसी भी नोटिस का जवाब दें।",
      },
    ],
    relatedLawSections: [
      "Section 35 — Consumer Protection Act, 2019 (Jurisdiction of District Commission)",
      "Section 38 — Consumer Protection Act, 2019 (Manner of filing complaint)",
      "Consumer Protection (E-Commerce) Rules, 2020",
    ],
    readCount: 678,
    featured: false,
    order: 11,
  },
  {
    title: "Cyber Crime Reporting",
    titleHi: "साइबर अपराध की रिपोर्टिंग",
    slug: "cyber-crime-reporting",
    category: "criminal",
    description:
      "How to report cyber crimes in India, including online fraud, identity theft, cyberstalking, and social media offences under the IT Act and BNS.",
    descriptionHi:
      "भारत में साइबर अपराध की रिपोर्ट कैसे करें, जिसमें IT अधिनियम और BNS के तहत ऑनलाइन धोखाधड़ी, पहचान चोरी, साइबरस्टॉकिंग और सोशल मीडिया अपराध शामिल हैं।",
    icon: "lock",
    tags: ["cyber crime", "IT Act", "online fraud", "hacking", "identity theft"],
    readTime: "6 min",
    content:
      "Cyber crime in India is addressed through the Information Technology Act, 2000 (IT Act) and the Bharatiya Nyaya Sanhita (BNS), 2023. The National Cyber Crime Reporting Portal (cybercrime.gov.in) is the centralized platform for reporting all types of cyber crimes. The IT Act covers offences like hacking (Section 66), identity theft (Section 66C), cheating by impersonation (Section 66D), and publication of obscene material (Section 67). The BNS also covers cyber-enabled traditional crimes. Quick reporting is essential as digital evidence can be lost rapidly.",
    contentHi:
      "भारत में साइबर अपराध का निवारण सूचना प्रौद्योगिकी अधिनियम, 2000 (IT अधिनियम) और भारतीय न्याय संहिता (BNS), 2023 के माध्यम से किया जाता है। राष्ट्रीय साइबर अपराध रिपोर्टिंग पोर्टल (cybercrime.gov.in) सभी प्रकार के साइबर अपराधों की रिपोर्ट करने का केंद्रीकृत मंच है। IT अधिनियम हैकिंग (धारा 66), पहचान चोरी (धारा 66C), प्रतिरूपण द्वारा धोखाधड़ी (धारा 66D), और अश्लील सामग्री प्रकाशन (धारा 67) जैसे अपराधों को शामिल करता है। त्वरित रिपोर्टिंग आवश्यक है क्योंकि डिजिटल साक्ष्य तेजी से नष्ट हो सकते हैं।",
    rights: [
      "Right to report online — File complaints at cybercrime.gov.in without visiting a police station.",
      "Right to financial fraud reporting — Call 1930 (Cyber Crime Helpline) immediately for financial fraud to freeze transactions.",
      "Right to data protection — Section 43A IT Act provides compensation for failure to protect personal data.",
      "Right to FIR — Cyber crimes are cognizable offences; police must register an FIR.",
    ],
    rightsHi: [
      "ऑनलाइन रिपोर्ट करने का अधिकार — थाने जाए बिना cybercrime.gov.in पर शिकायत दर्ज करें।",
      "वित्तीय धोखाधड़ी रिपोर्टिंग का अधिकार — लेनदेन रोकने के लिए तुरंत 1930 (साइबर अपराध हेल्पलाइन) पर कॉल करें।",
      "डेटा सुरक्षा का अधिकार — IT अधिनियम की धारा 43A व्यक्तिगत डेटा की सुरक्षा में विफलता के लिए मुआवजा प्रदान करती है।",
      "एफआईआर का अधिकार — साइबर अपराध संज्ञेय अपराध हैं; पुलिस को एफआईआर दर्ज करनी चाहिए।",
    ],
    steps: [
      {
        title: "Preserve Evidence Immediately",
        titleHi: "तुरंत साक्ष्य संरक्षित करें",
        description:
          "Take screenshots of messages, emails, transactions, and URLs. Save chat logs and call records. Do not delete anything.",
        descriptionHi:
          "संदेशों, ईमेल, लेनदेन और URL के स्क्रीनशॉट लें। चैट लॉग और कॉल रिकॉर्ड सहेजें। कुछ भी न हटाएं।",
      },
      {
        title: "Report on the National Portal",
        titleHi: "राष्ट्रीय पोर्टल पर रिपोर्ट करें",
        description:
          "Visit cybercrime.gov.in and file a complaint. For financial fraud, call 1930 immediately — the quicker you report, the higher the chances of recovering funds.",
        descriptionHi:
          "cybercrime.gov.in पर जाएं और शिकायत दर्ज करें। वित्तीय धोखाधड़ी के लिए तुरंत 1930 पर कॉल करें — जितनी जल्दी रिपोर्ट करेंगे, धन वापसी की संभावना उतनी अधिक होगी।",
      },
      {
        title: "File an FIR at the Cyber Cell",
        titleHi: "साइबर सेल में एफआईआर दर्ज करें",
        description:
          "Visit the nearest cyber crime police station or cyber cell. Bring all evidence, including printed screenshots and bank statements.",
        descriptionHi:
          "निकटतम साइबर अपराध थाने या साइबर सेल में जाएं। प्रिंटेड स्क्रीनशॉट और बैंक स्टेटमेंट सहित सभी साक्ष्य लाएं।",
      },
    ],
    relatedLawSections: [
      "Section 66 — IT Act, 2000 (Computer related offences)",
      "Section 66C — IT Act, 2000 (Identity theft)",
      "Section 66D — IT Act, 2000 (Cheating by personation using computer resource)",
      "Section 67 — IT Act, 2000 (Publishing obscene information)",
    ],
    readCount: 923,
    featured: false,
    order: 12,
  },
  {
    title: "Land Dispute Resolution",
    titleHi: "भूमि विवाद समाधान",
    slug: "land-dispute-resolution",
    category: "property",
    description:
      "Navigating land disputes in India — from revenue court remedies to civil suits, including partition, title disputes, and encroachment.",
    descriptionHi:
      "भारत में भूमि विवादों का निवारण — राजस्व न्यायालय उपचारों से लेकर सिविल वाद तक, जिसमें बंटवारा, स्वामित्व विवाद और अतिक्रमण शामिल है।",
    icon: "map",
    tags: ["land dispute", "property", "title", "encroachment", "revenue court"],
    readTime: "7 min",
    content:
      "Land disputes are among the most common legal conflicts in India, with cases often spanning decades. These disputes can involve title issues, boundary conflicts, encroachment, partition among co-owners, or possession disputes. Resolution mechanisms include revenue courts (for record and mutation disputes), civil courts (for title and possession), and alternative dispute resolution. The Transfer of Property Act, 1882 and the Code of Civil Procedure (CPC) are the primary laws governing property disputes. Recent digitization efforts like the Digital India Land Records Modernization Programme (DILRMP) have improved transparency in land records.",
    contentHi:
      "भूमि विवाद भारत में सबसे आम कानूनी संघर्षों में से हैं, जिनमें मामले अक्सर दशकों तक चलते हैं। इन विवादों में स्वामित्व मुद्दे, सीमा संघर्ष, अतिक्रमण, सह-स्वामियों के बीच बंटवारा, या कब्जा विवाद शामिल हो सकते हैं। समाधान तंत्रों में राजस्व न्यायालय (अभिलेख और नामांतरण विवाद), सिविल न्यायालय (स्वामित्व और कब्जा), और वैकल्पिक विवाद समाधान शामिल हैं। संपत्ति हस्तांतरण अधिनियम, 1882 और सिविल प्रक्रिया संहिता (CPC) संपत्ति विवादों को नियंत्रित करने वाले प्राथमिक कानून हैं।",
    rights: [
      "Right to clear title — You can file a declaratory suit under Section 34 of the Specific Relief Act, 1963 to establish ownership.",
      "Right against encroachment — Section 5 of the Specific Relief Act allows recovery of specific immovable property.",
      "Right to partition — Co-owners can file a partition suit under CPC Order XX Rule 18.",
      "Right to injunction — Section 38 of the Specific Relief Act allows temporary and permanent injunctions to prevent interference.",
    ],
    rightsHi: [
      "स्पष्ट स्वामित्व का अधिकार — आप स्वामित्व स्थापित करने के लिए विशिष्ट अनुतोष अधिनियम, 1963 की धारा 34 के तहत घोषणात्मक वाद दायर कर सकते हैं।",
      "अतिक्रमण के विरुद्ध अधिकार — विशिष्ट अनुतोष अधिनियम की धारा 5 विशिष्ट अचल संपत्ति की वसूली की अनुमति देती है।",
      "बंटवारे का अधिकार — सह-स्वामी CPC आदेश XX नियम 18 के तहत बंटवारे का वाद दायर कर सकते हैं।",
      "निषेधाज्ञा का अधिकार — विशिष्ट अनुतोष अधिनियम की धारा 38 हस्तक्षेप रोकने के लिए अस्थायी और स्थायी निषेधाज्ञा की अनुमति देती है।",
    ],
    steps: [
      {
        title: "Verify Land Records",
        titleHi: "भूमि अभिलेख सत्यापित करें",
        description:
          "Obtain certified copies of the land records from the Revenue Department. Check the 7/12 extract (in Maharashtra), khatauni, khasra, or equivalent records in your state.",
        descriptionHi:
          "राजस्व विभाग से भूमि अभिलेखों की प्रमाणित प्रतियां प्राप्त करें। अपने राज्य में 7/12 उतारा (महाराष्ट्र में), खतौनी, खसरा, या समकक्ष अभिलेख जांचें।",
      },
      {
        title: "Attempt Mediation",
        titleHi: "मध्यस्थता का प्रयास करें",
        description:
          "Many land disputes can be resolved through Lok Adalats or mediation centres. This is faster and less expensive than litigation.",
        descriptionHi:
          "कई भूमि विवाद लोक अदालतों या मध्यस्थता केंद्रों के माध्यम से हल किए जा सकते हैं। यह मुकदमेबाजी से तेज और कम खर्चीला है।",
      },
      {
        title: "File a Civil Suit",
        titleHi: "सिविल वाद दायर करें",
        description:
          "If mediation fails, file a civil suit in the court of competent jurisdiction. Ensure you file within the limitation period — 12 years for possession, 3 years for other civil suits.",
        descriptionHi:
          "यदि मध्यस्थता विफल होती है, तो सक्षम क्षेत्राधिकार के न्यायालय में सिविल वाद दायर करें। सुनिश्चित करें कि आप परिसीमा अवधि के भीतर दायर करें — कब्जे के लिए 12 वर्ष, अन्य सिविल वाद के लिए 3 वर्ष।",
      },
    ],
    relatedLawSections: [
      "Section 34 — Specific Relief Act, 1963 (Declaratory decrees)",
      "Section 38 — Specific Relief Act, 1963 (Perpetual injunction)",
      "Order XX Rule 18 — CPC (Decree in suit for partition)",
      "Transfer of Property Act, 1882",
    ],
    readCount: 1102,
    featured: false,
    order: 13,
  },
  {
    title: "Maternity Benefits",
    titleHi: "मातृत्व लाभ",
    slug: "maternity-benefits",
    category: "employment",
    description:
      "Complete guide to maternity benefits for working women in India under the Maternity Benefit Act, 1961, including leave, pay, and workplace protections.",
    descriptionHi:
      "मातृत्व लाभ अधिनियम, 1961 के तहत भारत में कामकाजी महिलाओं के लिए मातृत्व लाभों की संपूर्ण गाइड, जिसमें छुट्टी, वेतन और कार्यस्थल सुरक्षा शामिल है।",
    icon: "heart",
    tags: ["maternity", "employment", "women", "leave", "benefits"],
    readTime: "5 min",
    content:
      "The Maternity Benefit Act, 1961 (as amended in 2017) provides comprehensive protections for working women during pregnancy and after childbirth. The 2017 amendment increased paid maternity leave from 12 to 26 weeks for the first two children and mandated creche facilities in establishments with 50 or more employees. The Act applies to every establishment employing 10 or more persons. Women who have worked for at least 80 days in the 12 months preceding the expected delivery date are eligible. The Act also provides for miscarriage leave, medical bonus, and protection against dismissal during maternity.",
    contentHi:
      "मातृत्व लाभ अधिनियम, 1961 (2017 में संशोधित) गर्भावस्था और प्रसव के बाद कामकाजी महिलाओं को व्यापक सुरक्षा प्रदान करता है। 2017 के संशोधन ने पहले दो बच्चों के लिए सवेतन मातृत्व अवकाश 12 से बढ़ाकर 26 सप्ताह कर दिया और 50 या अधिक कर्मचारियों वाले प्रतिष्ठानों में शिशुगृह सुविधाओं को अनिवार्य कर दिया। यह अधिनियम 10 या अधिक व्यक्तियों को रोजगार देने वाले प्रत्येक प्रतिष्ठान पर लागू होता है। अपेक्षित प्रसव तिथि से पूर्व 12 महीनों में कम से कम 80 दिन काम करने वाली महिलाएं पात्र हैं।",
    rights: [
      "Right to 26 weeks paid maternity leave — For the first two children under the Maternity Benefit (Amendment) Act, 2017.",
      "Right to medical bonus — Rs. 3,500 or as prescribed if the employer does not provide free medical care.",
      "Right to creche facility — Mandatory in establishments with 50 or more employees.",
      "Right against dismissal — Section 12 prohibits dismissal during maternity leave.",
      "Right to work from home — Section 5(5) allows negotiation of work-from-home arrangements after maternity leave.",
    ],
    rightsHi: [
      "26 सप्ताह सवेतन मातृत्व अवकाश का अधिकार — मातृत्व लाभ (संशोधन) अधिनियम, 2017 के तहत पहले दो बच्चों के लिए।",
      "चिकित्सा बोनस का अधिकार — यदि नियोक्ता मुफ्त चिकित्सा देखभाल प्रदान नहीं करता तो 3,500 रुपये या निर्धारित राशि।",
      "शिशुगृह सुविधा का अधिकार — 50 या अधिक कर्मचारियों वाले प्रतिष्ठानों में अनिवार्य।",
      "बर्खास्तगी के विरुद्ध अधिकार — धारा 12 मातृत्व अवकाश के दौरान बर्खास्तगी पर रोक लगाती है।",
      "घर से काम करने का अधिकार — धारा 5(5) मातृत्व अवकाश के बाद वर्क-फ्रॉम-होम व्यवस्था की बातचीत की अनुमति देती है।",
    ],
    steps: [
      {
        title: "Notify Your Employer",
        titleHi: "अपने नियोक्ता को सूचित करें",
        description:
          "Inform your employer in writing about your pregnancy and expected delivery date. The notice should be given at least 8 weeks before the expected delivery date.",
        descriptionHi:
          "अपने नियोक्ता को अपनी गर्भावस्था और अपेक्षित प्रसव तिथि के बारे में लिखित रूप में सूचित करें। नोटिस अपेक्षित प्रसव तिथि से कम से कम 8 सप्ताह पहले दिया जाना चाहिए।",
      },
      {
        title: "Submit Required Documents",
        titleHi: "आवश्यक दस्तावेज जमा करें",
        description:
          "Provide medical certificates confirming pregnancy and expected delivery date. After delivery, submit the birth certificate and discharge summary.",
        descriptionHi:
          "गर्भावस्था और अपेक्षित प्रसव तिथि की पुष्टि करने वाले चिकित्सा प्रमाणपत्र प्रदान करें। प्रसव के बाद जन्म प्रमाणपत्र और डिस्चार्ज सारांश जमा करें।",
      },
      {
        title: "Claim Your Benefits",
        titleHi: "अपने लाभों का दावा करें",
        description:
          "Maternity pay must be paid at the rate of average daily wage. If the employer delays or refuses payment, file a complaint with the Labour Inspector or Labour Court.",
        descriptionHi:
          "मातृत्व वेतन औसत दैनिक मजदूरी की दर से भुगतान किया जाना चाहिए। यदि नियोक्ता भुगतान में देरी करता है या मना करता है, तो श्रम निरीक्षक या श्रम न्यायालय में शिकायत दर्ज करें।",
      },
    ],
    relatedLawSections: [
      "Section 5 — Maternity Benefit Act, 1961 (Right to payment of maternity benefit)",
      "Section 12 — Maternity Benefit Act, 1961 (Dismissal during maternity)",
      "Maternity Benefit (Amendment) Act, 2017",
    ],
    readCount: 534,
    featured: false,
    order: 14,
  },
  {
    title: "Right to Education",
    titleHi: "शिक्षा का अधिकार",
    slug: "right-to-education",
    category: "rti",
    description:
      "Understanding the Right to Education under Article 21A of the Constitution and the RTE Act, 2009, including free and compulsory education for children aged 6-14.",
    descriptionHi:
      "संविधान के अनुच्छेद 21A और RTE अधिनियम, 2009 के तहत शिक्षा के अधिकार को समझें, जिसमें 6-14 वर्ष के बच्चों के लिए मुफ्त और अनिवार्य शिक्षा शामिल है।",
    icon: "book",
    tags: ["education", "RTE", "children", "school", "fundamental right"],
    readTime: "6 min",
    content:
      "The Right of Children to Free and Compulsory Education Act, 2009 (RTE Act) makes education a fundamental right for every child aged 6 to 14 years under Article 21A of the Constitution. The 86th Constitutional Amendment (2002) inserted Article 21A, and the RTE Act operationalized it. Key provisions include no capitation fee or screening for admission, 25% reservation in private unaided schools for economically weaker sections, qualified teacher requirements, and prohibition of corporal punishment. The Act places the responsibility of ensuring enrollment, attendance, and completion of elementary education on the appropriate government and local authorities.",
    contentHi:
      "बच्चों का मुफ्त और अनिवार्य शिक्षा अधिकार अधिनियम, 2009 (RTE अधिनियम) संविधान के अनुच्छेद 21A के तहत 6 से 14 वर्ष की आयु के प्रत्येक बच्चे के लिए शिक्षा को मौलिक अधिकार बनाता है। 86वें संविधान संशोधन (2002) ने अनुच्छेद 21A जोड़ा, और RTE अधिनियम ने इसे क्रियान्वित किया। प्रमुख प्रावधानों में प्रवेश के लिए कोई कैपिटेशन शुल्क या स्क्रीनिंग नहीं, निजी गैर-सहायता प्राप्त स्कूलों में आर्थिक रूप से कमजोर वर्गों के लिए 25% आरक्षण, योग्य शिक्षक आवश्यकताएं और शारीरिक दंड का निषेध शामिल है।",
    rights: [
      "Right to free and compulsory education for children aged 6-14 — Article 21A of the Constitution.",
      "Right to 25% reservation in private schools — Section 12(1)(c) RTE Act for economically weaker and disadvantaged groups.",
      "Right against capitation fee and screening — Section 13 prohibits any fee or procedure for admission.",
      "Right against corporal punishment — Section 17 prohibits physical punishment and mental harassment.",
      "Right to quality education — Section 19 mandates norms and standards for schools.",
    ],
    rightsHi: [
      "6-14 वर्ष के बच्चों के लिए मुफ्त और अनिवार्य शिक्षा का अधिकार — संविधान का अनुच्छेद 21A।",
      "निजी स्कूलों में 25% आरक्षण का अधिकार — RTE अधिनियम की धारा 12(1)(c) आर्थिक रूप से कमजोर और वंचित वर्गों के लिए।",
      "कैपिटेशन शुल्क और स्क्रीनिंग के विरुद्ध अधिकार — धारा 13 प्रवेश के लिए किसी शुल्क या प्रक्रिया पर रोक लगाती है।",
      "शारीरिक दंड के विरुद्ध अधिकार — धारा 17 शारीरिक दंड और मानसिक उत्पीड़न पर रोक लगाती है।",
      "गुणवत्तापूर्ण शिक्षा का अधिकार — धारा 19 स्कूलों के लिए मानदंड और मानक अनिवार्य करती है।",
    ],
    steps: [
      {
        title: "Know Eligibility and Entitlements",
        titleHi: "पात्रता और अधिकार जानें",
        description:
          "Every child aged 6-14 has the right to free education in a neighbourhood school. Children from EWS/DG categories are entitled to 25% seats in private schools.",
        descriptionHi:
          "6-14 वर्ष के प्रत्येक बच्चे को पड़ोस के स्कूल में मुफ्त शिक्षा का अधिकार है। EWS/DG श्रेणी के बच्चे निजी स्कूलों में 25% सीटों के हकदार हैं।",
      },
      {
        title: "Apply for Admission",
        titleHi: "प्रवेश के लिए आवेदन करें",
        description:
          "Apply through the state's RTE portal for 25% reservation. Submit income certificate, residence proof, birth certificate, and caste certificate if applicable.",
        descriptionHi:
          "25% आरक्षण के लिए राज्य के RTE पोर्टल के माध्यम से आवेदन करें। आय प्रमाणपत्र, निवास प्रमाण, जन्म प्रमाणपत्र और यदि लागू हो तो जाति प्रमाणपत्र जमा करें।",
      },
      {
        title: "File a Grievance if Denied",
        titleHi: "अस्वीकृत होने पर शिकायत दर्ज करें",
        description:
          "If a school denies admission or charges capitation fees, complain to the local authority, Block Education Officer, or file a complaint under Section 13-14 of the RTE Act.",
        descriptionHi:
          "यदि कोई स्कूल प्रवेश से इनकार करता है या कैपिटेशन शुल्क लेता है, तो स्थानीय प्राधिकरण, खंड शिक्षा अधिकारी को शिकायत करें, या RTE अधिनियम की धारा 13-14 के तहत शिकायत दर्ज करें।",
      },
    ],
    relatedLawSections: [
      "Article 21A — Constitution of India (Right to Education)",
      "Section 3 — RTE Act, 2009 (Right of child to free and compulsory education)",
      "Section 12(1)(c) — RTE Act, 2009 (25% reservation in private schools)",
      "Section 13 — RTE Act, 2009 (No capitation fee and screening)",
      "86th Constitutional Amendment Act, 2002",
    ],
    readCount: 812,
    featured: false,
    order: 15,
  },
];

// ── Main ──

async function main() {
  console.log("📚 SatyaVera — Seed Legal Rights Guides");
  console.log("━".repeat(50));
  console.log(`🔧 Dry run: ${DRY_RUN}`);
  console.log(`🔄 Force:   ${FORCE}`);
  console.log(`📊 Guides:  ${guides.length}`);
  console.log("");

  let written = 0;
  let skipped = 0;
  let errors = 0;

  const BATCH_SIZE = 400;
  let batch = db.batch();
  let batchCount = 0;

  for (const guide of guides) {
    const docId = guide.slug;
    const docRef = db.collection("guides").doc(docId);

    try {
      if (!FORCE && !DRY_RUN) {
        const existing = await docRef.get();
        if (existing.exists) {
          console.log(`  ⏭ ${guide.title} — already exists, skipping`);
          skipped++;
          continue;
        }
      }

      if (DRY_RUN) {
        console.log(`  ✓ [DRY] ${guide.title} (${guide.category}) — ${guide.steps.length} steps, ${guide.rights.length} rights`);
        written++;
        continue;
      }

      const data = {
        title: guide.title,
        titleHi: guide.titleHi,
        slug: guide.slug,
        category: guide.category,
        description: guide.description,
        descriptionHi: guide.descriptionHi,
        icon: guide.icon,
        tags: guide.tags,
        readTime: guide.readTime,
        content: guide.content,
        contentHi: guide.contentHi,
        rights: guide.rights,
        rightsHi: guide.rightsHi,
        steps: guide.steps,
        relatedLawSections: guide.relatedLawSections,
        readCount: guide.readCount,
        featured: guide.featured,
        order: guide.order,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      };

      batch.set(docRef, data);
      batchCount++;

      if (batchCount >= BATCH_SIZE) {
        await batch.commit();
        console.log(`  💾 Committed batch of ${batchCount} guides`);
        batch = db.batch();
        batchCount = 0;
      }

      written++;
      console.log(`  ✓ ${guide.title} (${guide.category})`);
    } catch (err) {
      console.error(`  ❌ ${guide.title} — ERROR: ${(err as Error).message}`);
      errors++;
    }
  }

  // Commit remaining batch
  if (batchCount > 0 && !DRY_RUN) {
    await batch.commit();
    console.log(`  💾 Committed final batch of ${batchCount} guides`);
  }

  console.log("\n" + "━".repeat(50));
  console.log("📊 Seed Summary");
  console.log("━".repeat(50));
  console.log(`  ✅ Written:  ${written}`);
  console.log(`  ⏭  Skipped:  ${skipped}`);
  console.log(`  ❌ Errors:   ${errors}`);
  console.log("\n✨ Done!");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
