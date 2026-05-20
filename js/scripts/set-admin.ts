#!/usr/bin/env npx tsx
/**
 * SatyaVera — Set Admin Custom Claims
 * Usage: npx tsx scripts/set-admin.ts <uid>
 */

import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
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

const auth = getAuth();

async function main() {
  const uid = process.argv[2];

  if (!uid) {
    console.error("Usage: npx tsx scripts/set-admin.ts <uid>");
    console.error("  <uid>  Firebase Auth user ID to promote to admin");
    process.exit(1);
  }

  try {
    const user = await auth.getUser(uid);
    console.log(`\nUser: ${user.displayName || user.email || uid}`);
    console.log(`Email: ${user.email}`);
    console.log(`Current claims: ${JSON.stringify(user.customClaims || {})}`);

    await auth.setCustomUserClaims(uid, { ...user.customClaims, admin: true });

    const updated = await auth.getUser(uid);
    console.log(`Updated claims: ${JSON.stringify(updated.customClaims)}`);
    console.log(`\n✅ User ${uid} is now an admin.`);
    console.log(`   Note: The user must sign out and sign back in for claims to take effect.`);
  } catch (error) {
    console.error(`\n❌ Error: ${(error as Error).message}`);
    process.exit(1);
  }
}

main();
