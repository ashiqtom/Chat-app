const User = require('../models/user');
const bcrypt=require('bcrypt');
const jwt = require('jsonwebtoken');
const Group = require("../models/group");


exports.getUsers=async(req,res)=>{
    try{
        const users=await User.findAll({
            attributes:['username']
        })
        res.status(200).json(users)
    } catch(err){
        console.log(err);
    }
}

const stringValidate=(string)=>{
    if(string===undefined || string.length===0){
        return false;
    }else{
        return true;
    }
}

exports.signupUser=async (req, res) => {
    try {
        const { username, email, phoneNumber, password } = req.body;
        
        if(!stringValidate(username)|| !stringValidate(email)||!stringValidate(password) || !stringValidate(phoneNumber)){
            return res.status(400).json({err:"bad request ,something is missing"});        
        }
        const existingUser = await User.findOne({ where: { email } });

        if (existingUser) {
            return res.status(400).json({ err: 'Email already exists' });
        }
        const saltrounds=Number(process.env.saltrounds);
        const hashedPassword = await bcrypt.hash(password,saltrounds); //blowfish 

        await User.create({ username, email , phoneNumber , password:hashedPassword});
        res.status(201).json({message: 'Successfuly create new user'});

    } catch (err) {
        console.error('Error signing up:', err);
        res.status(500).json({ err: 'Internal server error' });
    }
}



exports.loginUser = async (req, res) => {
    try {
        const { email, password} = req.params; 
        const existingUser = await User.findOne({ where: { email } });
        
        if (!existingUser) {
            return res.status(404).json({ err: 'Invalid email' });
        }
        const passwordCompared=await bcrypt.compare(password,existingUser.password);

        if(passwordCompared){
            return res.status(200).json({ success: true, message: "User logged in successfully",userName:existingUser.username,token: generateAccessToken(existingUser.id,existingUser.username)});
        }else{
            return res.status(400).json({success: false, err: 'Password is incorrect'});
        }
    } catch (err) {
        console.error('Error login:', err);
        return res.status(500).json({err: err, success: false});
    }
};

const generateAccessToken=(id,name)=>{
    return jwt.sign({userId:id,name:name},process.env.jwtSecretkey)
};


exports.getloggedUser = async (req, res) => {
    try {
        console.log(req.params,'```````')
        const { groupName } = req.params;
        const userId = req.user.id;

        // Find the group by name
        const group = await Group.findOne({ where: { groupName } });
        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        // Check if the requesting user is a member of the group
        const isMember = await group.hasUser(userId);
        if (!isMember) {
            return res.status(403).json({ message: 'You are not a member of this group' });
        }

        // Find all logged in users in the group
        const usersInGroup = await group.getUsers({
            where: { loggedIn: true },
            attributes: ['username']
        });

        const usernames = usersInGroup.map(user => user.username);

        return res.status(200).json(usernames);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err });
    }
};

exports.setloggedUser = async (req, res) => {
try {
    req.user.loggedIn = true;
    await req.user.save();
    res.status(200).json({ message: "User is online" });
} catch (err) {
    res.status(500).json({err});
}
}

exports.logOff = async (req, res) => {
try {
    req.user.loggedIn = false;
    await req.user.save();
    res.status(200).json({ message: "User is offline" });
} catch (err) {
    console.error(err);
    res.status(500).json({ err});
}
}
