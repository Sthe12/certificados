const User = require('./models/userModel');

async function testDatabaseConnection() {
  try {
    const isConnected = await User.testConnection();
    if (isConnected) {
      console.log('La conexión a la base de datos se ha establecido correctamente.');
    } else {
      console.log('No se pudo establecer la conexión a la base de datos.');
    }
  } catch (error) {
    console.error('Error al probar la conexión a la base de datos:', error);
  }
  process.exit();
}

testDatabaseConnection();