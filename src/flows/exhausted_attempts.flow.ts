import { addKeyword,EVENTS } from "@builderbot/bot";

const flowFinalizarSesion = addKeyword(['Cancelar','cancelar','cerrar','cerra','cierra','salir','cancelas'])
.addAnswer('Si quieres volver a intentar con algun proceso, por favor escribe *Hola*')

const FlowIntentosAgotados = addKeyword(EVENTS.ACTION).addAnswer(
    [
        '🙌 Lo siento, parece que has excedido el límite de intentos.',
        'Si necesitas ayuda adicional o tienes alguna pregunta, no dudes en contactar a gestión humana. Estamos aquí para ayudarte.',
        'escribe *Cancelar* para reiniciar la conversacion.',
    ],
    {delay:2000},
    null,
    [flowFinalizarSesion]
)

export {FlowIntentosAgotados,flowFinalizarSesion}