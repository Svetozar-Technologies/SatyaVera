export const UserRole = { CITIZEN: "CITIZEN", ADVOCATE: "ADVOCATE", ADMIN: "ADMIN" } as const;
export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export const Language = { EN: "en", HI: "hi" } as const;
export type Language = (typeof Language)[keyof typeof Language];

export const DocumentType = {
  FIR: "FIR", RTI: "RTI", COMPLAINT: "COMPLAINT", BAIL_APPLICATION: "BAIL_APPLICATION",
  NOTICE: "NOTICE", AGREEMENT: "AGREEMENT", AFFIDAVIT: "AFFIDAVIT", OTHER: "OTHER",
} as const;
export type DocumentType = (typeof DocumentType)[keyof typeof DocumentType];

export const DocumentStatus = { DRAFT: "DRAFT", COMPLETED: "COMPLETED" } as const;
export type DocumentStatus = (typeof DocumentStatus)[keyof typeof DocumentStatus];

export const MessageRole = { USER: "USER", ASSISTANT: "ASSISTANT", SYSTEM: "SYSTEM" } as const;
export type MessageRole = (typeof MessageRole)[keyof typeof MessageRole];

export const ConsultationStatus = {
  PENDING: "PENDING", ACCEPTED: "ACCEPTED", DECLINED: "DECLINED", COMPLETED: "COMPLETED",
} as const;
export type ConsultationStatus = (typeof ConsultationStatus)[keyof typeof ConsultationStatus];

export const SubscriptionPlan = {
  FREE: "FREE", CITIZEN_PREMIUM: "CITIZEN_PREMIUM", LAWYER_PRO: "LAWYER_PRO",
} as const;
export type SubscriptionPlan = (typeof SubscriptionPlan)[keyof typeof SubscriptionPlan];

// ── User-facing interfaces ──

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  citations?: string[];
  createdAt?: Date;
}

export interface Conversation {
  id: string;
  title: string;
  category?: string;
  language: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

export interface LegalDocument {
  id: string;
  type: DocumentType;
  title: string;
  content: string;
  status: DocumentStatus;
  createdAt: Date;
}

export interface LawyerCard {
  id: string;
  name: string;
  photo?: string;
  specializations: string[];
  city: string;
  state?: string;
  experience: number;
  rating: number;
  reviewCount: number;
  fee: string;
  feeAmount?: number;
  languages: string[];
  verified: boolean;
  topMatch?: boolean;
  availability?: string;
  courts?: string[];
  description?: string;
  descriptionHi?: string;
}

export interface GuideItem {
  id: string;
  title: string;
  titleHi: string;
  slug: string;
  category: string;
  description: string;
  descriptionHi: string;
  icon?: string;
  tags: string[];
  readTime?: string;
  content?: string;
  contentHi?: string;
  rights?: string[];
  rightsHi?: string[];
  steps?: GuideStep[];
  relatedLawSections?: string[];
  readCount?: number;
  featured?: boolean;
  order?: number;
}

export interface GuideStep {
  title: string;
  titleHi: string;
  description: string;
  descriptionHi: string;
}

export interface DictionaryTerm {
  id: string;
  termEn: string;
  termHi: string;
  pronunciation?: string;
  origin?: string;
  definitionEn: string;
  definitionHi: string;
  exampleEn?: string;
  exampleHi?: string;
  relatedTerms?: string[];
  relatedSections?: string[];
  source: string;
  category: string;
  letter: string;
}

export interface TemplateItem {
  id: string;
  name: string;
  nameHi: string;
  slug: string;
  category: string;
  description: string;
  descriptionHi: string;
  icon?: string;
  format?: string;
  premium: boolean;
  downloadCount?: number;
  content?: string;
  contentHi?: string;
  fields?: TemplateField[];
  order?: number;
}

export interface TemplateField {
  key: string;
  label: string;
  labelHi: string;
  type: string;
  required: boolean;
}

export interface QuizItem {
  id: string;
  title: string;
  titleHi: string;
  category: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  questionCount: number;
  timeMinutes: number;
  completedCount?: number;
  icon?: string;
  order?: number;
}

export interface QuizQuestion {
  id: string;
  question: string;
  questionHi: string;
  options: string[];
  optionsHi: string[];
  correctIndex: number;
  explanation: string;
  explanationHi: string;
  lawReference?: string;
  order: number;
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  score: number;
  totalQuestions: number;
  completedAt: Date;
}

export interface ConsultationRequest {
  id: string;
  citizenId: string;
  lawyerId: string;
  citizenName: string;
  topic: string;
  mode: "video" | "phone" | "in_person";
  status: ConsultationStatus;
  scheduledAt?: Date;
  notes?: string;
  fee?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface EmergencyContact {
  name: string;
  relation: string;
  phone: string;
  altPhone?: string;
}

export interface NotificationSettings {
  email: boolean;
  sms: boolean;
  push: boolean;
  newsletter: boolean;
  quizReminders: boolean;
  lawyerUpdates: boolean;
}

export interface PrivacySettings {
  saveChatHistory: boolean;
  analyticsOptIn: boolean;
}

export interface PricingTier {
  id: string;
  name: string;
  price: string;
  period: string;
  recommended: boolean;
  features: string[];
  cta: string;
}

// ── Firestore document interfaces (server-side) ──

export interface UserProfileDoc {
  name: string;
  email: string;
  phone?: string;
  role: "CITIZEN" | "ADVOCATE" | "ADMIN";
  language: string;
  state?: string;
  city?: string;
  district?: string;
  pincode?: string;
  barCouncilNumber?: string;
  barCouncilState?: string;
  yearsOfPractice?: number;
  specializations?: string[];
  courts?: string[];
  verified: boolean;
  image?: string;
  emergencyContact?: EmergencyContact;
  notifications?: NotificationSettings;
  privacySettings?: PrivacySettings;
  bookmarkedGuides?: string[];
  bookmarkedTerms?: string[];
  createdAt: unknown;
  updatedAt: unknown;
}

export interface ConversationDoc {
  userId: string;
  title: string;
  category?: string;
  language: string;
  createdAt: unknown;
  updatedAt: unknown;
}

export interface MessageDoc {
  role: "user" | "assistant" | "system";
  content: string;
  citations?: string[];
  createdAt: unknown;
}

export interface LegalDocumentDoc {
  userId: string;
  type: string;
  title: string;
  content: string;
  status: "DRAFT" | "COMPLETED";
  createdAt: unknown;
  updatedAt: unknown;
}

export interface GuideDoc {
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
  steps: GuideStep[];
  relatedLawSections: string[];
  readCount: number;
  featured: boolean;
  order: number;
  createdAt: unknown;
  updatedAt: unknown;
}

export interface DictionaryEntryDoc {
  termEn: string;
  termHi: string;
  pronunciation: string;
  origin: string;
  category: string;
  definitionEn: string;
  definitionHi: string;
  exampleEn: string;
  exampleHi: string;
  relatedTerms: string[];
  relatedSections: string[];
  source: string;
  letter: string;
  createdAt: unknown;
}

export interface TemplateDoc {
  name: string;
  nameHi: string;
  slug: string;
  category: string;
  description: string;
  descriptionHi: string;
  icon: string;
  format: string;
  premium: boolean;
  downloadCount: number;
  content: string;
  contentHi: string;
  fields: TemplateField[];
  order: number;
  createdAt: unknown;
}

export interface QuizDoc {
  title: string;
  titleHi: string;
  category: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  questionCount: number;
  timeMinutes: number;
  completedCount: number;
  icon: string;
  order: number;
  createdAt: unknown;
}

export interface QuizQuestionDoc {
  question: string;
  questionHi: string;
  options: string[];
  optionsHi: string[];
  correctIndex: number;
  explanation: string;
  explanationHi: string;
  lawReference: string;
  order: number;
}

export interface LawyerProfileDoc {
  userId: string;
  name: string;
  photo?: string;
  verified: boolean;
  rating: number;
  reviewCount: number;
  experience: number;
  location: string;
  city: string;
  state: string;
  practiceAreas: string[];
  languages: string[];
  fee: string;
  feeAmount: number;
  availability: string;
  courts: string[];
  description: string;
  descriptionHi: string;
  barCouncilNumber: string;
  createdAt: unknown;
  updatedAt: unknown;
}

export interface ConsultationRequestDoc {
  citizenId: string;
  lawyerId: string;
  citizenName: string;
  topic: string;
  mode: "video" | "phone" | "in_person";
  status: "PENDING" | "ACCEPTED" | "DECLINED" | "COMPLETED";
  scheduledAt?: unknown;
  notes: string;
  fee: string;
  createdAt: unknown;
  updatedAt: unknown;
}

export interface SubscriptionDoc {
  plan: "FREE" | "CITIZEN_PREMIUM" | "LAWYER_PRO";
  status: "active" | "past_due" | "cancelled" | "trialing";
  queriesUsedToday: number;
  documentsUsedThisMonth: number;
  lastResetDate: string;
  lastDocResetDate: string;
  razorpaySubscriptionId?: string;
  razorpayCustomerId?: string;
  currentPeriodStart?: unknown;
  currentPeriodEnd?: unknown;
  cancelledAt?: unknown;
}

export interface LawDoc {
  title: string;
  hindiTitle?: string;
  actNumber?: number;
  actYear?: number;
  ministry?: string;
  department?: string;
  enactmentDate?: string;
  sourceUrl?: string;
  sectionCount?: number;
  slug: string;
  categories?: string[];
  primaryCategory?: string;
}

export interface LawSectionDoc {
  sectionNo: string;
  title: string;
  content: string;
  orderNo: number;
  footnotes?: string;
}
