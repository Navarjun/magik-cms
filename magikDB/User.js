const mongoose = require('mongoose');
const Schema = require('mongoose').Schema;
const bcrypt = require('bcrypt');
const saltRounds = 10;

const userSchema = new Schema({
    name: String,
    username: String,
    email: String,
    password: String,
    roles: [{
        type: Schema.Types.ObjectId,
        ref: 'Role'
    }]
});
const User = mongoose.model('User', userSchema);

User.initialSetup = function (superAdmin) {
    return new Promise(function (resolve, reject) {
        User.find().count().exec()
            .then(function (count) {
                if (count === 0) {
                    bcrypt.hash('admin', saltRounds)
                        .then(function (hash) {
                            const user = new User({
                                name: 'admin',
                                username: 'admin',
                                email: 'admin@magik.com',
                                password: hash,
                                roles: [superAdmin._id]
                            });
                            user.save(function (err) {
                                if (err) {
                                    reject(err);
                                    return;
                                }
                                resolve(user);
                            });
                        })
                        .catch(function (err) {
                            reject(err);
                        });
                }
            })
            .catch(function (err) {
                reject(err);
            });
    });
};

User.addUser = function (name, username, email, password) {
    return new Promise(function (resolve, reject) {
        helpers.findWithEmail(email)
            .then(function (user) {
                if (user) {
                    resolve({ message: 'User already exists' });
                } else {
                    bcrypt.hash(password, saltRounds)
                        .then(function (hash) {
                            const user = new User({
                                name: name,
                                email: email,
                                username: username,
                                password: hash
                            });
                            user.save(function (err) {
                                if (err) {
                                    reject(err);
                                    return;
                                }
                                resolve(user);
                            });
                        })
                        .catch(function (err) {
                            reject(err);
                        });
                }
            })
            .catch(function (err) {
                reject(err);
            });
    });
};

const helpers = {
    findWithEmail: function (email) {
        return User.findOne({ email: email }).select('name username email').exec();
    }
};

module.exports = User;
