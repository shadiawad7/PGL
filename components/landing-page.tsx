'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, CalendarDays, Camera, Check, Menu, MoveUpRight, Play, X } from 'lucide-react'
import { useState } from 'react'

const trainings = [
  { title: 'Entrenamiento personal', description: 'Plan diseñado para ti, con seguimiento real y resultados que se mantienen.', duration: '60 min', tag: '1 a 1' },
  { title: 'Small group', description: 'La energía de un equipo. La atención de un entrenador que te conoce.', duration: '50 min', tag: 'Hasta 6' },
  { title: 'Valoración inicial', description: 'Punto de partida, objetivos y un plan claro para empezar con intención.', duration: '45 min', tag: 'Nuevo' },
]

const pillars = ['Entrena con intención', 'Mide lo que importa', 'Disfruta el proceso']

export function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <main className="min-h-screen overflow-hidden bg-background text-foreground">
      <section className="relative min-h-[760px] bg-primary text-primary-foreground">
        <header className="absolute inset-x-0 top-0 z-20 mx-auto flex max-w-7xl items-center justify-between px-6 py-7 lg:px-10">
          <Link href="#inicio" className="font-mono text-sm font-bold tracking-[0.18em]" aria-label="PGL TRAINNING inicio">PGL<span className="text-accent">.</span>TRAINNING</Link>
          <nav className="hidden items-center gap-8 text-xs font-medium uppercase tracking-[0.16em] md:flex" aria-label="Navegación principal">
            <Link className="transition-colors hover:text-accent" href="#metodo">Método</Link>
            <Link className="transition-colors hover:text-accent" href="#entrenamientos">Entrenamientos</Link>
            <Link className="transition-colors hover:text-accent" href="#contacto">Contacto</Link>
            <Link className="border border-primary-foreground/40 px-4 py-3 transition-colors hover:border-accent hover:text-accent" href="/reservar">Reservar sesión <ArrowRight className="ml-2 inline size-4" aria-hidden="true" /></Link>
          </nav>
          <button type="button" className="md:hidden" onClick={() => setMenuOpen((open) => !open)} aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'} aria-expanded={menuOpen}>{menuOpen ? <X /> : <Menu />}</button>
        </header>
        {menuOpen && <nav className="absolute inset-x-0 top-20 z-30 flex flex-col gap-5 border-y border-primary-foreground/15 bg-primary px-6 py-6 text-sm uppercase tracking-[0.16em] md:hidden"><Link href="#metodo" onClick={() => setMenuOpen(false)}>Método</Link><Link href="#entrenamientos" onClick={() => setMenuOpen(false)}>Entrenamientos</Link><Link href="#contacto" onClick={() => setMenuOpen(false)}>Contacto</Link><Link className="text-accent" href="/reservar">Reservar sesión</Link></nav>}
        <div id="inicio" className="mx-auto grid max-w-7xl items-end gap-12 px-6 pb-16 pt-40 lg:grid-cols-[1.05fr_0.95fr] lg:px-10 lg:pb-24 lg:pt-48">
          <div className="relative z-10">
            <p className="mb-8 flex items-center gap-3 font-mono text-xs uppercase tracking-[0.2em] text-primary-foreground/60"><span className="h-px w-10 bg-accent" /> Entrena diferente</p>
            <h1 className="max-w-3xl text-balance text-6xl font-bold leading-[0.9] tracking-[-0.07em] sm:text-8xl lg:text-[8.4rem]">Hazlo <span className="text-accent">real.</span></h1>
            <p className="mt-10 max-w-md text-pretty text-base leading-7 text-primary-foreground/70">Un espacio para entrenar mejor. Sin ruido, sin fórmulas rápidas. Solo un método que se adapta a ti.</p>
            <div className="mt-10 flex flex-wrap items-center gap-5"><Link href="/reservar" className="inline-flex items-center gap-3 bg-accent px-6 py-4 text-sm font-bold uppercase tracking-[0.1em] text-accent-foreground transition-transform hover:-translate-y-1">Empieza aquí <ArrowRight className="size-4" /></Link><Link href="#metodo" className="inline-flex items-center gap-2 text-sm font-medium text-primary-foreground/70 hover:text-primary-foreground">Conoce el método <MoveUpRight className="size-4" /></Link></div>
          </div>
          <div className="relative aspect-[0.9] overflow-hidden lg:aspect-[0.82]">
            <Image src="/pgl-training-hero.png" alt="Entrenamiento personal en PGL TRAINNING" fill priority className="object-cover grayscale-[0.15]" sizes="(max-width: 1024px) 100vw, 45vw" />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/60 via-transparent to-transparent" />
            <div className="absolute bottom-6 left-6 flex items-center gap-3 text-xs uppercase tracking-[0.18em]"><span className="grid size-10 place-items-center rounded-full border border-primary-foreground/60"><Play className="ml-0.5 size-3 fill-current" /></span> Mira cómo entrenamos</div>
          </div>
        </div>
      </section>

      <section id="metodo" className="mx-auto grid max-w-7xl gap-12 px-6 py-24 lg:grid-cols-[0.8fr_1.2fr] lg:px-10 lg:py-32">
        <div><p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">01 / El método</p><h2 className="mt-5 max-w-sm text-4xl font-bold leading-[0.95] tracking-[-0.05em] sm:text-6xl">Tu mejor versión no aparece por accidente.</h2></div>
        <div className="max-w-2xl"><p className="text-2xl leading-tight tracking-[-0.03em] text-muted-foreground sm:text-4xl">Diseñamos cada sesión para que avances con claridad. Conocemos tu punto de partida, escuchamos tus objetivos y construimos el camino contigo.</p><div className="mt-12 grid gap-5 border-t border-border pt-6 sm:grid-cols-3">{pillars.map((pillar, index) => <div key={pillar}><span className="font-mono text-xs text-accent">0{index + 1}</span><p className="mt-5 text-sm font-semibold uppercase tracking-[0.08em]">{pillar}</p></div>)}</div></div>
      </section>

      <section id="entrenamientos" className="bg-secondary px-6 py-24 lg:px-10 lg:py-32"><div className="mx-auto max-w-7xl"><div className="flex flex-col justify-between gap-8 sm:flex-row sm:items-end"><div><p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">02 / Entrenamientos</p><h2 className="mt-5 text-4xl font-bold tracking-[-0.05em] sm:text-6xl">Elige tu forma<br />de avanzar.</h2></div><Link href="/reservar" className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.12em]">Ver disponibilidad <ArrowRight className="size-4 text-accent" /></Link></div><div className="mt-16 grid gap-px bg-border md:grid-cols-3">{trainings.map((training) => <article key={training.title} className="group flex min-h-72 flex-col justify-between bg-secondary p-7 transition-colors hover:bg-primary hover:text-primary-foreground"><div className="flex items-start justify-between gap-4"><span className="border border-current/30 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.16em]">{training.tag}</span><CalendarDays className="size-5 text-accent" aria-hidden="true" /></div><div><h3 className="max-w-xs text-2xl font-bold tracking-[-0.04em]">{training.title}</h3><p className="mt-4 max-w-xs text-sm leading-6 text-muted-foreground group-hover:text-primary-foreground/60">{training.description}</p><p className="mt-6 font-mono text-xs uppercase tracking-[0.16em] text-accent">{training.duration}</p></div></article>)}</div></div></section>

      <section className="mx-auto grid max-w-7xl gap-12 px-6 py-24 lg:grid-cols-2 lg:px-10 lg:py-32"><div><p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">03 / PGL TRAINNING</p><h2 className="mt-5 max-w-lg text-4xl font-bold leading-[0.95] tracking-[-0.05em] sm:text-6xl">No necesitas más motivación. Necesitas un plan.</h2></div><div className="flex flex-col justify-end"><p className="max-w-lg text-lg leading-8 text-muted-foreground">En PGL TRAINNING creemos en hacer las cosas bien. En la constancia, la técnica y en celebrar cada pequeño avance. Aquí no vienes a demostrar nada. Vienes a construir.</p><div className="mt-10 flex flex-wrap gap-x-8 gap-y-4 border-t border-border pt-5 text-xs font-semibold uppercase tracking-[0.14em]"><span className="flex items-center gap-2"><Check className="size-4 text-accent" /> Entrenadores certificados</span><span className="flex items-center gap-2"><Check className="size-4 text-accent" /> Acompañamiento real</span></div></div></section>

      <section id="contacto" className="bg-accent px-6 py-20 text-accent-foreground lg:px-10 lg:py-28"><div className="mx-auto flex max-w-7xl flex-col justify-between gap-12 lg:flex-row lg:items-end"><div><p className="font-mono text-xs uppercase tracking-[0.2em] opacity-70">Tu siguiente paso</p><h2 className="mt-5 max-w-2xl text-5xl font-bold leading-[0.9] tracking-[-0.06em] sm:text-7xl">¿Empezamos?</h2></div><div className="max-w-sm"><p className="text-sm leading-6 opacity-80">Calle del Marqués de Cubas, 12 · Madrid</p><Link href="/reservar" className="mt-6 inline-flex items-center gap-3 border border-accent-foreground/50 px-6 py-4 text-sm font-bold uppercase tracking-[0.1em] transition-colors hover:bg-accent-foreground hover:text-accent">Reserva tu primera sesión <ArrowRight className="size-4" /></Link></div></div></section>

      <footer className="bg-primary px-6 py-8 text-primary-foreground lg:px-10"><div className="mx-auto flex max-w-7xl flex-col justify-between gap-6 text-xs text-primary-foreground/50 sm:flex-row sm:items-center"><span className="font-mono font-bold tracking-[0.16em] text-primary-foreground">PGL<span className="text-accent">.</span>TRAINNING</span><span>© 2025 PGL TRAINNING. Todos los derechos reservados.</span><a href="https://instagram.com" aria-label="Instagram de PGL TRAINNING" className="hover:text-primary-foreground"><Camera className="size-4" /></a></div></footer>
    </main>
  )
}
