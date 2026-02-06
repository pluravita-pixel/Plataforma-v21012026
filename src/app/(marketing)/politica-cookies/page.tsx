import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function CookiesPolicyPage() {
    return (
        <div className="container mx-auto px-6 md:px-12 lg:px-20 py-12 max-w-4xl">
            <Link href="/" className="inline-flex items-center gap-2 text-[#A68363] font-bold mb-8 hover:underline">
                <ArrowLeft className="h-4 w-4" />
                Volver al inicio
            </Link>

            <h1 className="text-4xl font-black text-[#4A3C31] mb-8">Política de Cookies</h1>

            <div className="prose prose-lg prose-stone max-w-none text-gray-600 leading-relaxed font-medium">
                <p>
                    La ASOCIACIÓN ESTUDIANTIL JUNIOR EMPRESA NEXIO (en adelante, Nexio) desea informarle sobre el uso de cookies en sus sitios web. Las cookies son archivos que pueden descargarse en su equipo a través de las páginas web. Son herramientas esenciales para la prestación de numerosos servicios de la sociedad de la información. Entre otros, permiten a un sitio web almacenar y recuperar información sobre los hábitos de navegación de un usuario o de su equipo y, dependiendo de la información obtenida, se pueden utilizar para reconocer al usuario y mejorar el servicio ofrecido.
                </p>

                <h2 className="text-2xl font-bold text-[#4A3C31] mt-10 mb-4">Tipos de Cookies</h2>
                <p>
                    Según quien sea la entidad que gestione el dominio desde donde se envían las cookies y trate los datos que se obtengan se pueden distinguir dos tipos: cookies propias y cookies de terceros.
                    <br />
                    Además, referidas al plazo de tiempo que permanecen almacenadas en el navegador del cliente, pueden tratarse de cookies de sesión o cookies persistentes.
                    <br />
                    Por último, existe otra clasificación con cinco tipos de cookies según la finalidad para la que se traten los datos obtenidos:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                    <li>Cookies técnicas</li>
                    <li>Cookies de personalización</li>
                    <li>Cookies de análisis, analíticas o de medición</li>
                    <li>Cookies publicitarias</li>
                    <li>Cookies de publicidad comportamental</li>
                </ul>

                <h2 className="text-2xl font-bold text-[#4A3C31] mt-10 mb-4">Cookies Exentas de Consentimiento</h2>
                <p>
                    Quedan exceptuadas del cumplimiento de las obligaciones establecidas en el artículo 22.2 de la Ley 34/2002, de 11 de julio, de servicios de la sociedad de la información y de comercio electrónico (LSSI), las cookies utilizadas para alguna de las siguientes finalidades:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                    <li>Permitir únicamente la comunicación entre el equipo del usuario y la red.</li>
                    <li>Estrictamente prestar un servicio expresamente solicitado por el usuario.</li>
                </ul>
                <p>
                    El Grupo de Trabajo del Artículo 29 en su Dictamen 4/2012 interpreta que entre las cookies exceptuadas estarían aquellas que tienen por finalidad:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                    <li>Cookies de entrada del usuario</li>
                    <li>Cookies de autenticación o identificación de usuario (únicamente de sesión)</li>
                    <li>Cookies de seguridad del usuario</li>
                    <li>Cookies de sesión de reproductor multimedia</li>
                    <li>Cookies de sesión para equilibrar la carga</li>
                    <li>Cookies de personalización de la interfaz de usuario</li>
                    <li>Cookies de complemento (plug-in) para intercambiar contenidos sociales</li>
                </ul>
                <p>
                    Por tanto, puede entenderse que estas cookies quedan excluidas del ámbito de aplicación del artículo 22.2 de la LSSI, y por lo tanto, no sería necesario informar ni obtener el consentimiento sobre su uso.
                </p>

                <h2 className="text-2xl font-bold text-[#4A3C31] mt-10 mb-4">Cookies utilizadas en la web</h2>
                <p>
                    A continuación se identifican las cookies específicas que está utilizando este portal:
                </p>

                <h3 className="text-xl font-bold text-[#4A3C31] mt-6 mb-2">Cookies Técnicas y de Funcionalidad</h3>
                <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Cookies de Autenticación Supabase (sb-*-auth-token):</strong> Estas cookies son esenciales para gestionar su sesión en la plataforma Pluravita. Nos permiten reconocerle cuando inicia sesión, mantener su sesión activa de forma segura y proteger sus datos de usuario.</li>
                    <li><strong>Stripe (Cookies de pago y seguridad):</strong> Utilizamos Stripe como pasarela de pago segura. Stripe utiliza cookies (como <em>__stripe_mid</em>, <em>__stripe_sid</em> y <em>m</em>) para garantizar la seguridad de las transacciones, prevenir el fraude y procesar los pagos correctamente. Estas cookies son necesarias para poder contratar los servicios de los oyentes.</li>
                </ul>

                <h3 className="text-xl font-bold text-[#4A3C31] mt-6 mb-2">Cookies de Análisis y Rendimiento</h3>
                <p>
                    La analítica web nos proporciona información sobre el número de usuarios que acceden a la web, el número de páginas vistas, la frecuencia y repetición de las visitas, su duración, el navegador utilizado, el operador que presta el servicio, el idioma, el terminal que utiliza, o la ciudad a la que está asignada su dirección IP. Esta información posibilita un mejor y más apropiado servicio por parte de este portal.
                </p>

                <h2 className="text-2xl font-bold text-[#4A3C31] mt-10 mb-4">Aceptación de la Política de Cookies</h2>
                <p>
                    Nexio asume que usted acepta el uso de cookies. No obstante, muestra información sobre su Política de cookies en la parte inferior de cualquier página del portal con cada inicio de sesión con el objeto de que usted sea consciente.
                </p>

                <h2 className="text-2xl font-bold text-[#4A3C31] mt-10 mb-4">Cómo modificar la configuración de las cookies</h2>
                <p>
                    Usted puede restringir, bloquear o borrar las cookies de Nexio o cualquier otra página web, utilizando su navegador. En cada navegador la operativa es diferente, la función de 'Ayuda' le mostrará cómo hacerlo.
                </p>
                <ul className="list-disc pl-6 space-y-2">
                    <li>Internet Explorer: <a href="https://support.microsoft.com/es-es/help/17442/windows-internet-explorer-delete-manage-cookies#ie=ie-10" target="_blank" className="text-[#A68363] hover:underline">Soporte Microsoft</a></li>
                    <li>Firefox: <a href="https://support.mozilla.org/es/kb/Borrar%20cookies" target="_blank" className="text-[#A68363] hover:underline">Soporte Mozilla</a></li>
                    <li>Chrome: <a href="https://support.google.com/chrome/answer/95647?hl=es" target="_blank" className="text-[#A68363] hover:underline">Soporte Google</a></li>
                    <li>Safari: <a href="https://www.apple.com/es/privacy/use-of-cookies/" target="_blank" className="text-[#A68363] hover:underline">Soporte Apple</a></li>
                </ul>
                <p className="mt-4">
                    Además, también puede gestionar el almacén de cookies en su navegador a través de herramientas como:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                    <li><a href="https://www.ghostery.com/" target="_blank" className="text-[#A68363] hover:underline">Ghostery</a></li>
                    <li><a href="https://www.youronlinechoices.com/es/" target="_blank" className="text-[#A68363] hover:underline">Your Online Choices</a></li>
                </ul>
            </div>
        </div>
    );
}
