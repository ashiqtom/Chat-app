const form = document.getElementById('loginForm');

form.addEventListener('submit', async function(event) {
    try {
        event.preventDefault();

        const formData = new FormData(form);
        const email = formData.get('email');
        const password = formData.get('password');
        console.log(email,password)

        const response = await axios.post(`/user/login/${email}/${password}`);
        alert(response.data.message)
        localStorage.setItem('token',response.data.token)
    } catch (err) {
        console.log(err)
        document.body.innerHTML += `<div style="color:red;">${err.response.data.err} <div>`;
    }
});
