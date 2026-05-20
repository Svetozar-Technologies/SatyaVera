/**
 * Indian Law Categorization System
 *
 * Maps laws to user-facing categories shown in the SatyaVera UI.
 * Categories: Criminal, Civil, Constitutional, Property, Family, Labour,
 * Consumer, Women, Corporate, Tax, Environment, Cyber, General
 *
 * A law can belong to multiple categories.
 * Categorization uses: ministry, department, title keywords, and explicit overrides.
 */

export interface LawCategory {
  id: string;
  label: string;
  labelHi: string;
  icon: string; // Icon name for UI
  color: string; // Tailwind color class
  description: string;
  descriptionHi: string;
}

export const LAW_CATEGORIES: LawCategory[] = [
  { id: "criminal", label: "Criminal", labelHi: "आपराधिक", icon: "shield", color: "red", description: "Criminal law, BNS, BNSS, BSA, offences, bail, arrest", descriptionHi: "आपराधिक कानून, BNS, BNSS, BSA" },
  { id: "civil", label: "Civil", labelHi: "दीवानी", icon: "scale", color: "navy", description: "Civil procedure, contracts, disputes", descriptionHi: "दीवानी प्रक्रिया, अनुबंध" },
  { id: "constitutional", label: "Constitutional", labelHi: "संवैधानिक", icon: "flag", color: "saffron", description: "Constitution, fundamental rights, governance", descriptionHi: "संविधान, मौलिक अधिकार" },
  { id: "property", label: "Property", labelHi: "संपत्ति", icon: "home", color: "navy", description: "Property transfer, land, tenancy, registration", descriptionHi: "संपत्ति हस्तांतरण, भूमि, किरायेदारी" },
  { id: "family", label: "Family", labelHi: "परिवार", icon: "heart", color: "saffron", description: "Marriage, divorce, adoption, inheritance, maintenance", descriptionHi: "विवाह, तलाक, दत्तक, विरासत" },
  { id: "labour", label: "Labour", labelHi: "श्रम", icon: "users", color: "navy", description: "Employment, industrial disputes, wages, workplace safety", descriptionHi: "रोजगार, औद्योगिक विवाद, मजदूरी" },
  { id: "consumer", label: "Consumer", labelHi: "उपभोक्ता", icon: "shield", color: "green", description: "Consumer protection, food safety, product liability", descriptionHi: "उपभोक्ता संरक्षण, खाद्य सुरक्षा" },
  { id: "women", label: "Women", labelHi: "महिला", icon: "heart", color: "red", description: "Women's rights, domestic violence, dowry, POSH", descriptionHi: "महिला अधिकार, घरेलू हिंसा, दहेज" },
  { id: "corporate", label: "Corporate", labelHi: "कॉर्पोरेट", icon: "template", color: "navy", description: "Companies, banking, securities, insolvency", descriptionHi: "कंपनी, बैंकिंग, प्रतिभूति" },
  { id: "tax", label: "Tax", labelHi: "कर", icon: "doc", color: "saffron", description: "Income tax, GST, customs, excise", descriptionHi: "आयकर, GST, सीमा शुल्क" },
  { id: "environment", label: "Environment", labelHi: "पर्यावरण", icon: "map", color: "green", description: "Environmental protection, pollution, wildlife, forests", descriptionHi: "पर्यावरण संरक्षण, प्रदूषण, वन्यजीव" },
  { id: "cyber", label: "Cyber", labelHi: "साइबर", icon: "bolt", color: "navy", description: "Information technology, data protection, cyber crimes", descriptionHi: "सूचना प्रौद्योगिकी, डेटा सुरक्षा" },
  { id: "general", label: "General", labelHi: "सामान्य", icon: "book", color: "default", description: "General laws, RTI, administrative, regulatory", descriptionHi: "सामान्य कानून, RTI, प्रशासनिक" },
];

// Explicit slug → category overrides for important laws
const EXPLICIT_CATEGORIES: Record<string, string[]> = {
  "the-bharatiya-nyaya-sanhita-2023": ["criminal"],
  "the-bharatiya-nagarik-suraksha-sanhita-2023": ["criminal"],
  "the-bharatiya-sakshya-adhiniyam-2023": ["criminal"],
  "the-indian-penal-code-1860": ["criminal"],
  "the-code-of-criminal-procedure-1973": ["criminal"],
  "the-indian-evidence-act-1872": ["criminal"],
  "the-narcotic-drugs-and-psychotropic-substances-act-1985": ["criminal"],
  "the-prevention-of-corruption-act-1988": ["criminal"],
  "the-unlawful-activities-prevention-act-1967": ["criminal"],
  "the-protection-of-children-from-sexual-offences-act-2012": ["criminal", "women"],
  "the-constitution-of-india": ["constitutional"],
  "the-transfer-of-property-act-1882": ["property", "civil"],
  "the-registration-act-1908": ["property"],
  "the-indian-stamp-act-1899": ["property", "tax"],
  "the-real-estate-regulation-and-development-act-2016": ["property", "consumer"],
  "the-hindu-marriage-act-1955": ["family"],
  "the-hindu-succession-act-1956": ["family", "property"],
  "the-special-marriage-act-1954": ["family"],
  "the-hindu-adoptions-and-maintenance-act-1956": ["family"],
  "the-muslim-women-protection-of-rights-on-divorce-act-1986": ["family", "women"],
  "the-dissolution-of-muslim-marriages-act-1939": ["family"],
  "the-indian-divorce-act-1869": ["family"],
  "the-guardians-and-wards-act-1890": ["family"],
  "the-protection-of-women-from-domestic-violence-act-2005": ["women", "family", "criminal"],
  "the-sexual-harassment-of-women-at-workplace-prevention-prohibition-and-redressal-act-2013": ["women", "labour"],
  "the-dowry-prohibition-act-1961": ["women", "criminal"],
  "the-prohibition-of-child-marriage-act-2006": ["women", "family"],
  "the-consumer-protection-act-2019": ["consumer"],
  "the-food-safety-and-standards-act-2006": ["consumer"],
  "the-companies-act-2013": ["corporate"],
  "the-insolvency-and-bankruptcy-code-2016": ["corporate"],
  "the-negotiable-instruments-act-1881": ["corporate", "criminal"],
  "the-reserve-bank-of-india-act-1934": ["corporate"],
  "the-securities-and-exchange-board-of-india-act-1992": ["corporate"],
  "the-limited-liability-partnership-act-2008": ["corporate"],
  "the-income-tax-act-1961": ["tax"],
  "the-central-goods-and-services-tax-act-2017": ["tax"],
  "the-customs-act-1962": ["tax"],
  "the-industrial-disputes-act-1947": ["labour"],
  "the-code-on-wages-2019": ["labour"],
  "the-factories-act-1948": ["labour"],
  "the-employees-provident-funds-and-miscellaneous-provisions-act-1952": ["labour"],
  "the-payment-of-gratuity-act-1972": ["labour"],
  "the-maternity-benefit-act-1961": ["labour", "women"],
  "the-environment-protection-act-1986": ["environment"],
  "the-wildlife-protection-act-1972": ["environment"],
  "the-water-prevention-and-control-of-pollution-act-1974": ["environment"],
  "the-air-prevention-and-control-of-pollution-act-1981": ["environment"],
  "the-forest-conservation-act-1980": ["environment"],
  "the-information-technology-act-2000": ["cyber"],
  "the-right-to-information-act-2005": ["constitutional", "general"],
  "the-code-of-civil-procedure-1908": ["civil"],
  "the-indian-contract-act-1872": ["civil", "corporate"],
  "the-specific-relief-act-1963": ["civil"],
  "the-arbitration-and-conciliation-act-1996": ["civil"],
  "the-limitation-act-1963": ["civil"],
};

// Ministry → category mapping for automatic categorization
const MINISTRY_CATEGORIES: Record<string, string[]> = {
  "Ministry of Home Affairs": ["criminal"],
  "Ministry of Law and Justice": ["civil", "general"],
  "Ministry of Consumer Affairs, Food and Public Distribution": ["consumer"],
  "Ministry of Women and Child Development": ["women"],
  "Ministry of Labour and Employment": ["labour"],
  "Ministry of Finance": ["tax", "corporate"],
  "Ministry of Corporate Affairs": ["corporate"],
  "Ministry of Environment, Forest and Climate Change": ["environment"],
  "Ministry of Electronics and Information Technology": ["cyber"],
  "Ministry of Housing and Urban Affairs": ["property"],
  "Ministry of Commerce and Industry": ["corporate"],
};

// Title keyword → category mapping
const KEYWORD_CATEGORIES: Array<{ pattern: RegExp; categories: string[] }> = [
  { pattern: /penal|criminal|offence|punishment|bail|arrest|murder|theft|robbery/i, categories: ["criminal"] },
  { pattern: /marriage|divorce|adoption|maintenance|succession|inheritance|guardian/i, categories: ["family"] },
  { pattern: /property|land|tenancy|rent|registration|stamp/i, categories: ["property"] },
  { pattern: /company|companies|corporate|insolvency|bankruptcy|partnership|llp/i, categories: ["corporate"] },
  { pattern: /tax|income.tax|gst|customs|excise|duty/i, categories: ["tax"] },
  { pattern: /consumer|food.safety|product/i, categories: ["consumer"] },
  { pattern: /women|domestic.violence|dowry|sexual.harassment|maternity/i, categories: ["women"] },
  { pattern: /labour|wage|worker|employee|factory|industrial.dispute|gratuity|provident/i, categories: ["labour"] },
  { pattern: /environment|pollution|forest|wildlife|water.*control|air.*control/i, categories: ["environment"] },
  { pattern: /information.technology|cyber|electronic|data.protection/i, categories: ["cyber"] },
  { pattern: /constitution|fundamental|directive.principle|amendment.*constitution/i, categories: ["constitutional"] },
  { pattern: /civil.procedure|contract|arbitration|limitation|specific.relief/i, categories: ["civil"] },
];

/**
 * Categorize a law based on slug, title, ministry, and department.
 * Returns an array of category IDs. A law can belong to multiple categories.
 * Always returns at least ["general"] if no specific match.
 */
export function categorizeLaw(
  slug: string,
  title: string,
  ministry?: string,
  department?: string,
  longTitle?: string
): string[] {
  const categories = new Set<string>();

  // 1. Check explicit overrides first (most accurate)
  if (EXPLICIT_CATEGORIES[slug]) {
    EXPLICIT_CATEGORIES[slug].forEach((c) => categories.add(c));
    return Array.from(categories);
  }

  // 2. Check ministry mapping
  if (ministry && MINISTRY_CATEGORIES[ministry]) {
    MINISTRY_CATEGORIES[ministry].forEach((c) => categories.add(c));
  }

  // 3. Check title keywords
  const fullText = `${title} ${longTitle || ""}`;
  for (const { pattern, categories: cats } of KEYWORD_CATEGORIES) {
    if (pattern.test(fullText)) {
      cats.forEach((c) => categories.add(c));
    }
  }

  // 4. Default to "general" if no match
  if (categories.size === 0) {
    categories.add("general");
  }

  return Array.from(categories);
}

/**
 * Get the primary (most specific) category for a law.
 * Used for UI display where only one category badge is shown.
 */
export function getPrimaryCategory(categories: string[]): string {
  // Priority order — more specific categories first
  const priority = ["criminal", "constitutional", "women", "family", "property", "consumer", "labour", "corporate", "tax", "environment", "cyber", "civil", "general"];
  for (const p of priority) {
    if (categories.includes(p)) return p;
  }
  return "general";
}
