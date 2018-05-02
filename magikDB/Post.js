const mongoose = require('mongoose');
const Schema = require('mongoose').Schema;

const postSchema = new Schema({
    title: String,
    uri: String,
    published: Boolean,
    draft: Boolean,
    publishedDate: Date,
    description: String,
    tags: [String],
    blog: {
        type: Schema.Types.ObjectId,
        ref: 'Blog'
    }
});

const Post = mongoose.model('Post', postSchema);

module.exports = Post;
