import { ToWords } from 'to-words';
import fs from 'fs';
import * as XLSX from 'xlsx';
import nodemailer from 'nodemailer';
import 'dotenv/config'

const toWords = new ToWords({
    localeCode: 'es-ES',
});

interface Stubs {
    ENERGiA: string;
    'Fecha de pago':string;
    //*Periodo: string;
    NOMINA: string;
    NIT: string;
    //*'FECHA INGRESO':string;
    'SUELDO BASE':string;
    IDENTIFICACION:string;
    'NOMBRE COMPLETO': string;
    CARGO: string;
    PAGOS: string;
    DESCUENTOS: string;
    Inf: string;
    DESCRIPCION: string;
    VALOR: string;
    Pago: any;
    Des: any;
    TP: string;
    TD: string;
    Neto: string;
}

interface Tupla {
    'FECHA INGRESO': any;
    'FECHA RETIRO': any;
    'SUELDO': number;
    'SUELDO LETRAS': string;
    'PROYECTO': string;
    'TIPO CONTRATO': string;
    'CARGO': string;
    'CONTRATO': string;
    'NOMINA': string;
    'MOTIVO'?: string;
    'FECHA ACTUAL': string;
    'ANTE MOTIVO': string;
    'año': number;
    [key: string]: any;
}

interface FilaExcel {
    IDENTIFICACION: number;
    [key: string]: any; // Otros campos pueden estar presentes
}

interface letter {
    PROYECTO: string;
    PARRAFO:string;
    CERTIFICA:string;
    CORDIAL:string;
    NOMBRE:string;
    CONSECUTIVO2:string;
    GH:string;
    ENERGIA:string;
    VALIDACION:string;
    DIRECCION:string;
}

function numeroSerieAfecha(numeroSerie: number): string {
    // Definir la fecha de origen de Excel (1 de enero de 1900)
    const fechaOrigen: Date = new Date('1899-12-30');
    
    // Calcular la cantidad de días desde la fecha de origen
    const dias: number = numeroSerie;
    
    // Calcular la cantidad de milisegundos desde la fecha de origen
    const milisegundos: number = dias * 24 * 60 * 60 * 1000;
    
    // Crear y devolver el objeto de fecha sumando los milisegundos a la fecha de origen
    const fecha: Date = new Date(fechaOrigen.getTime() + milisegundos);
    fecha.setUTCHours(0, 0, 0, 0); // Establecer la hora en 00:00:00

    // Obtener día, mes y año
    const dia: number = fecha.getUTCDate();
    const mes: number = fecha.getUTCMonth() + 1; // Los meses van de 0 a 11, por eso se suma 1
    const anio: number = fecha.getUTCFullYear();

    // Formatear la fecha como día/mes/año
    const fechaFormateada: string = `${dia}/${mes}/${anio}`;

    // Devolver la fecha formateada
    return fechaFormateada;
}

async function autocompleteInfoStubs(data: any) {
    
    const datos = await data;
    
    const Stubs: Stubs = {
        ENERGiA:'ENERGÍA INTEGRAL',
        'Fecha de pago': numeroSerieAfecha(datos['FECHA DE PAGO']),
        NOMINA:datos.NOMINA,
        NIT:'860533206 -8',
        'SUELDO BASE':datos.SALARIO,
        IDENTIFICACION:datos.IDENTIFICACION,
        'NOMBRE COMPLETO':datos['NOMBRE COMPLETO'],
        CARGO:datos.CARGO,
        PAGOS:'PAGOS',
        DESCUENTOS:'DESCUENTOS',
        Inf:'Inf',
        DESCRIPCION:'DESCRIPCION',
        VALOR:'VALOR',
        Pago:datos.Pago,
        Des:datos.Des,
        TP: datos.TP,
        TD: datos.TD,
        Neto: datos.Neto
    }
    return Stubs

}

function formatearFecha(fecha: string): string {
    // Dividir la cadena de fecha en día, mes y año
    const partes = fecha.split('/');
    const dia = parseInt(partes[0], 10);
    const mes = parseInt(partes[1], 10) - 1; // Restamos 1 al mes ya que en JavaScript los meses van de 0 a 11
    const anio = parseInt(partes[2], 10);
  
    // Crear un nuevo objeto de fecha
    const fechaObj = new Date(anio, mes, dia);

    if (isNaN(fechaObj.getTime())) {
        return "Fecha no válida";
    }
  
    // Definir opciones de formato
    const opciones: Intl.DateTimeFormatOptions = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
  
    // Formatear la fecha
    const fechaFormatoLargo = fechaObj.toLocaleDateString('es-ES', opciones);
  
    return fechaFormatoLargo;
}

function TuplaExcel(tupla: FilaExcel): Tupla {
    tupla['FECHA INGRESO'] = numeroSerieAfecha(tupla['FECHA INGRESO']);
    tupla['FECHA RETIRO'] = numeroSerieAfecha(tupla['FECHA RETIRO']);

    const SUELDO_LETRAS = toWords.convert(tupla['SUELDO']);
    console.log(SUELDO_LETRAS)
    tupla['SUELDO LETRAS'] = SUELDO_LETRAS;
    tupla['NOMBRE COMPLETO'] = tupla['NOMBRE COMPLETO'].trim();

    if (tupla['PROYECTO'] === 'UNE') {
        tupla['TIPO CONTRATO'] = 'en la ejecución del contrato No. 342';
    } else if (tupla['PROYECTO'] === 'EDATEL') {
        tupla['TIPO CONTRATO'] = '';
    }else if (tupla['PROYECTO'] === 'ETB') {
            tupla['TIPO CONTRATO'] = '';
    } else {
        tupla['TIPO CONTRATO'] = '';
    }

    tupla['CARGO'] = tupla['CARGO'].trim();
    tupla['CONTRATO'] = tupla['CONTRATO'].trim();
    tupla['NOMINA'] = tupla['NOMINA'].trim();
    if (tupla['MOTIVO']) {
        tupla['MOTIVO'] = tupla['MOTIVO'].trim();
    }

    const opciones: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const fechaActual = new Date();
    const fechaFormatoLargo = fechaActual.toLocaleDateString('es-ES', opciones);
    tupla['FECHA ACTUAL'] = fechaFormatoLargo;
    tupla['FECHA INGRESO'] = formatearFecha(tupla['FECHA INGRESO']);
    tupla['FECHA RETIRO'] = formatearFecha(tupla['FECHA RETIRO']);

    if (tupla['MOTIVO'] === 'TERMINACION CONTRATO JUSTA CAUSA' || 
        tupla['MOTIVO'] ==='TERMINACION DE  CONTRATO JUSTA CAUSA'||
        tupla['MOTIVO'] === 'TERMINACION CONTRATO SIN JUSTA CAUSA' || 
        tupla['MOTIVO'] === 'FALLECIMIENTO' || 
        tupla['MOTIVO'] === 'RETIRO POR ORDEN JUDICIAL' || 
        tupla['MOTIVO'] === 'REVOCATORIA FALLO TUTELA') {
        tupla['MOTIVO'] = '';
        tupla['ANTE MOTIVO'] = '';
    } else {
        tupla['ANTE MOTIVO'] = ', Motivo del retiro: ';
    }

    const añoActual = fechaActual.getFullYear();
    tupla['año'] = añoActual;

    return tupla as unknown as Tupla;
}

async function autocompleteInfoLetterActive(data: Tupla) {
    const letter: letter = {
        PROYECTO:`${data.PROYECTO} - RH -CL - ${data.Consecutivo1} - ${data['año']}`,
        PARRAFO:`Que el señor (a) ${data['NOMBRE COMPLETO']} identificado (a) con la cédula de ciudadanía No. ${data.IDENTIFICACION}, presta sus servicios en esta Empresa como ${data.CARGO} ;con un contrato individual de trabajo a término ${data.CONTRATO}, desde el día ${data['FECHA INGRESO']}, su remuneración mensual es de ${data['SUELDO LETRAS']} ($${data.SUELDO})`,
        CERTIFICA:`La presente certificación se expide por solicitud del interesado en ${data.NOMINA}, el día ${data['FECHA ACTUAL']}`,
        CORDIAL:`Cordialmente,`,
        NOMBRE:process.env.NAME_COOR_GEST_HUM,
        CONSECUTIVO2:`Consecutivo ${data.Consecutivo2}`,
        GH:`Coordinadora Talento Humano`,
        ENERGIA:`ENERGIA`,
        VALIDACION:`La validación de esta certificación es únicamente en el teléfono 604 o en el número de celular 3245 de lunes a viernes de 2:00 pm a 4:00 pm.`,
        DIRECCION:`Calle 50 Nº 11 - 04  PBX: 4034324 - MEDELLIN - COLOMBIA`
    }
    return letter
}

async function autocompleteInfoLetterInActive(data: Tupla) {
    const letter: letter = {
        PROYECTO:`${data.PROYECTO} - RH -CL - ${data.Consecutivo1} - ${data['año']}`,
        PARRAFO:`Que el (la) señor (a) ${data['NOMBRE COMPLETO']} identificado (a) con la cédula de Ciudadanía No. ${data.IDENTIFICACION}, laboró para esta Empresa desempeñando el cargo de ${data.CARGO} ;desde el  ${data['FECHA INGRESO']}, hasta el ${data['FECHA RETIRO']}, con una remuneración mensual de ($${data.SUELDO}) ${data['SUELDO LETRAS']}${data['ANTE MOTIVO']}${data['MOTIVO']} `,
        CERTIFICA:`La presente certificación se expide a solicitud del interesado en ${data.NOMINA}, el día ${data['FECHA ACTUAL']}`,
        CORDIAL:`Cordialmente,`,
        NOMBRE:process.env.NAME_COOR_GEST_HUM,
        CONSECUTIVO2:`Consecutivo ${data.Consecutivo2}`,
        GH:`Coordinadora Talento Humano`,
        ENERGIA:`ENERGIA INTEGRAL ANDINA S.A`,
        VALIDACION:`La validación de esta certificación es únicamente en el teléfono 604 o en el número de celular 3245 de lunes a viernes de 2:00 pm a 4:00 pm.`,
        DIRECCION:`Calle 50 Nº 11 - 04  PBX: 4034324 - MEDELLIN - COLOMBIA`
    }
    return letter

}

async function send_mail(correo:string,cc:string,Path:string){ //revisar el adjunto
    // Configuración del transporte SMTP con la contraseña de aplicación
    try {
        const fileBuffer = fs.readFileSync(process.env.EXC_DB_COMPLETA);
    
        const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
        const numeroInt = parseInt(cc, 10);
        
        const primeraHoja = workbook.SheetNames[0];
        const datos: FilaExcel[] = XLSX.utils.sheet_to_json(workbook.Sheets[primeraHoja]);
    
        const filasConNumero = datos.filter(fila => (fila as { IDENTIFICACION: number }).IDENTIFICACION === numeroInt);
    
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.USER_EMAIL, // Coloca aquí tu dirección de correo electrónico
                pass: process.env.PASS_EMAIL // Coloca aquí tu contraseña de aplicación
            }
        });
        const primerElemento = filasConNumero[0];
        //console.log(primerElemento)
        const mensaje = `la persona con nombre ${primerElemento['NOMBRE COMPLETO'].trim()} y cedula: ${primerElemento.IDENTIFICACION}, requiere una carta laborar en el siguiente correo: ${correo}`;
    
        // Opciones del correo electrónico
        const mailOptions = {
            from: process.env.USER_EMAIL, // Remitente
            to: process.env.USER_EMAIL_GH, // Destinatario
            subject: 'Solicitud de envio de carta laborar', // Asunto
            text: mensaje, // Cuerpo del correo
            attachments: [
                {
                    filename: 'archivo_adjunto.pdf', // Nombre del archivo adjunto
                    path: Path // Ruta al archivo adjunto
                }
            ]
        };
    
        // Envío del correo electrónico
        transporter.sendMail(mailOptions, function(error: any, info: { response: string; }){
            if (error) {
                console.log(error);
            } else {
                console.log('Correo electrónico enviado: ' + info.response);
            }
        });
    } catch (error) {
        console.error(error);
    }
}

export { 
    autocompleteInfoStubs,
    numeroSerieAfecha,
    formatearFecha,
    TuplaExcel,
    autocompleteInfoLetterActive,
    autocompleteInfoLetterInActive,
    send_mail
}