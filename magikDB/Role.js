const mongoose = require('mongoose');
const Schema = require('mongoose').Schema;

const roleSchema = new Schema({
    name: String,
    ACL: []
});
const Role = mongoose.model('Role', roleSchema);

module.exports = Role;
