"use client"
import { useEffect, useState } from "react"
import { gradeFor, type Severity } from "@/lib/scoring"

export const SEV_COLOR: Record<Severity, string> = { good: "#1f7a43", warn: "#9a5b00", bad: "#ba1a1a" }

const MIN = 300, MAX = 900
const pt = (cx: number, cy: number, r: number, f: number) => {
  const a = Math.PI - f * Math.PI
  return [cx + r * Math.cos(a), cy - r * Math.sin(a)] as const
}

/** Semicircle score gauge 300–900. Colour carries the grade, the label repeats it in text. */
export function ScoreGauge({ score, label = "FundenFlo Score", compact = false, animate = true }: { score: number; label?: string; compact?: boolean; animate?: boolean }) {
  const [animated, setShown] = useState(MIN)
  const shown = animate ? animated : score
  useEffect(() => {
    if (!animate) return
    let raf = 0
    const start = performance.now(), from = MIN
    const tick = (t: number) => {
      const k = Math.min(1, (t - start) / 1100)
      const e = 1 - Math.pow(1 - k, 3)
      setShown(Math.round(from + (score - from) * e))
      if (k < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [score, animate])

  const g = gradeFor(score)
  const color = SEV_COLOR[g.cls]
  const cx = 150, cy = 150, r = 118, sw = compact ? 18 : 22
  const f = (shown - MIN) / (MAX - MIN)
  const [sx, sy] = pt(cx, cy, r, 0)
  const [ex, ey] = pt(cx, cy, r, 1)
  const [vx, vy] = pt(cx, cy, r, Math.max(0.001, f))
  const ticks = [300, 450, 600, 750, 900]

  return (
    <div className="text-center">
      <svg viewBox="0 0 300 185" className="mx-auto w-full max-w-[300px] overflow-visible" role="img" aria-label={`${label}: ${score} out of 900, ${g.label}`}>
        <path d={`M${sx} ${sy} A${r} ${r} 0 0 1 ${ex} ${ey}`} fill="none" stroke="var(--color-track)" strokeWidth={sw} strokeLinecap="round" />
        <path d={`M${sx} ${sy} A${r} ${r} 0 0 1 ${vx} ${vy}`} fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" />
        <circle cx={vx} cy={vy} r={sw / 2 + 3} fill="#fff" stroke={color} strokeWidth={3} />
        {!compact && ticks.map((t) => {
          const f0 = (t - MIN) / (MAX - MIN)
          // end ticks sit under the arc ends; inner ticks sit inside the arc
          const [tx, ty] = f0 === 0 || f0 === 1 ? pt(cx, cy, r, f0) : pt(cx, cy, r - sw - 10, f0)
          return <text key={t} x={tx} y={f0 === 0 || f0 === 1 ? ty + sw + 8 : ty + 4} textAnchor="middle" className="fill-muted-foreground text-[10px]">{t}</text>
        })}
        <text x={cx} y={cy - 18} textAnchor="middle" className="fill-navy font-heading text-[52px] font-bold ff-num">{shown}</text>
        <text x={cx} y={cy + 8} textAnchor="middle" className="fill-muted-foreground text-[12px] font-semibold">{label} · out of 900</text>
      </svg>
      <span
        className="mt-1 inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-sm font-bold"
        style={{ color, background: g.cls === "good" ? "var(--color-success-soft)" : g.cls === "warn" ? "var(--color-warning-soft)" : "var(--color-error-soft)" }}
      >
        <span className="size-2 rounded-full" style={{ background: color }} /> {g.label}
      </span>
    </div>
  )
}
