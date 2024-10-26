import * as XLSX from 'xlsx';
import * as fs from 'fs';
import * as xlsx from 'xlsx';
import { MongoDBConnection } from '../database/MongoDBConnection';
import {TuplaExcel,autocompleteInfoLetterActive,autocompleteInfoLetterInActive}  from "../utils/varios";


const mongoConnection = new MongoDBConnection(process.env.MONGO_DB_URI, process.env.MONGO_DB_NAME);

interface Fila {
    IDENTIFICACION: number;
    NOMINA: string;
    'NOMBRE COMPLETO': string;
    'FECHA INGRESO': string | number;
    'CENTRO DE COSTO': string;
    'PERIODO PAGO ': string;
    SALARIO: number;
    CARGO: string;
    'FECHA DE PAGO': string | number;
    NATURALEZA: string;
    CONCEPTO: string;
    CANTIDAD: number;
    ValorPago: number;
    HORAS: number;
}

interface Datos {
    Pago: {
        CON: string;
        CAN: number;
        ValorPago: string;
        HORAS: number;
    }[];
    Des: {
        CON: string;
        CAN: number;
        ValorPago: string;
        HORAS: number;
    }[];
}

interface ND {
    NOMINA: string;
    IDENTIFICACION: number;
    'NOMBRE COMPLETO': string;
    'FECHA INGRESO': any;
    'CENTRO DE COSTO': string;
    TP: string;
    TD: string;
    Neto: string;
    'PERIODO PAGO': string;
    SALARIO: string;
    CARGO: string;
    'FECHA DE PAGO': any;
    Pago?: Datos['Pago'];
    Des?: Datos['Des'];
}

// Define la interfaz para los datos de Excel
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

async function searchByIdentification_DB_complete( cc: number): Promise<typeof status> {
    return new Promise((resolve, reject) => {
        try {
            // Leer el archivo como un buffer
            const fileBuffer = fs.readFileSync(process.env.EXC_DB_COMPLETA);
            
            // Parsear el archivo Excel (soporta .xls y .xlsx)
            const workbook = XLSX.read(fileBuffer, { type: 'buffer' });

            // Obtener la primera hoja de cálculo
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];

            // Convertir la hoja de cálculo en un arreglo de objetos (filas)
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

            // Identificar las columnas de interés
            const headers: string[] = jsonData[0] as string[]; // Suponiendo que la primera fila son los encabezados

            const idColumnIndex = headers.indexOf("IDENTIFICACION");
            const activeColumnIndex = headers.indexOf("ACTIVO");

            if (idColumnIndex === -1 || activeColumnIndex === -1) {
                reject("Las columnas IDENTIFICACION o ACTIVO no existen en el archivo.");
                return;
            }
            // Filtrar las filas donde el valor de IDENTIFICACION sea igual a cc
            const filteredRows = jsonData.filter((row: any) => row[idColumnIndex] == cc);

            if (filteredRows.length === 0) {
                throw new Error("No se encuentra el usuario.");
            }

            // Recorrer todas las filas filtradas para verificar si al menos una tiene "Si" en la columna ACTIVO
            let activoEncontrado = false;

            for (const row of filteredRows) {
                console.log(row[activeColumnIndex]);

                if (row[activeColumnIndex] === "Si") {
                    activoEncontrado = true;
                    break; // Si encuentras un "Si", no es necesario seguir buscando
                }
            }

            if (activoEncontrado) {
                resolve ('activo');  // Si al menos una fila tiene "Si" en ACTIVO, retorna 'activo'
            } else {
                resolve ('inactivo');  // Si ninguna fila tiene "Si", retorna 'inactivo'
            }

        } catch (error) {
            reject(`Error leyendo o procesando el archivo: ${error}`);
        }
    });
}

async function searchByIdentification_payroll(numero: string | number) {
    // Lee el archivo Excel
    const fileBuffer = fs.readFileSync(process.env.EXC_DB_NOMINA);
    const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
    
    // Obtén la primera hoja del libro de trabajo
    const primeraHoja = workbook.SheetNames[0];
    
    // Convierte el número a entero
    numero = parseInt(numero.toString(), 10);
    
    // Obtén los datos de la primera hoja como objeto
    const datos: Fila[] = xlsx.utils.sheet_to_json(workbook.Sheets[primeraHoja]);
    
    // Filtrar las filas que contengan el número en la columna "IDENTIFICACION"
    const filasConNumero = datos.filter(fila => fila.IDENTIFICACION === numero);

    //let contador = 0;
    //let encontrado = false;

    if (filasConNumero.length > 0) {
        const datos: Datos = {
            Pago: [],
            Des: []
        };

        let TP = 0;
        let TD = 0;

        for (const elemento of filasConNumero) {
            const PositivoPago = Math.abs(elemento.ValorPago);
            const valor = {
                CON: elemento.CONCEPTO.trim(),
                CAN: elemento.CANTIDAD,
                ValorPago: PositivoPago.toLocaleString(),
                HORAS: elemento.HORAS
            };

            if (elemento.NATURALEZA.trim() === 'Pago') {
                datos.Pago.push(valor);
                TP += elemento.ValorPago;
            } else if (elemento.NATURALEZA.trim() === 'Descuento') {
                datos.Des.push(valor);
                TD += PositivoPago;
            }
        }

        const Neto = TP - TD;
        const ND: ND = {
            NOMINA: filasConNumero[0].NOMINA.trim(),
            IDENTIFICACION: filasConNumero[0].IDENTIFICACION,
            'NOMBRE COMPLETO': filasConNumero[0]['NOMBRE COMPLETO'].trim(),
            'FECHA INGRESO': filasConNumero[0]['FECHA INGRESO'],
            'CENTRO DE COSTO': filasConNumero[0].NOMINA.trim(),
            TP: TP.toLocaleString(),
            TD: TD.toLocaleString(),
            Neto: Neto.toLocaleString(),
            'PERIODO PAGO': filasConNumero[0]['PERIODO PAGO '],
            SALARIO: filasConNumero[0].SALARIO.toLocaleString(),
            CARGO: filasConNumero[0].CARGO,
            'FECHA DE PAGO': filasConNumero[0]['FECHA DE PAGO']
        };

        ND.Pago = datos.Pago;
        ND.Des = datos.Des;

        return ND;
    } else {
        return null;
    }
}

async function getByIdentification_DB_complete(cc: string): Promise<boolean|any> {
    
    const fileBuffer = fs.readFileSync(process.env.EXC_DB_COMPLETA);
    
    const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
    const numeroInt = parseInt(cc, 10);
    
    const primeraHoja = workbook.SheetNames[0];
    const datos: FilaExcel[] = XLSX.utils.sheet_to_json(workbook.Sheets[primeraHoja]);

    const filasConNumero = datos.filter(fila => (fila as { IDENTIFICACION: number }).IDENTIFICACION === numeroInt);

    let contador = 0;
    let encontrado = false;
    await mongoConnection.connect()
    const lastConsecutive = await mongoConnection.getLastConsecutive()
    await mongoConnection.disconnect()

    let nombres: string[];
    let Info_letters: letter[];
    let project = ''

    if (filasConNumero.length > 0) {
        nombres= []
        Info_letters= []
        for (const fila of filasConNumero) {
            
            const Fila = TuplaExcel(fila);
            contador++;
            
            const new_conse = lastConsecutive + contador;
            const nuevoTexto = new_conse.toString();
            Fila['Consecutivo1'] = nuevoTexto;
            Fila['Consecutivo2'] = nuevoTexto;
            
            if (Fila['ACTIVO'] === 'No' ) {
                const InfoLetter = autocompleteInfoLetterInActive(Fila)

                if (InfoLetter){
                    const dic = await InfoLetter;
                    Info_letters.push(dic) 
                    encontrado = true;
                    project = Fila['PROYECTO']
                }

            } else if (Fila['ACTIVO'] === 'Si') {
                const InfoLetter = autocompleteInfoLetterActive(Fila)

                if (InfoLetter){
                    const dic = await InfoLetter;
                    Info_letters.push(dic) 
                    encontrado = true;
                    project = Fila['PROYECTO']
                }
            }
            //await mongoConnection.addHistoyConsecutive(cc,nombre_persona,new_conse)
        }

    }
    return [encontrado, Info_letters,project];
}

export { searchByIdentification_DB_complete,searchByIdentification_payroll,getByIdentification_DB_complete}