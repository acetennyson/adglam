// One-time bootstrap: creates (or promotes) the FIRST owner. Run locally:
//   node --env-file=.env.local scripts/make-owner.mjs you@email.com "Your Name" "a-long-password"
import { cert, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore, Timestamp } from "firebase-admin/firestore";

console.log('Project ID:', process.env.FIREBASE_PROJECT_ID ? '✓ loaded' : '✗ missing');
console.log('Client Email:', process.env.FIREBASE_CLIENT_EMAIL ? '✓ loaded' : '✗ missing');
console.log('Private Key:', process.env.FIREBASE_PRIVATE_KEY ? '✓ loaded' : '✗ missing');


const [email, name, password] = process.argv.slice(2);
if (!email || !name) { console.error('Usage: make-owner.mjs <email> "<name>" [password]'); process.exit(1); }
initializeApp({ credential: cert({ projectId: process.env.FIREBASE_PROJECT_ID, clientEmail: process.env.FIREBASE_CLIENT_EMAIL, privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n") }) });
const auth = getAuth(), db = getFirestore();
let user;
try { user = await auth.getUserByEmail(email); }
catch { if (!password || password.length < 10) { console.error("New user: pass a password of 10+ characters."); process.exit(1); } user = await auth.createUser({ email, password, displayName: name, emailVerified: true }); }
await auth.setCustomUserClaims(user.uid, { role: "owner" });
await db.doc(`admins/${user.uid}`).set({ email, name, role: "owner", disabled: false, createdAt: Timestamp.now() }, { merge: true });
console.log(`Owner ready: ${email} (${user.uid}). Sign in at /admin/login.`);
