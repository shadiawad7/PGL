import type { ReactNode } from 'react'
import { BrandLogo } from '@/components/brand-logo'

export function LegalDocument({ title, children }: { title: string; children: ReactNode }) {
  return (
    <main className="bg-secondary">
      <header className="border-b border-border bg-background px-6 py-5 lg:px-10">
        <BrandLogo />
      </header>
      <article className="mx-auto max-w-3xl break-words px-6 py-12 sm:py-20">
        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">{title}</h1>
        <div className="mt-10 space-y-9 text-base leading-7 [&_a]:font-medium [&_a]:underline [&_a]:underline-offset-4 [&_li]:pl-1 [&_ol]:pl-6 [&_ul]:list-disc [&_ul]:pl-6">
          {children}
        </div>
      </article>
    </main>
  )
}

export function LegalSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-4">
      <h2 className="border-t border-border pt-5 text-xl font-bold sm:text-2xl">{title}</h2>
      {children}
    </section>
  )
}
