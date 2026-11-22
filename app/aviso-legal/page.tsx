import type { Metadata } from 'next'
import { LegalDocument, LegalSection } from '@/components/legal-document'
import { OwnerDetails } from '@/components/owner-details'
import { legalOwner } from '@/lib/legal'

export const metadata: Metadata = { title: 'Aviso Legal | PGL TRAINING' }

export default function LegalNoticePage() {
  return (
    <LegalDocument title="Aviso Legal">
      <LegalSection title="Objeto y aceptación">
        <p>El presente aviso legal regula el uso del sitio web <a href={legalOwner.website}>{legalOwner.website}</a> (en adelante, LA WEB), del que es titular PABLO GARCIA LLORENS (en adelante, EL PROPIETARIO DE LA WEB).</p>
        <p>La navegación por el sitio web de EL PROPIETARIO DE LA WEB atribuye la condición de usuario del mismo e implica la aceptación plena y sin reservas de todas y cada una de las disposiciones incluidas en este Aviso Legal, que pueden sufrir modificaciones.</p>
        <p>El usuario se obliga a hacer un uso correcto del sitio web de conformidad con las leyes, la buena fe, el orden público, los usos del tráfico y el presente Aviso Legal. El usuario responderá frente a EL PROPIETARIO DE LA WEB o frente a terceros, de cualesquiera daños y perjuicios que pudieran causarse como consecuencia del incumplimiento de dicha obligación.</p>
      </LegalSection>
      <LegalSection title="Identificación y comunicaciones">
        <p>EL PROPIETARIO DE LA WEB, en cumplimiento de la Ley 34/2002, de 11 de julio, de servicios de la sociedad de la información y de comercio electrónico, le informa que:</p>
        <OwnerDetails />
        <h3 className="font-semibold">Comunicaciones</h3>
        <p>Todas las notificaciones y comunicaciones entre los usuarios y EL PROPIETARIO DE LA WEB se considerarán eficaces, a todos los efectos, cuando se realicen a través de correo postal o cualquiera de los medios de contacto indicados en este apartado.</p>
      </LegalSection>
      <LegalSection title="Condiciones de acceso y utilización">
        <p>El sitio web y sus servicios son de acceso libre y gratuito, no obstante, EL PROPIETARIO DE LA WEB condiciona la utilización de algunos de los servicios ofrecidos en su web a la previa cumplimentación del correspondiente formulario.</p>
        <p>El usuario garantiza la autenticidad y actualidad de todos aquellos datos que comunique a EL PROPIETARIO DE LA WEB y será el único responsable de las manifestaciones falsas o inexactas que realice.</p>
        <p>El usuario se compromete expresamente a hacer un uso adecuado de los contenidos y servicios de EL PROPIETARIO DE LA WEB y a no emplearlos para, entre otros:</p>
        <ol className="list-[lower-alpha]">
          <li>Difundir contenidos delictivos, violentos, pornográficos, racistas, xenófobo, ofensivos, de apología del terrorismo o, en general, contrarios a la ley o al orden público.</li>
          <li>Introducir en la red virus informáticos o realizar actuaciones susceptibles de alterar, estropear, interrumpir o generar errores o daños en los documentos electrónicos, datos o sistemas físicos y lógicos de EL PROPIETARIO DE LA WEB o de terceras personas; así como obstaculizar el acceso de otros usuarios al sitio web y a sus servicios mediante el consumo masivo de los recursos informáticos a través de los cuales EL PROPIETARIO DE LA WEB presta sus servicios.</li>
          <li>Intentar acceder a las cuentas de correo electrónico de otros usuarios o a áreas restringidas de los sistemas informáticos de EL PROPIETARIO DE LA WEB o de terceros y, en su caso, extraer información.</li>
          <li>Vulnerar los derechos de propiedad intelectual o industrial, así como violar la confidencialidad de la información de EL PROPIETARIO DE LA WEB o de terceros.</li>
          <li>Suplantar la identidad de otro usuario, de las administraciones públicas o de un tercero.</li>
          <li>Reproducir, copiar, distribuir, poner a disposición de, o cualquier otra forma de comunicación pública, transformar o modificar los contenidos, a menos que se cuente con la autorización del titular de los correspondientes derechos o ello resulte legalmente permitido.</li>
          <li>Recabar datos con finalidad publicitaria y remitir publicidad de cualquier clase y comunicaciones con fines de venta u otras de naturaleza comercial sin que medie su previa solicitud o consentimiento.</li>
        </ol>
      </LegalSection>
      <LegalSection title="Propiedad intelectual e industrial">
        <p>Todos los contenidos del sitio web, como textos, fotografías, gráficos, imágenes, iconos, tecnología, software, así como su diseño gráfico y códigos fuente, constituyen una obra protegida por los correspondientes derechos de propiedad intelectual e industrial, cuya propiedad pertenece a EL PROPIETARIO DE LA WEB o a terceros respecto de los cuales EL PROPIETARIO DE LA WEB dispone de autorización y/o licencia para su uso, sin que puedan entenderse cedidos al usuario ninguno de los derechos de explotación sobre los mismos más allá de lo estrictamente necesario para el correcto uso de la web.</p>
        <p>En definitiva, los usuarios que accedan a este sitio web pueden visualizar los contenidos y efectuar, en su caso, copias privadas autorizadas siempre que los elementos reproducidos no sean cedidos posteriormente a terceros, ni se instalen en servidores conectados a redes, ni sean objeto de ningún tipo de explotación.</p>
        <p>Asimismo, todas las marcas, nombres comerciales o signos distintivos de cualquier clase que aparecen en el sitio web son propiedad de EL PROPIETARIO DE LA WEB o de terceros y están protegidos por la normativa de propiedad industrial, sin que pueda entenderse que el uso o acceso al mismo atribuya al usuario derecho alguno sobre los mismos.</p>
        <p>La distribución, modificación, cesión o comunicación pública de los contenidos y cualquier otro acto que no haya sido expresamente autorizado por el titular de los derechos de explotación quedan prohibidos.</p>
      </LegalSection>
      <LegalSection title="Hiperenlaces">
        <p>El establecimiento de un hiperenlace no implica en ningún caso la existencia de relaciones entre EL PROPIETARIO DE LA WEB y el propietario del sitio web en la que se establezca, ni la aceptación y aprobación por parte de EL PROPIETARIO DE LA WEB de sus contenidos o servicios. Aquellas personas que se propongan establecer un hiperenlace previamente deberán solicitar autorización por escrito a EL PROPIETARIO DE LA WEB. En todo caso, el hiperenlace únicamente permitirá el acceso a la home-page o página de inicio de nuestro sitio web, asimismo deberá abstenerse de realizar manifestaciones o indicaciones falsas, inexactas o incorrectas sobre EL PROPIETARIO DE LA WEB, o incluir contenidos ilícitos, contrarios a las buenas costumbres y al orden público.</p>
        <p>EL PROPIETARIO DE LA WEB no se responsabiliza del uso que cada usuario le dé a los materiales puestos a disposición en este sitio web ni de las actuaciones que realice en base a los mismos.</p>
        <p>En los hiperenlaces hacia otros lugares, como también es el caso de redes sociales, EL PROPIETARIO DE LA WEB no ejercerá ningún control sobre estos lugares y contenidos, no asumirá ninguna responsabilidad por los contenidos de algún enlace perteneciente a otras web ajenas ni garantizará la disponibilidad técnica, calidad, fiabilidad, exactitud, amplitud, veracidad y validez de cualquier material o información contenida en ninguno de dichos hipervínculos u otros sitios de internet.</p>
      </LegalSection>
      <LegalSection title="Exclusión de garantías y de responsabilidad">
        <p>El contenido del presente sitio web es de carácter general y tiene una finalidad meramente informativa, sin que se garantice plenamente el acceso a todos los contenidos, ni su exhaustividad, corrección, vigencia o actualidad, ni su idoneidad o utilidad para un objetivo específico.</p>
        <p>EL PROPIETARIO DE LA WEB excluye, hasta donde permite el ordenamiento jurídico, cualquier responsabilidad por los daños y perjuicios de toda naturaleza derivados de:</p>
        <ol className="list-[lower-alpha]">
          <li>La imposibilidad de acceso al sitio web o la falta de veracidad, exactitud, exhaustividad y/o actualidad de los contenidos, así como la existencia de vicios y defectos de toda clase de los contenidos transmitidos, difundidos, almacenados, puestos a disposición, a los que se haya accedido a través del sitio web o de los servicios que se ofrecen.</li>
          <li>La presencia de virus o de otros elementos en los contenidos que puedan producir alteraciones en los sistemas informáticos, documentos electrónicos o datos de los usuarios.</li>
          <li>El incumplimiento de las leyes, la buena fe, el orden público, los usos del tráfico y el presente aviso legal como consecuencia del uso incorrecto del sitio web. En particular, y a modo ejemplificativo, EL PROPIETARIO DE LA WEB no se hace responsable de las actuaciones de terceros que vulneren derechos de propiedad intelectual e industrial, secretos empresariales, derechos al honor, a la intimidad personal y familiar y a la propia imagen, así como la normativa en materia de competencia desleal y publicidad ilícita.</li>
        </ol>
        <p>Asimismo, EL PROPIETARIO DE LA WEB declina cualquier responsabilidad respecto a la información que se halle fuera de esta web y no sea gestionada directamente por nuestro webmaster. La función de los links que aparecen en esta web es exclusivamente la de informar al usuario sobre la existencia de otras fuentes susceptibles de ampliar los contenidos que ofrece este sitio web. EL PROPIETARIO DE LA WEB no garantiza ni se responsabiliza del funcionamiento o accesibilidad de los sitios enlazados; ni sugiere, invita o recomienda la visita a los mismos, por lo que tampoco será responsable del resultado obtenido. EL PROPIETARIO DE LA WEB no se responsabiliza del establecimiento de hipervínculos por parte de terceros.</p>
      </LegalSection>
      <LegalSection title="Procedimiento en caso de realización de actividades de carácter ilícito">
        <p>Si EL PROPIETARIO DE LA WEB tuviera conocimiento del uso de los servicios de la web para actividades lesivas de derechos o que constituyan actos ilícitos, tomará las medidas necesarias para la represión y eliminación  de estas actividades, reservándose el derecho de iniciar acciones legales.</p>
        <p>En el caso de que cualquier usuario o un tercero considere que existen hechos o circunstancias que revelen el carácter ilícito de la utilización de cualquier contenido y/o de la realización de cualquier actividad en las páginas web incluidas o accesibles a través del sitio web, deberá enviar una notificación a EL PROPIETARIO DE LA WEB identificándose debidamente, especificando las supuestas infracciones.</p>
      </LegalSection>
      <LegalSection title="Publicaciones">
        <p>La información administrativa facilitada a través del sitio web no sustituye la publicidad legal de las leyes, normativas, planes, disposiciones generales y actos que tengan que ser publicados formalmente a los diarios oficiales de las administraciones públicas, que constituyen el único instrumento que da fe de su autenticidad y contenido. La información disponible en este sitio web debe entenderse como una guía sin propósito de validez legal.</p>
      </LegalSection>
      <LegalSection title="Legislación y jurisdicción aplicable">
        <p>Este Aviso Legal se rige por la ley española. Las partes acuerdan someterse a la jurisdicción de los Juzgados y Tribunales que les correspondan en función de la legislación procesal aplicable.</p>
      </LegalSection>
    </LegalDocument>
  )
}
