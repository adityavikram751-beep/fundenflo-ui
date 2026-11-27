"use client"
/* Tiny localStorage store — the demo has no backend, so results,
   chosen offers and task progress live in the browser. */
import { useCallback, useSyncExternalStore } from "react"
import type { Profile } from "./scoring"

export const KEYS = {
  result: "ff_result",
  offer: "ff_offer",
  tasks: "ff_tasks",
  apply: "ff_apply",
  user: "ff_user",
  users: "ff_users",
  assessment: "ff_assessment",
} as const

export interface User { phone: string; name: string; email?: string; at: string }

export interface SavedResult {
  source: "wizard" | "assessment"
  raw: Profile
  at: string
  summary: { score: number; grade: string; topIssues: string[]; name?: string | null }
}

export interface SavedOffer { code: string; name: string; rate: number; amount: number; speed: string; at: string }

const EVT = "ff-store"
const memory = new Map<string, string | null>() // fallback when localStorage is blocked
const cache = new Map<string, { raw: string | null; val: unknown }>() // stable snapshots per raw value

function readRaw(key: string): string | null {
  try {
    return window.localStorage.getItem(key)
  } catch {
    return memory.get(key) ?? null
  }
}

export function load<T>(key: string): T | null {
  if (typeof window === "undefined") return null
  const raw = readRaw(key)
  const hit = cache.get(key)
  if (hit && hit.raw === raw) return hit.val as T | null
  let val: T | null = null
  try { val = raw ? (JSON.parse(raw) as T) : null } catch { val = null }
  cache.set(key, { raw, val })
  return val
}

export function save<T>(key: string, value: T | null) {
  const raw = value == null ? null : JSON.stringify(value)
  try {
    if (raw == null) window.localStorage.removeItem(key)
    else window.localStorage.setItem(key, raw)
  } catch {
    memory.set(key, raw)
  }
  window.dispatchEvent(new CustomEvent(EVT, { detail: key }))
}

function subscribe(cb: () => void) {
  window.addEventListener(EVT, cb)
  window.addEventListener("storage", cb)
  return () => {
    window.removeEventListener(EVT, cb)
    window.removeEventListener("storage", cb)
  }
}

/** React hook bound to one localStorage key; `ready` is false during SSR/hydration, true on the client */
export function useStored<T>(key: string): [T | null, (v: T | null) => void, boolean] {
  const value = useSyncExternalStore(subscribe, () => load<T>(key), () => null)
  const ready = useSyncExternalStore(subscribe, () => true, () => false)
  const set = useCallback((v: T | null) => save(key, v), [key])
  return [value, set, ready]
}
