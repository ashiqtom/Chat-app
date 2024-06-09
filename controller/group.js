const { where } = require("sequelize");
const Group = require("../models/group");
const User = require("../models/user");
const sequelize = require('../util/database');



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


exports.postGroup=async(req,res)=>{
    const t = await sequelize.transaction();
    try {
        const {groupName}=req.body;    
        // Create the group
        const group = await Group.create({
            groupName: groupName,
        }, { transaction: t });

        // Find the requesting user
        let requestingUser = await User.findByPk(req.user.id);
        
        // Associate the requesting user with the group
        await group.addUser(requestingUser, { transaction: t });

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

                // Fetch all users in the group
        const members = await group.getUsers({
            attributes: ['username']
        });
        const usernames = members.map(member => ({
            username: member.username
        }));

        res.status(200).json(usernames);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'An error occurred while fetching group members' });
    }
};
