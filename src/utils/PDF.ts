import PDFDocumentKit from 'pdfkit';
import fs from 'fs';
import 'dotenv/config'


async function createPdfColilla(Stubs: any, cc: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocumentKit();

        const filePath = `../Colillas/${cc}.pdf`; // Concatenas la ruta con el nombre del archivo
        const stream = fs.createWriteStream(filePath);
        doc.pipe(stream);

        doc.lineJoin('miter') // Cuadrado
            .rect(50, 27, 520, 400) // Ancho largo
            .stroke();

        doc.font('Helvetica-Bold') // Energia
            .fontSize(8)
            .text('ENERGÍA INTEGRAL ANDINA S.A', 55, 30, {
                width: 590,
            });

        doc.font('Helvetica-Bold') // fecha de pago string
            .fontSize(8)
            .text('Fecha de pago:', 270, 30, {
                width: 590,
            });

        doc.font('Helvetica-Bold') // fecha de pago
            .fontSize(8)
            .text(Stubs['Fecha de pago'], 330, 30, {
                width: 590,
            });

        doc.font('Helvetica-Bold') // periodo string
            .fontSize(8)
            .text('Periodo:', 450, 30, {
                width: 590,
            });

        doc.font('Helvetica-Bold') // periodo
            .fontSize(8)
            .text(Stubs['Fecha de pago'], 482, 30, {
                width: 590,
            });

        doc.font('Helvetica-Bold') // Nomina string
            .fontSize(8)
            .text('NOMINA:', 120, 50, {
                width: 490,
            });

        doc.font('Helvetica-Bold') // Nomina
            .fontSize(8)
            .text(Stubs['NOMINA'], 156, 50, {
                width: 490,
            });

        doc.font('Helvetica-Bold') // nit string
            .fontSize(8)
            .text('NIT:', 350, 50, {
                width: 490,
            });

        doc.font('Helvetica-Bold') // nit
            .fontSize(8)
            .text(Stubs['NIT'], 365, 50, {
                width: 490,
            });

        doc.lineJoin('miter') // Linea
            .rect(50, 60, 520, 0)
            .stroke();

        doc.lineJoin('miter') // Linea
            .rect(50, 105, 520, 0)
            .stroke();

        doc.font('Helvetica-Bold') // FECHA INGRESO string
            .fontSize(8)
            .text('FECHA INGRESO:', 55, 65, {
                width: 590,
            });
        doc.font('Helvetica-Bold') // fecha ingreso
            .fontSize(8)
            .text('NaN/NaN/NaN', 128, 65, {
                width: 505,
            });

        doc.font('Helvetica-Bold') // SUELDO BASE string
            .fontSize(8)
            .text('SUELDO BASE:', 270, 65, {
                width: 505,
            });

        doc.font('Helvetica-Bold') // SUELDO BASE
            .fontSize(8)
            .text(Stubs['SUELDO BASE'], 331, 65, {
                width: 505,
            });

        doc.font('Helvetica-Bold') // Identificacion STRING
            .fontSize(8)
            .text('IDENTIFICACION:', 120, 80, {
                width: 470,
            });

        doc.font('Helvetica-Bold') // Identificacion
            .fontSize(8)
            .text(Stubs['IDENTIFICACION'], 187, 80, {
                width: 470
            });
        
        doc.font('Helvetica-Bold') //  NOMBRE STRING
            .fontSize(8)
            .text('NOMBRE:', 350, 80, {
                width: 470
            });

        doc.font('Helvetica-Bold') //  NOMBRE 
            .fontSize(8)
            .text(Stubs['NOMBRE COMPLETO'], 390, 80, {
                width: 470
            });

        doc.font('Helvetica-Bold') // Cargo STRING
            .fontSize(8)
            .text('CARGO:', 55, 95, {
                width: 290
            });

        doc.font('Helvetica-Bold') // Cargo
            .fontSize(8)
            .text(Stubs['CARGO'], 90, 95, {
                width: 290
            });

        doc.lineJoin('miter') // Linea
            .rect(50, 135, 520, 0)
            .stroke();

        doc.font('Helvetica-Bold') // Pago
            .fontSize(8)
            .text('PAGOS', 180, 110, {
                width: 370
            });

        doc.font('Helvetica-Bold') // Descuentos
            .fontSize(8)
            .text('DESCUENTOS', 410, 110, {
                width: 960
            });

        doc.font('Helvetica-Bold') // Info
            .fontSize(8)
            .text('Info', 60, 125, {
                width: 130
            });

        doc.font('Helvetica-Bold') // Descripcion
            .fontSize(8)
            .text('DESCRIPCION', 95, 125, {
                width: 240
            });

        doc.font('Helvetica-Bold') // Valor
            .fontSize(8)
            .text('VALOR', 265, 125, {
                width: 560
            });

        doc.font('Helvetica-Bold') // Descripcion
            .fontSize(8)
            .text('DESCRIPCION', 330, 125, {
                width: 710
            });

        doc.font('Helvetica-Bold') // Valor
            .fontSize(8)
            .text('VALOR', 515, 125, {
                width: 1060
            });

        doc.lineJoin('miter') // Linea media
            .rect(320, 135, 0, 254)
            .stroke();

        let x = 150;
        //Usando un bucle forEach para recorrer la lista
        Stubs['Pago'].forEach((dicionario: any) => {
            doc.font('Helvetica-Bold') // CONCEPTO
                .fontSize(8)
                .text(dicionario['CON'], 95, x, {
                    width: 500,
                    align: 'left'
                });

            doc.font('Helvetica-Bold') // CANTIDAD
                .fontSize(8)
                .text(dicionario['CAN'], 60, x, {
                    width: 500,
                    align: 'left'
                });

            doc.font('Helvetica-Bold') // VALOR PAGO 
                .text(dicionario['ValorPago'], 267, x, {
                    width: 500,
                    align: 'left'
                });

            x += 15;
        });

        x = 150;

        Stubs['Des'].forEach((dicionario: any) => {
            doc.font('Helvetica-Bold') // Concepto
                .text(dicionario['CON'], 330, x, {
                    width: 500,
                    align: 'left'
                });

            doc.font('Helvetica-Bold') // Valor Descuento
                .text(dicionario['ValorPago'], 516, x, {
                    width: 500,
                    align: 'left'
                });

            x += 15;
        });

        doc.font('Helvetica-Bold') // TOTAL PAGOS STRING
            .fontSize(8)
            .text('TOTAL PAGOS', 53, 380, {
                width: 351
            });

        doc.font('Helvetica-Bold') // TOTAL PAGOS
            .fontSize(8)
            .text(Stubs['TP'], 280, 380, {
                width: 351
            });

        doc.font('Helvetica-Bold') // TOTAL DESCUENTOS STRING
            .fontSize(8)
            .text('TOTAL DESCUENTOS', 325, 380, {
                width: 880
            });

        doc.font('Helvetica-Bold') // TOTAL DESCUENTOS
            .fontSize(8)
            .text(Stubs['TD'], 530, 380, {
                width: 880
            });

        doc.font('Helvetica-Bold') // NETO A PAGAR STRING
            .fontSize(8)
            .text('NETO A PAGAR', 60, 400, {
                width: 390
            });

        doc.font('Helvetica-Bold') // NETO A PAGAR
            .fontSize(8)
            .text(Stubs['Neto'], 280, 400, {
                width: 390
            });

        doc.lineJoin('miter') // Linea
            .rect(50, 390, 520, 0)
            .stroke();

        doc.end();

        stream.on('finish', () => {
            resolve(true);
        });

        stream.on('error', (error) => {
            reject(false);
        });
    });
   
}

async function createPdfLetter(diccionary:any, doc:any,project:string){
    const dic = await diccionary;
    //return new Promise((resolve, reject) => {
        if (project === 'ETB'){
            doc.image(process.env.IMG_ENCABEZADO_ETB1, 460, 7 ,{ width: 150, height: 120 });
            //doc.image(process.env.IMG_ENCABEZADO_ETB1, 420, 9);
        }else{
            doc.image(process.env.IMG_ENCABEZADO, 0, 34, { width: 620, height: 120 });
        }

        doc.moveDown(5);
        doc.font('Helvetica-Bold')//PROYECTO
            .fontSize(12)
            .text(dic['PROYECTO'], {
                width: 500,
                align: 'right',
            });
        doc.moveDown(3);
        doc.font('Helvetica-Bold')//TITULO
            .fontSize(13)
            .text('ENERGIA INTEGRAL', {
                width: 470,
                align: 'center',
            });

        doc.font('Helvetica-Bold')//nit falso
            .fontSize(13)
            .text('NIT. 09876542-1', {
                width: 470,
                align: 'center',
            });

        doc.moveDown(3);
        doc.font('Helvetica-Bold')//certifica
            .fontSize(13)
            .text('CERTIFICA:', {
                width: 470,
                align: 'center',
            });

        doc.moveDown(2);
        doc.font('Helvetica')//PARRAFO
            .fontSize(11)
            .text(dic.PARRAFO, {
                width: 410,
                align: 'justify'
        });

        doc.moveDown(1);
        doc.font('Helvetica')//CERTIFICA
        .fontSize(11)
        .text(dic.CERTIFICA, {
          width: 410,
          align: 'justify'
        }
        );
     
        doc.moveDown(2);
        doc.font('Helvetica')//Cordialmente
        .fontSize(11)
        .text('Cordialmente', {
          width: 410,
          align: 'justify'
        }
        );
    
        doc.image(process.env.IMG_FIRMA_JEFE, 70, 513, {width: 100, height: 50})
        doc.text('___________________________________________', 70, 550)
    
        doc.font('Helvetica')//Nombre falso
        .fontSize(10)
        .text('Milena Orrego Sanchez', {
          width: 410,
          align: 'justify'
        }
        );
    
        doc.font('Helvetica')//CONSECUTIVO2
        .fontSize(11)
        .text(dic.CONSECUTIVO2, {
          width: 410,
          align: 'justify'
        }
        );
    
        doc.font('Helvetica')//cargo
        .fontSize(11)
        .text('Coordinadora Gestión Humano y Nómina', {
          width: 410,
          align: 'justify'
        }
        );
    
        doc.font('Helvetica')//EIA
        .fontSize(11)
        .text('ENERGIA INTEGRAL', {
          width: 410,
          align: 'justify'
        }
        );
        doc.moveDown(3);
        doc.font('Helvetica')//validación
        .fontSize(11)
        .text('La validación de esta certificación es únicamente en el teléfono 604403345234 o en el número de celular 3243425234 de lunes a viernes de 2:00 pm a 4:00 pm', {
          width: 410,
          align: 'justify'
        }
        );

        doc.moveDown(1);
        doc.font('Helvetica')//DIRECCION
        .fontSize(11)
        .text(dic.DIRECCION, {
          width: 410,
          align: 'center',
        }
        );

}

const unificarPDFs = async (archivos: string[], CC: string,project:string) => {
    try {
        let i = 0;
        const totalArchivos = archivos.length;
        const doc = new PDFDocumentKit();
        const rutaPDF = `${process.env.ARCHIVO_CARTAS}${CC}.pdf`;
        const stream = fs.createWriteStream(rutaPDF);

        doc.pipe(stream);

        for (const archivo of archivos) {
            
            await createPdfLetter(archivo,doc,project)
                // Solo añadir una nueva página si no es la última iteración
            if (i < totalArchivos - 1) {
                doc.addPage();
            }
            i++; // Incrementar el índice
        }

        doc.end();

        console.log('El archivo PDF unificado se guardó correctamente en', rutaPDF);
        return rutaPDF;
    } catch (error) {
        
        console.error('Error al unificar archivos PDF:', error);
        //return false;
        throw error;
    }
}

export { createPdfColilla,unificarPDFs}