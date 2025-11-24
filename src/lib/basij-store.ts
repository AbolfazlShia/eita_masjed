import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";
import bcrypt from "bcryptjs";

export type BasijMember = {
  id: string;
  firstName: string;
  lastName: string;
  fatherName: string;
  phone: string;
  password: string;
  createdAt: string;
  qrToken: string;
};

export type BasijMemberPublic = Omit<BasijMember, "password">;

export type BasijMemberPayload = {
  firstName: string;
  lastName: string;
  fatherName: string;
  phone?: string;
  password: string;
};

export type BasijMemberUpdate = Partial<Omit<BasijMemberPayload, "password">> & {
  password?: string;
};

const DATA_DIR = path.resolve(process.cwd(), "data");
const FILE_PATH = path.join(DATA_DIR, "basij-members.json");
export const BASIJ_MEMBER_LIMIT = 300;

function ensureFile() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(FILE_PATH)) {
    fs.writeFileSync(FILE_PATH, JSON.stringify({ members: [] }, null, 2), "utf8");
  }
}

function readStore(): { members: BasijMember[] } {
  ensureFile();
  const raw = fs.readFileSync(FILE_PATH, "utf8");
  try {
    const data = JSON.parse(raw);
    if (!Array.isArray(data?.members)) return { members: [] };
    let dirty = false;
    const members = data.members.map((member: BasijMember) => {
      if (!member.qrToken) {
        dirty = true;
        return { ...member, qrToken: randomUUID() } as BasijMember;
      }
      return member;
    });
    if (dirty) {
      writeStore({ members });
    }
    return { members };
  } catch (error) {
    console.error("Failed to parse basij-members store", error);
    return { members: [] };
  }
}

function writeStore(store: { members: BasijMember[] }) {
  ensureFile();
  fs.writeFileSync(FILE_PATH, JSON.stringify(store, null, 2), "utf8");
}

export function listMembers(): BasijMember[] {
  return readStore().members;
}

export function createMember({ firstName, lastName, fatherName, phone = "", password }: BasijMemberPayload) {
  const store = readStore();
  if (store.members.length >= BASIJ_MEMBER_LIMIT) {
    throw new Error("limit_reached");
  }
  const normalizedFirstName = firstName.trim();
  const normalizedLastName = lastName.trim();
  const normalizedFatherName = fatherName.trim();
  if (!normalizedFirstName || !normalizedLastName || !normalizedFatherName) {
    throw new Error("missing_fields");
  }
  const normalizedPhone = phone?.trim() ?? "";
  if (normalizedPhone) {
    const existing = store.members.find((m) => m.phone === normalizedPhone);
    if (existing) throw new Error("duplicate_phone");
  }
  const now = new Date().toISOString();
  const hashed = bcrypt.hashSync(password, 8);
  const member: BasijMember = {
    id: randomUUID(),
    firstName: normalizedFirstName,
    lastName: normalizedLastName,
    fatherName: normalizedFatherName,
    phone: normalizedPhone,
    password: hashed,
    createdAt: now,
    qrToken: randomUUID(),
  };
  store.members.push(member);
  writeStore(store);
  return member;
}

export function updateMember(id: string, updates: BasijMemberUpdate) {
  const store = readStore();
  const index = store.members.findIndex((m) => m.id === id);
  if (index === -1) throw new Error("not_found");

  const existing = store.members[index];
  const normalizedFirstName = updates.firstName?.trim() ?? existing.firstName;
  const normalizedLastName = updates.lastName?.trim() ?? existing.lastName;
  const normalizedFatherName = updates.fatherName?.trim() ?? existing.fatherName;
  if (!normalizedFirstName || !normalizedLastName || !normalizedFatherName) {
    throw new Error("missing_fields");
  }
  const trimmedPhone = updates.phone?.trim();
  const nextPhone = trimmedPhone ?? existing.phone;
  if (nextPhone && nextPhone !== existing.phone) {
    const duplicate = store.members.find((m, idx) => idx !== index && m.phone === nextPhone);
    if (duplicate) throw new Error("duplicate_phone");
  }

  const hashedPassword = updates.password ? bcrypt.hashSync(updates.password, 8) : existing.password;

  const updatedMember: BasijMember = {
    ...existing,
    firstName: normalizedFirstName,
    lastName: normalizedLastName,
    fatherName: normalizedFatherName,
    phone: nextPhone,
    password: hashedPassword,
  };

  store.members[index] = updatedMember;
  writeStore(store);
  return updatedMember;
}

export function deleteMember(id: string) {
  const store = readStore();
  const normalizedId = typeof id === "string" ? id.trim() : "";
  if (!normalizedId) throw new Error("not_found");
  console.log("[basij-store] delete request", normalizedId, store.members.map((member) => member.id));
  const index = store.members.findIndex((member) => member.id === normalizedId);
  if (index === -1) throw new Error("not_found");
  store.members.splice(index, 1);
  writeStore(store);
}

export function verifyMember(phone: string, password: string) {
  const store = readStore();
  const member = store.members.find((m) => m.phone === phone.trim());
  if (!member) throw new Error("not_found");
  const normalizedPassword = password.trim();
  const hashedPassword = member.password || "";
  const isBcryptHash = hashedPassword.startsWith("$2a$") || hashedPassword.startsWith("$2b$") || hashedPassword.startsWith("$2y$");
  let ok = false;
  if (isBcryptHash) {
    ok = bcrypt.compareSync(normalizedPassword, hashedPassword);
  } else {
    ok = hashedPassword === normalizedPassword;
    if (ok) {
      member.password = bcrypt.hashSync(normalizedPassword, 8);
      writeStore(store);
    }
  }
  if (!ok) throw new Error("invalid_password");
  return member;
}

export function safeMember(member: BasijMember): BasijMemberPublic {
  const { password, ...rest } = member;
  return rest;
}

export function getMemberById(id: string) {
  const store = readStore();
  return store.members.find((m) => m.id === id) || null;
}

export function getMemberByQrToken(token: string) {
  const normalized = typeof token === "string" ? token.trim() : "";
  if (!normalized) return null;
  const store = readStore();
  return store.members.find((m) => m.qrToken === normalized) || null;
}
