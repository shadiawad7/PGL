import type { Metadata } from 'next'
import { LegalDocument, LegalSection } from '@/components/legal-document'
import { OwnerDetails } from '@/components/owner-details'
import { legalOwner } from '@/lib/legal'

export const metadata: Metadata = { title: 'Política de Privacidad | PGL TRAINING' }

export default function PrivacyPage() {
  return (
    <LegalDocument title="Política de Privacidad">
      <LegalSection title="¿Quién es el responsable de tratamiento de sus datos?">
        <OwnerDetails />
      </LegalSection>
      <LegalSection title="¿Qué tipo de datos tenemos sobre su persona y cómo los hemos obtenido?">
        <ul>
          <li>Nombre, correo electrónico y credenciales para el registro y el acceso a la cuenta.</li>
          <li>Datos técnicos de la sesión, como la dirección IP cuando está disponible, el navegador y la fecha de caducidad de la sesión.</li>
          <li>Teléfono de contacto y objetivos de entrenamiento si los facilitas en tu perfil.</li>
          <li>Datos de las sesiones reservadas, como el entrenamiento, la fecha, la hora y el estado de la reserva. El sistema también admite observaciones asociadas a una reserva.</li>
          <li>Datos de contacto y contenido de las consultas que nos comuniques.</li>
        </ul>
        <p>Los datos proceden del propio interesado o de su representante legal y, cuando corresponda, de las relaciones contractuales existentes.</p>
      </LegalSection>
      <LegalSection title="¿Con qué finalidad tratamos sus datos?">
        <p>Tratamos los datos que nos facilitan las personas interesadas con el fin de gestionar distintas actividades derivadas de la prestación del servicio. De esta manera, utilizaremos sus datos para llevar a cabo alguna de las siguientes acciones:</p>
        <ul>
          <li>Prestación de los servicios solicitados, incluida la gestión de la cuenta, el perfil y las reservas.</li>
          <li>Envío de la información que nos soliciten mediante cualquier medio de contacto con nuestra empresa.</li>
          <li>Llevar a cabo la gestión administrativa, fiscal y contable de nuestros clientes.</li>
        </ul>
      </LegalSection>
      <LegalSection title="¿Por cuánto tiempo conservaremos sus datos?">
        <p>Los datos proporcionados por nuestros clientes se conservarán mientras se mantenga la relación mercantil entre las partes respetando en cualquier caso los plazos mínimos legales de conservación según la materia.</p>
        <p>Los datos obtenidos mediante formularios se conservarán durante el tiempo necesario para la finalidad correspondiente, respetando los derechos de los interesados y los plazos legales aplicables.</p>
        <p>En cualquier caso, guardaremos sus datos personales durante el período de tiempo que sea razonablemente necesario teniendo en cuenta nuestras necesidades de dar respuesta a cuestiones que se planteen o resolver problemas y cumplir los requisitos que exija la legislación aplicable. Esto significa que podemos conservar sus datos personales durante un período de tiempo razonable incluso después de que haya dejado de usar nuestros servicios o de que haya dejado de usar esta página web. </p>
      </LegalSection>
      <LegalSection title="¿Cuál es la base de legitimación para el tratamiento de sus datos?">
        <p>Según tipo de tratamiento de datos la base de legitimación es la siguiente:</p>
        <dl className="space-y-3">
          <div><dt className="font-semibold">Prestación y gestión de los servicios solicitados</dt><dd>Ejecución del contrato o aplicación, a petición del interesado, de medidas precontractuales. Incluye la gestión de la cuenta, el perfil y las reservas y la atención de consultas sobre el servicio.</dd></div>
          <div><dt className="font-semibold">Gestión contable y administrativa</dt><dd>Mantenimiento, desarrollo y control de la relación contractual entre las partes y cumplimiento de las obligaciones legales aplicables.</dd></div>
          <div><dt className="font-semibold">Gestión fiscal</dt><dd>Cumplimiento de obligaciones legales.</dd></div>
        </dl>
        <p>En el supuesto de que no facilite sus datos de carácter personal no se podrá ejecutar su contrato, cumplir las obligaciones legales o derivadas de los poderes públicos.</p>
      </LegalSection>
      <LegalSection title="¿A qué destinatarios se comunicarán sus datos?">
        <p>No cederemos sus datos personales a ninguna empresa tercera que pretenda utilizarlos en sus acciones de marketing directo, excepto en el caso de que nos haya autorizado expresamente a ello.</p>
        <p>Le informamos que podemos facilitar sus datos personales a organismos de la Administración Pública y Autoridades competentes en aquellos casos en que nos requieran legalmente o en los casos en que, actuando de buena fe, consideremos que tal acción es razonablemente necesaria para cumplir con un proceso judicial; para contestar cualquier reclamación o demanda jurídica; o para proteger los derechos de la empresa o sus clientes y el público en general.</p>
        <p>Sí proporcionaremos sus datos personales a terceras personas que nos prestan los servicios tecnológicos necesarios para administrar la página web o llevar a cabo los servicios contratados. En cualquier caso, estas terceras personas deben mantener, en todo momento, los mismos niveles de seguridad que nosotros en relación a sus datos personales y, cuando sea necesario, estarán vinculadas por compromisos legales a fin de guardar sus datos personales de forma privada y segura, y también para utilizar únicamente la información siguiendo instrucciones específicas de la empresa.</p>
      </LegalSection>
      <LegalSection title="¿Cuáles son sus derechos como interesado?">
        <p>Cualquier persona tiene derecho a obtener confirmación sobre si estamos tratando datos personales que le conciernan, o no.</p>
        <p>En concreto, las personas interesadas pueden solicitar el derecho de acceso a sus datos personales, así como recibirlos en un formato común y lectura mecanizada si el tratamiento se efectúa por medios electrónicos (derecho de portabilidad).</p>
        <p>Asimismo, las personas interesadas pueden solicitar el derecho de rectificación de los datos inexactos o, en su caso, solicitar su supresión cuando, entre otros motivos, los datos ya no sean necesarios para los fines que fueron recogidos.</p>
        <p>Complementariamente, en determinadas circunstancias, los interesados podrán solicitar la limitación del tratamiento de sus datos, o en determinadas circunstancias y por motivos relacionados con su situación particular, los interesados podrán ejercitar su derecho a oponerse al tratamiento de sus datos. Dejaremos de tratar los datos, salvo por motivos legítimos imperiosos, o el ejercicio o la defensa de posibles reclamaciones o en aquellas excepciones establecidas en la normativa aplicable.</p>
        <p>Asimismo, le informamos que tiene derecho a retirar sus consentimientos otorgados en cualquier momento, sin que ello afecte a la licitud del tratamiento basado en el consentimiento previo a su retirada.</p>
        <p>Así mismo se informa al Usuario que en cualquier momento puede ejercitar los mencionados derechos dirigiéndose por escrito a nosotros utilizando el correo electrónico <a href={`mailto:${legalOwner.email}`}>{legalOwner.email}</a>.</p>
        <p>Usted también tendrá el derecho a presentar una reclamación ante la <a href="https://www.aepd.es">Agencia Española de Protección de Datos</a>, especialmente cuando no haya obtenido satisfacción en el ejercicio de sus derechos.</p>
      </LegalSection>
    </LegalDocument>
  )
}
