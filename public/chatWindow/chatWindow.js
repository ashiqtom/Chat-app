
document.getElementById('sendMessage').addEventListener('click',async()=>{
    try{
        const messageInput=document.getElementById('message');
        const message = messageInput.value;
        const messageObj={
            message:message
        }
        if(message){
            const token = localStorage.getItem('token');
            const messageResponse=await axios.post(`/chat/postChat`,messageObj,{headers:{"authorization":token}});
        }
        messageInput.value = "";
    } catch(err){
        console.log(err);
    }
})

// async function peopleStatus() {
//     try{
//         const users=await axios.get('/peopleStatus')
//         const userList = document.getElementById('peopleStatus');
//         userList.innerHTML = '';
//         users.forEach(user => {
//             const li = document.createElement('li');
//             li.textContent = user;
//             userList.appendChild(li);
//         });
//     }catch(err){
//         console.log(err);
//     }
// }

async function allMessage() {
    try{
        const storedMessages = JSON.parse(localStorage.getItem('messages')) || [];
        displayMessage(storedMessages);
        let lastMessageId=localStorage.getItem('lastMessageId')||0;
        const getMessages=await axios.get(`/chat/getChat/${lastMessageId}`);
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
    const messageList = document.getElementById('allMessage');
    messageList.innerHTML=''; 
    messages.forEach(message => {
        const li = document.createElement('li');
        li.innerHTML =`name : ${message.name} - message : ${message.chat}`
        messageList.appendChild(li);
    });
}
setInterval(allMessage, 1000);

window.addEventListener('DOMContentLoaded', async () => {
    try{
        //peopleStatus();
        allMessage();
    }catch(err){
        console.log(err)
    }
})
