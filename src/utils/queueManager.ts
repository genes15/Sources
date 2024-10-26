// queueManager.ts
//import Queue from 'enqueue'; // Asegúrate de instalar y importar el paquete adecuado
import Queue from 'queue';
import {getByIdentification_DB_complete } from "../utils/Excel";
import {unificarPDFs} from "../utils/PDF";

// Crear una instancia de la cola
const queue = new Queue({
  concurrency: 1, // Solo se procesa una tarea a la vez
  autostart: true, // Iniciar automáticamente al encolar
  timeout: 5000, // Timeout de 30 segundos (puedes ajustarlo)
});

// Función para encolar tareas
export default function init(userId: string): Promise<string | null> {
  return new Promise((resolve, reject) => {
    queue.push(async (cb: any) => {
      try {
        const [success, items, project] = await getByIdentification_DB_complete(userId);

        if (success) {
          try {
            const path = await unificarPDFs(items, userId,project);

            if (path) {
              resolve(path); // Retorna el path del archivo PDF
            } else {
              resolve(null); // No se generó el archivo PDF
            }
          } catch (error) {
            console.error('Error al unificar archivos PDF activo:', error);
            reject(error); // Manejo de error en la unificación
          }
        } else {
          console.log('No se encontraron elementos en la base de datos.');
          resolve(null); // No se encontraron elementos
        }
      } catch (error) {
        reject(error); // Manejo de error en la consulta a la base de datos
      } finally {
        cb(); // Llamar al callback para indicar que la tarea ha finalizado
      }
    });
  });
}