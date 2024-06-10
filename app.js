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
const UserGroup=require('./models/UserGroup');

User.hasMany(Chat);//one-to-many relationship
Chat.belongsTo(User);

User.belongsToMany(Group, { through: UserGroup , onDelete: 'CASCADE'});//many to many
Group.belongsToMany(User, { through: UserGroup });

UserGroup.belongsTo(User);
UserGroup.belongsTo(Group);

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
  .sync()
  //.sync()
  .then(() => {
    app.listen(process.env.PORT || 3000, () => {
      console.log(`Server is running on port ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.log(err);
  });