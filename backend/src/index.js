require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const {connectDB} = require('./config/db');
const userRouter = require('./routes/user');
const productRouter = require('./routes/product');
const buyerRouter = require('./routes/buyer');

const app = express();
const port = process.env.PORT || 3001;

connectDB();

app.use(bodyParser.json());
app.use(userRouter);
app.use(productRouter);
app.use(buyerRouter);

const server = app.listen(port, () => {
  console.log(`Server is up on port ${port}`);
});
module.exports = server; 


