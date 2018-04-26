import { mongo } from 'mongoose';

const mongoose = require('mongoose');
const Schema = require('mongoose').Schema;

const pageSchema = new Schema({
    type: ['blog', 'static', 'gallery', 'containers'],
    active: Boolean,
    navigation: Boolean,
    navigationRank: Number
});

const Page = mongoose.model('page', pageSchema);

module.exports = Page;
