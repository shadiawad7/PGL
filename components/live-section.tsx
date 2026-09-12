'use client'

import Image from 'next/image'
import { useEffect, useRef, type ReactNode } from 'react'

export function LiveSection({ id, variant, paused, className = '', children }: {
  id?: string
  variant: 'lines' | 'glow' | 'photo'
  paused: boolean
  className?: string
  children: ReactNode
}) {
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return
    let visible = false
    const update = () => { section.dataset.visible = String(visible && !document.hidden) }
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      update()
    }, { threshold: 0 })
    observer.observe(section)
    document.addEventListener('visibilitychange', update)
    return () => {
      observer.disconnect()
      document.removeEventListener('visibilitychange', update)
    }
  }, [])

  return <section ref={sectionRef} id={id} tabIndex={id ? -1 : undefined} data-paused={paused} className={`live-section live-section--${variant} ${className}`}>
    <div className="live-backdrop" aria-hidden="true">
      {variant === 'photo' ? <>
        <Image src="/pablo.JPG" alt="" fill sizes="100vw" className="live-photo object-cover object-[center_58%]" />
        <div className="live-photo-shade" />
      </> : <><div className="live-aura" /><div className="live-orbit live-orbit--one" /><div className="live-orbit live-orbit--two" /></>}
    </div>
    {children}
  </section>
}
