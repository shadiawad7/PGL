import Link from 'next/link'
import { Camera } from 'lucide-react'
import { BrandLogo } from '@/components/brand-logo'
import { legalLinks } from '@/lib/legal'

export function SiteFooter() {
  return (
    <footer className="bg-primary px-6 py-8 text-primary-foreground lg:px-10">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-8 gap-y-5 text-xs">
        <BrandLogo />
        <span className="text-primary-foreground/80">© 2025 PGL TRAINING. Todos los derechos reservados.</span>
        <nav aria-label="Información legal" className="flex flex-wrap gap-x-5 gap-y-3">
          {legalLinks.map(({ href, label }) => (
            <Link key={href} href={href} className="underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4">
              {label}
            </Link>
          ))}
        </nav>
        <a href="https://instagram.com" aria-label="Instagram de PGL TRAINING" className="focus-visible:outline-2 focus-visible:outline-offset-4">
          <Camera className="size-4" aria-hidden="true" />
        </a>
      </div>
    </footer>
  )
}
