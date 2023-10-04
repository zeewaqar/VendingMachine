const mongoose = require('mongoose');
const uri = process.env.MONGODB_URI;



async function connectDB() {
  mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  mongoose.connection.on('connected', () => {
    console.log('Connected to MongoDB!');
  });
  mongoose.connection.on('error', (err) => {
    console.error('Failed to connect to MongoDB:', err);
  });
}

connectDB().catch(console.dir);

module.exports = {

  connectDB
};
