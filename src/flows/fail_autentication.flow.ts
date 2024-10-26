import { addKeyword,EVENTS } from "@builderbot/bot";


export default addKeyword(EVENTS.ACTION)
.addAnswer('🔐 La autenticación ha fallado, por favor verifica tus datos, o dirígete al área de gestión humana de tu ciudad o municipio')
.addAnswer('Escribe *Cancelar* para reiniciar la conversacion.')