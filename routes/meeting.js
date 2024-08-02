const express = require("express");
const router = express.Router();

const Chat = require("../schemas/chatSchema");

// meeting url
router.get("/:chatId/:meetingId", async (req, res) => {
    const chatId = req.params.chatId;
    const chat = await Chat.findById(chatId);
    const meetingId = req.params.meetingId;
    if(!chatId || !chat || !meetingId) return res.redirect("/account/meetings");

    const meetings = chat.meetings;
    var meeting = null;
    meetings.forEach(meeting => {
        if(meeting.id == meetingId) {
            meeting = meeting;
        }
    });

    res.render("meeting.ejs", { chat, meeting });
});

module.exports = router;