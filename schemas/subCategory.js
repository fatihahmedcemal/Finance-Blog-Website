const mongoose = require("mongoose");

const subcategorySchema = new mongoose.Schema({
    category: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model("Sub Categories", subcategorySchema);