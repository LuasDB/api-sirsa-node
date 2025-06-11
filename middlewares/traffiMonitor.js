// contador y acumulador global
let totalRequests = 0;
let totalBytesSent = 0;

export const trafficMonitor = (req, res, next) => {
  if (req.method !== 'OPTIONS') {
    totalRequests++;
    const originalJson = res.json;

    res.json = function (data) {
      const responseSize = Buffer.byteLength(JSON.stringify(data), 'utf8');
      totalBytesSent += responseSize;

      console.log(`📥 [${new Date().toISOString()}]`);
      console.log(`➡️  Ruta: ${req.method} ${req.originalUrl}`);
      console.log('📊Método:', req.method, 'Ruta:', req.originalUrl);
      console.log(`📊 Peticiones totales: ${totalRequests}`);
      console.log(`📦 Datos enviados en esta respuesta: ${responseSize} bytes`);
      console.log(`📦 Total acumulado de datos enviados: ${totalBytesSent} bytes`);
      console.log('--------------------------------------');
    return originalJson.call(this, data);
  }

  };

  next();
};
