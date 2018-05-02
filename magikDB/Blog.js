const mongoose = require('mongoose');
const Schema = require('mongoose').Schema;

const blogSchema = new Schema({
    title: { type: String, unique: true },
    uri: { type: String, unique: true },
    published: Boolean,
    tags: [String], // are part of meta-tags for a blog and posts in that blog
    description: String
});

const Blog = mongoose.model('Blog', blogSchema);

Blog.findForUser = function (user, fields = 'title uri published tags description') {
    if (user.isSuperAdmin) {
        return Blog.find()
            .select(fields)
            .exec();
    }
    // TODO: handle other permissions
};

Blog.create = function (blog) {
    return new Blog(blog).save();
};
Blog.delete = function (blogId) {
    return Blog.findByIdAndRemove(blogId)
        .exec();
};

module.exports = Blog;
