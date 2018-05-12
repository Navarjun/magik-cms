const mongoose = require('mongoose');
const Schema = require('mongoose').Schema;
const MagikError = require('../helpers/MagikError');
const slugify = require('slugify');

const pageSchema = new Schema({
    title: { type: String, required: true },
    uri: { type: String, required: true, unique: true },
    published: { type: Boolean, default: false },
    content: { type: String, default: '' }
}, {timestamps: true});

const Page = mongoose.model('Page', pageSchema);

Page.create = function (object) {
    object.uri = slugify(object.title, { lower: true });
    return new Page(object).save();
};

Page.get = function (fields = 'title uri published createdAt updatedAt') {
    return Page.find().select(fields).exec();
};

Page.update = function (page) {
    return new Promise(function (resolve, reject) {
        Page.findByIdAndUpdate(page._id, page)
            .then(function (obj) {
                if (obj) {
                    resolve(obj);
                } else {
                    reject(new MagikError(404, 'Post with id requested not found'));
                }
            }).catch(function (err) {
                reject(err);
            });
    });
};

Page.delete = function (id) {
    return Page.findByIdAndRemove(id)
        .exec();
};

Page.findByUri = function (uri, fields = 'title uri published createdAt updatedAt content') {
    return Page.findOne({uri: uri, published: true}).exec();
};

module.exports = Page;
