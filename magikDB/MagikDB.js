const mongoose = require('mongoose');
const config = require('../magik.config');
const role = require('./Role');
const user = require('./User');
const page = require('./Page');
const staticPage = require('./Page');
const blog = require('./Blog');
const post = require('./Post');
const permission = require('./Permission');

mongoose.connect(config.database.uri);
mongoose.connection
    .on('error', console.error.bind(console, 'connection error:'));
mongoose.connection
    .on('open', function () {
        // we're connected
        user.initialSetup();
    });

module.exports = {
    role: role,
    user: user,
    page: page,
    staticPage: staticPage,
    blog: blog,
    post: post,
    permission: permission
};
