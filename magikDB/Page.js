const mongoose = require('mongoose');
const Schema = require('mongoose').Schema;

const pageSchema = new Schema({
    name: String,
    uri: String,
    published: Boolean
});

const Page = mongoose.model('Page', pageSchema);

module.exports = Page;
