const mongoose = require('mongoose');
const config = require('../magik.config');
const role = require('./Role');
const user = require('./User');
const page = require('./Page');

mongoose.connect(config.database.uri);
mongoose.connection
    .on('error', console.error.bind(console, 'connection error:'));
mongoose.connection
    .on('open', function () {
        // we're connected
    });

module.exports = {
    role: role,
    user: user,
    page: page
};
