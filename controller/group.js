const Group = require("../models/group");
const User = require("../models/user");
const UserGroup=require('../models/UserGroup')
const sequelize = require('../util/database');

const { Op, where } = require('sequelize');

exports.deleteGroup=async (req,res)=>{
    try{
        const userId=req.user.id;
        const groupId=req.body.groupId;

        console.log(userId,'userId')
        console.log(groupId,'groupId',req.body)

        const userGroup=await UserGroup.findOne({
            where:{
                UserId:userId,
                groupId:groupId,
                isAdmin:true
            }
        });
        if(!userGroup){
            return res.status(403).json({message:'you are not admin'});
        }
        // Find the group to ensure it exists
        const group = await Group.findByPk(groupId);
        if (!group) {
            return res.status(404).json({ message: 'Group not found.' });
        }

        // Delete the group (cascading deletions will occur for associated records)
        await group.destroy();

        res.status(200).json({ message: 'Group deleted successfully.' });
    } catch (err){
        console.log(err);
    }
}

exports.getUsers = async (req, res) => {
    try {
        const groupId = req.params.groupId;

        const userGroups = await UserGroup.findAll({
            attributes: ['UserId'],
            where: { GroupId: groupId }
        });
        
        const userIdsInGroup = userGroups.map(ug => ug.UserId);

        const users = await User.findAll({
            attributes: ['username'],
            where: {
                id: {
                    [Op.notIn]: userIdsInGroup
                }
            }
        });

        res.status(200).json(users);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Failed to get users' });
    }
};



exports.removeUser = async (req, res) => {
    try {
        const { groupName, username } = req.body;

        // Find the group by name
        const group = await Group.findOne({ where: { groupName: groupName } });
        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        // Check if the requester is an admin of the group
        const reqUserGroup = await UserGroup.findOne({ where: { UserId: req.user.id, GroupId: group.id } });
        if (!reqUserGroup || !reqUserGroup.isAdmin) {
            return res.status(403).json({ message: 'You are not an admin of this group' });
        }

        // Find the user by username
        const user = await User.findOne({ where: { username: username } });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Find the UserGroup association
        const userGroup = await UserGroup.findOne({ where: { UserId: user.id, GroupId: group.id } });
        if (userGroup) {
            await userGroup.destroy(); // Remove the user from the group
            return res.status(200).json({ message: 'User removed from group successfully',reqUserGroup });
        } else {
            return res.status(404).json({ message: 'User is not a member of the group' });
        }
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'An error occurred while removing user from group' });
    }
};

exports.promoteToAdmin = async (req, res) => {
    try {
        const { groupName, username } = req.body;
        console.log(req.body)

        const group = await Group.findOne({ where: { groupName: groupName } });
        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

         // Check if the requester is an admin of the group
         const reqUserGroup = await UserGroup.findOne({ where: { UserId: req.user.id, GroupId: group.id } });
         if (!reqUserGroup || !reqUserGroup.isAdmin) {
             return res.status(403).json({ message: 'You are not an admin of this group' });
         }

        const user = await User.findOne({ where: { username: username } });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Find the UserGroup association
        const userGroup = await UserGroup.findOne({ where: { UserId: user.id, GroupId: group.id } });
        if (userGroup) {
            userGroup.isAdmin = true;  // Set the user as admin
            await userGroup.save();    // Save the changes
            return res.status(200).json({ message: 'User promoted to admin successfully' });
        } else {
            return res.status(404).json({ message: 'User is not a member of the group' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'An error occurred while promoting user to admin' });
    }
};

exports.removeMember = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { groupName, username } = req.body;

        // Find the group by name
        const group = await Group.findOne({ where: { groupName: groupName } });
        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        // Find the user by username
        const user = await User.findOne({ where: { username: username } });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if the requester is an admin of the group
        const isAdmin = await group.isAdmin(req.user);
        if (!isAdmin) {
            return res.status(403).json({ message: 'You are not an admin of this group' });
        }

        // Remove the user from the group
        await group.removeUser(user, { transaction: t });

        await t.commit();
        res.status(200).json({ message: 'User removed from group successfully' });
    } catch (err) {
        await t.rollback();
        console.error(err);
        res.status(500).json({ message: 'An error occurred while removing the user from the group' });
    }
};


exports.addMember = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { groupName, username } = req.body;

        // Find the group by name
        const group = await Group.findOne({ where: { groupName: groupName } });
        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        // Find the user by username
        const user = await User.findOne({ where: { username: username } });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Associate the user with the group
        await group.addUser(user, { transaction: t });

        await t.commit();
        res.status(200).json({ message: 'User added to group successfully' });
    } catch (err) {
        await t.rollback();
        console.error(err);
        res.status(500).json({ message: 'An error occurred while adding the user to the group' });
    }
};


exports.createGroup=async(req,res)=>{
    const t = await sequelize.transaction();
    try {
        const {groupName}=req.body;    
        // Create the group
        const group = await Group.create({
            groupName: groupName
        }, { transaction: t });

        

        // Find the requesting user
        let requestingUser = await User.findByPk(req.user.id);
        
        // Associate the creator with the group as an admin
        await group.addUser(requestingUser, { through: { isAdmin: true }, transaction: t });

        await t.commit();
        res.status(200).json({ message: 'Group created successfully' });

    }catch(err){
        await t.rollback();
        console.log(err);
    }
}

exports.getGroup = async (req, res) => {
    try {
        const userId = req.user.id;

        const user = await User.findByPk(userId, {
            include: {
                model: Group,
                attributes: ['groupName','id'], // Only fetch the groupName attribute
                through: {
                    attributes: [] // Exclude the join table attributes
                }
            }
        });

        res.status(200).json(user.groups);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'An error occurred while fetching groups' });
    }
};

exports.getGroupMembers = async (req, res) => {
    try {
        const { groupName } = req.params;
        const userId = req.user.id;

        // Find the group by name
        const group = await Group.findOne({
            where: { groupName },
            
        });

        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        // Check if the requesting user is a member of the group
        const isMember = await group.hasUser(userId);
        if (!isMember) {
            return res.status(403).json({ message: 'You are not a member of this group' });
        }

        // const reqUser = await UserGroup.findOne({where: {UserId: req.user.id,GroupId: group.id}});
        
        // if (!reqUser.isAdmin) {
        //     const members = await group.getUsers({
        //         attributes: ['username'],
        //         through: {
        //             attributes: ['isAdmin']
        //         }
        //     });
                
        //     // Format response
        //     const usernames = members.map(member => ({
        //         username: member.username,
        //         Admin: member.UserGroup.isAdmin
        //     }));

        //     return res.status(200).json(usernames);
        // }

        // Fetch all users in the group along with their admin status
        const members = await group.getUsers({
            attributes: ['username'],
            through: {
                attributes: ['isAdmin']
            }
        });

        // Format response
        const usernames = members.map(member => ({
            username: member.username,
            Admin: member.UserGroup.isAdmin // Assuming the join table alias is UserGroup
        }));

        res.status(200).json(usernames);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'An error occurred while fetching group members' });
    }
};


