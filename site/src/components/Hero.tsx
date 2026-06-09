import { memo, useMemo, useRef } from 'react'
import { gsap, useGSAP, prefersReducedMotion } from '../lib/gsap'
import { useLang } from '../i18n'
import { CASES, MODELS } from '../data/cases'

// Perpetual animation, isolated and memoized so it never re-renders the hero.
const Typewriter = memo(function Typewriter({ lines }: { lines: string[] }) {
  const scope = useRef<HTMLSpanElement>(null)
  const textRef = useRef<HTMLSpanElement>(null)
  const cursorRef = useRef<HTMLSpanElement>(null)

  useGSAP(
    () => {
      if (!textRef.current) return
      if (prefersReducedMotion()) {
        textRef.current.textContent = lines[0] ?? ''
        return
      }
      gsap.to(cursorRef.current, {
        opacity: 0,
        duration: 0.55,
        repeat: -1,
        yoyo: true,
        ease: 'steps(1)',
      })
      const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.4 })
      lines.forEach((line) => {
        tl.to(textRef.current, {
          duration: Math.min(2.6, line.length * 0.045),
          text: line,
          ease: 'none',
        })
          .to({}, { duration: 2.2 })
          .to(textRef.current, { duration: 0.25, autoAlpha: 0, ease: 'power1.in' })
          .set(textRef.current, { text: '' })
          .set(textRef.current, { autoAlpha: 1 })
      })
    },
    { scope, dependencies: [lines], revertOnUpdate: true },
  )

  return (
    <span ref={scope} className="text-paper/90 min-h-[1.6em] leading-relaxed">
      <span ref={textRef} />
      <span
        ref={cursorRef}
        aria-hidden
        className="bg-acid ml-0.5 inline-block h-[1.05em] w-[0.55em] translate-y-[0.18em]"
      />
    </span>
  )
})

export default function Hero() {
  const { t, lang } = useLang()
  const scope = useRef<HTMLElement>(null)

  const promptLines = useMemo(() => CASES.map((c) => c.prompt[lang]), [lang])

  const ranCount = MODELS.filter((m) => m.status === 'ran').length
  const pendingCount = MODELS.length - ranCount
  const pad = (n: number) => String(n).padStart(2, '0')

  useGSAP(
    () => {
      if (prefersReducedMotion()) return
      gsap
        .timeline({ defaults: { ease: 'power3.out' } })
        .from('[data-hero-line]', { yPercent: 110, duration: 0.9, stagger: 0.12 })
        .from(
          '[data-hero-badge]',
          { scale: 0, rotation: -16, duration: 0.6, ease: 'back.out(1.7)' },
          '-=0.35',
        )
        .from('[data-hero-fade]', { y: 24, autoAlpha: 0, duration: 0.7, stagger: 0.1 }, '-=0.3')
    },
    { scope },
  )

  return (
    <section ref={scope} id="top" className="relative overflow-hidden">
      <div className="mx-auto w-full max-w-7xl px-4 pt-36 pb-20 md:pt-44 md:pb-28">
        <p data-hero-fade className="text-dim font-mono text-xs tracking-[0.35em] uppercase">
          {t('hero.kicker')}
        </p>

        <h1 className="mt-8 leading-[0.92] font-bold tracking-tight uppercase">
          <span className="block overflow-hidden pb-1">
            <span data-hero-line className="block text-[clamp(4rem,14vw,10.5rem)]">
              NAGI
            </span>
          </span>
          <span className="block overflow-hidden pb-2">
            <span data-hero-line className="text-outline relative inline-block text-[clamp(4rem,14vw,10.5rem)]">
              BENCH
              <span
                data-hero-badge
                className="bg-acid text-ink absolute -top-1 -right-4 origin-center translate-x-full rotate-[7deg] px-3 py-1.5 font-mono text-[10px] font-bold tracking-[0.15em] whitespace-nowrap normal-case [-webkit-text-stroke:0] md:text-xs"
              >
                {t('hero.badge')}
              </span>
            </span>
          </span>
        </h1>

        <p data-hero-fade className="text-dim mt-8 max-w-xl text-base leading-relaxed md:text-lg">
          {t('hero.sub')}
        </p>

        <div data-hero-fade className="mt-10 flex items-baseline gap-3 font-mono text-sm md:text-base">
          <span className="text-acid shrink-0 select-none">
            {t('hero.stdin')} &gt;
          </span>
          <Typewriter lines={promptLines} />
        </div>

        <dl
          data-hero-fade
          className="border-line text-dim mt-16 flex flex-wrap gap-x-14 gap-y-6 border-t pt-6 font-mono text-[11px] tracking-[0.25em] uppercase"
        >
          <div>
            <dt>{t('meta.cases')}</dt>
            <dd className="text-paper mt-1 text-3xl tracking-normal">{pad(CASES.length)}</dd>
          </div>
          <div>
            <dt>{t('meta.models')}</dt>
            <dd className="text-paper mt-1 text-3xl tracking-normal">
              {pad(ranCount)}
              <span className="text-amber ml-2 align-middle text-xs tracking-[0.2em]">
                +{pad(pendingCount)} {t('meta.pending')}
              </span>
            </dd>
          </div>
          <div>
            <dt>{t('meta.updated')}</dt>
            <dd className="text-paper mt-1 text-3xl tracking-normal">2026.06</dd>
          </div>
        </dl>
      </div>
    </section>
  )
}
