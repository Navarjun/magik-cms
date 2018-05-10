const mongoose = require('mongoose');
const Schema = require('mongoose').Schema;
const MagikError = require('../helpers/MagikError');

const blogSchema = new Schema({
    title: { type: String, unique: true, required: true },
    uri: { type: String, unique: true, required: true },
    published: Boolean,
    tags: [String], // are part of meta-tags for a blog and posts in that blog
    description: String
}, {timestamps: true});

const Blog = mongoose.model('Blog', blogSchema);

Blog.findForUser = function (user, fields = 'title uri published tags description') {
    if (user.isSuperAdmin) {
        return Blog.find()
            .select(fields)
            .exec();
    } else {
        return Blog.find({_id: {$in: user.canAccessBlogs}})
            .select(fields)
            .exec();
    }
};

Blog.findByUri = function (uri) {
    return Blog.findOne({ uri: uri })
        .exec();
};

Blog.create = function (blog) {
    return new Blog(blog).save();
};

Blog.update = function (blog) {
    return new Promise(function (resolve, reject) {
        Blog.findByIdAndUpdate(blog._id, blog)
            .then(function (blog) {
                if (blog) {
                    resolve(blog);
                } else {
                    reject(new MagikError(404, 'Blog with id requested not found'));
                }
            }).catch(function (err) {
                reject(err);
            });
    });
};

Blog.delete = function (blogId) {
    return Blog.findByIdAndRemove(blogId)
        .exec();
};

module.exports = Blog;
