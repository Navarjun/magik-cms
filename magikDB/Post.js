const mongoose = require('mongoose');
const Schema = require('mongoose').Schema;
const MagikError = require('../helpers/MagikError');
const slugify = require('slugify');

const postSchema = new Schema({
    title: String,
    uri: String,
    published: Boolean,
    draft: Boolean,
    updated: Date,
    publishedDate: Date,
    description: String,
    tags: [String],
    blog: {
        type: Schema.Types.ObjectId,
        ref: 'Blog'
    }
}, {timestamps: true});

const Post = mongoose.model('Post', postSchema);

Post.findByBlogId = function (blogId, limit = 10, skip = 0) {
    return Post.find({blog: blogId})
        .limit(limit)
        .skip(skip)
        .exec();
};

Post.create = function (post) {
    post.uri = slugify(post.title, {lowercase: true, remove: /[$*_+~.()'"!\-:@]/g});
    post.updatedDate = new Date();
    return new Post(post).save();
};
Post.update = function (post) {
    return new Promise(function (resolve, reject) {
        Post.findByIdAndUpdate(post._id, post)
            .then(function (post) {
                if (post) {
                    resolve(post);
                } else {
                    reject(new MagikError(404, 'Post with id requested not found'));
                }
            }).catch(function (err) {
                reject(err);
            });
    });
};
Post.delete = function (postId) {
    return Post.findByIdAndRemove(postId)
        .exec();
};

Post.verify = function (post) {
    if (post.title && post.blog) {
        return true;
    }
    return false;
};
Post.invalidMessage = 'A post must contain a title and belong to a blog';

module.exports = Post;
