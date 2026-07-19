import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
} from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  getDocs,
  query,
  collection,
  where,
  serverTimestamp,
} from "firebase/firestore";
import { auth, db } from "./firebase";

export type UserRole = "super_admin" | "admin";

export interface AdminProfile {
  uid: string;
  fullName: string;
  address: string;
  phone: string;
  designation: string;
  username: string;
  email: string;
  role: UserRole;
  status: "active" | "disabled";
  createdDate: string;
  createdBy: string;
}

// Internal email domain — users never see this
const INTERNAL_DOMAIN = "rssb.internal";

/** Build a deterministic internal email from a username */
export function buildInternalEmail(username: string): string {
  return `${username.toLowerCase()}@${INTERNAL_DOMAIN}`;
}

// ── Username-based login ─────────────────────────────────────────────────────

/**
 * Login with username + password.
 * Looks up the username in Firestore to get the linked internal email,
 * then authenticates against Firebase Auth.
 * Users never know the email address used internally.
 */
export async function loginWithUsername(username: string, password: string) {
  // Find the admin document by username
  const snap = await getDocs(
    query(collection(db, "admins"), where("username", "==", username.trim()))
  );

  if (snap.empty) {
    throw new Error("Invalid username or password.");
  }

  const adminData = snap.docs[0].data() as AdminProfile;

  if (adminData.status === "disabled") {
    throw new Error("Your account has been disabled. Contact Super Admin.");
  }

  // Sign in using the stored internal email
  const cred = await signInWithEmailAndPassword(auth, adminData.email, password);
  const profile = await getAdminProfile(cred.user.uid);
  return { user: cred.user, profile };
}

// ── Legacy email login (kept for internal tooling use) ───────────────────────
export async function login(email: string, password: string) {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  const profile = await getAdminProfile(cred.user.uid);
  if (profile?.status === "disabled") {
    await signOut(auth);
    throw new Error("Your account has been disabled. Contact Super Admin.");
  }
  return { user: cred.user, profile };
}

export async function logout() {
  await signOut(auth);
}

export async function getAdminProfile(uid: string): Promise<AdminProfile | null> {
  const snap = await getDoc(doc(db, "admins", uid));
  return snap.exists() ? (snap.data() as AdminProfile) : null;
}

export function onAuthChange(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}

export async function createAdminRecord(uid: string, data: Omit<AdminProfile, "uid">) {
  await setDoc(doc(db, "admins", uid), {
    ...data,
    uid,
    createdDate: serverTimestamp(),
  });
}

// ── Super Admin initialization ───────────────────────────────────────────────

const SUPER_ADMIN_USERNAME = "bhagwan01";
const SUPER_ADMIN_PASSWORD = "Bhagwan_01";

/**
 * Ensures the single Super Admin account exists in both Firebase Auth and
 * Firestore. Safe to call multiple times — creates only once.
 */
export async function ensureSuperAdmin(): Promise<void> {
  try {
    // Check if super admin already exists in Firestore
    const existing = await getDocs(
      query(collection(db, "admins"), where("role", "==", "super_admin"))
    );

    if (!existing.empty) {
      // Super admin already exists — nothing to do
      return;
    }

    const email = buildInternalEmail(SUPER_ADMIN_USERNAME);

    // Create the Firebase Auth account
    let uid: string;
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, SUPER_ADMIN_PASSWORD);
      uid = cred.user.uid;
      // Sign out immediately — this creation should not count as a login
      await signOut(auth);
    } catch (authError: unknown) {
      const err = authError as { code?: string };
      if (err.code === "auth/email-already-in-use") {
        // Auth account exists but Firestore doc may be missing — sign in to get uid
        const cred = await signInWithEmailAndPassword(auth, email, SUPER_ADMIN_PASSWORD);
        uid = cred.user.uid;
        await signOut(auth);
      } else {
        throw authError;
      }
    }

    // Create the Firestore document
    await setDoc(doc(db, "admins", uid), {
      uid,
      fullName: "Super Administrator",
      address: "RSSB SNE, Rudrapur, Uttarakhand",
      phone: "",
      designation: "Super Admin",
      username: SUPER_ADMIN_USERNAME,
      email,
      role: "super_admin",
      status: "active",
      createdBy: "System",
      createdDate: serverTimestamp(),
    });

    console.log("[RSSB AMS] Super Admin account created successfully.");
  } catch (err) {
    console.error("[RSSB AMS] ensureSuperAdmin error:", err);
    // Non-fatal — app still works; super admin may already exist
  }
}
