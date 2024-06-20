//encapsulate the state within an object
const appState = {
    currentGroup: null,
    currentGroupName: null,
    token: localStorage.getItem('token'),
    adminName: localStorage.getItem('adminName')
};

const socket = io();
socket.on('newMessage', (groupId) => {
    getMessage(groupId);
});

document.getElementById('sendMessage').addEventListener('click', async () => {
    try {
        const token = appState.token;
        const messageInput = document.getElementById('message');
        const message = messageInput.value;
        const messageObj={
            message:message,
            groupId:appState.currentGroup,
            token:token
        }
        if(message){
            const messageResponse=await axios.post(`/chat/postChat`,messageObj,{headers:{"authorization":token}});
            console.log(messageResponse)
            messageInput.value=''
            getMessage(appState.currentGroup);
            socket.emit('message',messageObj);
        }
        messageInput.value = "";
    } catch (err) {
        console.log(err);
    }
});


document.getElementById('uploadForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    const fileInput = document.getElementById('myFile');
    const file = fileInput.files[0];

    if (!file) {
        return alert('Please select a file to upload');
    }

    const formData = new FormData();
    formData.append('myFile', file);
    formData.append('groupId', appState.currentGroup);

    const token = appState.token;

    try {
        const response = await axios.post(`/chat/uploadFile`,formData,{headers:{"authorization":token}});
        console.log(response)
        fileInput.value = '';
        getMessage(appState.currentGroup);

    } catch (error) {
        console.error('Error:', error);
        document.getElementById('message').innerText = 'Failed to upload file';
    }
});


async function getMessage(groupId) {
    try {
        console.log('groupid',groupId)
        const token = appState.token;

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
        messageDivFunction(filteredChat);
    } catch (err) {
        console.log(err);
    }
}

const messageDivFunction = (messages) => {
    document.getElementById('loggedUsersList').innerHTML='';
    document.getElementById('addMembersList').innerHTML='';
    document.getElementById('groupMemberslist').innerHTML='';

    console.log(messages);
    const messageList = document.getElementById('allMessage');
    messageList.innerHTML = ''; 

    messages.forEach(message => {
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        const li = document.createElement('li');
        
        const contentWithLinks = message.chat.replace(urlRegex, (url) => {
            if (url.match(/\.(jpeg|jpg|gif|png)$/i)) {
                return `<img src="${url}" alt="image" style="max-width: 200px; max-height: 200px;">`;
            } else if (url.match(/\.(mp4|webm|ogg)$/i)) {
                return `<video width="320" height="240" controls>
                            <source src="${url}" type="video/mp4">
                            Your browser does not support the video tag.
                        </video>`;
            } else {
                return `<a href="${url}" target="_blank">click</a>`;
            }
        });

        li.innerHTML = `name: ${message.name} - message: ${contentWithLinks}`;
        messageList.appendChild(li);
    });
}
document.getElementById('addMembers').addEventListener('click',async () => {
    try {
        const users = await axios.get(`/group/userList/${appState.currentGroup}`);
        console.log(users)
        const userList = document.getElementById('addMembersList');
        userList.innerHTML = '';
        users.data.forEach(user => {
            if (user.username !== appState.adminName) {
                const li = document.createElement('li');
                li.textContent = user.username;
                const addUser = document.createElement('button');
                addUser.innerHTML = 'add';
                addUser.addEventListener('click', async () => {
                    try {
                        const token = appState.token;
                        const response = await axios.post(`/group/addMembers`, {
                            groupName: appState.currentGroupName,
                            username: user.username
                        }, { headers: { 'authorization': token } });
                        alert(response.data.message)
                        getMessage(appState.currentGroup);
                    } catch (err) {
                        console.log(err);
                    }
                });
                li.appendChild(addUser)
                userList.appendChild(li);
            }
        });
    } catch (err) {
        console.log(err);
    }
});

document.getElementById('showLoggedUsers').addEventListener('click', async () => {
    const token = appState.token;
    try {
        const response = await axios.get(`/user/getloggedUser/${appState.currentGroupName}`, { headers: { 'authorization': token } });
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
        const token = appState.token;
        const groups = await axios.get(`/group/groupMembers/${appState.currentGroupName}`, { headers: { 'authorization': token } });
        const groupList = document.getElementById('groupMemberslist');
        groupList.innerHTML = '';
        groups.data.forEach(group => { 
            const listItem = document.createElement('li');
            if(group.username===appState.adminName && group.Admin){
                listItem.innerHTML = `${group.username} - You - Admin`;

            } else if (group.username===appState.adminName){
                listItem.innerHTML = `${group.username} - You`;
            } else if (group.Admin){
                listItem.innerHTML = `${group.username}- Admin`;
            } else {
                listItem.innerHTML = `${group.username}`;
                const addAdmin = document.createElement('button');
                addAdmin.innerHTML = 'addAdmin';
                addAdmin.addEventListener('click', async () => {
                    try {
                        const token = appState.token;
                        const promoteToAdmin = await axios.post(`/group/promoteToAdmin`, {
                            groupName: appState.currentGroupName,
                            username: group.username
                        }, { headers: { 'authorization': token } });
                        console.log(promoteToAdmin, '```````````');
                        getMessage(appState.currentGroup);
                    } catch (err) {
                        console.log(err.response.data.message);
                    }
                });
                listItem.appendChild(addAdmin);

                const removeUser = document.createElement('button');
                removeUser.innerHTML = 'Remove';
                removeUser.addEventListener('click', async () => {
                    try {
                        const response = await axios.post(`/group/removeUser`, {
                            groupName: appState.currentGroupName,
                            username: group.username
                        }, { headers: { 'authorization': token } });
                        alert(response.data.message)
                        getMessage(appState.currentGroup);
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





document.getElementById('logout').addEventListener('click', async () => {
    try {
        const token = appState.token;
        await axios.post("/user/logOff", {},{ headers: { "Authorization": token } });
        localStorage.removeItem('messages');
        localStorage.removeItem('token');
        window.location.href = "../login/login.html";
    } catch (err) {
        console.error(err);
    }
});


document.getElementById('createGroupBtn').addEventListener('click', async () => {
    try {
        const token = appState.token;
        const groupName = document.getElementById('createGroup').value;
        const response = await axios.post(`/group/createGroup`, { groupName: groupName }, { headers: { 'authorization': token } });
        console.log(response.data);
        alert(response.data.message)
        groupList()
    } catch (err) {
        console(err);
    }
});

const groupList = async () => {
    try {
        const token = appState.token;
        const groups = await axios.get(`/group/getGroup`, { headers: { 'authorization': token } });
        const groupListElement = document.getElementById('groupList');
        groupListElement.innerHTML='';
        groups.data.forEach(group => {
            const listItem = document.createElement('li');
            listItem.id = 'groupListLi';
            listItem.textContent = group.groupName;

            const deleteBtn=document.createElement('button');
            deleteBtn.textContent='Delete';
            deleteBtn.addEventListener('click',async()=>{
                try{
                    const response = await axios.delete('/group/deleteGroup', {
                        headers: {
                            'authorization': token
                        },
                        data: {
                            groupId: appState.currentGroup
                        }
                    });
                    console.log(response);
                    alert(response.data.message)
                    groupList()
                    
                }catch(err){
                    console.log(err);
                }
            });
            listItem.appendChild(deleteBtn)

            listItem.addEventListener('click', () => {
                document.getElementById('rightDiv').style.display='block';

                // Remove 'active' class from all list items
                document.querySelectorAll('#groupList li').forEach(item => {
                    item.classList.remove('active');
                });
                // Add 'active' class to the clicked list item
                listItem.classList.add('active');

                document.getElementById('messageHeading').innerHTML = `Message from group ${group.groupName}`;
                
                document.getElementById('loggedUsersList').innerHTML='';
                document.getElementById('addMembersList').innerHTML='';
                document.getElementById('groupMemberslist').innerHTML='';

                appState.currentGroup = group.id;
                appState.currentGroupName = group.groupName;
                socket.emit('joinGroup', group.id);

                getMessage(group.id);
            });
            groupListElement.appendChild(listItem);
        });

    } catch (err) {
        console.log(err);
    }
}

window.addEventListener('DOMContentLoaded', async () => {
    try {
        document.getElementById('adminNmae').innerHTML = `Welcome ${appState.adminName}`;
        groupList();
        const token = appState.token;
        await axios.post('/user/setloggedUser', {}, { headers: { 'authorization': token } });
    } catch (err) {
        console.log(err);
    }
});
