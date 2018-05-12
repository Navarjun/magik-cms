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
    blogId: {
        type: Schema.Types.ObjectId,
        ref: 'Blog'
    },
    authorId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {timestamps: true});

const Post = mongoose.model('Post', postSchema);

Post.getById = function (id) {
    return Post.findOne({_id: id}).exec();
};

Post.findByBlogId = function (blogId, limit = 10, skip = 0) {
    return Post.find({blog: blogId})
        .limit(limit)
        .skip(skip)
        .exec();
};

Post.create = function (post) {
    post.uri = slugify(post.title, {lower: true, remove: /[$*_+~.()'"!\-:@]/g});
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

module.exports = Post;
