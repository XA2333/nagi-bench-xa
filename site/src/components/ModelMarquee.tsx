import { memo, useRef } from 'react'
import { gsap, useGSAP, prefersReducedMotion } from '../lib/gsap'
import { MODELS } from '../data/cases'

// Perpetual animation, isolated and memoized; duplicated track for a seamless -50% loop.
const ModelMarquee = memo(function ModelMarquee() {
  const scope = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      if (prefersReducedMotion()) return
      gsap.to('[data-marquee-track]', { xPercent: -50, duration: 32, ease: 'none', repeat: -1 })
    },
    { scope },
  )

  const Sequence = () => (
    <>
      {MODELS.map((m) => (
        <span key={m.id} className="mx-7 inline-flex items-center gap-3">
          <span className={`size-1.5 rounded-full ${m.status === 'ran' ? 'bg-ink' : 'bg-ink/30'}`} />
          {m.label}
          <span className="text-ink/55">{m.vendor}</span>
          <span className="text-ink/55">[{m.status === 'ran' ? 'RAN' : 'PENDING'}]</span>
        </span>
      ))}
    </>
  )

  return (
    <div ref={scope} aria-hidden className="relative z-10 -my-4 overflow-hidden">
      <div className="bg-acid text-ink -mx-[2%] w-[104%] -rotate-[1.1deg] overflow-hidden py-2.5">
        <div
          data-marquee-track
          className="flex w-max font-mono text-xs font-bold tracking-[0.2em] whitespace-nowrap uppercase"
        >
          <Sequence />
          <Sequence />
        </div>
      </div>
    </div>
  )
})

export default ModelMarquee
