"use client"
import { useState } from "react"

interface Pt { label: string; value: number }

/** Score history line (single series) + optional projected point. Hover shows a crosshair + tooltip. */
export function ScoreTrend({ points, projected }: { points: Pt[]; projected?: number | null }) {
  const [hover, setHover] = useState<number | null>(null)
  const W = 560, H = 220, padL = 40, padR = 20, padT = 16, padB = 30
  const all = [...points.map((p) => p.value), ...(projected ? [projected] : [])]
  const lo = Math.max(300, Math.floor((Math.min(...all) - 40) / 50) * 50)
  const hi = Math.min(900, Math.ceil((Math.max(...all) + 30) / 50) * 50)
  const n = points.length + (projected ? 1 : 0)
  const x = (i: number) => padL + (i * (W - padL - padR)) / Math.max(1, n - 1)
  const y = (v: number) => padT + ((hi - v) * (H - padT - padB)) / (hi - lo)
  const grid = Array.from({ length: 5 }, (_, i) => Math.round(lo + ((hi - lo) * i) / 4))
  const line = points.map((p, i) => `${i ? "L" : "M"}${x(i)} ${y(p.value)}`).join(" ")
  const last = points.length - 1
  const hv = hover != null ? (hover <= last ? points[hover] : { label: "Projected", value: projected! }) : null

  return (
    <div className="relative">
      <div className="mb-2 flex flex-wrap gap-4 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5"><i className="h-0.5 w-4 rounded bg-chart-1" /> FundenFlo Score</span>
        {projected ? <span className="inline-flex items-center gap-1.5"><i className="h-0 w-4 border-t-2 border-dashed border-chart-2" /> Projected after your plan</span> : null}
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={`Score trend from ${points[0].value} to ${points[last].value}`} onMouseLeave={() => setHover(null)}>
        {grid.map((g) => (
          <g key={g}>
            <line x1={padL} x2={W - padR} y1={y(g)} y2={y(g)} stroke="var(--color-border)" strokeDasharray={g === lo ? undefined : "3 4"} />
            <text x={padL - 8} y={y(g) + 4} textAnchor="end" className="fill-muted-foreground text-[11px]">{g}</text>
          </g>
        ))}
        {[...points, ...(projected ? [{ label: "Next", value: projected }] : [])].map((p, i) => (
          <text key={i} x={x(i)} y={H - 8} textAnchor="middle" className="fill-muted-foreground text-[11px]">{p.label}</text>
        ))}
        {hover != null && <line x1={x(hover)} x2={x(hover)} y1={padT} y2={H - padB} stroke="var(--color-muted-foreground)" strokeOpacity={0.4} />}
        <path d={line} fill="none" stroke="var(--color-chart-1)" strokeWidth={2} strokeLinejoin="round" />
        {projected ? <path d={`M${x(last)} ${y(points[last].value)} L${x(last + 1)} ${y(projected)}`} fill="none" stroke="var(--color-chart-2)" strokeWidth={2} strokeDasharray="5 5" /> : null}
        {points.map((p, i) => (
          <circle key={i} cx={x(i)} cy={y(p.value)} r={i === last || hover === i ? 5 : 4} fill="var(--color-chart-1)" stroke="#fff" strokeWidth={2} />
        ))}
        {projected ? <circle cx={x(last + 1)} cy={y(projected)} r={5} fill="var(--color-chart-2)" stroke="#fff" strokeWidth={2} /> : null}
        <text x={x(last)} y={y(points[last].value) - 12} textAnchor="middle" className="fill-navy text-[12px] font-bold">{points[last].value}</text>
        {projected ? <text x={x(last + 1)} y={y(projected) - 12} textAnchor="middle" className="fill-navy text-[12px] font-bold">{projected}</text> : null}
        {/* hit targets */}
        {Array.from({ length: n }).map((_, i) => (
          <rect key={i} x={x(i) - (W - padL - padR) / (2 * Math.max(1, n - 1))} y={padT} width={(W - padL - padR) / Math.max(1, n - 1)} height={H - padT - padB} fill="transparent" onMouseEnter={() => setHover(i)} />
        ))}
      </svg>
      {hv && hover != null && (
        <div className="pointer-events-none absolute top-6 rounded-lg bg-navy px-2.5 py-1.5 text-xs text-white shadow-lg" style={{ left: `calc(${(x(hover) / W) * 100}% + ${hover > n / 2 ? -110 : 10}px)` }}>
          <div className="text-[#b8c6e3]">{hv.label}</div>
          <b className="ff-num">{hv.value}</b>
        </div>
      )}
    </div>
  )
}
