const User = require('../models/user');
const bcrypt=require('bcrypt');

const stringValidate=(string)=>{
    if(string===undefined || string.length===0){
        return false;
    }else{
        return true;
    }
}

exports.signupUser=async (req, res) => {
    try {
        console.log(req.body)
        const { username, email, phoneNumber, password } = req.body;
        
        if(!stringValidate(username)|| !stringValidate(email)||!stringValidate(password) || !stringValidate(phoneNumber)){
            return res.status(400).json({err:"bad request ,something is missing"});        
        }
        const existingUser = await User.findOne({ where: { email } });

        if (existingUser) {
            return res.status(400).json({ err: 'Email already exists' });
        }
        const saltrounds = 10;
        const hashedPassword = await bcrypt.hash(password,saltrounds); //blowfish 

        await User.create({ username, email , phoneNumber , password:hashedPassword});
        res.status(201).json({message: 'Successfuly create new user'});

    } catch (err) {
        console.error('Error signing up:', err);
        res.status(500).json({ err: 'Internal server error' });
    }
}