const mongoose = require("mongoose");
const converSationDb = require("../models/conversationSchema");
const messageDb = require("../models/messagesSchema");

module.exports={
    createChat: async (req, res) => {
        try {
            const { senderUserId, reciverId } = req.body;
            console.log(senderUserId, reciverId);
            const converSation = await converSationDb.findOne({
                members: {
                    $all: [senderUserId, reciverId],
                },
            });

            if (!converSation) {
                const newConverSation = new converSationDb({
                    members: [senderUserId, reciverId],
                });
                const saveConverSation = await newConverSation.save();

                res.status(200).json({ saveConverSation });
            } else {
                res.status(200).json({ message: "Conversation already created" });
            }
        } catch (error) {
            console.error("Error:", error);
            res.status(500).json({ message: "An error occurred" });
        }
    },

    getChatList: async (req, res) => {
        try {
            // const chatlist = await converSationDb.find({members:{$in : req.query.userId}}).populate('members')
            const chatlist = await converSationDb.aggregate([
                {
                    $match: {
                        $expr: {
                            $in: [new mongoose.Types.ObjectId(req.query.userId), "$members"],
                        },
                    },
                },

                { $unwind: { path: "$members" } },
                {
                    $lookup: {
                        from: "userCollection",
                        localField: "members",
                        foreignField: "_id",
                        as: "memdersData",
                    },
                },
                { $project: { memdersData: 1 } },
            ]);

            res.status(200).json({ chatlist });
        } catch (error) {
            console.error("Error:", error);
            res.status(500).json({ message: "An error occurred" });
        }
    },

    createMessage: async (req, res) => {
        try {
            const { conversationId, sender, text } = req.body;
            const newMessage = new messageDb({
                conversationId,
                sender,
                text,
            });

            try {
                const savedMessage = await newMessage.save();

                res.status(200).json({ savedMessage });
            } catch (error) {
                res.status(500).json({ error: "internal servor error" });
            }
        } catch (error) {
            console.error("Error:", error);
            res.status(500).json({ message: "An error occurred" });
        }
    },
    getOldMessage: async (req, res) => {
        try {
            const messages = await messageDb.find({
                conversationId: req.query.converSation,
            });

            res.status(200).json(messages);
        } catch (error) {
            console.error("Error:", error);
            res.status(500).json({ message: "An error occurred" });
        }
    },
    addMesssage: async (req, res) => {
        try {
            const { from, to, message } = req.body;
            const data = await messageDb.create({
                message: { text: message },
                users: { from, to },
                sender: from,
            });
            if (data) return res.status(201).json({ msg: "Message added successfully" });
            return res.json({ msg: "faild to add message in datebase" });
        } catch (error) {
            console.error("Error:", error);
            res.status(500).json({ message: "An error occurred" });
        }
    },
}