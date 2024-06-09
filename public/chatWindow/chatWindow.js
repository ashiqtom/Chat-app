let currentGroup=null;
let currentGroupName=null;

// Example of calling login function when user logs in
document.getElementById('logout').addEventListener('click', async () => {
    try {
        localStorage.removeItem('messages');
        localStorage.removeItem('lastMessageId');
        localStorage.removeItem('token');
        window.location.href = "../Login/login.html";
    } catch (err) {
        console.error(err);
    }
});


const groupList=async ()=>{
    try{
        const token = localStorage.getItem('token');
        groups=await axios.get(`/group/getGroup`,{headers:{'authorization':token}})
        console.log(groups.data)
        const groupList = document.getElementById('groupList');
        groups.data.forEach(group => {
            const listItem = document.createElement('li');
            listItem.textContent = group.groupName;
            listItem.addEventListener('click', () => {
                document.getElementById('messageHeading').innerHTML=`Message from group ${group.groupName}`
                allMessage(group.id);
                currentGroup=group.id;
                currentGroupName=group.groupName;
                console.log(group.id)
            });
            groupList.appendChild(listItem);
        });
    }catch(err){
        console.log(err)
    }
}

document.getElementById('createGroupBtn').addEventListener('click',async()=>{
    try{
        const token = localStorage.getItem('token');
        const groupName=document.getElementById('createGroup').value;
        const groupRes=await axios.post(`/group/postGroup`,{groupName:groupName},{headers:{'authorization':token}})

    }catch(err){
        console(err);
    }
})

document.getElementById('sendMessage').addEventListener('click',async()=>{
    try{
        const messageInput=document.getElementById('message');
        const message = messageInput.value;
        const messageObj={
            message:message,
            groupId:currentGroup
        }
        if(message){
            const token = localStorage.getItem('token');
            const messageResponse=await axios.post(`/chat/postChat`,messageObj,{headers:{"authorization":token}});
            console.log(messageResponse)
        }
        messageInput.value = "";
    } catch(err){
        console.log(err);
    }
})

async function allMessage(groupId) {
    try{
        const storedMessages = JSON.parse(localStorage.getItem('messages')) || [];
        console.log(storedMessages);
        const filteredMessages = storedMessages.filter(message => { 
            console.log( message.groupId, groupId)
            return message.groupId === groupId
        });
        displayMessage(filteredMessages);

        const token = localStorage.getItem('token');
        let lastMessageId=localStorage.getItem('lastMessageId')||0;
        const getMessages=await axios.get(`/chat/getChat/${lastMessageId}/${groupId}`,{headers:{'authorization':token}});
        const newMessages=getMessages.data;

        const updatedMessages = storedMessages.concat(newMessages.filter(item2 => {
            return !storedMessages.some(item1 => item1.id === item2.id);
        }));
        localStorage.setItem('messages', JSON.stringify(updatedMessages));

        const messages =JSON.parse(localStorage.getItem('messages') || []);
        lastMessageId=messages? messages[messages.length - 1].id : 0;
        localStorage.setItem('lastMessageId',lastMessageId)
    }catch(err){
        console.log(err);
    }
}

const displayMessage=(messages)=>{
    console.log(messages)
    document.getElementById('messageInput').style.display='block'
    const addMembersBtn=document.getElementById('addMembers');
    addMembersBtn.style.display='block';
    addMembersBtn.addEventListener('click',()=>{
        peopleAdd()
    })
    

    const messageList = document.getElementById('allMessage');
    messageList.innerHTML=''; 
    messages.forEach(message => {
        const li = document.createElement('li');
        li.innerHTML =`name : ${message.name} - message : ${message.chat}`
        messageList.appendChild(li);
    });
    
    const groupMembersButton = document.getElementById('groupMembers');
    groupMembersButton.style.display='block';
    
    const groupList=document.getElementById('groupMemberslist')
    groupList.textContent='';
}
    const groupMembers=document.getElementById('groupMembers')
    groupMembers.addEventListener('click',async()=>{
        const token = localStorage.getItem('token');
        const groups=await axios.get(`/group/groupMembers/${currentGroupName}`,{headers:{'authorization':token}})
        console.log(groups.data)
        const groupList=document.getElementById('groupMemberslist')
        groups.data.forEach(group => { 
            const listItem = document.createElement('li');
            listItem.textContent = group.username;
            groupList.appendChild(listItem);
        });
    })

async function peopleAdd() {
    try{
        const users=await axios.get('/user/userList')
        console.log(users)
        const userList = document.getElementById('peopleStatus');
        userList.innerHTML = '';
        users.data.forEach(user => {
            const li = document.createElement('li');
            li.textContent = user.username;
            li.addEventListener('click',async()=>{
                try{
                    const token = localStorage.getItem('token');
                    const groupRes=await axios.post(`/group/addMembers`,{
                        groupName:currentGroupName,
                        username:user.username
                    },{headers:{'authorization':token}});
                }catch(err){
                    console.log(err);
                }
            })
            userList.appendChild(li);
        });
    }catch(err){
        console.log(err);
    }
}


//setInterval(allMessage, 1000);

window.addEventListener('DOMContentLoaded', async () => {
    try{
        document.getElementById('adminNmae').innerHTML=`Welcome ${localStorage.getItem('adminName')}`
        groupList()
    }catch(err){
        console.log(err)
    }
})
