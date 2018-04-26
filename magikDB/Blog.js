const mongoose = require('mongoose');
const Schema = require('mongoose').Schema;

const blogSchema = new Schema({
    name: String,
    uri: String,
    published: Boolean
});

const Blog = mongoose.model('Blog', blogSchema);

module.exports = Blog;
