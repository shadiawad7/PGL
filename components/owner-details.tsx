import { legalOwner } from '@/lib/legal'

export function OwnerDetails() {
  return (
    <dl className="space-y-2">
      <div><dt className="inline font-semibold">Titular</dt><dd className="inline"> · {legalOwner.name}</dd></div>
      <div><dt className="inline font-semibold">NIF</dt><dd className="inline"> · {legalOwner.nif}</dd></div>
      <div><dt className="inline font-semibold">Domicilio</dt><dd className="inline"> · {legalOwner.address}</dd></div>
      <div><dt className="inline font-semibold">Teléfono</dt><dd className="inline"> · <a href={`tel:+34${legalOwner.phone}`}>{legalOwner.phone}</a></dd></div>
      <div><dt className="inline font-semibold">Correo electrónico</dt><dd className="inline"> · <a href={`mailto:${legalOwner.email}`}>{legalOwner.email}</a></dd></div>
    </dl>
  )
}
