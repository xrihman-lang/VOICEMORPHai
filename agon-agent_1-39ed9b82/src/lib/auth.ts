export interface User {
  id: string;
  email: string;
  displayName: string;
  createdAt: number;
  avatar: string;
  trialStartedAt: number | null;
  isTrialUsed: boolean;
}

interface StoredUser {
  email: string;
  passwordHash: string;
  displayName: string;
  createdAt: number;
  id: string;
  avatar: string;
  trialStartedAt: number | null;
  isTrialUsed: boolean;
}

const USERS_KEY = 'voicemorph_users';
const SESSION_KEY = 'voicemorph_session';

// Simple hash for demo — NOT for production
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + 'voicemorph_salt_2024');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

function getStoredUsers(): StoredUser[] {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveStoredUsers(users: StoredUser[]): void {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function generateId(): string {
  return 'u_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8);
}

function generateAvatar(email: string): string {
  const colors = ['#00e5ff', '#ff00e5', '#8b5cf6', '#ffb300', '#00e676', '#ff1744'];
  const idx = email.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % colors.length;
  return colors[idx];
}

function toPublicUser(stored: StoredUser): User {
  return {
    id: stored.id,
    email: stored.email,
    displayName: stored.displayName,
    createdAt: stored.createdAt,
    avatar: stored.avatar,
    trialStartedAt: stored.trialStartedAt ?? null,
    isTrialUsed: stored.isTrialUsed ?? false,
  };
}

export type AuthError = {
  code: string;
  message: string;
};

export async function signUp(
  email: string,
  password: string,
  displayName: string
): Promise<{ user?: User; error?: AuthError }> {
  email = email.trim().toLowerCase();
  displayName = displayName.trim();

  // Validation
  if (!email) return { error: { code: 'empty-email', message: 'Email is required' } };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return { error: { code: 'invalid-email', message: 'Please enter a valid email address' } };
  if (!displayName || displayName.length < 2)
    return { error: { code: 'invalid-name', message: 'Name must be at least 2 characters' } };
  if (!password || password.length < 6)
    return { error: { code: 'weak-password', message: 'Password must be at least 6 characters' } };

  const users = getStoredUsers();
  if (users.find((u) => u.email === email)) {
    return { error: { code: 'email-exists', message: 'An account with this email already exists' } };
  }

  const passwordHash = await hashPassword(password);
  const newUser: StoredUser = {
    id: generateId(),
    email,
    passwordHash,
    displayName,
    createdAt: Date.now(),
    avatar: generateAvatar(email),
    trialStartedAt: null,
    isTrialUsed: false,
  };

  users.push(newUser);
  saveStoredUsers(users);

  const publicUser = toPublicUser(newUser);
  localStorage.setItem(SESSION_KEY, JSON.stringify(publicUser));

  return { user: publicUser };
}

export async function signIn(
  email: string,
  password: string
): Promise<{ user?: User; error?: AuthError }> {
  email = email.trim().toLowerCase();

  if (!email) return { error: { code: 'empty-email', message: 'Email is required' } };
  if (!password) return { error: { code: 'empty-password', message: 'Password is required' } };

  const users = getStoredUsers();
  const found = users.find((u) => u.email === email);

  if (!found) {
    return { error: { code: 'user-not-found', message: 'No account found with this email' } };
  }

  const passwordHash = await hashPassword(password);
  if (found.passwordHash !== passwordHash) {
    return { error: { code: 'wrong-password', message: 'Incorrect password. Please try again.' } };
  }

  const publicUser = toPublicUser(found);
  localStorage.setItem(SESSION_KEY, JSON.stringify(publicUser));

  return { user: publicUser };
}

export function signOut(): void {
  localStorage.removeItem(SESSION_KEY);
}

export function getCurrentUser(): User | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

// ─── Admin Auth ──────────────────────────────────────────────

const ADMIN_SESSION_KEY = 'voicemorph_admin_session';
const ADMIN_USERNAME = 'GDXAI';
const ADMIN_PASSWORD = 'GDXAI12300';

export function adminLogin(username: string, password: string): boolean {
  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify({ loggedIn: true, at: Date.now() }));
    return true;
  }
  return false;
}

export function adminLogout(): void {
  localStorage.removeItem(ADMIN_SESSION_KEY);
}

export function isAdminLoggedIn(): boolean {
  try {
    const raw = localStorage.getItem(ADMIN_SESSION_KEY);
    if (!raw) return false;
    const data = JSON.parse(raw);
    // Auto-expire after 2 hours
    if (Date.now() - data.at > 2 * 60 * 60 * 1000) {
      localStorage.removeItem(ADMIN_SESSION_KEY);
      return false;
    }
    return data.loggedIn === true;
  } catch {
    return false;
  }
}

export function getAllUsers(): User[] {
  return getStoredUsers().map(toPublicUser);
}

// ─── Trial Functions ─────────────────────────────────────────

export function startUserTrial(userId: string): boolean {
  const users = getStoredUsers();
  const idx = users.findIndex((u) => u.id === userId);
  if (idx === -1) return false;
  if (users[idx].isTrialUsed) return false;

  users[idx].trialStartedAt = Date.now();
  users[idx].isTrialUsed = true;
  saveStoredUsers(users);

  // Update session too
  const session = getCurrentUser();
  if (session && session.id === userId) {
    session.trialStartedAt = users[idx].trialStartedAt;
    session.isTrialUsed = true;
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  }

  return true;
}

export function getUserTrialInfo(userId: string): { trialStartedAt: number | null; isTrialUsed: boolean } {
  const users = getStoredUsers();
  const user = users.find((u) => u.id === userId);
  if (!user) return { trialStartedAt: null, isTrialUsed: false };
  return { trialStartedAt: user.trialStartedAt ?? null, isTrialUsed: user.isTrialUsed ?? false };
}

export function getPasswordStrength(password: string): {
  score: number;
  label: string;
  color: string;
} {
  let score = 0;
  if (password.length >= 6) score++;
  if (password.length >= 10) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 1) return { score, label: 'Weak', color: '#ff1744' };
  if (score <= 2) return { score, label: 'Fair', color: '#ffb300' };
  if (score <= 3) return { score, label: 'Good', color: '#00e5ff' };
  return { score, label: 'Strong', color: '#00e676' };
}
