const mongoose = require('mongoose');
const Schema = require('mongoose').Schema;
const MagikError = require('../helpers/MagikError');

const pageSchema = new Schema({
    name: { type: String, required: true },
    uri: { type: String, required: true, unique: true },
    published: { type: Boolean, default: false }
}, {timestamps: true});

const Page = mongoose.model('Page', pageSchema);

Page.create = function (object) {
    return new Page(object).save();
};

Page.get = function () {
    return Page.find().exec();
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

module.exports = Page;
