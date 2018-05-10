const mongoose = require('mongoose');
const config = require('../magik.config');
const user = require('./User');
const page = require('./Page');
const blog = require('./Blog');
const post = require('./Post');
const navigation = require('./Navigation');
const container = require('./Container');

mongoose.connect(config.database.uri);
mongoose.connection
    .on('error', console.error.bind(console, 'connection error:'));
mongoose.connection
    .on('open', function () {
        // we're connected
        user.initialSetup();
    });

module.exports = {
    user: user,
    page: page,
    blog: blog,
    post: post,
    navigation: navigation,
    container: container
};
