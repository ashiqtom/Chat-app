const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors'); 
const path = require('path');
require('dotenv').config();
const app = express();
app.use(bodyParser.json());

app.use(cors({
  origin:"http://127.0.0.1:5000",
})); 

const sequelize = require('./util/database');

const adminRoutes = require('./routes/user');

app.use('/user',adminRoutes);

app.use((req,res)=>{
  res.sendFile(path.join(__dirname,`public/${req.url}`));
})

sequelize
  .sync()
  .then(() => {
    app.listen(process.env.PORT || 3000, () => {
      console.log(`Server is running on port ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.log(err);
  });