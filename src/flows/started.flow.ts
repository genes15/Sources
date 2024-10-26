import 'dotenv/config'
import { addKeyword,EVENTS} from "@builderbot/bot";
import UserNotFind  from "./user_not_find.flow";
import UserDenied  from "./staff_denied.flow";
import failAutentication  from "./fail_autentication.flow";
import { MongoDBConnection} from '../database/MongoDBConnection';
import {AutenticationSuceesStubsFlow}  from "./payment_stubs.flow";
import {AutenticationSuceesletterFlow} from "./employment_letters.flow";
import {searchByIdentification_DB_complete} from "../utils/Excel";

const mongoConnection = new MongoDBConnection(process.env.MONGO_DB_URI, process.env.MONGO_DB_NAME);

const ListNumbersReceptions = [
    '57123456789', 
    '57234567890',
];

const IdentificationFlow = addKeyword(EVENTS.ACTION)
.addAnswer('📝Para continuar, ingresa tu número de documento sin puntos, comas o guiones: *(Ejem.: 1234567890)* para generar tu documento'
    ,{capture:true,delay:1000},async(ctx, {fallBack,gotoFlow,state}) => {
    if ( ctx.body.length >= 7 && !isNaN(Number(ctx.body))) {
        try {
            const myState = state.getMyState()

            const status = await searchByIdentification_DB_complete(Number(ctx.body));
            await state.update({ NumeroCedula: ctx.body})

            if (status == 'activo' && myState.option == 1){
                await state.update({ status: 'Activo'})
                return gotoFlow(AutenticationFlow)

            }else if(status == 'inactivo' && myState.option == 1) {
                await state.update({ status: 'Inactivo'})
                return gotoFlow(AutenticationFlow)

            }else if(status == 'activo' && myState.option == 2){
                return gotoFlow(AutenticationFlow)

            }else if  (status == 'inactivo' && myState.option == 2) {
                return gotoFlow(UserNotFind)
            }else{
                return fallBack()
            }
            
        } catch (error) {
            console.error('Error al consultar número en Excel:', error);
            // Obtener información sobre el error y la línea donde ocurrió
            const errorMessage = `${error.stack}\n`;
            console.log(errorMessage)
            return fallBack();
        }
    }else{
        return fallBack()
    }
})

const AutenticationFlow = addKeyword(EVENTS.ACTION)
.addAnswer('👉 Vamos a proceder a verificar tu identidad, Por favor escribe los ultimos 4 digitos de tu cuenta de ahorros asociado a la empresa')
.addAnswer('🧐👀 *Si* no lo conoces puedes solicitarlo con \n👨‍💻 gestión humana \n📱: 304 3855397'
    ,{capture:true},async(ctx, {fallBack,gotoFlow,state}) => {
    const myState = state.getMyState()
    
    await mongoConnection.connect();
    const find_cuenta = await mongoConnection.searchDocumentByCode(myState.NumeroCedula,ctx.body);
    await mongoConnection.disconnect();

    if (find_cuenta && myState.option == 2 ){
        return gotoFlow(AutenticationSuceesStubsFlow)

    }else if (find_cuenta && myState.option == 1 && myState.status == 'Activo') {
        return gotoFlow(AutenticationSuceesletterFlow)

    }else if (find_cuenta && myState.option == 1 && myState.status == 'Inactivo') {

        if (ListNumbersReceptions.includes(ctx.from)){
            return gotoFlow(AutenticationSuceesletterFlow)
        }else{
            return gotoFlow(UserDenied)
        }

    }else if (!find_cuenta ) {
        return gotoFlow(failAutentication)

    }else{
        return fallBack();
    }

}
)

export { IdentificationFlow,AutenticationFlow}