import { addKeyword,EVENTS, } from "@builderbot/bot";
import { MongoDBConnection } from '../database/MongoDBConnection';
import {FlowIntentosAgotados } from "./exhausted_attempts.flow";
import  init  from './../utils/queueManager';
import {send_mail}  from "../utils/varios";
import 'dotenv/config'

const mongoConnection = new MongoDBConnection(process.env.MONGO_DB_URI, process.env.MONGO_DB_NAME);

const AutenticationSuceesletterFlow = addKeyword(EVENTS.ACTION)
.addAnswer('🔓 Autenticacion exitosa.', 
  {delay:1000}, async (_, {gotoFlow, state}) => {
    const myState = state.getMyState()

    const checkConsecutive = await mongoConnection.checkConsecutiveDateExpired(myState.NumeroCedula)

    if (checkConsecutive && myState.option == 1 ){
      return gotoFlow(flowgeneracion_documento_Activo)

    }else{
      return gotoFlow(FlowIntentosAgotados)

    }
})

const flowgeneracion_documento_Activo = addKeyword(EVENTS.ACTION)
.addAnswer('📄 Procederemos a generar tu documento por favor espera un momento',
  {delay:1000}, async (ctx, {gotoFlow,flowDynamic, state}) => {
    const myState = state.getMyState()
    const userId = myState.NumeroCedula;
    
    if(myState.status == 'Activo'){
      try {
        const path = await init(userId);

        if (path){
          await flowDynamic([{ body: "entrega", media: path, delay: 2000 }]);
        } else {
          console.log('No se generó el archivo PDF.');
        }
      } catch (error) {
        console.error('Error al procesar la solicitud:', error);
      }
    }
    else if(myState.status == 'Inactivo'){
      try {
        const path = await init(userId);

        if (path){
          //await flowDynamic([{ body: "entrega", media: path, delay: 2000 }]);
          await state.update({ Path: path})
          return gotoFlow(flowvalidacion_correo)
        } else {
          console.log('No se generó el archivo PDF.');
        }
      } catch (error) {
        console.error('Error al procesar la solicitud:', error);
      }
    }
  }
);

const flowvalidacion_correo = addKeyword('Validacion_correo_personal_inactivo')
.addAnswer('por favor escribe la direccion de correo electronico al que quieres que te llegue el correo.'
  ,{capture:true},async(ctx, { fallBack,gotoFlow,state }) => {
    if (!ctx.body.includes('@')) {
      return fallBack()
    } else {
        await state.update({ Correo: ctx.body})
        return gotoFlow(flowenvio_correo)
    }
})

const flowenvio_correo = addKeyword('Envio_correo_GH')
.addAnswer('Muy bien, ahora procederemos a enviar la información a gestión humana, la recepcion del correo puede tomar unas horas por favor sea paciente',
  null,async(_, {state}) => {
    
    const myState = state.getMyState()
    await send_mail(myState.Correo,myState.NumeroCedula,myState.Path)
    
})

export {AutenticationSuceesletterFlow,flowgeneracion_documento_Activo,flowvalidacion_correo,flowenvio_correo}