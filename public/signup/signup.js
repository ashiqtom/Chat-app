const form=document.getElementById('signupForm')
form.addEventListener('submit',async(e)=>{
    e.preventDefault();
    try {
        const formData = new FormData(form);
        const data = {};
        
        formData.forEach((value, key) => {
            data[key] = value;
        });
        console.log(data)
        const response = await axios.post(`/user/signup`, data);
        alert(response.data.message)
    } catch (error) {
        console.log(error)
        document.body.innerHTML += `<div style="color:red;">${error.response.data.err} <div>`;
            //dynamically adds a new <div> element to the end of the <body>
    }
})