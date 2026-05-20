#!/usr/bin/env npx tsx
/**
 * SatyaVera — Seed Legal Quizzes
 * Usage: npx tsx scripts/seed-quizzes.ts [--dry-run] [--force]
 */

import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import * as dotenv from "dotenv";
dotenv.config();

if (getApps().length === 0) {
  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n");
  if (clientEmail && privateKey) {
    initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
  } else {
    initializeApp({ projectId });
  }
}
const db = getFirestore();

const args = process.argv.slice(2);
const DRY_RUN = args.includes("--dry-run");
const FORCE = args.includes("--force");

interface QuestionSeed {
  question: string; questionHi: string;
  options: string[]; optionsHi: string[];
  correctIndex: number; explanation: string; explanationHi: string;
  lawReference: string; order: number;
}

interface QuizSeed {
  title: string; titleHi: string; slug: string; category: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  timeMinutes: number; icon: string; order: number;
  questions: QuestionSeed[];
}

const quizzes: QuizSeed[] = [
  {
    title: "Know Your Fundamental Rights", titleHi: "अपने मौलिक अधिकारों को जानें", slug: "fundamental-rights",
    category: "constitutional", difficulty: "Beginner", timeMinutes: 10, icon: "shield", order: 1,
    questions: [
      { question: "Which Part of the Indian Constitution deals with Fundamental Rights?", questionHi: "भारतीय संविधान का कौन सा भाग मौलिक अधिकारों से संबंधित है?", options: ["Part II", "Part III", "Part IV", "Part V"], optionsHi: ["भाग II", "भाग III", "भाग IV", "भाग V"], correctIndex: 1, explanation: "Part III (Articles 12-35) of the Constitution contains the Fundamental Rights.", explanationHi: "संविधान का भाग III (अनुच्छेद 12-35) मौलिक अधिकारों को शामिल करता है।", lawReference: "Part III, Constitution of India", order: 1 },
      { question: "Right to Life and Personal Liberty is guaranteed under which Article?", questionHi: "जीवन और व्यक्तिगत स्वतंत्रता का अधिकार किस अनुच्छेद में है?", options: ["Article 14", "Article 19", "Article 21", "Article 25"], optionsHi: ["अनुच्छेद 14", "अनुच्छेद 19", "अनुच्छेद 21", "अनुच्छेद 25"], correctIndex: 2, explanation: "Article 21 states: 'No person shall be deprived of his life or personal liberty except according to procedure established by law.'", explanationHi: "अनुच्छेद 21 कहता है: 'किसी भी व्यक्ति को कानून द्वारा स्थापित प्रक्रिया के अनुसार ही जीवन या व्यक्तिगत स्वतंत्रता से वंचित किया जा सकता है।'", lawReference: "Article 21", order: 2 },
      { question: "Which writ protects against illegal detention?", questionHi: "कौन सी रिट अवैध हिरासत से सुरक्षा देती है?", options: ["Mandamus", "Certiorari", "Habeas Corpus", "Quo Warranto"], optionsHi: ["परमादेश", "उत्प्रेषण", "बंदी प्रत्यक्षीकरण", "अधिकार पृच्छा"], correctIndex: 2, explanation: "Habeas Corpus (meaning 'produce the body') protects against unlawful detention.", explanationHi: "बंदी प्रत्यक्षीकरण ('शरीर प्रस्तुत करो') अवैध हिरासत से सुरक्षा प्रदान करती है।", lawReference: "Article 32, 226", order: 3 },
      { question: "At what age does a child have the Right to Free Education?", questionHi: "बच्चे को मुफ्त शिक्षा का अधिकार किस आयु तक है?", options: ["0-12 years", "6-14 years", "5-16 years", "6-18 years"], optionsHi: ["0-12 वर्ष", "6-14 वर्ष", "5-16 वर्ष", "6-18 वर्ष"], correctIndex: 1, explanation: "Article 21A guarantees free and compulsory education for children aged 6-14 years.", explanationHi: "अनुच्छेद 21A 6-14 वर्ष के बच्चों के लिए मुफ्त और अनिवार्य शिक्षा की गारंटी देता है।", lawReference: "Article 21A, RTE Act 2009", order: 4 },
      { question: "Which Article prohibits untouchability?", questionHi: "कौन सा अनुच्छेद अस्पृश्यता को प्रतिबंधित करता है?", options: ["Article 14", "Article 15", "Article 17", "Article 19"], optionsHi: ["अनुच्छेद 14", "अनुच्छेद 15", "अनुच्छेद 17", "अनुच्छेद 19"], correctIndex: 2, explanation: "Article 17 abolishes 'untouchability' and forbids its practice in any form.", explanationHi: "अनुच्छेद 17 'अस्पृश्यता' को समाप्त करता है और किसी भी रूप में इसके अभ्यास को प्रतिबंधित करता है।", lawReference: "Article 17", order: 5 },
      { question: "Right against exploitation is in which Articles?", questionHi: "शोषण के विरुद्ध अधिकार किन अनुच्छेदों में है?", options: ["14-18", "19-22", "23-24", "25-28"], optionsHi: ["14-18", "19-22", "23-24", "25-28"], correctIndex: 2, explanation: "Articles 23 (prohibition of traffic in human beings and forced labour) and 24 (prohibition of child labour) deal with Right against Exploitation.", explanationHi: "अनुच्छेद 23 (मानव तस्करी और बलात श्रम निषेध) और 24 (बाल श्रम निषेध) शोषण के विरुद्ध अधिकार से संबंधित हैं।", lawReference: "Articles 23-24", order: 6 },
      { question: "Who can file a writ petition in the Supreme Court?", questionHi: "सर्वोच्च न्यायालय में रिट याचिका कौन दायर कर सकता है?", options: ["Only Indian citizens", "Only affected parties", "Any person", "Only advocates"], optionsHi: ["केवल भारतीय नागरिक", "केवल प्रभावित पक्ष", "कोई भी व्यक्ति", "केवल अधिवक्ता"], correctIndex: 2, explanation: "Under Article 32, any person (not just citizens) can approach the Supreme Court for enforcement of Fundamental Rights.", explanationHi: "अनुच्छेद 32 के तहत, कोई भी व्यक्ति (केवल नागरिक नहीं) मौलिक अधिकारों के प्रवर्तन के लिए सर्वोच्च न्यायालय में जा सकता है।", lawReference: "Article 32", order: 7 },
      { question: "Which Fundamental Right can NOT be suspended during Emergency?", questionHi: "आपातकाल में कौन सा मौलिक अधिकार निलंबित नहीं किया जा सकता?", options: ["Right to Freedom", "Right to Equality", "Right to Life (Art. 21)", "Right to Religion"], optionsHi: ["स्वतंत्रता का अधिकार", "समानता का अधिकार", "जीवन का अधिकार (अनु. 21)", "धर्म का अधिकार"], correctIndex: 2, explanation: "After the 44th Amendment, Articles 20 and 21 cannot be suspended even during a National Emergency.", explanationHi: "44वें संशोधन के बाद, राष्ट्रीय आपातकाल में भी अनुच्छेद 20 और 21 को निलंबित नहीं किया जा सकता।", lawReference: "Article 359(1A)", order: 8 },
    ],
  },
  {
    title: "Criminal Law Basics (BNS)", titleHi: "आपराधिक कानून की मूल बातें (BNS)", slug: "criminal-law-bns",
    category: "criminal", difficulty: "Beginner", timeMinutes: 10, icon: "scale", order: 2,
    questions: [
      { question: "BNS 2023 replaced which earlier law?", questionHi: "BNS 2023 ने किस पूर्व कानून को प्रतिस्थापित किया?", options: ["CrPC", "IPC", "Indian Evidence Act", "CPC"], optionsHi: ["CrPC", "IPC", "भारतीय साक्ष्य अधिनियम", "CPC"], correctIndex: 1, explanation: "Bharatiya Nyaya Sanhita (BNS) 2023 replaced the Indian Penal Code (IPC) 1860.", explanationHi: "भारतीय न्याय संहिता (BNS) 2023 ने भारतीय दंड संहिता (IPC) 1860 को प्रतिस्थापित किया।", lawReference: "BNS 2023", order: 1 },
      { question: "Within how many hours must an arrested person be produced before a magistrate?", questionHi: "गिरफ्तार व्यक्ति को कितने घंटों के भीतर मजिस्ट्रेट के समक्ष प्रस्तुत करना होगा?", options: ["12 hours", "24 hours", "48 hours", "72 hours"], optionsHi: ["12 घंटे", "24 घंटे", "48 घंटे", "72 घंटे"], correctIndex: 1, explanation: "Article 22(2) of the Constitution mandates that an arrested person must be produced before a magistrate within 24 hours.", explanationHi: "संविधान का अनुच्छेद 22(2) अनिवार्य करता है कि गिरफ्तार व्यक्ति को 24 घंटे के भीतर मजिस्ट्रेट के समक्ष प्रस्तुत किया जाए।", lawReference: "Article 22(2), S.187 BNSS", order: 2 },
      { question: "Can police refuse to register an FIR for a cognizable offence?", questionHi: "क्या पुलिस संज्ञेय अपराध के लिए FIR दर्ज करने से इनकार कर सकती है?", options: ["Yes, at their discretion", "No, they are legally bound", "Only if the offence is minor", "Only with SP permission"], optionsHi: ["हां, अपने विवेक पर", "नहीं, वे कानूनी रूप से बाध्य हैं", "केवल छोटे अपराध में", "केवल SP की अनुमति से"], correctIndex: 1, explanation: "Under S.173 BNSS, police MUST register an FIR for cognizable offences. Refusal is punishable.", explanationHi: "धारा 173 BNSS के तहत, पुलिस को संज्ञेय अपराधों के लिए FIR दर्ज करना अनिवार्य है। इनकार दंडनीय है।", lawReference: "S.173 BNSS", order: 3 },
      { question: "What is the maximum police custody remand period?", questionHi: "पुलिस हिरासत रिमांड की अधिकतम अवधि क्या है?", options: ["7 days", "15 days", "30 days", "60 days"], optionsHi: ["7 दिन", "15 दिन", "30 दिन", "60 दिन"], correctIndex: 1, explanation: "Under BNSS, police custody remand cannot exceed 15 days. After that, only judicial custody.", explanationHi: "BNSS के तहत, पुलिस हिरासत रिमांड 15 दिन से अधिक नहीं हो सकती। उसके बाद केवल न्यायिक हिरासत।", lawReference: "S.187 BNSS", order: 4 },
      { question: "What is 'zero FIR'?", questionHi: "'जीरो FIR' क्या है?", options: ["FIR with no accused", "FIR filed at any police station", "FIR for minor offences", "Anonymous FIR"], optionsHi: ["बिना आरोपी वाली FIR", "किसी भी थाने में दर्ज FIR", "छोटे अपराधों की FIR", "गुमनाम FIR"], correctIndex: 1, explanation: "A Zero FIR can be filed at any police station regardless of jurisdiction. It is then transferred to the relevant station.", explanationHi: "जीरो FIR किसी भी थाने में दर्ज की जा सकती है चाहे क्षेत्राधिकार कोई भी हो। फिर इसे संबंधित थाने को स्थानांतरित किया जाता है।", lawReference: "S.173(1) BNSS", order: 5 },
      { question: "Right to free legal aid is under which Article?", questionHi: "मुफ्त कानूनी सहायता का अधिकार किस अनुच्छेद में है?", options: ["Article 14", "Article 21", "Article 22(1)", "Article 39A"], optionsHi: ["अनुच्छेद 14", "अनुच्छेद 21", "अनुच्छेद 22(1)", "अनुच्छेद 39A"], correctIndex: 3, explanation: "Article 39A (DPSP) mandates the State to provide free legal aid to ensure justice is not denied due to poverty.", explanationHi: "अनुच्छेद 39A (DPSP) राज्य को मुफ्त कानूनी सहायता प्रदान करने का निर्देश देता है।", lawReference: "Article 39A, Legal Services Authorities Act", order: 6 },
      { question: "Within how many days must police file a chargesheet for offences punishable up to 3 years?", questionHi: "3 वर्ष तक सज़ा वाले अपराधों के लिए पुलिस को कितने दिनों में चार्जशीट दायर करनी होगी?", options: ["30 days", "60 days", "90 days", "120 days"], optionsHi: ["30 दिन", "60 दिन", "90 दिन", "120 दिन"], correctIndex: 1, explanation: "For offences punishable up to 3 years, the chargesheet must be filed within 60 days.", explanationHi: "3 वर्ष तक सज़ा वाले अपराधों के लिए, 60 दिनों के भीतर चार्जशीट दायर करनी होगी।", lawReference: "S.193 BNSS", order: 7 },
      { question: "What is the punishment for filing a false FIR?", questionHi: "झूठी FIR दर्ज करने की सज़ा क्या है?", options: ["No punishment", "Up to 6 months", "Up to 2 years", "Up to 7 years"], optionsHi: ["कोई सज़ा नहीं", "6 महीने तक", "2 वर्ष तक", "7 वर्ष तक"], correctIndex: 3, explanation: "Filing a false FIR is punishable under BNS with imprisonment up to 7 years for false charges of serious offences.", explanationHi: "झूठी FIR दर्ज करना BNS के तहत गंभीर अपराधों के झूठे आरोपों के लिए 7 वर्ष तक कारावास से दंडनीय है।", lawReference: "S.248 BNS", order: 8 },
    ],
  },
  {
    title: "Consumer Rights Quiz", titleHi: "उपभोक्ता अधिकार प्रश्नोत्तरी", slug: "consumer-rights",
    category: "consumer", difficulty: "Beginner", timeMinutes: 8, icon: "flag", order: 3,
    questions: [
      { question: "The Consumer Protection Act 2019 replaced which earlier Act?", questionHi: "उपभोक्ता संरक्षण अधिनियम 2019 ने किस पूर्व अधिनियम को प्रतिस्थापित किया?", options: ["Consumer Protection Act 1986", "Sale of Goods Act 1930", "Competition Act 2002", "FEMA 1999"], optionsHi: ["उपभोक्ता संरक्षण अधिनियम 1986", "माल विक्रय अधिनियम 1930", "प्रतिस्पर्धा अधिनियम 2002", "FEMA 1999"], correctIndex: 0, explanation: "The Consumer Protection Act 2019 replaced the 1986 Act with modern provisions including e-commerce regulation.", explanationHi: "उपभोक्ता संरक्षण अधिनियम 2019 ने 1986 अधिनियम को ई-कॉमर्स विनियमन सहित आधुनिक प्रावधानों के साथ प्रतिस्थापित किया।", lawReference: "Consumer Protection Act 2019", order: 1 },
      { question: "What is the maximum claim amount for District Consumer Commission?", questionHi: "जिला उपभोक्ता आयोग में अधिकतम दावा राशि क्या है?", options: ["Rs. 20 lakhs", "Rs. 50 lakhs", "Rs. 1 crore", "Rs. 2 crores"], optionsHi: ["20 लाख", "50 लाख", "1 करोड़", "2 करोड़"], correctIndex: 2, explanation: "District Commission handles complaints where value of goods/services does not exceed Rs. 1 crore.", explanationHi: "जिला आयोग उन शिकायतों को संभालता है जहां माल/सेवाओं का मूल्य 1 करोड़ से अधिक नहीं है।", lawReference: "S.34(2)(a) CP Act 2019", order: 2 },
      { question: "Can consumers file complaints online?", questionHi: "क्या उपभोक्ता ऑनलाइन शिकायत दर्ज कर सकते हैं?", options: ["No, only in person", "Yes, via edaakhil.nic.in", "Only through a lawyer", "Only for e-commerce"], optionsHi: ["नहीं, केवल व्यक्तिगत रूप से", "हां, edaakhil.nic.in द्वारा", "केवल वकील के माध्यम से", "केवल ई-कॉमर्स के लिए"], correctIndex: 1, explanation: "The e-Daakhil portal (edaakhil.nic.in) allows consumers to file complaints electronically.", explanationHi: "ई-दाखिल पोर्टल (edaakhil.nic.in) उपभोक्ताओं को इलेक्ट्रॉनिक रूप से शिकायत दर्ज करने की अनुमति देता है।", lawReference: "S.35(1)(c) CP Act 2019", order: 3 },
      { question: "What does CCPA stand for?", questionHi: "CCPA का पूरा नाम क्या है?", options: ["Central Consumer Protection Authority", "Central Consumer Price Authority", "Consumer Court Protection Act", "Central Commerce Protection Agency"], optionsHi: ["केंद्रीय उपभोक्ता संरक्षण प्राधिकरण", "केंद्रीय उपभोक्ता मूल्य प्राधिकरण", "उपभोक्ता न्यायालय संरक्षण अधिनियम", "केंद्रीय वाणिज्य संरक्षण एजेंसी"], correctIndex: 0, explanation: "CCPA was established under the CP Act 2019 to protect consumer rights and regulate misleading ads.", explanationHi: "CCPA की स्थापना CP अधिनियम 2019 के तहत उपभोक्ता अधिकारों की रक्षा और भ्रामक विज्ञापनों के विनियमन के लिए की गई।", lawReference: "S.10 CP Act 2019", order: 4 },
      { question: "Is a bill/receipt necessary to file a consumer complaint?", questionHi: "क्या उपभोक्ता शिकायत दर्ज करने के लिए बिल/रसीद आवश्यक है?", options: ["Always mandatory", "Not mandatory but helpful as evidence", "Only for goods above Rs. 10,000", "Never needed"], optionsHi: ["हमेशा अनिवार्य", "अनिवार्य नहीं लेकिन साक्ष्य के रूप में सहायक", "केवल 10,000 से अधिक के सामान के लिए", "कभी नहीं चाहिए"], correctIndex: 1, explanation: "A bill is not mandatory but serves as strong evidence. Other proof of transaction can also be used.", explanationHi: "बिल अनिवार्य नहीं है लेकिन मजबूत साक्ष्य के रूप में कार्य करता है। लेनदेन का अन्य प्रमाण भी उपयोग किया जा सकता है।", lawReference: "S.35 CP Act 2019", order: 5 },
      { question: "What is product liability?", questionHi: "उत्पाद दायित्व क्या है?", options: ["Warranty on products", "Manufacturer's responsibility for defective products", "Consumer's duty to test products", "Shop owner's license"], optionsHi: ["उत्पादों पर वारंटी", "दोषपूर्ण उत्पादों के लिए निर्माता की जिम्मेदारी", "उपभोक्ता का उत्पाद परीक्षण कर्तव्य", "दुकान मालिक का लाइसेंस"], correctIndex: 1, explanation: "Product liability makes manufacturers, sellers, and service providers liable for harm caused by defective products.", explanationHi: "उत्पाद दायित्व निर्माताओं, विक्रेताओं को दोषपूर्ण उत्पादों से हुई हानि के लिए जिम्मेदार बनाता है।", lawReference: "Chapter VI, CP Act 2019", order: 6 },
    ],
  },
];

async function main() {
  console.log(`\n🧠 SatyaVera Quiz Seeder`);
  console.log(`   Quizzes: ${quizzes.length}`);
  console.log(`   Mode: ${DRY_RUN ? "DRY RUN" : "LIVE"}\n`);

  if (DRY_RUN) {
    quizzes.forEach((q, i) => console.log(`   ${i + 1}. ${q.title} [${q.difficulty}] (${q.questions.length} questions)`));
    console.log(`\n✅ Dry run complete.`);
    return;
  }

  let quizCount = 0, questionCount = 0;

  for (const quiz of quizzes) {
    const quizRef = db.collection("quizzes").doc(quiz.slug);
    const existing = await quizRef.get();
    if (existing.exists && !FORCE) { console.log(`   ⏭  ${quiz.title} (exists)`); continue; }

    const { questions, slug, ...quizData } = quiz;
    void slug;
    await quizRef.set({
      ...quizData,
      questionCount: questions.length,
      completedCount: Math.floor(Math.random() * 500) + 50,
      createdAt: FieldValue.serverTimestamp(),
    });
    quizCount++;

    const batch = db.batch();
    for (const q of questions) {
      const qRef = quizRef.collection("questions").doc(`q${q.order}`);
      batch.set(qRef, q);
      questionCount++;
    }
    await batch.commit();
    console.log(`   ✅ ${quiz.title} (${questions.length} questions)`);
  }

  console.log(`\n✅ Done. Quizzes: ${quizCount}, Questions: ${questionCount}`);
}

main().catch(console.error);
