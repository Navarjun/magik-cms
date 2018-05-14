const mongoose = require('mongoose');
const Schema = require('mongoose').Schema;
const MagikError = require('../helpers/MagikError');
const slugify = require('slugify');

const postSchema = new Schema({
    title: { type: String, required: true },
    uri: { type: String, required: true },
    published: { type: Boolean, default: false },
    publishedDate: { type: Date, default: function () { return this.published ? Date.now() : null; } },
    description: { type: String, default: '' },
    tags: { type: [String], default: [] },
    blogId: {
        type: Schema.Types.ObjectId,
        ref: 'Blog',
        required: true
    },
    authorId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    content: String
}, {timestamps: true});

const Post = mongoose.model('Post', postSchema);

Post.getById = function (id) {
    return Post.findOne({_id: id}).exec();
};

Post.findByBlogId = function (blogId, limit = 10, skip = 0) {
    return Post.find({blogId: blogId})
        .limit(limit)
        .skip(skip)
        .exec();
};

Post.create = function (object) {
    object.uri = slugify(object.title, {lower: true, remove: /[$*_+~.()'"!\-:@]/g});
    if (object['tags[]']) {
        if (Array.isArray(object['tags[]'])) {
            object.tags = object['tags[]'];
        } else {
            object.tags = [object['tags[]']];
        }
    }
    return new Post(object).save();
};
Post.update = function (post) {
    return new Promise(function (resolve, reject) {
        if (post['tags[]']) {
            if (Array.isArray(post['tags[]'])) {
                post.tags = post['tags[]'];
            } else {
                post.tags = [post['tags[]']];
            }
        }
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
