const mongoose = require('mongoose');
const Schema = require('mongoose').Schema;

const userSchema = new Schema({
    name: String,
    email: String,
    password: String,
    role: {
        type: Schema.Types.ObjectId,
        ref: 'Role'
    }
});
const User = mongoose.model('User', userSchema);

module.exports = User;
