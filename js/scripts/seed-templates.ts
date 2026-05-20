#!/usr/bin/env npx tsx
/**
 * SatyaVera — Seed Document Templates
 * Usage: npx tsx scripts/seed-templates.ts [--dry-run] [--force]
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

interface TemplateSeed {
  name: string; nameHi: string; slug: string; category: string;
  description: string; descriptionHi: string; icon: string;
  format: string; premium: boolean; downloadCount: number;
  content: string; contentHi: string;
  fields: { key: string; label: string; labelHi: string; type: string; required: boolean }[];
  order: number;
}

const templates: TemplateSeed[] = [
  {
    name: "FIR (First Information Report)", nameHi: "प्रथम सूचना रिपोर्ट (FIR)", slug: "fir",
    category: "criminal", description: "File a police complaint for cognizable offences",
    descriptionHi: "संज्ञेय अपराधों के लिए पुलिस शिकायत दर्ज करें", icon: "shield",
    format: "PDF / Word", premium: false, downloadCount: 4520,
    content: "To,\nThe Station House Officer,\n{{policeStation}}\n\nSubject: FIR regarding {{offenceType}}\n\nRespected Sir/Madam,\n\nI, {{complainantName}}, son/daughter of {{fatherName}}, residing at {{address}}, do hereby lodge a complaint as follows:\n\nDate of Incident: {{incidentDate}}\nTime of Incident: {{incidentTime}}\nPlace of Occurrence: {{incidentPlace}}\n\nBrief Facts:\n{{description}}\n\nAccused Person(s):\n{{accusedDetails}}\n\nI request that an FIR be registered and necessary action be taken.\n\nYours faithfully,\n{{complainantName}}\nPhone: {{phone}}\nDate: {{date}}",
    contentHi: "सेवा में,\nथाना प्रभारी,\n{{policeStation}}\n\nविषय: {{offenceType}} के संबंध में प्रथम सूचना रिपोर्ट\n\nमहोदय/महोदया,\n\nमैं, {{complainantName}}, पुत्र/पुत्री {{fatherName}}, निवासी {{address}}, निम्नानुसार शिकायत दर्ज करता/करती हूं:\n\nघटना की तिथि: {{incidentDate}}\nघटना का समय: {{incidentTime}}\nघटना का स्थान: {{incidentPlace}}\n\nसंक्षिप्त विवरण:\n{{description}}\n\nआरोपी व्यक्ति:\n{{accusedDetails}}\n\nकृपया FIR दर्ज कर आवश्यक कार्रवाई करें।\n\nभवदीय,\n{{complainantName}}\nफोन: {{phone}}\nदिनांक: {{date}}",
    fields: [
      { key: "complainantName", label: "Complainant Name", labelHi: "शिकायतकर्ता का नाम", type: "text", required: true },
      { key: "fatherName", label: "Father's/Mother's Name", labelHi: "पिता/माता का नाम", type: "text", required: true },
      { key: "address", label: "Address", labelHi: "पता", type: "textarea", required: true },
      { key: "phone", label: "Phone Number", labelHi: "फोन नंबर", type: "tel", required: true },
      { key: "policeStation", label: "Police Station", labelHi: "थाना", type: "text", required: true },
      { key: "offenceType", label: "Type of Offence", labelHi: "अपराध का प्रकार", type: "text", required: true },
      { key: "incidentDate", label: "Date of Incident", labelHi: "घटना की तिथि", type: "date", required: true },
      { key: "incidentTime", label: "Time of Incident", labelHi: "घटना का समय", type: "text", required: false },
      { key: "incidentPlace", label: "Place of Occurrence", labelHi: "घटना का स्थान", type: "text", required: true },
      { key: "description", label: "Description of Incident", labelHi: "घटना का विवरण", type: "textarea", required: true },
      { key: "accusedDetails", label: "Accused Details", labelHi: "आरोपी का विवरण", type: "textarea", required: false },
    ],
    order: 1,
  },
  {
    name: "RTI Application", nameHi: "सूचना का अधिकार आवेदन", slug: "rti",
    category: "rti", description: "Request information from any public authority under RTI Act",
    descriptionHi: "RTI अधिनियम के तहत किसी भी सार्वजनिक प्राधिकरण से सूचना मांगें", icon: "eye",
    format: "PDF / Word", premium: false, downloadCount: 6230,
    content: "To,\nThe Public Information Officer,\n{{authority}}\n{{authorityAddress}}\n\nSubject: Application under Right to Information Act, 2005\n\nDear Sir/Madam,\n\nI, {{applicantName}}, wish to seek the following information under the RTI Act, 2005:\n\n{{informationSought}}\n\nI am enclosing an IPO/DD/Court Fee Stamp of Rs. 10/- as the prescribed fee.\n\nPeriod of Information: {{period}}\n\nI request that the information be provided in {{format}} format.\n\nIf the information sought is not available with your office, kindly transfer this application to the concerned authority under Section 6(3) of the RTI Act.\n\nYours faithfully,\n{{applicantName}}\nAddress: {{address}}\nPhone: {{phone}}\nEmail: {{email}}\nDate: {{date}}",
    contentHi: "सेवा में,\nजन सूचना अधिकारी,\n{{authority}}\n{{authorityAddress}}\n\nविषय: सूचना का अधिकार अधिनियम, 2005 के तहत आवेदन\n\nमहोदय/महोदया,\n\nमैं, {{applicantName}}, RTI अधिनियम 2005 के तहत निम्नलिखित सूचना प्राप्त करना चाहता/चाहती हूं:\n\n{{informationSought}}\n\nमैं निर्धारित शुल्क के रूप में 10/- रुपये का IPO/DD संलग्न कर रहा/रही हूं।\n\nसूचना की अवधि: {{period}}\n\nकृपया सूचना {{format}} प्रारूप में उपलब्ध कराएं।\n\nभवदीय,\n{{applicantName}}\nपता: {{address}}\nफोन: {{phone}}\nईमेल: {{email}}\nदिनांक: {{date}}",
    fields: [
      { key: "applicantName", label: "Applicant Name", labelHi: "आवेदक का नाम", type: "text", required: true },
      { key: "address", label: "Address", labelHi: "पता", type: "textarea", required: true },
      { key: "phone", label: "Phone", labelHi: "फोन", type: "tel", required: true },
      { key: "email", label: "Email", labelHi: "ईमेल", type: "email", required: false },
      { key: "authority", label: "Public Authority Name", labelHi: "सार्वजनिक प्राधिकरण", type: "text", required: true },
      { key: "authorityAddress", label: "Authority Address", labelHi: "प्राधिकरण का पता", type: "textarea", required: true },
      { key: "informationSought", label: "Information Sought", labelHi: "मांगी गई सूचना", type: "textarea", required: true },
      { key: "period", label: "Time Period", labelHi: "समय अवधि", type: "text", required: false },
      { key: "format", label: "Preferred Format", labelHi: "प्रारूप", type: "text", required: false },
    ],
    order: 2,
  },
  {
    name: "Consumer Complaint", nameHi: "उपभोक्ता शिकायत", slug: "consumer-complaint",
    category: "consumer", description: "File a complaint with Consumer Commission",
    descriptionHi: "उपभोक्ता आयोग में शिकायत दर्ज करें", icon: "flag",
    format: "PDF / Word", premium: false, downloadCount: 3150,
    content: "Before the District Consumer Disputes Redressal Commission\n{{district}}\n\nComplaint No. ______ of {{year}}\n\n{{complainantName}}\nS/o D/o {{parentName}}\nR/o {{address}}\n... Complainant\n\nVersus\n\n{{oppositeParty}}\n{{oppositePartyAddress}}\n... Opposite Party\n\nComplaint Under Section 35 of the Consumer Protection Act, 2019\n\nThe complainant respectfully submits:\n\n1. The complainant is a consumer as defined under the Act.\n2. {{facts}}\n3. This amounts to deficiency in service / unfair trade practice / defective goods.\n\nPrayer:\n{{relief}}\n\nYours faithfully,\n{{complainantName}}\nDate: {{date}}\nPlace: {{place}}",
    contentHi: "जिला उपभोक्ता विवाद निवारण आयोग\n{{district}}\n\nशिकायत संख्या ______ / {{year}}\n\n{{complainantName}}\nपुत्र/पुत्री {{parentName}}\nनिवासी {{address}}\n... शिकायतकर्ता\n\nबनाम\n\n{{oppositeParty}}\n{{oppositePartyAddress}}\n... विपक्षी\n\nउपभोक्ता संरक्षण अधिनियम 2019 की धारा 35 के तहत शिकायत\n\nशिकायतकर्ता सादर निवेदन करता/करती है:\n\n1. शिकायतकर्ता अधिनियम के तहत उपभोक्ता है।\n2. {{facts}}\n3. यह सेवा में कमी / अनुचित व्यापार व्यवहार / दोषपूर्ण माल है।\n\nप्रार्थना:\n{{relief}}\n\nभवदीय,\n{{complainantName}}\nदिनांक: {{date}}\nस्थान: {{place}}",
    fields: [
      { key: "complainantName", label: "Complainant Name", labelHi: "शिकायतकर्ता", type: "text", required: true },
      { key: "parentName", label: "Parent Name", labelHi: "पिता/माता का नाम", type: "text", required: true },
      { key: "address", label: "Address", labelHi: "पता", type: "textarea", required: true },
      { key: "district", label: "District", labelHi: "जिला", type: "text", required: true },
      { key: "oppositeParty", label: "Opposite Party", labelHi: "विपक्षी", type: "text", required: true },
      { key: "oppositePartyAddress", label: "Opposite Party Address", labelHi: "विपक्षी का पता", type: "textarea", required: true },
      { key: "facts", label: "Facts of the Case", labelHi: "मामले के तथ्य", type: "textarea", required: true },
      { key: "relief", label: "Relief Sought", labelHi: "मांगी गई राहत", type: "textarea", required: true },
    ],
    order: 3,
  },
  {
    name: "Bail Application", nameHi: "ज़मानत आवेदन", slug: "bail-application",
    category: "criminal", description: "Apply for regular bail in criminal cases",
    descriptionHi: "आपराधिक मामलों में नियमित ज़मानत के लिए आवेदन", icon: "scale",
    format: "PDF / Word", premium: false, downloadCount: 2840,
    content: "In the Court of {{courtName}}\n\nBail Application No. ___/{{year}}\nIn FIR No. {{firNumber}}\nU/S {{sections}} of {{act}}\nP.S. {{policeStation}}\n\n{{applicantName}} ... Applicant/Accused\nVs.\nState of {{state}} ... Respondent\n\nApplication for Grant of Bail U/S 483 BNSS\n\nMost Respectfully Showeth:\n\n1. The applicant has been falsely implicated in the above case.\n2. {{grounds}}\n3. The applicant is ready to furnish bail bonds and surety.\n4. The applicant undertakes not to tamper with evidence or influence witnesses.\n\nPrayer:\nIt is therefore prayed that this Hon'ble Court may be pleased to grant bail to the applicant.\n\n{{applicantName}}\nThrough Counsel\nDate: {{date}}",
    contentHi: "न्यायालय {{courtName}} में\n\nज़मानत आवेदन संख्या ___/{{year}}\nFIR संख्या {{firNumber}}\nधारा {{sections}} {{act}}\nथाना {{policeStation}}\n\n{{applicantName}} ... आवेदक/आरोपी\nबनाम\n{{state}} राज्य ... प्रत्यर्थी\n\nधारा 483 BNSS के तहत ज़मानत प्रार्थना पत्र\n\nसादर निवेदन है:\n\n1. आवेदक को उपरोक्त मामले में झूठा फंसाया गया है।\n2. {{grounds}}\n3. आवेदक ज़मानत बांड और प्रतिभूति प्रस्तुत करने को तैयार है।\n\nप्रार्थना:\nअतः प्रार्थना है कि यह माननीय न्यायालय आवेदक को ज़मानत प्रदान करने की कृपा करें।\n\n{{applicantName}}\nअधिवक्ता द्वारा\nदिनांक: {{date}}",
    fields: [
      { key: "applicantName", label: "Applicant Name", labelHi: "आवेदक का नाम", type: "text", required: true },
      { key: "courtName", label: "Court Name", labelHi: "न्यायालय", type: "text", required: true },
      { key: "firNumber", label: "FIR Number", labelHi: "FIR संख्या", type: "text", required: true },
      { key: "sections", label: "Sections", labelHi: "धाराएं", type: "text", required: true },
      { key: "act", label: "Act", labelHi: "अधिनियम", type: "text", required: true },
      { key: "policeStation", label: "Police Station", labelHi: "थाना", type: "text", required: true },
      { key: "state", label: "State", labelHi: "राज्य", type: "text", required: true },
      { key: "grounds", label: "Grounds for Bail", labelHi: "ज़मानत के आधार", type: "textarea", required: true },
    ],
    order: 4,
  },
  {
    name: "Legal Notice", nameHi: "कानूनी नोटिस", slug: "legal-notice",
    category: "civil", description: "Send a formal legal notice before filing suit",
    descriptionHi: "मुकदमा दायर करने से पहले औपचारिक कानूनी नोटिस भेजें", icon: "doc",
    format: "PDF / Word", premium: false, downloadCount: 5100,
    content: "LEGAL NOTICE\n\nDate: {{date}}\n\nTo,\n{{recipientName}}\n{{recipientAddress}}\n\nSubject: Legal Notice under {{act}}\n\nDear Sir/Madam,\n\nUnder instructions from my client {{clientName}}, R/o {{clientAddress}}, I hereby serve this legal notice upon you as follows:\n\n{{facts}}\n\nYou are hereby called upon to {{demand}} within {{days}} days of receipt of this notice, failing which my client shall be constrained to initiate appropriate legal proceedings against you, at your risk and cost.\n\n{{lawyerName}}\nAdvocate\n{{barCouncil}}\n{{lawyerAddress}}",
    contentHi: "कानूनी नोटिस\n\nदिनांक: {{date}}\n\nसेवा में,\n{{recipientName}}\n{{recipientAddress}}\n\nविषय: {{act}} के तहत कानूनी नोटिस\n\nमहोदय/महोदया,\n\nमेरे मुवक्किल {{clientName}}, निवासी {{clientAddress}} के निर्देशानुसार, मैं आपको यह कानूनी नोटिस भेजता हूं:\n\n{{facts}}\n\nआपको सूचित किया जाता है कि इस नोटिस की प्राप्ति के {{days}} दिनों के भीतर {{demand}} करें, अन्यथा मेरे मुवक्किल आपके विरुद्ध उचित कानूनी कार्यवाही करने को बाध्य होंगे।\n\n{{lawyerName}}\nअधिवक्ता\n{{barCouncil}}\n{{lawyerAddress}}",
    fields: [
      { key: "clientName", label: "Client Name", labelHi: "मुवक्किल का नाम", type: "text", required: true },
      { key: "clientAddress", label: "Client Address", labelHi: "मुवक्किल का पता", type: "textarea", required: true },
      { key: "recipientName", label: "Recipient Name", labelHi: "प्राप्तकर्ता", type: "text", required: true },
      { key: "recipientAddress", label: "Recipient Address", labelHi: "प्राप्तकर्ता का पता", type: "textarea", required: true },
      { key: "facts", label: "Facts", labelHi: "तथ्य", type: "textarea", required: true },
      { key: "demand", label: "Demand", labelHi: "मांग", type: "textarea", required: true },
      { key: "days", label: "Days to Comply", labelHi: "अनुपालन अवधि (दिन)", type: "text", required: true },
      { key: "lawyerName", label: "Advocate Name", labelHi: "अधिवक्ता का नाम", type: "text", required: true },
    ],
    order: 5,
  },
  {
    name: "Rent Agreement", nameHi: "किराया समझौता", slug: "rent-agreement",
    category: "property", description: "Standard rental/lease agreement for residential property",
    descriptionHi: "आवासीय संपत्ति के लिए मानक किराया/पट्टा समझौता", icon: "home",
    format: "PDF / Word", premium: false, downloadCount: 7800,
    content: "RENT AGREEMENT\n\nThis Agreement is made on {{date}} at {{city}}\n\nBETWEEN:\n{{landlordName}}, R/o {{landlordAddress}} (hereinafter called 'Landlord')\n\nAND:\n{{tenantName}}, R/o {{tenantAddress}} (hereinafter called 'Tenant')\n\nProperty: {{propertyAddress}}\n\nTerms:\n1. Period: {{period}} months from {{startDate}}\n2. Monthly Rent: Rs. {{rent}}/- payable by {{rentDueDay}} of each month\n3. Security Deposit: Rs. {{deposit}}/- (refundable)\n4. Purpose: Residential use only\n5. Lock-in Period: {{lockinPeriod}} months\n6. Notice Period: {{noticePeriod}} months\n\nWitnesses:\n1. _______________\n2. _______________\n\n{{landlordName}} (Landlord)\n{{tenantName}} (Tenant)",
    contentHi: "किराया समझौता\n\nयह समझौता {{date}} को {{city}} में किया गया\n\nके बीच:\n{{landlordName}}, निवासी {{landlordAddress}} (इसके बाद 'मकान मालिक')\n\nऔर:\n{{tenantName}}, निवासी {{tenantAddress}} (इसके बाद 'किरायेदार')\n\nसंपत्ति: {{propertyAddress}}\n\nशर्तें:\n1. अवधि: {{startDate}} से {{period}} महीने\n2. मासिक किराया: रु. {{rent}}/- प्रत्येक माह की {{rentDueDay}} तारीख तक\n3. सुरक्षा जमा: रु. {{deposit}}/- (वापसी योग्य)\n4. उद्देश्य: केवल आवासीय उपयोग\n5. लॉक-इन अवधि: {{lockinPeriod}} महीने\n6. नोटिस अवधि: {{noticePeriod}} महीने\n\nगवाह:\n1. _______________\n2. _______________\n\n{{landlordName}} (मकान मालिक)\n{{tenantName}} (किरायेदार)",
    fields: [
      { key: "landlordName", label: "Landlord Name", labelHi: "मकान मालिक", type: "text", required: true },
      { key: "tenantName", label: "Tenant Name", labelHi: "किरायेदार", type: "text", required: true },
      { key: "propertyAddress", label: "Property Address", labelHi: "संपत्ति का पता", type: "textarea", required: true },
      { key: "rent", label: "Monthly Rent (Rs.)", labelHi: "मासिक किराया", type: "text", required: true },
      { key: "deposit", label: "Security Deposit (Rs.)", labelHi: "सुरक्षा जमा", type: "text", required: true },
      { key: "period", label: "Lease Period (months)", labelHi: "पट्टा अवधि (महीने)", type: "text", required: true },
      { key: "startDate", label: "Start Date", labelHi: "आरंभ तिथि", type: "date", required: true },
    ],
    order: 6,
  },
  {
    name: "Affidavit", nameHi: "शपथ पत्र", slug: "affidavit",
    category: "civil", description: "General purpose sworn statement for court proceedings",
    descriptionHi: "न्यायालय कार्यवाही के लिए सामान्य शपथ पत्र", icon: "doc",
    format: "PDF / Word", premium: false, downloadCount: 4100,
    content: "AFFIDAVIT\n\nI, {{deponentName}}, S/o D/o {{parentName}}, aged {{age}} years, R/o {{address}}, do hereby solemnly affirm and state as follows:\n\n1. That I am the deponent herein and competent to swear this affidavit.\n2. {{statement1}}\n3. {{statement2}}\n4. {{statement3}}\n\nVERIFICATION:\nI, the above-named deponent, do hereby verify that the contents of this affidavit are true and correct to the best of my knowledge and belief.\n\nVerified at {{place}} on {{date}}.\n\nDEPONENT\n{{deponentName}}",
    contentHi: "शपथ पत्र\n\nमैं, {{deponentName}}, पुत्र/पुत्री {{parentName}}, आयु {{age}} वर्ष, निवासी {{address}}, सत्यनिष्ठा से शपथपूर्वक कहता/कहती हूं:\n\n1. मैं इसमें शपथकर्ता हूं और यह शपथ पत्र देने में सक्षम हूं।\n2. {{statement1}}\n3. {{statement2}}\n4. {{statement3}}\n\nसत्यापन:\nमैं उपरोक्त शपथकर्ता पुष्टि करता/करती हूं कि इस शपथ पत्र की सामग्री मेरी जानकारी और विश्वास के अनुसार सत्य है।\n\n{{place}} में {{date}} को सत्यापित।\n\nशपथकर्ता\n{{deponentName}}",
    fields: [
      { key: "deponentName", label: "Deponent Name", labelHi: "शपथकर्ता", type: "text", required: true },
      { key: "parentName", label: "Parent Name", labelHi: "पिता/माता", type: "text", required: true },
      { key: "age", label: "Age", labelHi: "आयु", type: "text", required: true },
      { key: "address", label: "Address", labelHi: "पता", type: "textarea", required: true },
      { key: "statement1", label: "Statement 1", labelHi: "कथन 1", type: "textarea", required: true },
      { key: "statement2", label: "Statement 2", labelHi: "कथन 2", type: "textarea", required: false },
      { key: "statement3", label: "Statement 3", labelHi: "कथन 3", type: "textarea", required: false },
      { key: "place", label: "Place", labelHi: "स्थान", type: "text", required: true },
    ],
    order: 7,
  },
  {
    name: "Power of Attorney", nameHi: "मुख्तारनामा", slug: "power-of-attorney",
    category: "property", description: "Authorize someone to act on your behalf in legal matters",
    descriptionHi: "कानूनी मामलों में अपनी ओर से कार्य करने का अधिकार दें", icon: "users",
    format: "PDF / Word", premium: true, downloadCount: 2200,
    content: "GENERAL POWER OF ATTORNEY\n\nKNOW ALL MEN BY THESE PRESENTS:\n\nI, {{principalName}}, S/o D/o {{parentName}}, R/o {{principalAddress}}, do hereby appoint and authorize {{agentName}}, R/o {{agentAddress}} as my lawful attorney to act on my behalf for:\n\n{{purposes}}\n\nThe attorney is authorized to sign documents, appear in offices/courts, and do all lawful acts on my behalf.\n\nIN WITNESS WHEREOF, I have signed this on {{date}} at {{place}}.\n\n{{principalName}} (Principal)\n\nWitnesses:\n1. _______________\n2. _______________",
    contentHi: "सामान्य मुख्तारनामा\n\nसर्वविदित हो:\n\nमैं, {{principalName}}, पुत्र/पुत्री {{parentName}}, निवासी {{principalAddress}}, एतद्द्वारा {{agentName}}, निवासी {{agentAddress}} को अपना विधिक प्रतिनिधि नियुक्त करता/करती हूं:\n\n{{purposes}}\n\nप्रतिनिधि को मेरी ओर से दस्तावेज़ पर हस्ताक्षर करने, कार्यालयों/न्यायालयों में उपस्थित होने का अधिकार है।\n\nइसके साक्ष्य में मैंने {{date}} को {{place}} में हस्ताक्षर किए।\n\n{{principalName}} (प्रधान)\n\nगवाह:\n1. _______________\n2. _______________",
    fields: [
      { key: "principalName", label: "Principal Name", labelHi: "प्रधान का नाम", type: "text", required: true },
      { key: "agentName", label: "Attorney Name", labelHi: "प्रतिनिधि का नाम", type: "text", required: true },
      { key: "purposes", label: "Purposes", labelHi: "उद्देश्य", type: "textarea", required: true },
    ],
    order: 8,
  },
  {
    name: "Will / Testament", nameHi: "वसीयतनामा", slug: "will",
    category: "property", description: "Create a legal will for property and asset distribution",
    descriptionHi: "संपत्ति वितरण के लिए कानूनी वसीयत बनाएं", icon: "doc",
    format: "PDF / Word", premium: true, downloadCount: 1800,
    content: "LAST WILL AND TESTAMENT\n\nI, {{testatorName}}, S/o D/o {{parentName}}, aged {{age}}, R/o {{address}}, being of sound mind and memory, do hereby declare this as my Last Will and Testament:\n\n1. I revoke all previous Wills.\n2. {{bequests}}\n3. I appoint {{executorName}} as the Executor of this Will.\n\nIN WITNESS WHEREOF, I sign this Will on {{date}} at {{place}}.\n\n{{testatorName}} (Testator)\n\nWitnesses:\n1. _______________\n2. _______________",
    contentHi: "अंतिम वसीयतनामा\n\nमैं, {{testatorName}}, पुत्र/पुत्री {{parentName}}, आयु {{age}}, निवासी {{address}}, स्वस्थ मन और स्मृति से, एतद्द्वारा इसे अपना अंतिम वसीयतनामा घोषित करता/करती हूं:\n\n1. मैं सभी पूर्व वसीयतें रद्द करता/करती हूं।\n2. {{bequests}}\n3. मैं {{executorName}} को इस वसीयत का निष्पादक नियुक्त करता/करती हूं।\n\n{{date}} को {{place}} में हस्ताक्षरित।\n\n{{testatorName}} (वसीयतकर्ता)\n\nगवाह:\n1. _______________\n2. _______________",
    fields: [
      { key: "testatorName", label: "Testator Name", labelHi: "वसीयतकर्ता", type: "text", required: true },
      { key: "bequests", label: "Property Distribution", labelHi: "संपत्ति वितरण", type: "textarea", required: true },
      { key: "executorName", label: "Executor Name", labelHi: "निष्पादक", type: "text", required: true },
    ],
    order: 9,
  },
  {
    name: "No Objection Certificate", nameHi: "अनापत्ति प्रमाण पत्र", slug: "noc",
    category: "civil", description: "General NOC template for various purposes",
    descriptionHi: "विभिन्न उद्देश्यों के लिए सामान्य NOC टेम्पलेट", icon: "check",
    format: "PDF / Word", premium: true, downloadCount: 3400,
    content: "NO OBJECTION CERTIFICATE\n\nDate: {{date}}\n\nTo Whom It May Concern,\n\nI, {{issuerName}}, {{designation}}, {{organization}}, hereby certify that I/we have no objection to {{beneficiaryName}} for the purpose of {{purpose}}.\n\n{{additionalDetails}}\n\nThis NOC is issued on request without any duress.\n\n{{issuerName}}\n{{designation}}\n{{organization}}\nDate: {{date}}\nPlace: {{place}}",
    contentHi: "अनापत्ति प्रमाण पत्र\n\nदिनांक: {{date}}\n\nसंबंधित को,\n\nमैं, {{issuerName}}, {{designation}}, {{organization}}, प्रमाणित करता/करती हूं कि {{beneficiaryName}} को {{purpose}} के लिए मुझे/हमें कोई आपत्ति नहीं है।\n\n{{additionalDetails}}\n\nयह NOC अनुरोध पर बिना किसी दबाव के जारी किया गया है।\n\n{{issuerName}}\n{{designation}}\n{{organization}}\nदिनांक: {{date}}\nस्थान: {{place}}",
    fields: [
      { key: "issuerName", label: "Issuer Name", labelHi: "जारीकर्ता", type: "text", required: true },
      { key: "beneficiaryName", label: "Beneficiary Name", labelHi: "लाभार्थी", type: "text", required: true },
      { key: "purpose", label: "Purpose", labelHi: "उद्देश्य", type: "textarea", required: true },
    ],
    order: 10,
  },
  {
    name: "Complaint to Police SP", nameHi: "पुलिस अधीक्षक को शिकायत", slug: "sp-complaint",
    category: "criminal", description: "Escalate complaint to Superintendent of Police",
    descriptionHi: "पुलिस अधीक्षक को शिकायत करें", icon: "shield",
    format: "PDF / Word", premium: true, downloadCount: 1600,
    content: "To,\nThe Superintendent of Police,\n{{district}}, {{state}}\n\nSubject: Complaint regarding inaction by {{policeStation}} Police Station\n\nRespected Sir/Madam,\n\nI, {{complainantName}}, R/o {{address}}, wish to bring the following to your attention:\n\n{{facts}}\n\nDespite repeated visits to {{policeStation}} PS, no action has been taken. I request your intervention.\n\n{{complainantName}}\nPhone: {{phone}}\nDate: {{date}}",
    contentHi: "सेवा में,\nपुलिस अधीक्षक,\n{{district}}, {{state}}\n\nविषय: {{policeStation}} थाना द्वारा निष्क्रियता के संबंध में शिकायत\n\nमहोदय/महोदया,\n\nमैं, {{complainantName}}, निवासी {{address}}, निम्नलिखित आपके ध्यान में लाना चाहता/चाहती हूं:\n\n{{facts}}\n\n{{policeStation}} थाना में बार-बार जाने के बावजूद कोई कार्रवाई नहीं हुई। कृपया हस्तक्षेप करें।\n\n{{complainantName}}\nफोन: {{phone}}\nदिनांक: {{date}}",
    fields: [
      { key: "complainantName", label: "Complainant", labelHi: "शिकायतकर्ता", type: "text", required: true },
      { key: "address", label: "Address", labelHi: "पता", type: "textarea", required: true },
      { key: "district", label: "District", labelHi: "जिला", type: "text", required: true },
      { key: "state", label: "State", labelHi: "राज्य", type: "text", required: true },
      { key: "policeStation", label: "Police Station", labelHi: "थाना", type: "text", required: true },
      { key: "facts", label: "Facts", labelHi: "तथ्य", type: "textarea", required: true },
      { key: "phone", label: "Phone", labelHi: "फोन", type: "tel", required: true },
    ],
    order: 11,
  },
  {
    name: "Maintenance Application", nameHi: "भरण-पोषण आवेदन", slug: "maintenance",
    category: "family", description: "Apply for maintenance under Section 125 BNSS",
    descriptionHi: "धारा 125 BNSS के तहत भरण-पोषण के लिए आवेदन", icon: "heart",
    format: "PDF / Word", premium: false, downloadCount: 2100,
    content: "In the Court of {{courtName}}\n\nApplication U/S 144 BNSS (Section 125 CrPC)\n\n{{applicantName}} ... Applicant\nVs.\n{{respondentName}} ... Respondent\n\nApplication for Grant of Maintenance\n\n1. The applicant is the {{relationship}} of the respondent.\n2. {{facts}}\n3. The respondent earns approximately Rs. {{income}}/- per month.\n4. The applicant has no independent source of income.\n\nPrayer: Grant maintenance of Rs. {{amount}}/- per month.\n\n{{applicantName}}\nDate: {{date}}",
    contentHi: "न्यायालय {{courtName}} में\n\nधारा 144 BNSS के तहत आवेदन\n\n{{applicantName}} ... आवेदक\nबनाम\n{{respondentName}} ... प्रत्यर्थी\n\nभरण-पोषण प्रदान करने का आवेदन\n\n1. आवेदक प्रत्यर्थी की/का {{relationship}} है।\n2. {{facts}}\n3. प्रत्यर्थी लगभग रु. {{income}}/- प्रतिमाह कमाता है।\n4. आवेदक की कोई स्वतंत्र आय नहीं है।\n\nप्रार्थना: रु. {{amount}}/- प्रतिमाह भरण-पोषण प्रदान करें।\n\n{{applicantName}}\nदिनांक: {{date}}",
    fields: [
      { key: "applicantName", label: "Applicant", labelHi: "आवेदक", type: "text", required: true },
      { key: "respondentName", label: "Respondent", labelHi: "प्रत्यर्थी", type: "text", required: true },
      { key: "relationship", label: "Relationship", labelHi: "संबंध", type: "text", required: true },
      { key: "facts", label: "Facts", labelHi: "तथ्य", type: "textarea", required: true },
      { key: "income", label: "Respondent Income (Rs.)", labelHi: "प्रत्यर्थी आय", type: "text", required: true },
      { key: "amount", label: "Amount Sought (Rs.)", labelHi: "मांगी गई राशि", type: "text", required: true },
      { key: "courtName", label: "Court", labelHi: "न्यायालय", type: "text", required: true },
    ],
    order: 12,
  },
];

async function main() {
  console.log(`\n📝 SatyaVera Template Seeder`);
  console.log(`   Templates: ${templates.length}`);
  console.log(`   Mode: ${DRY_RUN ? "DRY RUN" : "LIVE"}\n`);

  if (DRY_RUN) {
    templates.forEach((t, i) => console.log(`   ${i + 1}. ${t.name} [${t.category}] ${t.premium ? "(Premium)" : ""}`));
    console.log(`\n✅ Dry run complete.`);
    return;
  }

  let created = 0, skipped = 0;
  const batch = db.batch();

  for (const tpl of templates) {
    const ref = db.collection("templates").doc(tpl.slug);
    const existing = await ref.get();
    if (existing.exists && !FORCE) { skipped++; continue; }
    batch.set(ref, { ...tpl, createdAt: FieldValue.serverTimestamp() });
    created++;
  }

  if (created > 0) await batch.commit();
  console.log(`✅ Done. Created: ${created}, Skipped: ${skipped}`);
}

main().catch(console.error);
