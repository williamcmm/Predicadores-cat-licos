// src/config/gcloud.js
const { Storage } = require('@google-cloud/storage');

const storage = new Storage({
  keyFilename: './google-credentials.json', // Ruta al archivo de credenciales
  projectId: 'TU_PROJECT_ID'
});

module.exports = storage;
