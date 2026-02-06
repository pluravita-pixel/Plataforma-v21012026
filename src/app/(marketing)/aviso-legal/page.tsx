import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function LegalNoticePage() {
    return (
        <div className="container mx-auto px-6 md:px-12 lg:px-20 py-12 max-w-4xl">
            <Link href="/" className="inline-flex items-center gap-2 text-[#A68363] font-bold mb-8 hover:underline">
                <ArrowLeft className="h-4 w-4" />
                Volver al inicio
            </Link>

            <h1 className="text-4xl font-black text-[#4A3C31] mb-8">Aviso Legal</h1>

            <div className="prose prose-lg prose-stone max-w-none text-gray-600 leading-relaxed font-medium">
                <p>
                    Bienvenido al sitio web de <strong>ASOCIACIÓN ESTUDIANTIL JUNIOR NEXIO</strong> (en adelante <strong>NEXIO</strong>) con NIF G75579508 y domicilio en PS/ URIBITARTE, 6 48001 BILBAO (BIZKAIA). Contacto por correo en <a href="mailto:contact@team-nexio.com" className="text-[#A68363] hover:underline">contact@team-nexio.com</a> e inscrita en el Registro de Asociaciones de Bizkaia con el número AS/B/26060/2025.
                </p>

                <h2 className="text-2xl font-bold text-[#4A3C31] mt-10 mb-4">Propiedad Intelectual</h2>
                <p>
                    Los contenidos de este sitio web, textos, imágenes, sonidos, animaciones, etc., así como su diseño gráfico y su código fuente, están protegidos por la legislación española sobre derechos de propiedad intelectual e industrial a favor de las empresas que componen NEXIO. Queda por tanto prohibida su reproducción, distribución o comunicación pública, total o parcial, sin la autorización expresa de NEXIO.
                </p>

                <h2 className="text-2xl font-bold text-[#4A3C31] mt-10 mb-4">Contenido web y enlaces</h2>
                <p>
                    En NEXIO no nos responsabilizamos del mal uso que se realice de los contenidos de nuestra página web, siendo exclusiva responsabilidad de la persona que accede a ellos o los utiliza. Tampoco asumimos ninguna responsabilidad por la información contenida en las páginas web de terceros a las que se pueda acceder por enlaces o buscadores desde este sitio web.
                </p>

                <h2 className="text-2xl font-bold text-[#4A3C31] mt-10 mb-4">Actualización y modificación de la página web</h2>
                <p>
                    NEXIO se reserva el derecho a modificar o eliminar, sin previo aviso, tanto la información contenida en su sitio web como su configuración y presentación, sin asumir responsabilidad alguna por ello.
                </p>

                <h2 className="text-2xl font-bold text-[#4A3C31] mt-10 mb-4">Indicaciones sobre aspectos técnicos</h2>
                <p>
                    NEXIO no asume ninguna responsabilidad que se pueda derivar de problemas técnicos o fallos en los equipos informáticos que se produzcan durante la conexión a la red de Internet, así como de daños que pudieran ser causados por terceros mediante intromisiones ilegítimas fuera del control de NEXIO. También quedamos exonerados de toda responsabilidad ante posibles daños o perjuicios que pueda sufrir el usuario a consecuencia de errores, defectos u omisiones en la información que facilitemos cuando proceda de fuentes ajenas a nosotros.
                </p>
            </div>
        </div>
    );
}
