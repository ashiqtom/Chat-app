const { where } = require("sequelize");
const Group = require("../models/group");
const User = require("../models/user");

exports.getGroupMembers=async(req,res)=>{
    try{
        console.log(req.params)
        const result = await User.findAll({
            attributes: ['username'],
            include: [{
                model: Group,
                where:{groupName:req.params.groupName},
                attributes: []
            }]
        });
        res.status(200).json(result);
          
 

    }catch(err){
        console.log(err);
    }
}

exports.addMembers=async(req,res)=>{
    try{
        const { groupName, username }=req.body
        const user=await User.findOne({
            where:{username:username},
            attributes:['id']
        })
        console.log(user.id);
        await Group.create({groupName:groupName,UserId:user.id})
    }catch(err){
        console.log(err)
    }
}

exports.postGroup=async(req,res)=>{
    try{
        const {groupName}=req.body;
        await Group.create({groupName:groupName,UserId:req.user.id})
    }catch(err){
        console.log(err);
    }
}

exports.getGroup=async(req,res)=>{
    try{
        const groups= await Group.findAll({
            where:{UserId:req.user.id},
            attributes:['id','groupName']
        })
        res.status(200).json(groups);
    }catch(err){
        console.log(err);
    }
}