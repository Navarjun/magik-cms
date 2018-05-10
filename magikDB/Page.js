const mongoose = require('mongoose');
const Schema = require('mongoose').Schema;
const MagikError = require('../helpers/MagikError');

const pageSchema = new Schema({
    name: String,
    uri: String,
    published: Boolean
}, {timestamps: true});

const Page = mongoose.model('Page', pageSchema);

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

module.exports = Page;
