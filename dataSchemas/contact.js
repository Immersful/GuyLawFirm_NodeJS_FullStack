var mongoose = require("mongoose");

var contactData = new mongoose.Schema({
    lName: String,
    firstName: String,
    lastName: String,
    rFContact: String,
    message: String,
});

module.exports = mongoose.model("Contact", contactData);