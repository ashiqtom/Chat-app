const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors'); 
const path = require('path');
require('dotenv').config();
const app = express();

//socket.io
const http = require('http');
const socketIo = require('socket.io');

const server = http.createServer(app);
const io = socketIo(server);

const chatController = require('./controller/chat');

// Pass io to the chat controller
chatController.init(io);

io.on('connection', (socket) => {
  console.log('New client connected');

  socket.on('joinGroup', (groupId) => {
    socket.join(groupId);
  });

});


app.use(bodyParser.json());
app.use(cors({
  origin: "*",
}));

// Import sequelize and models
const sequelize = require('./util/database');
const User = require('./models/user');
const Chat = require('./models/chat');
const Group = require('./models/group');
const UserGroup = require('./models/UserGroup');

// Define model relationships
User.hasMany(Chat); 
Chat.belongsTo(User);
User.belongsToMany(Group, { through: UserGroup, onDelete: 'CASCADE' });
Group.belongsToMany(User, { through: UserGroup });
UserGroup.belongsTo(User);
UserGroup.belongsTo(Group);
Group.hasMany(Chat);
Chat.belongsTo(Group);

const adminRoutes = require('./routes/user');
const chatRoutes = require('./routes/chat');
const groupRoutes = require('./routes/groups');

app.use('/user', adminRoutes);
app.use('/chat', chatRoutes);
app.use('/group', groupRoutes);

app.use((req, res) => {
  res.sendFile(path.join(__dirname, `public/${req.url}`));
});


// Start the cron job
const cronJob = require('./cron/cron'); // Import the cron job configuration


sequelize.sync()
  .then(() => {
    server.listen(process.env.PORT || 3000, () => {
      console.log(`Server is running on port ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.log(err);
  });
