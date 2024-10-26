import { addKeyword,EVENTS, } from "@builderbot/bot";
import { MongoDBConnection } from '../database/MongoDBConnection';
import {searchByIdentification_payroll } from "../utils/Excel";
import {autocompleteInfoStubs } from "../utils/varios";
import {createPdfColilla } from "../utils/PDF";
import Confirmflow  from "./Confirm.flow";
import UserNotFind  from "./user_not_find.flow";
import 'dotenv/config'
import fs from 'fs';

const mongoConnection = new MongoDBConnection(process.env.MONGO_DB_URI, process.env.MONGO_DB_NAME);

const stubsflow_generation = addKeyword(EVENTS.ACTION).
addAnswer('📄 Procederemos a generar tu colilla por favor espera un momento',
    {delay:1000}, async (ctx, {gotoFlow,flowDynamic, state}) => {

        const myState = state.getMyState()
        const ND = searchByIdentification_payroll(myState.NumeroCedula)
        const Dicc_info_colilla = await autocompleteInfoStubs(ND)
        const status_PDF = await createPdfColilla(Dicc_info_colilla,myState.NumeroCedula)

        if (status_PDF) {
            try {
                const path = `../Colillas/${myState.NumeroCedula}.pdf`;
                const datos = await ND;
                await flowDynamic([{ body: "archivo",media: path }]);
                await mongoConnection.addHistoyStubs(myState.NumeroCedula,datos['NOMBRE COMPLETO']);

                return gotoFlow(Confirmflow)

            } catch (error) {
                console.error('Error al enviar archivo a usuario', error);

                const separador = '--------------------'
                fs.appendFile('error_log.txt', separador, (err) => {
                    if (err) throw err;
                    console.log('Error guardado en error_log.txt');
                });
            }
    
        } else {
            return gotoFlow(UserNotFind);
        }
})

const AutenticationSuceesStubsFlow = addKeyword(EVENTS.ACTION).
addAnswer('🔓 Autenticacion exitosa.', 
    {delay:1000}, async (ctx, {gotoFlow, state}) => {
        const myState = state.getMyState()

        await mongoConnection.connect();
        const lastQuincena = await mongoConnection.getLastRecordByIdentification(myState.NumeroCedula);
        await mongoConnection.disconnect();

        if (lastQuincena){
            return gotoFlow(stubsflow_generation)
        }else{
            console.log('no permitido el ingreso')
        }
})

// await mongoConnection.addHistoyStubs(myState.NumeroCedula,"Andres Genes");


export { stubsflow_generation,AutenticationSuceesStubsFlow }