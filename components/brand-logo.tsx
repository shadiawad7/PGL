import Image from 'next/image'
import Link from 'next/link'

export function BrandLogo({ href = '/', priority = false }: { href?: string; priority?: boolean }) {
  return <Link href={href} aria-label="PGL Training — Inicio" className="inline-flex shrink-0 items-center rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-current">
    <Image
      src="/logo-transparent.png"
      alt="PGL Training"
      width={1536}
      height={1024}
      priority={priority}
      sizes="(max-width: 639px) 96px, 120px"
      className="h-16 w-24 object-contain sm:h-20 sm:w-[120px]"
    />
  </Link>
}
