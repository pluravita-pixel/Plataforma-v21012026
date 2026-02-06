import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPolicyPage() {
    return (
        <div className="container mx-auto px-6 md:px-12 lg:px-20 py-12 max-w-4xl">
            <Link href="/" className="inline-flex items-center gap-2 text-[#A68363] font-bold mb-8 hover:underline">
                <ArrowLeft className="h-4 w-4" />
                Volver al inicio
            </Link>

            <h1 className="text-4xl font-black text-[#4A3C31] mb-8">Política de Privacidad</h1>

            <div className="prose prose-lg prose-stone max-w-none text-gray-600 leading-relaxed font-medium">
                <h2 className="text-2xl font-bold text-[#4A3C31] mt-10 mb-4">Identificación del responsable del tratamiento</h2>
                <p>
                    Asociación Estudiantil Junior Empresa NEXIO (en adelante "NEXIO") con NIF G75579508 y domicilio en Paseo Uribitarte 6, 48001 Bilbao (Bizkaia).
                    <br />
                    Contacto: <a href="mailto:contact@team-nexio.com" className="text-[#A68363] hover:underline">contact@team-nexio.com</a>
                </p>

                <h2 className="text-2xl font-bold text-[#4A3C31] mt-10 mb-4">¿Quién es el responsable del tratamiento de sus datos?</h2>
                <p>
                    Esta política de privacidad se aplica a todos los datos personales que el interesado aporta a NEXIO, así como a toda persona física interesada en las actividades y servicios que NEXIO ofrece a través de sus páginas web y a través de cualquier otro medio de comunicación. El objetivo de la Política de Privacidad de NEXIO es dar transparencia a la información sobre cómo tratamos sus datos personales en cumplimiento de la normativa vigente de protección de datos.
                </p>
                <p>
                    El interesado podrá ponerse en contacto con NEXIO a través de la información detallada en la identificación del responsable del tratamiento.
                </p>

                <h2 className="text-2xl font-bold text-[#4A3C31] mt-10 mb-4">¿Con qué finalidad tratamos sus datos personales y con qué legitimación?</h2>
                <p>
                    NEXIO dispone de un Registro de Actividades de Tratamiento donde se detallan cada uno de los siguientes tratamientos realizados como responsable del tratamiento:
                </p>

                <div className="overflow-x-auto my-6">
                    <table className="min-w-full text-sm text-left border border-gray-200 rounded-lg">
                        <thead className="bg-[#A68363]/10 text-[#4A3C31]">
                            <tr>
                                <th className="p-4 border">TRATAMIENTO RGPD</th>
                                <th className="p-4 border">FINALIDAD RGPD</th>
                                <th className="p-4 border">BASE LEGÍTIMA</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className="p-4 border font-bold">MIEMBROS</td>
                                <td className="p-4 border">Gestión de datos personales de los miembros</td>
                                <td className="p-4 border">Art. 6.1 b) el tratamiento es necesario para la ejecución de un contrato en el que el interesado es parte o para la aplicación a petición de este de medidas precontractuales.</td>
                            </tr>
                            <tr>
                                <td className="p-4 border font-bold">PERSONAS DE CONTACTO</td>
                                <td className="p-4 border">Gestión de la base de datos de contactos (personas vinculadas a clientes, proveedores, instituciones, administraciones públicas y empresas en general).</td>
                                <td className="p-4 border">Art. 6.1 f) el tratamiento es necesario para la satisfacción de intereses legítimos perseguidos por el responsable del tratamiento o por un tercero.</td>
                            </tr>
                            <tr>
                                <td className="p-4 border font-bold">GESTIÓN DE EVENTOS</td>
                                <td className="p-4 border">Registro y gestión de datos personales de los participantes del evento</td>
                                <td className="p-4 border">Art. 6.1 a) el interesado dio su consentimiento para el tratamiento de sus datos personales para uno o varios fines específicos; Art. 6.1 f) el tratamiento es necesario para la satisfacción de intereses legítimos perseguidos por el responsable del tratamiento o por un tercero en relación con la publicidad y promoción comercial.</td>
                            </tr>
                            <tr>
                                <td className="p-4 border font-bold">CONTABILIDAD</td>
                                <td className="p-4 border">Gestión administrativa y contable de clientes</td>
                                <td className="p-4 border">Art. 6.1 b) el tratamiento es necesario para la ejecución de un contrato en el que el interesado es parte o para la aplicación a petición de este de medidas precontractuales.</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <p>
                    En caso, debidamente justificado, de requerir más detalle respecto al Registro de Actividades de Tratamiento, puede contactar con NEXIO a través de cualquiera de los canales identificados.
                </p>

                <h2 className="text-2xl font-bold text-[#4A3C31] mt-10 mb-4">¿Por cuánto tiempo conservamos sus datos personales?</h2>
                <p>
                    NEXIO conservará los datos de los interesados durante su relación con la organización y, posteriormente, los datos se conservarán conforme a lo dispuesto en las normativas de archivo y documentación que cada legislación aplicable establezca. En caso de que solicite un derecho, se procederá a la supresión de sus datos conforme al derecho que haya solicitado.
                </p>

                <h2 className="text-2xl font-bold text-[#4A3C31] mt-10 mb-4">¿Quién tiene acceso a sus datos personales?</h2>
                <p>
                    NEXIO podrá realizar cesiones o comunicaciones de datos personales para atender sus obligaciones con las Administraciones Públicas en los casos que así se requiera de acuerdo con la legislación vigente en cada momento y a otras entidades necesarias para la prestación de los servicios solicitados y con las cuales NEXIO mantiene acuerdos de tratamiento de datos en conformidad con el RGPD.
                </p>

                <h2 className="text-2xl font-bold text-[#4A3C31] mt-10 mb-4">¿Cuáles son los derechos de los afectados?</h2>
                <p>Le informamos de que podrá ejercer los siguientes derechos:</p>
                <ul className="list-disc pl-6 space-y-2">
                    <li>Derecho de acceso a sus datos personales para saber cuáles están siendo objeto de tratamiento.</li>
                    <li>Derecho de rectificación de cualquier dato personal inexacto.</li>
                    <li>Derecho de supresión de sus datos personales, cuando esto sea posible.</li>
                    <li>Derecho a solicitar la limitación del tratamiento de sus datos personales cuando la exactitud, la legalidad o la necesidad del tratamiento de los datos resulte dudosa, en cuyo caso, podremos conservar los datos para el ejercicio o la defensa de reclamaciones.</li>
                    <li>Derecho de oposición al tratamiento de sus datos personales, cuando la base legal que nos habilite para su tratamiento sea el interés legítimo. NEXIO dejará de tratar sus datos salvo que tenga un interés legítimo imperioso o para la formulación, el ejercicio o la defensa de reclamaciones.</li>
                    <li>Derecho a la portabilidad de sus datos, cuando la base legal que nos habilite para su tratamiento sea el consentimiento.</li>
                </ul>
                <p className="mt-4">
                    Dichos derechos podrán ser ejercitados gratuitamente por el interesado, y en su caso quien lo represente, mediante solicitud escrita dirigida a <a href="mailto:nexiocoop@gmail.com" className="text-[#A68363] hover:underline">nexiocoop@gmail.com</a>.
                </p>
                <p>
                    Además de los derechos anteriores, el interesado tendrá derecho a retirar el consentimiento otorgado en cualquier momento sin que dicha retirada de consentimiento afecte a la licitud del tratamiento anterior a la retirada del mismo. NEXIO podrá continuar tratando los datos del interesado en la medida en que la ley aplicable lo permita.
                </p>
                <p>
                    NEXIO recuerda al interesado que tiene derecho a presentar una reclamación ante la Autoridad de Control competente del país en el que se encuentre.
                </p>

                <h2 className="text-2xl font-bold text-[#4A3C31] mt-10 mb-4">Baja en el envío de comunicaciones comerciales</h2>
                <p>
                    El interesado tiene derecho a revocar en cualquier momento el consentimiento prestado para el envío de comunicaciones comerciales con la simple notificación a NEXIO por la que informa que no desea seguir recibiendo comunicaciones comerciales. Para ello, el interesado podrá pinchar en el enlace incluido en cada comunicación cancelando el envío de comunicaciones comerciales electrónicas o revocando su consentimiento mediante comunicado a <a href="mailto:contact@team-nexio.com" className="text-[#A68363] hover:underline">contact@team-nexio.com</a>.
                </p>

                <h2 className="text-2xl font-bold text-[#4A3C31] mt-10 mb-4">¿Qué medidas de seguridad tenemos implementadas?</h2>
                <p>
                    NEXIO se compromete al cumplimiento de su obligación de secreto de los datos de carácter personal y de su deber de guardarlos, y adoptará las medidas necesarias para evitar su alteración, pérdida, tratamiento o acceso no autorizado, de acuerdo con lo establecido por normativa aplicable.
                </p>
                <p>
                    NEXIO tiene implantadas las medidas de seguridad de índole técnica y organizativa necesarias para garantizar la seguridad de sus datos de carácter personal y evitar su alteración, pérdida y tratamiento y/o acceso no autorizado, habida cuenta del estado de la tecnología, la naturaleza de los datos almacenados y los riesgos a que están expuestos, ya provengan de la acción humana o del medio físico o natural, de acuerdo a lo establecido por la normativa aplicable.
                </p>

                <h2 className="text-2xl font-bold text-[#4A3C31] mt-10 mb-4">Enlaces</h2>
                <p>
                    La página web de NEXIO puede incluir hipervínculos a otros sitios que no son operados o controlados por NEXIO. Por ello, NEXIO no garantiza, ni se hace responsable de la licitud, fiabilidad, utilidad, veracidad y actualidad de los contenidos de tales sitios web o de sus prácticas de privacidad. Por favor antes de proporcionar su información personal a estos sitios web ajenos a NEXIO tenga en cuenta que su cumplimiento en materia de protección de datos puede diferir del nuestro.
                </p>

                <h2 className="text-2xl font-bold text-[#4A3C31] mt-10 mb-4">Modificación de la Política de Privacidad</h2>
                <p>
                    NEXIO podrá modificar su Política de Privacidad de acuerdo con la legislación aplicable en cada momento. En todo caso, cualquier modificación de la Política de Privacidad será debidamente notificada al Afectado para que, quede informado de los cambios realizados en el tratamiento de sus datos personales y, en caso de que la normativa aplicable así lo exija, el Afectado pueda otorgar su consentimiento.
                </p>
                <p className="mt-4 text-sm text-gray-500">
                    Última actualización de la Política de Privacidad de NEXIO el 27 de Marzo de 2025.
                </p>
            </div>
        </div>
    );
}
