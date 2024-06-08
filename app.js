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

const User = require('./models/user');
const Chat = require('./models/chat');
const Group = require('./models/group');

User.hasMany(Chat);//one-to-many relationship
Chat.belongsTo(User);
User.hasMany(Group);
Group.belongsTo(User);
Group.hasMany(Chat);
Chat.belongsTo(Group);

const adminRoutes = require('./routes/user');
const chatRoutes=require('./routes/chat');
const groupRoutes=require('./routes/groups');

// app.use('/',(req,res,next)=>{
//     console.log(req.url);
//     next();
// })

app.use('/user',adminRoutes);
app.use('/chat',chatRoutes);
app.use('/group',groupRoutes);


app.use((req,res)=>{
  res.sendFile(path.join(__dirname,`public/${req.url}`));
})

sequelize
  //.sync({force:true})
  .sync()
  .then(() => {
    app.listen(process.env.PORT || 3000, () => {
      console.log(`Server is running on port ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.log(err);
  });