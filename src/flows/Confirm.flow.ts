import { EVENTS, addKeyword } from "@builderbot/bot";

export default addKeyword(EVENTS.ACTION)
.addAnswer('Si la colilla de pago abre correctamente escribe *Si*, por el contrario escribe *No*',
    {capture:true},async(ctx, {fallBack,flowDynamic,state}) => {
        const myState = state.getMyState()
        if(ctx.body == "Si" || ctx.body == "si"){
            await flowDynamic([{ body: "Gracias por la confirmación"}]);
        }else if (ctx.body == "No" || ctx.body == "no"){
            console.log('usuario escribe no')
            const path = `../Colillas/${myState.NumeroCedula}.pdf`;

            await flowDynamic([{ body: "archivo",media: path }]);
        }else{
            return fallBack();
        }
});