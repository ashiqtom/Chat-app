const form=document.getElementById('signupForm')
form.addEventListener('submit',(e)=>{
    e.preventDefault();
    const formData = new FormData(form);
    const data = {};
    
    formData.forEach((value, key) => {
        data[key] = value;
    });
    console.log(data)
})