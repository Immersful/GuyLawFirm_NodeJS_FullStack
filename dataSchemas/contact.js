var mongoose = require("mongoose");

var contactData = new mongoose.Schema({
    lName: String,
    firstName: String,
    lastName: String,
    rFContact: String,
    message: String,
    // making it so I can user the contact data on a specific user
    duthor: {
        //getting the users id
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    }
});

module.exports = mongoose.model("Contact", contactData);