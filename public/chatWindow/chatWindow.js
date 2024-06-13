let currentGroup = null;
let currentGroupName = null;


document.getElementById('uploadForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    const fileInput = document.getElementById('myFile');
    const file = fileInput.files[0];

    if (!file) {
        return alert('Please select a file to upload');
    }

    const formData = new FormData();
    formData.append('myFile', file);
    formData.append('groupId', currentGroup);

    const token = localStorage.getItem('token');

    try {
        const response = await axios.post(`/chat/uploadFile`,formData,{headers:{"authorization":token}});
        console.log(response)
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('message').innerText = 'Failed to upload file';
    }
});


const socket = io();
socket.on('newMessage', (groupId) => {
    allMessage(groupId);
});

const groupList = async () => {
    try {
        const token = localStorage.getItem('token');
        const groups = await axios.get(`/group/getGroup`, { headers: { 'authorization': token } });
        const groupListElement = document.getElementById('groupList');
        groups.data.forEach(group => {
            const listItem = document.createElement('li');
            listItem.textContent = group.groupName;
            listItem.addEventListener('click', () => {
                document.getElementById('messageHeading').innerHTML = `Message from group ${group.groupName}`;
                document.getElementById('showLoggedUsers').style.display = 'block';
                allMessage(group.id);
                currentGroup = group.id;
                currentGroupName = group.groupName;
                socket.emit('joinGroup', group.id);
            });
            groupListElement.appendChild(listItem);
        });
    } catch (err) {
        console.log(err);
    }
}

document.getElementById('createGroupBtn').addEventListener('click', async () => {
    try {
        const token = localStorage.getItem('token');
        const groupName = document.getElementById('createGroup').value;
        const groupRes = await axios.post(`/group/createGroup`, { groupName: groupName }, { headers: { 'authorization': token } });
        console.log(groupRes.data);
    } catch (err) {
        console(err);
    }
});


document.getElementById('sendMessage').addEventListener('click', async () => {
    try {
        const messageInput = document.getElementById('message');
        const message = messageInput.value;
        const messageObj={
            message:message,
            groupId:currentGroup
        }
        if(message){
            const token = localStorage.getItem('token');
            const messageResponse=await axios.post(`/chat/postChat`,messageObj,{headers:{"authorization":token}});
            console.log(messageResponse)
            allMessage(currentGroup);
        }
        messageInput.value = "";
    } catch (err) {
        console.log(err);
    }
});



async function allMessage(groupId) {
    try {
        const token = localStorage.getItem('token');

        const storedMessages = JSON.parse(localStorage.getItem('messages')) || [];
        const filteredMessages = storedMessages.filter(message => message.groupId === groupId);
        lastMessageId = filteredMessages.length !== 0 ? filteredMessages[filteredMessages.length - 1].id : 0;

        const getMessages = await axios.get(`/chat/getChat/${lastMessageId}/${groupId}`, { headers: { 'authorization': token } });
        const newMessages = getMessages.data;

        const updatedMessages = storedMessages.concat(newMessages.filter(item2 => {
            return !storedMessages.some(item1 => item1.id === item2.id);
        }));

        localStorage.setItem('messages', JSON.stringify(updatedMessages));

        const filteredChat = updatedMessages.filter(message => message.groupId === groupId);
        displayMessage(filteredChat);
    } catch (err) {
        console.log(err);
    }
}

const displayMessage = (messages) => {
    document.getElementById('messageInput').style.display = 'block';
    const addMembersBtn = document.getElementById('addMembers');
    addMembersBtn.style.display = 'block';
    addMembersBtn.addEventListener('click', () => {
        peopleAdd(currentGroup);
    });

    const messageList = document.getElementById('allMessage');
    messageList.innerHTML = ''; 
    messages.forEach(message => {
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        const contentWithLinks = message.chat.replace(urlRegex, '<a href="$1" target="_blank">click</a>');

        const li = document.createElement('li');
        li.innerHTML = `name: ${message.name} - message: ${contentWithLinks}`;
        messageList.appendChild(li);
    });

    const groupMembersButton = document.getElementById('groupMembers');
    groupMembersButton.style.display = 'block';

    const groupList = document.getElementById('groupMemberslist');
    groupList.textContent = '';
}

document.getElementById('showLoggedUsers').addEventListener('click', async () => {
    const token = localStorage.getItem('token');
    try {
        const response = await axios.get(`/user/getloggedUser/${currentGroupName}`, { headers: { 'authorization': token } });
        const loggedUsers = response.data;
        const userList = document.getElementById('loggedUsersList');
        userList.innerHTML = ''; // Clear previous list items if any
        loggedUsers.forEach(username => {
            const listItem = document.createElement('li');
            listItem.textContent = username;
            userList.appendChild(listItem);
        });
    } catch (err) {
        console.error(err);
    }
});

const groupMembers = document.getElementById('groupMembers');
groupMembers.addEventListener('click', async () => {
    try {
        const token = localStorage.getItem('token');
        const groups = await axios.get(`/group/groupMembers/${currentGroupName}`, { headers: { 'authorization': token } });
        const groupList = document.getElementById('groupMemberslist');
        groupList.innerHTML = '';
        groups.data.forEach(group => { 
            const listItem = document.createElement('li');
            if(group.username===localStorage.getItem('adminName') && group.Admin){
                listItem.innerHTML = `${group.username} - You - Admin`;

            } else if (group.username===localStorage.getItem('adminName')){
                listItem.innerHTML = `${group.username} - You`;
            } else if (group.Admin){
                listItem.innerHTML = `${group.username}- Admin`;
            } else {
                listItem.innerHTML = `${group.username}`;
                const addAdmin = document.createElement('button');
                addAdmin.innerHTML = 'addAdmin';
                addAdmin.addEventListener('click', async () => {
                    try {
                        const token = localStorage.getItem('token');
                        const promoteToAdmin = await axios.post(`/group/promoteToAdmin`, {
                            groupName: currentGroupName,
                            username: group.username
                        }, { headers: { 'authorization': token } });
                        console.log(promoteToAdmin, '```````````');
                    } catch (err) {
                        console.log(err.response.data.message);
                    }
                });
                listItem.appendChild(addAdmin);

                const removeUser = document.createElement('button');
                removeUser.innerHTML = 'Remove User';
                removeUser.addEventListener('click', async () => {
                    try {
                        const removeUserResponse = await axios.post(`/group/removeUser`, {
                            groupName: currentGroupName,
                            username: group.username
                        }, { headers: { 'authorization': token } });
                        console.log(removeUserResponse.data);
                    } catch (err) {
                        console.log(err.response.data.message);
                    }
                });
                listItem.appendChild(removeUser);
            }
              
            groupList.appendChild(listItem);
        });
    } catch (err) {
        console.log(err, '``````````');
    }
});

async function peopleAdd(groupId) {
    try {
        const users = await axios.get(`/group/userList/${groupId}`);
        console.log(users)
        const userList = document.getElementById('addMembersList');
        userList.innerHTML = '';
        users.data.forEach(user => {
            if (user.username !== localStorage.getItem('adminName')) {
                const li = document.createElement('li');
                li.textContent = user.username;
                li.addEventListener('click', async () => {
                    try {
                        const token = localStorage.getItem('token');
                        const groupRes = await axios.post(`/group/addMembers`, {
                            groupName: currentGroupName,
                            username: user.username
                        }, { headers: { 'authorization': token } });
                        console.log(groupRes.data);
                    } catch (err) {
                        console.log(err);
                    }
                });
                userList.appendChild(li);
            }
        });
    } catch (err) {
        console.log(err);
    }
}

document.getElementById('logout').addEventListener('click', async () => {
    try {
        const token = localStorage.getItem('token');
        await axios.post("/user/logOff", {},{ headers: { "Authorization": token } });
        localStorage.removeItem('messages');
        localStorage.removeItem('token');
        window.location.href = "../Login/login.html";
    } catch (err) {
        console.error(err);
    }
});

window.addEventListener('DOMContentLoaded', async () => {
    try {
        document.getElementById('adminNmae').innerHTML = `Welcome ${localStorage.getItem('adminName')}`;
        groupList();
        const token = localStorage.getItem('token');
        await axios.post('/user/setloggedUser', {}, { headers: { 'authorization': token } });
    } catch (err) {
        console.log(err);
    }
});
