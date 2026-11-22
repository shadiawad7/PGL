import Link from 'next/link'
import { legalOwner, privacyPath, privacyPurposes } from '@/lib/legal'

export function PrivacyNotice({ context }: { context: keyof typeof privacyPurposes }) {
  const basis = {
    registration: 'Aplicación de medidas precontractuales a tu petición y ejecución del contrato cuando corresponda.',
    signIn: 'Ejecución del contrato de prestación del servicio.',
    booking: 'Ejecución del contrato o aplicación de medidas precontractuales a tu petición.',
    profile: 'Ejecución del contrato de prestación del servicio.',
    contact: 'Aplicación de medidas precontractuales a tu petición o ejecución del contrato, para consultas sobre el servicio.',
  }

  return (
    <div className="space-y-2 break-words border-l-2 border-accent pl-3 text-xs leading-5">
      <p className="font-semibold">Información básica sobre protección de datos personales</p>
      <p><strong>Responsable:</strong> {legalOwner.name}.</p>
      <p><strong>Finalidad:</strong> {privacyPurposes[context]}</p>
      <p><strong>Legitimación:</strong> {basis[context]}</p>
      <p><strong>Destinatarios:</strong> autoridades cuando exista obligación legal y proveedores necesarios con las garantías correspondientes.</p>
      <p><strong>Derechos:</strong> puedes ejercer los derechos de acceso, rectificación, supresión y otros derechos reconocidos por la normativa en <a className="underline underline-offset-2" href={`mailto:${legalOwner.email}`}>{legalOwner.email}</a>.</p>
      <p><Link className="font-semibold underline underline-offset-2" href={privacyPath}>Consulta la Política de Privacidad</Link>.</p>
    </div>
  )
}
