import type { Metadata } from 'next'
import Link from 'next/link'
import { LegalDocument, LegalSection } from '@/components/legal-document'
import { cookieNoticeStorageKey, legalOwner, privacyPath } from '@/lib/legal'

export const metadata: Metadata = { title: 'Política de Cookies | PGL TRAINING' }

const cookies = [
  {
    name: 'better-auth.session_token',
    duration: 'Persistente, hasta 7 días desde su emisión o renovación. En modo no persistente, dura la sesión del navegador.',
    purpose: 'Mantener la sesión autenticada y permitir el acceso a la cuenta y las reservas.',
  },
  {
    name: 'better-auth.dont_remember',
    duration: 'Sesión del navegador.',
    purpose: 'Mantener el modo de sesión no persistente cuando se solicita en la autenticación.',
  },
]

export default function CookiesPage() {
  return (
    <LegalDocument title="Política de Cookies">
      <LegalSection title="¿Qué son las cookies?">
        <p>{legalOwner.name}, el titular de este sitio web, informa que se utilizan cookies y tecnologías similares que almacenan y recuperan información cuando navegas. Los usos concretos que hacemos de estas tecnologías se describen a continuación.</p>
        <p>Únicamente se utilizan cookies propias con finalidad técnica para la autenticación y el funcionamiento de la cuenta. Las cookies propias son aquellas que se envían a su equipo desde nuestros propios equipos o dominios y desde el que prestamos el servicio que nos solicita.</p>
        <p>El portal del que somos titulares contiene enlaces a sitios web de terceros, cuyas políticas de privacidad son ajenas a nosotros. Al acceder a tales sitios web usted puede decidir si acepta sus políticas de privacidad y de cookies.</p>
        <p>Las cookies de sesión se eliminan al cerrar la sesión del navegador. Las persistentes se conservan hasta su vencimiento o hasta que se eliminen.</p>
      </LegalSection>
      <LegalSection title="Cookies utilizadas">
        <p>Los nombres de las cookies pueden comenzar por <code>__Secure-</code> cuando se usa HTTPS.</p>
        {cookies.map(({ name, duration, purpose }) => (
          <section key={name} className="rounded-lg border border-border bg-background p-4 sm:p-6">
            <h3 className="break-all font-mono text-sm font-semibold sm:text-base">{name}</h3>
            <dl className="mt-3 space-y-2">
              <div><dt className="font-semibold">Tipo</dt><dd>Técnica propia</dd></div>
              <div><dt className="font-semibold">Proveedor</dt><dd>PGL Training, mediante Better Auth</dd></div>
              <div><dt className="font-semibold">Duración</dt><dd>{duration}</dd></div>
              <div><dt className="font-semibold">Finalidad</dt><dd>{purpose}</dd></div>
            </dl>
          </section>
        ))}
      </LegalSection>
      <LegalSection title="Almacenamiento del aviso">
        <p>Al pulsar «Entendido», su navegador guarda la clave <code className="break-all">{cookieNoticeStorageKey}</code> en el almacenamiento de la pestaña. PGL Training la utiliza para recordar que se ha cerrado el aviso durante esa sesión de la pestaña.</p>
        <p>Las cookies y el almacenamiento de esta web no se utilizan para elaborar perfiles.</p>
      </LegalSection>
      <LegalSection title="Cómo gestionar las cookies">
        <p>Puedes eliminar o bloquear las cookies desde los ajustes de tu navegador. Si bloqueas las cookies de autenticación, es posible que no puedas acceder a tu cuenta ni reservar sesiones.</p>
        <p>Para más información sobre los datos personales, consulta la <Link href={privacyPath}>Política de Privacidad</Link>.</p>
      </LegalSection>
    </LegalDocument>
  )
}
