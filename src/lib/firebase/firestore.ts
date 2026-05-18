import {
  collection, doc, getDoc, getDocs, setDoc, updateDoc, addDoc,
  deleteDoc, query, where, orderBy, limit, serverTimestamp,
  type DocumentData, type QueryConstraint,
} from "firebase/firestore";
import { db } from "./config";

// ── Collection references ──

export const usersRef = collection(db, "users");
export const conversationsRef = collection(db, "conversations");
export const documentsRef = collection(db, "documents");
export const guidesRef = collection(db, "guides");
export const lawyerProfilesRef = collection(db, "lawyerProfiles");
export const consultationRequestsRef = collection(db, "consultationRequests");
export const templatesRef = collection(db, "templates");
export const subscriptionsRef = collection(db, "subscriptions");
export const dictionaryEntriesRef = collection(db, "dictionaryEntries");
export const lawsRef = collection(db, "laws");

// ── Users ──

export interface UserProfile {
  name: string;
  email: string;
  phone?: string;
  role: "CITIZEN" | "ADVOCATE" | "ADMIN";
  language: string;
  state?: string;
  city?: string;
  barCouncilNumber?: string;
  yearsOfPractice?: number;
  specializations?: string[];
  verified: boolean;
  image?: string;
  createdAt: unknown;
  updatedAt: unknown;
}

export async function getUserProfile(uid: string) {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? (snap.data() as UserProfile) : null;
}

export async function createUserProfile(uid: string, data: Partial<UserProfile>) {
  await setDoc(doc(db, "users", uid), {
    role: "CITIZEN",
    language: "en",
    verified: false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    ...data,
  });
}

export async function updateUserProfile(uid: string, data: Partial<UserProfile>) {
  await updateDoc(doc(db, "users", uid), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

// ── Conversations ──

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

export async function getConversations(userId: string) {
  const q = query(conversationsRef, where("userId", "==", userId), orderBy("updatedAt", "desc"), limit(50));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function createConversation(data: Omit<ConversationDoc, "createdAt" | "updatedAt">) {
  const docRef = await addDoc(conversationsRef, {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function addMessage(conversationId: string, message: Omit<MessageDoc, "createdAt">) {
  const messagesRef = collection(db, "conversations", conversationId, "messages");
  await addDoc(messagesRef, { ...message, createdAt: serverTimestamp() });
  await updateDoc(doc(db, "conversations", conversationId), { updatedAt: serverTimestamp() });
}

export async function getMessages(conversationId: string) {
  const messagesRef = collection(db, "conversations", conversationId, "messages");
  const q = query(messagesRef, orderBy("createdAt", "asc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// ── Documents ──

export interface LegalDocumentDoc {
  userId: string;
  type: string;
  title: string;
  content: string;
  status: "DRAFT" | "COMPLETED";
  createdAt: unknown;
  updatedAt: unknown;
}

export async function getUserDocuments(userId: string) {
  const q = query(documentsRef, where("userId", "==", userId), orderBy("updatedAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function createDocument(data: Omit<LegalDocumentDoc, "createdAt" | "updatedAt">) {
  const docRef = await addDoc(documentsRef, {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

// ── Guides ──

export async function getGuides(category?: string) {
  const constraints: QueryConstraint[] = [orderBy("createdAt", "desc")];
  if (category && category !== "All") {
    constraints.unshift(where("category", "==", category));
  }
  const q = query(guidesRef, ...constraints);
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// ── Laws ──

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
}

export interface LawSectionDoc {
  sectionNo: string;
  title: string;
  content: string;
  orderNo: number;
  footnotes?: string;
}

export async function getLaws(searchQuery?: string) {
  const q = query(lawsRef, orderBy("title"), limit(100));
  const snap = await getDocs(q);
  const laws = snap.docs.map((d) => ({ id: d.id, ...d.data() as LawDoc }));
  if (searchQuery) {
    const lower = searchQuery.toLowerCase();
    return laws.filter((l) => l.title.toLowerCase().includes(lower));
  }
  return laws;
}

export async function getLaw(slug: string) {
  const snap = await getDoc(doc(db, "laws", slug));
  return snap.exists() ? { id: snap.id, ...snap.data() as LawDoc } : null;
}

export async function getLawSections(slug: string) {
  const sectionsRef = collection(db, "laws", slug, "sections");
  const q = query(sectionsRef, orderBy("orderNo", "asc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() as LawSectionDoc }));
}

export async function getLawSection(slug: string, sectionNo: string) {
  const snap = await getDoc(doc(db, "laws", slug, "sections", sectionNo));
  return snap.exists() ? { id: snap.id, ...snap.data() as LawSectionDoc } : null;
}

// ── Templates ──

export async function getTemplates(category?: string) {
  const constraints: QueryConstraint[] = [orderBy("name")];
  if (category && category !== "All") {
    constraints.unshift(where("category", "==", category));
  }
  const q = query(templatesRef, ...constraints);
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// ── Lawyer Profiles ──

export async function getLawyerProfiles(filters?: { specialization?: string; city?: string }) {
  const constraints: QueryConstraint[] = [];
  if (filters?.city) constraints.push(where("courts", "array-contains", filters.city));
  const q = query(lawyerProfilesRef, ...constraints, limit(50));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// ── Subscriptions ──

export interface SubscriptionDoc {
  plan: "FREE" | "CITIZEN_PREMIUM" | "LAWYER_PRO";
  status: string;
  queriesUsedToday: number;
  lastResetDate: string;
  currentPeriodEnd?: unknown;
}

export async function getSubscription(userId: string) {
  const snap = await getDoc(doc(db, "subscriptions", userId));
  return snap.exists() ? (snap.data() as SubscriptionDoc) : null;
}

export async function incrementQueryCount(userId: string) {
  const sub = await getSubscription(userId);
  const today = new Date().toISOString().split("T")[0];

  if (!sub) {
    await setDoc(doc(db, "subscriptions", userId), {
      plan: "FREE",
      status: "active",
      queriesUsedToday: 1,
      lastResetDate: today,
    });
    return { allowed: true, used: 1, limit: 5 };
  }

  // Reset if new day
  if (sub.lastResetDate !== today) {
    await updateDoc(doc(db, "subscriptions", userId), {
      queriesUsedToday: 1,
      lastResetDate: today,
    });
    return { allowed: true, used: 1, limit: sub.plan === "FREE" ? 5 : Infinity };
  }

  const queryLimit = sub.plan === "FREE" ? 5 : Infinity;
  if (sub.queriesUsedToday >= queryLimit) {
    return { allowed: false, used: sub.queriesUsedToday, limit: queryLimit };
  }

  await updateDoc(doc(db, "subscriptions", userId), {
    queriesUsedToday: sub.queriesUsedToday + 1,
  });
  return { allowed: true, used: sub.queriesUsedToday + 1, limit: queryLimit };
}

// ── Dictionary ──

export async function getDictionaryEntries(category?: string, searchTerm?: string) {
  const constraints: QueryConstraint[] = [orderBy("termEn")];
  if (category) constraints.unshift(where("category", "==", category));
  const q = query(dictionaryEntriesRef, ...constraints, limit(100));
  const snap = await getDocs(q);
  const entries = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  if (searchTerm) {
    const lower = searchTerm.toLowerCase();
    return entries.filter((e: DocumentData) =>
      (e.termEn as string)?.toLowerCase().includes(lower) ||
      (e.termHi as string)?.includes(searchTerm)
    );
  }
  return entries;
}
