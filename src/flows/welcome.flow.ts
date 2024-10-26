import { EVENTS, addKeyword } from "@builderbot/bot";
import {IdentificationFlow}  from "./started.flow";
import 'dotenv/config'
//import massive_letters from "./massive_letters.flow";


export default addKeyword(EVENTS.WELCOME)
.addAnswer(`¡Hola! 👋 soy EIA-Asistente 🤖, tu asistente virtual de EIA. Aquí puedes solictar colillas de pago y cartas laborales.`)
.addAnswer('Por favor, escribir el número de la opcion a solicitar: \n1️⃣ Cartas Laborales \n2️⃣ Colillas de Pago',
    {capture:true, delay:1000}, async(ctx, { fallBack,gotoFlow,state }) => {

        if (ctx.body == '1' ) {
            await state.update({ option: ctx.body })
            return gotoFlow(IdentificationFlow)

        }else if(ctx.body =='2'){
            await state.update({ option: ctx.body })
            return gotoFlow(IdentificationFlow)

        }else if(ctx.body ==process.env.PASS_GH){
            
            //return gotoFlow(massive_letters)
            console.log('option 3')
        }else{
            return fallBack('🙏🏽 Por favor elige una opción válida *(1 o 2)*')
        }
    })
    