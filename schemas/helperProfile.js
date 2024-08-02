const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    profilePicture: {
        type: String
    },
    description: {
        type: String
    },
    occupation: {
        type: String
    },
    resume: { // could make a system to add a resume file
        type: Array
    },
    subCategory: {
        type: String,
    }
});

module.exports = mongoose.model("Profiles", userSchema);