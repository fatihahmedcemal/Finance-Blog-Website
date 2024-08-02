const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema({
    helper: {
        type: String,
        required: true,
    },
    customer: {
        type: String,
        required: true
    },
    messages: {
        type: Array,
        required: true
    },
    meetings: {
        type: Array
    },
    subCategory: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model("Chats", chatSchema);