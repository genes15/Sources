import { createFlow } from "@builderbot/bot";
import welcomeFlow from "./welcome.flow";
//import testFlow from "./test.flow";
import UserNotFind  from "./user_not_find.flow";
import failAutentication  from "./fail_autentication.flow";
import Confirmflow  from "./Confirm.flow";
import {IdentificationFlow,AutenticationFlow} from "./started.flow";
import {FlowIntentosAgotados,flowFinalizarSesion} from "./exhausted_attempts.flow";
import {stubsflow_generation,AutenticationSuceesStubsFlow}  from "./payment_stubs.flow";
import {AutenticationSuceesletterFlow,flowgeneracion_documento_Activo,flowvalidacion_correo,flowenvio_correo} from "./employment_letters.flow";

/**
 * Declaramos todos los flujos que vamos a utilizar
 */
export default createFlow([
    welcomeFlow, 
    IdentificationFlow,
    AutenticationFlow,
    UserNotFind,
    AutenticationSuceesStubsFlow,
    stubsflow_generation,
    AutenticationSuceesletterFlow,
    flowgeneracion_documento_Activo,
    failAutentication,
    Confirmflow,
    FlowIntentosAgotados,flowFinalizarSesion,
    flowvalidacion_correo,flowenvio_correo
    //testFlow
])//, flowSchedule, flowConfirm])