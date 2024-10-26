import { MongoClient } from 'mongodb';

export class MongoDBConnection {
  constructor(uri, dbName) {
    this.uri = uri;
    this.dbName = dbName;
    this.client = null;
  }

  async connect() {
    try {
      this.client = await MongoClient.connect(this.uri, { useNewUrlParser: true, useUnifiedTopology: true });
      this.db = this.client.db(this.dbName);
      //console.log('Connected to MongoDB');
    } catch (err) {
      console.error('Error connecting to MongoDB:', err);
      throw err;
    }
  }

  async searchDocumentByCode(numero_identificacion, codigo) {
    try {
      this.client = await MongoClient.connect(this.uri, { useNewUrlParser: true, useUnifiedTopology: true });
      this.db = this.client.db(this.dbName);

      const result = await this.db.collection('Num_Cod_User').findOne({
        "Numero de identificación": numero_identificacion,
        "código": codigo
      });

      if (result) {
        //console.log('Documento encontrado:', result);
        return true;
      } else {
        //console.log('No se encontró ningún documento con esos valores');
        return false;
      }
    } catch (err) {
      console.error('Error al buscar el documento:', err);
      throw err;
    }
  }

  async disconnect() {
    try {
      await this.client.close();
      //console.log('Desconectado de MongoDB');
    } catch (err) {
      console.error('Error al desconectar de MongoDB:', err);
      throw err;
    }
  }

  async addHistoyStubs(identificacion, nombre) {
    try {
      // Asumimos que 'db' es tu conexión a la base de datos de MongoDB
      this.client = await MongoClient.connect(this.uri, { useNewUrlParser: true, useUnifiedTopology: true });
      this.db = this.client.db(this.dbName);

      const collection = this.db.collection("Historial_Colilla");
      const today = new Date();
      const currentDate = new Date(today.getFullYear(), today.getMonth(), today.getDate(), today.getHours(), today.getMinutes(), today.getSeconds());

      // Crear el documento a insertar
      const documento = {
        Identificacion: identificacion,
        Nombre: nombre,
        Fecha: currentDate
      };
  
      // Insertar el documento en la colección
      const resultado = await collection.insertOne(documento);
      await this.client.close();
      console.log(`Documento insertado con el id: ${resultado.insertedId}`);
      return resultado.insertedId;
    } catch (error) {
      console.error("Error al agregar el historial de colilla:", error);
      throw error;
    }
  }

  getLastRecordByIdentification = async (identificacion) => {
    try {
        const result = await this.db.collection('Historial_Colilla')
            .find({ Identificacion: identificacion })
            .sort({ Fecha: -1 })
            .limit(1)
            .toArray();

        const lastRecord = result[0];
        //console.log(result1)
        if (!lastRecord) {
            return true; // Si no hay registros, devolvemos false
        }
        //console.log(lastRecord)
        const recordDate = new Date(lastRecord.Fecha);
        const currentDate = new Date();

        // Determina la quincena actual
        const currentQuincena = currentDate.getDate() <= 15 ? 1 : 2;
        const recordQuincena = recordDate.getDate() <= 15 ? 1 : 2;

        // Verifica si están en la misma quincena y mes
        const isSameQuincena = 
            currentQuincena === recordQuincena && 
            currentDate.getMonth() === recordDate.getMonth() && 
            currentDate.getFullYear() === recordDate.getFullYear();

        return !isSameQuincena; // Devuelve true si NO están en la misma quincena, false si sí
    } catch (e) {
        console.log('Error', e);
        return null;
    }
  };

  checkConsecutiveDateExpired= async (identificacion) => {
    try {
      // Asumimos que 'db' es tu conexión a la base de datos de MongoDB
      this.client = await MongoClient.connect(this.uri, { useNewUrlParser: true, useUnifiedTopology: true });
      this.db = this.client.db(this.dbName);

      const collection = this.db.collection("History_Consecutive");
      
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      console.log('fecha')
      console.log(thirtyDaysAgo)
      //console.log(identificacion.toString())
      const result = await collection.findOne({
        Identificacion: identificacion,
        Fecha: { $gte: thirtyDaysAgo }
      });
      console.log('result')
      console.log(result)
      await this.client.close();
      // Si no se encuentra ningún resultado, o si el resultado encontrado es más antiguo que 30 días, retornamos true
      return result === null;
    } catch (error) {
      //console.error("Error al buscar en la colección:", error);
      const errorMessage = `${error.stack}\n`;
      console.log(errorMessage)
      throw error;
    }
  };

  async getLastConsecutive() {
    let client;
    try {
      client = await MongoClient.connect(this.uri, { useNewUrlParser: true, useUnifiedTopology: true });
      const db = client.db(this.dbName);
      // Realiza la consulta para obtener el último registro basado en "Fecha"
      const result = await db.collection('History_Consecutive')
        .find({}) // Filtra por Identificación
        .sort({ Fecha: -1 }) // Ordena en orden descendente por Fecha
        .limit(1) // Solo trae el último registro
        .toArray(); // Convierte el resultado a un array
      // Si hay un resultado, devuelve el campo "Consecutivo"
      if (result.length > 0) {
        return result[0].Consecutivo;
      } else {
        return null; // Si no hay resultados, devuelve null o maneja el caso
      }
    } catch (e) {
      console.error('Error al obtener el último consecutivo:', e);
      return null;
    } finally {
    // Verificar si la conexión fue establecida antes de cerrarla
    if (client) {
        try {
            await client.close();
            console.log("Conexión a MongoDB cerrada.");
        } catch (closeError) {
            console.error("Error al cerrar la conexión de MongoDB:", closeError);
        }
    }
  }
  }

  async addHistoyConsecutive(identificacion, nombre,consecutivo) {
    let client;
    try {

      // Establecer la conexión a MongoDB
      client = await MongoClient.connect(this.uri, { useNewUrlParser: true, useUnifiedTopology: true });
      const db = client.db(this.dbName);
      const collection = db.collection("History_Consecutive");
      
      const today = new Date();
      // Crear el documento a insertar
      const documento = {
        Identificacion: identificacion,
        Nombre: nombre,
        Fecha: today,
        Consecutivo:consecutivo
      };

      // Insertar el documento en la colección
      const resultado = await collection.insertOne(documento);
      
      console.log(`Documento insertado con el id: ${resultado.insertedId}`);
      return resultado.insertedId;
    } catch (error) {
      console.error("Error al agregar el historial de consecutivo:", error);
    } finally {
      // Verificar si la conexión fue establecida antes de cerrarla
      if (client) {
          try {
              await client.close();
              console.log("Conexión a MongoDB cerrada.");
          } catch (closeError) {
              console.error("Error al cerrar la conexión de MongoDB:", closeError);
          }
      }
    }
  }
}
