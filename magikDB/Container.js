const mongoose = require('mongoose');
const Schema = require('mongoose').Schema;
const slugify = require('slugify');
const MagikError = require('../helpers/MagikError');

const schema = new Schema({
    title: { type: String, required: true },
    uri: { type: String, required: true, unique: true },
    containerURI: { type: String, required: true },
    published: { type: Boolean, default: false },
    tags: [String]
}, {timestamps: true});

const Model = mongoose.model('Container', schema);

Model.create = function (object) {
    object.uri = slugify(object.title, {lowercase: true});
    return new Model(object).save();
};

Model.get = function () {
    return Model.find().exec();
};

Model.update = function (container) {
    return new Promise(function (resolve, reject) {
        Model.findByIdAndUpdate(container._id, container)
            .then(function (container) {
                if (container) {
                    resolve(container);
                } else {
                    reject(new MagikError(404, 'Model with id requested not found'));
                }
            }).catch(function (err) {
                reject(err);
            });
    });
};

Model.delete = function (id) {
    return Model.findByIdAndRemove(id)
        .exec();
};

module.exports = Model;
