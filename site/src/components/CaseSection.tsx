import { useEffect, useRef, useState } from 'react'
import { Check, Copy, ExternalLink, Play } from 'lucide-react'
import { gsap, useGSAP, prefersReducedMotion } from '../lib/gsap'
import { useLang } from '../i18n'
import {
  MODELS,
  OUTPUTS,
  REPO_URL,
  outputUrl,
  type CaseDef,
  type ModelDef,
} from '../data/cases'

function Spinner({ label }: { label: string }) {
  return (
    <span className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3" role="status">
      <span className="border-line border-t-acid size-6 animate-spin rounded-full border-2" />
      <span className="text-dim font-mono text-[10px] tracking-[0.25em] uppercase">{label}</span>
    </span>
  )
}

function FrameFooter({ path }: { path: string }) {
  const { t } = useLang()
  const file = path.split('/').pop() ?? path
  return (
    <div className="text-dim mt-3 flex flex-wrap items-center justify-between gap-2 font-mono text-[11px]">
      <span className="truncate">{file}</span>
      <span className="flex items-center gap-4">
        <a
          href={outputUrl(path)}
          target="_blank"
          rel="noreferrer"
          className="hover:text-acid inline-flex items-center gap-1.5 transition-colors"
        >
          <ExternalLink className="size-3" />
          {t('case.open')}
        </a>
        <a
          href={`${REPO_URL}/blob/main/${path}`}
          target="_blank"
          rel="noreferrer"
          className="hover:text-acid transition-colors"
        >
          {t('case.raw')}
        </a>
      </span>
    </div>
  )
}

function EmptyState() {
  const { t } = useLang()
  return (
    <div className="border-line bg-ink-2/50 mt-5 flex aspect-[16/10] flex-col items-center justify-center gap-3 border border-dashed px-6">
      <span className="bg-amber dot-breathe size-2.5 rounded-full" />
      <p className="text-paper font-mono text-xs tracking-[0.25em] uppercase">{t('empty.title')}</p>
      <p className="text-dim max-w-xs text-center text-xs leading-relaxed">{t('empty.desc')}</p>
    </div>
  )
}

function SvgViewer({ path, label }: { path: string; label: string }) {
  const { t } = useLang()
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading')
  return (
    <figure>
      <div className="border-line bg-ink-2 relative mt-5 flex min-h-64 items-center justify-center overflow-hidden border p-4 md:p-8">
        {state === 'loading' && <Spinner label={t('case.loading')} />}
        {state === 'error' ? (
          <p className="text-dim max-w-sm text-center font-mono text-xs leading-relaxed">
            {t('case.loadError')}
          </p>
        ) : (
          <img
            src={outputUrl(path)}
            alt={label}
            onLoad={() => setState('ready')}
            onError={() => setState('error')}
            className={`max-h-[34rem] w-full object-contain transition-opacity duration-500 ${
              state === 'ready' ? 'opacity-100' : 'opacity-0'
            }`}
          />
        )}
      </div>
      <FrameFooter path={path} />
    </figure>
  )
}

function HtmlViewer({ path, label }: { path: string; label: string }) {
  const { t } = useLang()
  const [phase, setPhase] = useState<'idle' | 'loading' | 'ready'>('idle')
  return (
    <div>
      <div className="border-line bg-ink-2 relative mt-5 aspect-[16/10] overflow-hidden border">
        {phase === 'idle' ? (
          <button
            onClick={() => setPhase('loading')}
            className="group absolute inset-0 flex flex-col items-center justify-center gap-4"
          >
            <span className="border-acid text-acid flex size-16 items-center justify-center rounded-full border transition-transform duration-300 group-hover:scale-110">
              <Play className="size-6 translate-x-0.5" />
            </span>
            <span className="text-paper font-mono text-xs tracking-[0.25em] uppercase">
              {t('case.run')}
            </span>
            <span className="text-dim font-mono text-[10px]">{t('case.runHint')}</span>
          </button>
        ) : (
          <>
            {phase === 'loading' && <Spinner label={t('case.loading')} />}
            <iframe
              src={outputUrl(path)}
              title={label}
              allow="fullscreen; pointer-lock"
              onLoad={() => setPhase('ready')}
              className={`absolute inset-0 size-full transition-opacity duration-500 ${
                phase === 'ready' ? 'opacity-100' : 'opacity-0'
              }`}
            />
          </>
        )}
      </div>
      <FrameFooter path={path} />
    </div>
  )
}

function Viewer({ caseDef, model }: { caseDef: CaseDef; model: ModelDef }) {
  const { pick } = useLang()
  const path = OUTPUTS[caseDef.id]?.[model.id]
  if (!path) return <EmptyState />
  const label = `${pick(caseDef.title)} - ${model.label}`
  return caseDef.kind === 'svg' ? (
    <SvgViewer path={path} label={label} />
  ) : (
    <HtmlViewer path={path} label={label} />
  )
}

export default function CaseSection({ caseDef }: { caseDef: CaseDef }) {
  const { t, pick } = useLang()
  const scope = useRef<HTMLElement>(null)
  const [activeModelId, setActiveModelId] = useState(MODELS[0].id)
  const activeModel = MODELS.find((m) => m.id === activeModelId) ?? MODELS[0]
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!copied) return
    const timer = window.setTimeout(() => setCopied(false), 1600)
    return () => window.clearTimeout(timer)
  }, [copied])

  useGSAP(
    () => {
      if (prefersReducedMotion()) return
      gsap.from('[data-reveal]', {
        y: 36,
        autoAlpha: 0,
        duration: 0.8,
        ease: 'power3.out',
        stagger: 0.12,
        scrollTrigger: { trigger: scope.current, start: 'top 72%', once: true },
      })
    },
    { scope },
  )

  const prompt = pick(caseDef.prompt)
  const copyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(prompt)
      setCopied(true)
    } catch {
      setCopied(false)
    }
  }

  return (
    <section ref={scope} id={caseDef.id} className="border-line relative overflow-hidden border-t">
      <div
        aria-hidden
        className="text-outline-faint pointer-events-none absolute -top-6 right-2 rotate-6 font-mono text-[clamp(8rem,20vw,15rem)] leading-none font-bold select-none"
      >
        {caseDef.index}
      </div>

      <div className="relative mx-auto w-full max-w-7xl px-4 py-24 md:py-32">
        <header data-reveal className="max-w-3xl">
          <div className="text-dim flex flex-wrap items-center gap-2.5 font-mono text-[11px] tracking-[0.2em] uppercase">
            <span className="text-acid">CASE {caseDef.index}</span>
            {caseDef.tags.map((tag) => (
              <span key={tag} className="border-line border px-2 py-0.5">
                {tag}
              </span>
            ))}
          </div>
          <h2 className="mt-5 text-4xl font-bold tracking-tight uppercase md:text-6xl">
            {pick(caseDef.title)}
          </h2>
          <p className="text-dim mt-4 max-w-xl leading-relaxed">{pick(caseDef.tagline)}</p>
        </header>

        <div className="mt-14 grid gap-12 lg:grid-cols-[2fr_3fr] lg:gap-16">
          <div data-reveal>
            <div className="border-line text-dim flex items-center justify-between border-b pb-3 font-mono text-[11px] tracking-[0.25em] uppercase">
              <span>{t('case.prompt')}</span>
              <button
                onClick={copyPrompt}
                className="hover:text-acid inline-flex items-center gap-1.5 transition-colors"
              >
                {copied ? <Check className="text-acid size-3" /> : <Copy className="size-3" />}
                {copied ? t('case.copied') : t('case.copy')}
              </button>
            </div>
            <pre className="border-acid text-paper/90 mt-6 border-l-2 pl-5 font-mono text-sm leading-loose whitespace-pre-wrap">
              {prompt}
            </pre>
            {caseDef.note && (
              <p className="border-line text-dim mt-6 border-t pt-4 font-mono text-[11px] leading-relaxed">
                <span className="text-amber">{t('case.note')}</span>
                <span className="mx-2">·</span>
                {pick(caseDef.note)}
              </p>
            )}
          </div>

          <div data-reveal>
            <div className="border-line flex flex-wrap items-center justify-between gap-3 border-b pb-3">
              <span className="text-dim font-mono text-[11px] tracking-[0.25em] uppercase">
                {t('case.output')}
              </span>
              <div className="flex flex-wrap gap-1.5" role="tablist">
                {MODELS.map((m) => (
                  <button
                    key={m.id}
                    role="tab"
                    aria-selected={m.id === activeModelId}
                    onClick={() => setActiveModelId(m.id)}
                    className={`inline-flex items-center gap-1.5 border px-2.5 py-1 font-mono text-[11px] transition-colors ${
                      m.id === activeModelId
                        ? 'border-acid text-acid'
                        : 'text-dim hover:text-paper border-transparent'
                    }`}
                  >
                    <span
                      className={`size-1.5 rounded-full ${
                        m.status === 'ran' ? 'bg-acid' : 'bg-amber dot-breathe'
                      }`}
                    />
                    {m.label}
                  </button>
                ))}
              </div>
            </div>
            <Viewer key={`${caseDef.id}-${activeModelId}`} caseDef={caseDef} model={activeModel} />
          </div>
        </div>
      </div>
    </section>
  )
}
