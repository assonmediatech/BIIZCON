// Three hills (communities), two figures on each (people), linked by a dotted line (connection).
// The SVG is cropped to the center pair on small screens so it never crowds the form.
const hills = [
  { cx: 150, cy: 520, r: 280 },
  { cx: 1290, cy: 520, r: 280 },
  { cx: 720, cy: 560, r: 300 },
]

// Stand a figure on a hill at angle (degrees from vertical), on the outer edge of the arc.
function Person({ hill, angle, sky = false, delay = 0 }) {
  const t = (angle * Math.PI) / 180
  const R = hill.r + 12
  const x = hill.cx + R * Math.sin(t)
  const y = hill.cy - R * Math.cos(t)
  const fill = sky ? 'var(--color-sky)' : 'var(--color-cream)'
  return (
    <g transform={`translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${angle})`}>
      <g className="float" style={{ animationDelay: `${delay}s` }}>
        <circle cx="0" cy="-62" r="21" fill={fill} />
        <path d="M-24 0V-20a24 24 0 0 1 48 0V0Z" fill={fill} />
      </g>
    </g>
  )
}

export default function ConnectionGraphic() {
  const [left, right, center] = hills
  return (
    <div className="fade pointer-events-none h-[150px] w-full md:h-[200px] lg:h-[230px] 2xl:h-[280px]" style={{ animationDelay: '.5s' }} aria-hidden="true">
      <svg className="h-full w-full" viewBox="0 130 1440 230" preserveAspectRatio="xMidYMax slice">
        {hills.map((h, i) => (
          <circle key={i} cx={h.cx} cy={h.cy} r={h.r} fill="var(--color-navy)" stroke="var(--color-cream)" strokeWidth="28" />
        ))}
        <g fill="none" stroke="var(--color-sky)" strokeWidth="4" strokeLinecap="round" strokeDasharray="1 10" className="flow">
          <path d="M310 205C400 130 540 130 640 205" />
          <path d="M800 205C900 130 1040 130 1130 205" />
        </g>
        <Person hill={left} angle={26} />
        <Person hill={left} angle={46} sky delay={1.2} />
        <Person hill={center} angle={-13} sky delay={0.6} />
        <Person hill={center} angle={13} delay={1.8} />
        <Person hill={right} angle={-26} delay={0.9} />
        <Person hill={right} angle={-46} sky delay={2.1} />
      </svg>
    </div>
  )
}
