const express = require("express");
const router = express.Router();

const Helpers = require("../schemas/helperProfile");
const User = require("../schemas/userSchema");
const Chat = require("../schemas/chatSchema");

const Message = require("../schemas/message");
const Meeting = require("../schemas/meeting");
const Contact = require("../schemas/contact");

const { v4: uuidv4 } = require('uuid');

router.get("/", async (req, res) => {
    const query = req.query.id;
    // contacts
    var chatsOfUser;
    var helperProfiles = []
    var contacts = []
    if(req.user.role == 'Helper') {
        chatsOfUser = await Chat.find({ helper: req.user.name });
        console.log("chats for helper", chatsOfUser);
        contacts = chatsOfUser;
        console.log("contacts for helper", contacts);
    } else if (req.user.role == 'Customer') {
        chatsOfUser = await Chat.find({ customer: req.user.name });
        console.log("chats for customer", chatsOfUser);
        for(let i = 0; i < chatsOfUser.length; i++) {
            const profile = await Helpers.findOne({ name: chatsOfUser[i].helper });
            helperProfiles.push(profile);
        }
        for(let i = 0; i < chatsOfUser.length; i++) {
            console.log("Profiles:"+ helperProfiles[i], "ID:"+ helperProfiles[i].id)
            var contact = new Contact(chatsOfUser[i].id, helperProfiles[i].id, helperProfiles[i].name);
            contacts.push(contact);
        }
        console.log("contacts for customer", contacts);
    } else {
        return res.redirect("/chat");
    }

    if(query) {
        const chat = await Chat.findById(query);
        const url = chat.id;
        return res.render("chat.ejs", { contacts, chat, url });
    } else {
        console.log(chatsOfUser + 'Hello!');
        return res.render("chat.ejs", { contacts, chat: false, url: "/chat" });
    }
});

router.get("/add", async (req, res) => {
    const query = req.query.id;

    const userProfile = await Helpers.findById(query);
    const user = await User.findOne({ email: userProfile.email });
    if(!user) return res.redirect("/");

    // create a new chat
    var chat = new Chat({
        helper: user.name,
        customer: req.user.name,
        messages: [],
        subCategory: userProfile.subCategory
    });

    try {
        chat = await chat.save();
        res.redirect("/chat");
    } catch (error) {
        console.log(error);
        res.redirect("/");
    }

});

router.get("/new-message", async (req, res) => {
    const id = req.query.id;
    const message = req.query.content;
    const user = req.user;

    var date = req.query.date;
    const time = req.query.time;
    const timeframe = req.query.timeframe;
    if(time && timeframe) {
        date = `${date} ${time} ${timeframe}`
    }
    

    const chat = await Chat.findById(id);
    if(!chat) return res.status(404).send("Error!");

    // check if it is a meeting request
    var messageType = 'Message';
    if(message == 'Meeting Request') {
        messageType = 'Meeting Request';
    }

    var updatedMessages = []

    const messages = chat.messages;
    messages.forEach(message => {
        updatedMessages.push(message);
    });

    var newMessage = new Message(message, user.email, messageType, date);
    updatedMessages.push(newMessage);

    try {
        await Chat.findByIdAndUpdate({ _id: chat.id }, { messages: updatedMessages })
    } catch (error) {
        return res.status(500).send("Error!");
    }
    
    const updatedChat = await Chat.findOne({ id: chat.id });
    return res.json({"messages": updatedChat.messages});
});

router.get("/request-accepted", async (req, res) => {
    console.log("Request Accepted!");
    const id = req.query.id;
    const date = req.query.date;
    const time = req.query.time;
    const timeframe = req.query.timeframe;
    const fullDate = `${date} ${time}${timeframe}`

    const chat = await Chat.findById(id);
    if(!chat) return res.status(404).send("Error!");

    var updatedMeetings = []

    if(typeof chat.meetings !== 'undefined') {
        const meetings = chat.meetings;
        meetings.forEach(meeting => {
            updatedMeetings.push(meeting);
        });    
    }

    // create a meeting link
    const uniqueId = uuidv4()
    const link = `/meeting/${chat.id}/${uniqueId}`;

    var newMeeting = new Meeting(fullDate, link, chat.helper, chat.customer, uniqueId);
    updatedMeetings.push(newMeeting);

    try {
        await Chat.findByIdAndUpdate({ _id: chat.id }, { meetings: updatedMeetings });
    } catch (error) {
        return res.status(500).send("Error!");
    }

    const updatedChat = await Chat.findOne({ id: chat.id });
    return res.json({"meetings": updatedChat.meetings});
});

router.get("/delete-request", async (req, res) => {
    const id = req.query.id;

    const chat = await Chat.findById(id);
    if(!chat) return res.status(404).send("Error!");

    var updatedMessages = []

    const messages = chat.messages;
    messages.forEach(message => {
        if(typeof message.meetingDate === 'undefined') {
            updatedMessages.push(message);
        }
    });

    try {
        await Chat.findByIdAndUpdate({ _id: chat.id }, { messages: updatedMessages });
    } catch (error) {
        return res.status(500).send("Error!");
    }
});

module.exports = router;