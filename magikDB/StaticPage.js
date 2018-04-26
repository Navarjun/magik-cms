const mongoose = require('mongoose');
const Schema = require('mongoose').Schema;

const staticPageSchema = new Schema({
    name: String,
    uri: String,
    published: Boolean
});

const Page = mongoose.model('StaticPage', staticPageSchema);

module.exports = Page;
