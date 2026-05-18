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
  specializations: string[];
  city: string;
  experience: number;
  rating: number;
  reviewCount: number;
  fee: string;
  languages: string;
  verified: boolean;
  topMatch?: boolean;
}

export interface GuideItem {
  id: string;
  title: string;
  titleHi: string;
  category: string;
  description: string;
  descriptionHi: string;
  tags: string[];
}

export interface DictionaryTerm {
  id: string;
  termEn: string;
  termHi: string;
  definitionEn: string;
  definitionHi: string;
  source: string;
  category: string;
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
