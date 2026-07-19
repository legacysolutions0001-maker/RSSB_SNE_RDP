import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp,
  QueryConstraint,
  Firestore,
} from "firebase/firestore";
import { db } from "./firebase";

// ─── Guard helper ─────────────────────────────────────────────────────────────

function requireDb(): Firestore {
  if (!db) {
    throw new Error(
      "Firebase is not configured. Please check your environment variables."
    );
  }
  return db;
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Applicant {
  id: string;
  applicantName: string;
  age: number;
  phone: string;
  gender: "Male" | "Female" | "Transgender";
  medicalIssues: string;
  handicap: boolean;
  coupleOrSingle: "Couple" | "Single";
  centreName: string;
  centreAddress: string;
  guardianNominee: string;
  dateOfArrival: string;
  timeOfArrival: string;
  createdBy: string;
  createdDate: Timestamp | string;
}

export interface AdminRecord {
  id: string;
  fullName: string;
  address: string;
  phone: string;
  designation: string;
  username: string;
  email: string;
  role: "super_admin" | "admin";
  status: "active" | "disabled";
  createdDate: Timestamp | string;
  createdBy: string;
}

// ─── Applicants ───────────────────────────────────────────────────────────────

export async function getApplicants(filters?: {
  gender?: string;
  coupleOrSingle?: string;
  handicap?: boolean;
  search?: string;
}): Promise<Applicant[]> {
  const firestore = requireDb();
  const constraints: QueryConstraint[] = [orderBy("createdDate", "desc")];
  if (filters?.gender) constraints.push(where("gender", "==", filters.gender));
  if (filters?.coupleOrSingle)
    constraints.push(where("coupleOrSingle", "==", filters.coupleOrSingle));
  if (filters?.handicap !== undefined)
    constraints.push(where("handicap", "==", filters.handicap));

  const snap = await getDocs(
    query(collection(firestore, "applicants"), ...constraints)
  );
  let results = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Applicant));
  if (filters?.search) {
    const s = filters.search.toLowerCase();
    results = results.filter(
      (a) =>
        a.applicantName.toLowerCase().includes(s) ||
        a.phone.includes(s) ||
        a.centreName.toLowerCase().includes(s)
    );
  }
  return results;
}

export async function getApplicant(id: string): Promise<Applicant | null> {
  const firestore = requireDb();
  const snap = await getDoc(doc(firestore, "applicants", id));
  return snap.exists() ? ({ id: snap.id, ...snap.data() } as Applicant) : null;
}

export async function addApplicant(
  data: Omit<Applicant, "id" | "createdDate">,
  createdBy: string
) {
  const firestore = requireDb();
  const ref = await addDoc(collection(firestore, "applicants"), {
    ...data,
    createdBy,
    createdDate: serverTimestamp(),
  });
  return ref.id;
}

export async function updateApplicant(
  id: string,
  data: Partial<Omit<Applicant, "id">>
) {
  const firestore = requireDb();
  await updateDoc(doc(firestore, "applicants", id), data);
}

export async function deleteApplicant(id: string) {
  const firestore = requireDb();
  await deleteDoc(doc(firestore, "applicants", id));
}

export async function getTodaysApplicants(): Promise<Applicant[]> {
  const firestore = requireDb();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const snap = await getDocs(
    query(
      collection(firestore, "applicants"),
      where("createdDate", ">=", Timestamp.fromDate(today)),
      orderBy("createdDate", "desc")
    )
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Applicant));
}

export async function getRecentApplicants(n = 10): Promise<Applicant[]> {
  const firestore = requireDb();
  const snap = await getDocs(
    query(
      collection(firestore, "applicants"),
      orderBy("createdDate", "desc"),
      limit(n)
    )
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Applicant));
}

export async function getDashboardStats() {
  const firestore = requireDb();
  const [allSnap, todayApplicants] = await Promise.all([
    getDocs(collection(firestore, "applicants")),
    getTodaysApplicants(),
  ]);
  const all = allSnap.docs.map((d) => d.data() as Applicant);
  const adminsSnap = await getDocs(collection(firestore, "admins"));

  return {
    totalApplicants: all.length,
    todayApplicants: todayApplicants.length,
    maleCount: all.filter((a) => a.gender === "Male").length,
    femaleCount: all.filter((a) => a.gender === "Female").length,
    transgenderCount: all.filter((a) => a.gender === "Transgender").length,
    handicapCount: all.filter((a) => a.handicap).length,
    coupleCount: all.filter((a) => a.coupleOrSingle === "Couple").length,
    singleCount: all.filter((a) => a.coupleOrSingle === "Single").length,
    totalAdmins: adminsSnap.size,
  };
}

// ─── Admins ───────────────────────────────────────────────────────────────────

export async function getAdmins(): Promise<AdminRecord[]> {
  const firestore = requireDb();
  const snap = await getDocs(
    query(collection(firestore, "admins"), orderBy("createdDate", "desc"))
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as AdminRecord));
}

export async function updateAdmin(id: string, data: Partial<AdminRecord>) {
  const firestore = requireDb();
  await updateDoc(doc(firestore, "admins", id), data);
}

export async function deleteAdmin(id: string) {
  const firestore = requireDb();
  await deleteDoc(doc(firestore, "admins", id));
}
