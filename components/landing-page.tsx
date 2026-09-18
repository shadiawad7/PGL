'use client'

import { BrandLogo } from '@/components/brand-logo'

import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, CalendarDays, Camera, Check, Menu, MoveUpRight, Pause, Play, X } from 'lucide-react'
import { useEffect, useRef, useState, type MouseEvent } from 'react'
import { SessionNavigation } from '@/components/session-navigation'
import { LiveSection } from '@/components/live-section'

interface TrainingSummary { id: string; title: string; description: string; durationMinutes: number; capacity: number }

const pillars = ['Entrena con intención', 'Mide lo que importa', 'Disfruta el proceso']

export function LandingPage() {
  const heroRef = useRef<HTMLElement>(null)
  const [backgroundsPaused, setBackgroundsPaused] = useState(false)
  function goToMethod(event: MouseEvent<HTMLAnchorElement>) {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return
    const target = document.getElementById('metodo')
    if (!target) return
    event.preventDefault()
    setMenuOpen(false)
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    target.focus({ preventScroll: true })
    target.scrollIntoView({ behavior: reducedMotion ? 'instant' : 'smooth', block: 'start' })
    window.history.replaceState(window.history.state, '', '#metodo')
  }
  const [menuOpen, setMenuOpen] = useState(false)
  useEffect(() => {
    const hero = heroRef.current
    if (!hero) return
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)')
    let frame = 0
    const update = () => {
      frame = 0
      const rect = hero.getBoundingClientRect()
      const progress = preference.matches ? 1 : Math.min(1, Math.max(0, -rect.top / (rect.height * 0.65)))
      hero.style.setProperty('--hero-progress', String(progress))
    }
    const schedule = () => { if (!frame) frame = window.requestAnimationFrame(update) }
    update()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    preference.addEventListener('change', schedule)
    return () => {
      window.cancelAnimationFrame(frame)
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      preference.removeEventListener('change', schedule)
    }
  }, [])
  const [trainings, setTrainings] = useState<TrainingSummary[]>([])
  const [catalogMessage, setCatalogMessage] = useState('Cargando entrenamientos…')
  useEffect(() => {
    const controller = new AbortController()
    async function load() {
      try {
        const response = await fetch('/api/trainings', { cache: 'no-store', signal: controller.signal })
        if (!response.ok) throw new Error('Catalog unavailable')
        const data = await response.json()
        setTrainings(data.trainings)
        setCatalogMessage(data.trainings.length ? '' : 'Próximamente, nuevos entrenamientos.')
      } catch {
        if (!controller.signal.aborted) setCatalogMessage('No se han podido cargar los entrenamientos. Vuelve a intentarlo más tarde.')
      }
    }
    void load()
    return () => controller.abort()
  }, [])

  return (
    <main className="min-h-screen overflow-x-clip bg-background text-foreground">
      <section ref={heroRef} className="pgl-hero relative bg-primary text-primary-foreground">
        <header className="absolute inset-x-0 top-0 z-20 mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-10">
          <BrandLogo priority />
          <nav className="hidden items-center gap-5 text-xs font-medium uppercase tracking-[0.16em] xl:flex" aria-label="Navegación principal"><SessionNavigation />
            <a className="transition-colors hover:text-accent" href="#metodo" onClick={goToMethod}>Método</a>
            <Link className="transition-colors hover:text-accent" href="#entrenamientos">Entrenamientos</Link>
            <Link className="transition-colors hover:text-accent" href="#contacto">Contacto</Link>
            <Link className="border border-primary-foreground/40 px-4 py-3 transition-colors hover:border-accent hover:text-accent" href="/reservar">Reservar sesión <ArrowRight className="ml-2 inline size-4" aria-hidden="true" /></Link>
          </nav>
          <button type="button" className="grid size-11 place-items-center xl:hidden" onClick={() => setMenuOpen((open) => !open)} aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'} aria-expanded={menuOpen}>{menuOpen ? <X /> : <Menu />}</button>
        </header>
        {menuOpen && <nav className="absolute inset-x-0 top-24 sm:top-28 z-30 flex flex-col gap-5 border-y border-primary-foreground/15 bg-primary px-6 py-6 text-sm uppercase tracking-[0.16em] xl:hidden"><SessionNavigation /><a href="#metodo" onClick={goToMethod}>Método</a><Link href="#entrenamientos" onClick={() => setMenuOpen(false)}>Entrenamientos</Link><Link href="#contacto" onClick={() => setMenuOpen(false)}>Contacto</Link><Link className="text-accent" href="/reservar">Reservar sesión</Link></nav>}
        <div id="inicio" className="pgl-hero-layout relative mx-auto grid max-w-7xl items-start gap-6 px-6 pb-12 pt-36 lg:grid-cols-[1.05fr_0.95fr] lg:gap-0 lg:px-10 lg:pb-20 lg:pt-44">
          <div className="pgl-hero-copy relative z-10 lg:pr-8 lg:pt-12">
            <p className="mb-8 flex items-center gap-3 font-mono text-xs uppercase tracking-[0.2em] text-primary-foreground/60"><span className="h-px w-10 bg-accent" /> Entrena diferente</p>
            <h1 className="max-w-3xl text-balance text-6xl font-bold leading-[0.9] tracking-[-0.07em] sm:text-8xl lg:text-[8.4rem]">Hazlo <span className="text-accent">real.</span></h1>
            <p className="pgl-hero-description mt-10 max-w-md text-pretty text-base leading-7 text-primary-foreground/70">Un espacio para entrenar mejor. Sin ruido, sin fórmulas rápidas. Solo un método que se adapta a ti.</p>
            <div className="pgl-hero-actions mt-10 flex flex-wrap items-center gap-5"><Link href="/reservar" className="inline-flex items-center gap-3 bg-accent px-6 py-4 text-sm font-bold uppercase tracking-[0.1em] text-accent-foreground transition-transform hover:-translate-y-1">Empieza aquí <ArrowRight className="size-4" /></Link><a href="#metodo" className="inline-flex items-center gap-2 text-sm font-medium text-primary-foreground/70 hover:text-primary-foreground" onClick={goToMethod}>Conoce el método <MoveUpRight className="size-4" /></a></div>
            <div className="pgl-hero-editorial mt-14 max-w-md border-t border-white/15 pt-6 lg:mt-20">
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/45">Del entrenamiento al juego</p>
              <p className="mt-4 text-2xl font-medium leading-tight tracking-[-0.04em] sm:text-3xl">Lo que trabajas hoy.<br /><span className="text-white/50">Lo que das mañana.</span></p>
              <div className="mt-7 flex flex-wrap gap-x-6 gap-y-3 font-mono text-[10px] uppercase tracking-[0.14em] text-white/60"><span>01 / Fuerza</span><span>02 / Técnica</span><span>03 / Constancia</span></div>
              <a href="#metodo" className="mt-10 inline-flex items-center gap-4 text-xs text-white/60 transition-colors hover:text-white" onClick={goToMethod}><span className="grid size-9 place-items-center rounded-full border border-white/25" aria-hidden="true">↓</span> Descubre nuestro método</a>
            </div>
          </div>
          <div className="pgl-hero-photo relative aspect-[2/3] lg:-ml-12 lg:w-[calc(100%+3rem)]">
            <div className="pgl-hero-photo-reveal absolute inset-0">
              <Image src="/pablo.JPG" alt="Pablo jugando un partido de fútbol con el balón en primer plano" fill priority className="pgl-hero-image object-cover" sizes="(max-width: 1024px) 100vw, 50vw" />
            </div>
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-black to-transparent" />
            <p className="hidden lg:block absolute bottom-6 right-3 font-mono text-[10px] uppercase tracking-[0.22em] text-white/50">PGL / En movimiento</p>
          </div>
        </div>
      </section>

      <LiveSection id="metodo" variant="lines" paused={backgroundsPaused} className="px-6 py-24 lg:px-10 lg:py-32">
        <div className="mx-auto max-w-7xl">
        <div className="mb-12 flex justify-end"><button type="button" aria-pressed={backgroundsPaused} onClick={() => setBackgroundsPaused((paused) => !paused)} className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-black/30 px-4 py-2 text-xs text-white/75 transition-colors hover:border-lime-300 hover:text-white focus-visible:outline-2 focus-visible:outline-lime-300">{backgroundsPaused ? <Play className="size-3" aria-hidden="true" /> : <Pause className="size-3" aria-hidden="true" />}{backgroundsPaused ? 'Activar fondos animados' : 'Pausar fondos animados'}</button></div>
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
        <div><p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">01 / El método</p><h2 className="mt-5 max-w-sm text-4xl font-bold leading-[0.95] tracking-[-0.05em] sm:text-6xl">Tu mejor versión no aparece por accidente.</h2></div>
        <div className="max-w-2xl"><p className="text-2xl leading-tight tracking-[-0.03em] text-muted-foreground sm:text-4xl">Diseñamos cada sesión para que avances con claridad. Conocemos tu punto de partida, escuchamos tus objetivos y construimos el camino contigo.</p><div className="mt-12 grid gap-5 border-t border-border pt-6 sm:grid-cols-3">{pillars.map((pillar, index) => <div key={pillar}><span className="font-mono text-xs text-accent">0{index + 1}</span><p className="mt-5 text-sm font-semibold uppercase tracking-[0.08em]">{pillar}</p></div>)}</div></div>
      </div></div>
      </LiveSection>

      <LiveSection id="entrenamientos" variant="glow" paused={backgroundsPaused} className="px-6 py-24 lg:px-10 lg:py-32"><div className="mx-auto max-w-7xl"><div className="flex flex-col justify-between gap-8 sm:flex-row sm:items-end"><div><p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">02 / Entrenamientos</p><h2 className="mt-5 text-4xl font-bold tracking-[-0.05em] sm:text-6xl">Elige tu forma<br />de avanzar.</h2></div><Link href="/reservar" className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.12em]">Ver disponibilidad <ArrowRight className="size-4 text-accent" /></Link></div>{catalogMessage && <p className="mt-10 text-sm text-muted-foreground" role="status">{catalogMessage}</p>}<div className="mt-16 grid gap-4 md:grid-cols-3">{trainings.map((training) => <article key={training.id} className="live-training-card group flex min-h-64 sm:min-h-80 flex-col justify-between gap-8 rounded-xl border border-white/15 bg-black/45 p-7"><div className="flex items-start justify-between gap-4"><span className="border border-current/30 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.16em]">{training.capacity === 1 ? '1 a 1' : `Hasta ${training.capacity}`}</span><CalendarDays className="size-5 text-accent" aria-hidden="true" /></div><div><h3 className="max-w-xs text-2xl font-bold tracking-[-0.04em]">{training.title}</h3><p className="mt-4 max-w-xs text-sm leading-6 text-muted-foreground group-hover:text-primary-foreground/60">{training.description}</p><p className="mt-6 font-mono text-xs uppercase tracking-[0.16em] text-accent">{training.durationMinutes} min</p><Link href={`/reservar/${encodeURIComponent(training.id)}`} className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-lime-300">Ver horarios <ArrowRight className="size-4" aria-hidden="true" /><span className="sr-only"> de {training.title}</span></Link></div></article>)}</div></div></LiveSection>

      <LiveSection variant="photo" paused={backgroundsPaused} className="px-6 py-28 lg:px-10 lg:py-44"><div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-2"><div><p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">03 / PGL TRAINING</p><h2 className="mt-5 max-w-lg text-4xl font-bold leading-[0.95] tracking-[-0.05em] sm:text-6xl">No necesitas más motivación. Necesitas un plan.</h2></div><div className="flex flex-col justify-end"><p className="max-w-lg text-lg leading-8 text-muted-foreground">En PGL TRAINING creemos en hacer las cosas bien. En la constancia, la técnica y en celebrar cada pequeño avance. Aquí no vienes a demostrar nada. Vienes a construir.</p><div className="mt-10 flex flex-wrap gap-x-8 gap-y-4 border-t border-border pt-5 text-xs font-semibold uppercase tracking-[0.14em]"><span className="flex items-center gap-2"><Check className="size-4 text-accent" /> Entrenadores certificados</span><span className="flex items-center gap-2"><Check className="size-4 text-accent" /> Acompañamiento real</span></div></div></div></LiveSection>

      <LiveSection id="contacto" variant="glow" paused={backgroundsPaused} className="live-contact px-6 py-20 lg:px-10 lg:py-28"><div className="mx-auto flex max-w-7xl flex-col justify-between gap-12 lg:flex-row lg:items-end"><div><p className="font-mono text-xs uppercase tracking-[0.2em] opacity-70">Tu siguiente paso</p><h2 className="mt-5 max-w-2xl text-5xl font-bold leading-[0.9] tracking-[-0.06em] sm:text-7xl">¿Empezamos?</h2></div><div className="max-w-sm"><p className="text-sm leading-6 opacity-80">Calle del Marqués de Cubas, 12 · Madrid</p><address className="mt-5 flex flex-col gap-3 text-sm not-italic"><a href="tel:+34606023609" className="w-fit underline decoration-white/30 underline-offset-4 transition-colors hover:text-lime-300">(+34) 606 023 609</a><a href="mailto:xxxxx@gmail.com" className="w-fit underline decoration-white/30 underline-offset-4 transition-colors hover:text-lime-300">xxxxx@gmail.com</a></address><Link href="/reservar" className="mt-6 inline-flex items-center gap-3 border border-lime-300 bg-lime-300 text-black px-6 py-4 text-sm font-bold uppercase tracking-[0.1em] transition-colors hover:bg-lime-200">Reserva tu primera sesión <ArrowRight className="size-4" /></Link></div></div></LiveSection>

      <footer className="bg-primary px-6 py-8 text-primary-foreground lg:px-10"><div className="mx-auto flex max-w-7xl flex-col justify-between gap-6 text-xs text-primary-foreground/50 sm:flex-row sm:items-center"><BrandLogo /><span>© 2025 PGL TRAINING. Todos los derechos reservados.</span><a href="https://instagram.com" aria-label="Instagram de PGL TRAINING" className="hover:text-primary-foreground"><Camera className="size-4" /></a></div></footer>
    </main>
  )
}
