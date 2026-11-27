"use client"
/* Demo phone + OTP auth — no backend. The session and known users live in localStorage. */
import { KEYS, load, save, useStored, type User } from "./store"

type KnownUsers = Record<string, { name: string; email?: string }>

export function useAuth() {
  const [user, , ready] = useStored<User>(KEYS.user)
  return { user, ready }
}

export const isValidMobile = (m: string) => /^[6-9]\d{9}$/.test(m)
export const maskPhone = (m: string) => `+91 ${m.slice(0, 2)}XXXXX${m.slice(7)}`
export const knownUser = (phone: string) => load<KnownUsers>(KEYS.users)?.[phone] ?? null

export function signIn(phone: string, name: string, email?: string): User {
  const user: User = { phone, name, email, at: new Date().toISOString() }
  save(KEYS.users, { ...(load<KnownUsers>(KEYS.users) ?? {}), [phone]: { name, email } })
  save(KEYS.user, user)
  return user
}

export function signOut() {
  save(KEYS.user, null)
}

/* ---- "login required" modal, opened from anywhere ---- */
let pending: (() => void) | null = null

/** Opens the login dialog; runs `onSuccess` right after a successful login */
export function requestLogin(opts: { reason?: string; onSuccess?: () => void } = {}) {
  pending = opts.onSuccess ?? null
  window.dispatchEvent(new CustomEvent("ff-login-open", { detail: opts.reason }))
}

export function takePendingLoginAction() {
  const fn = pending
  pending = null
  return fn
}

/** Runs `action` now if logged in, otherwise asks for login first */
export function withLogin(user: User | null, action: () => void, reason?: string) {
  if (user) action()
  else requestLogin({ reason, onSuccess: action })
}
