const mongoose = require('mongoose');
const Schema = require('mongoose').Schema;
const bcrypt = require('bcrypt');
const passwordSalt = bcrypt.genSaltSync(require('../magik.config').encryption.passwordSaltRounds);
const MagikError = require('../helpers/MagikError');

const userSchema = new Schema({
    name: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isSuperAdmin: { type: Boolean, default: false },
    canAccessUsers: { type: Boolean, default: false },
    canAccessBlogs: {
        type: [{
            type: Schema.Types.ObjectId,
            ref: 'blogs'
        }],
        default: []
    }
}, {timestamps: true});
const User = mongoose.model('User', userSchema);

User.initialSetup = function () {
    return new Promise(function (resolve, reject) {
        User.find().count().exec()
            .then(function (count) {
                if (count === 0) {
                    bcrypt.hash('admin', passwordSalt)
                        .then(function (hash) {
                            const user = new User({
                                name: 'admin',
                                username: 'admin',
                                email: 'admin@magik.com',
                                isSuperAdmin: true,
                                password: hash,
                                roles: []
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
        bcrypt.hash(password, passwordSalt)
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
    });
};

User.loginWithUsername = function (username, password) {
    return new Promise(function (resolve, reject) {
        helpers.getPasswordWithUsername(username)
            .then(function (hash) {
                if (!hash) {
                    throw new MagikError(404, 'Username not found');
                }
                bcrypt.compare(password, hash)
                    .then(function (res) {
                        if (res) {
                            helpers.findWithUsername(username)
                                .then(function (user) {
                                    if (!user) {
                                        throw new MagikError(404, 'Username not found');
                                    }
                                    resolve(user);
                                });
                        } else {
                            throw new MagikError(401, 'Invalid password');
                        }
                    }).catch(function (err) {
                        reject(err);
                    });
            }).catch(function (err) {
                reject(err);
            });
    });
};

User.loginWithEmail = function (email, password) {
    return new Promise(function (resolve, reject) {
        helpers.getPasswordWithEmail(email)
            .then(function (hash) {
                if (!hash) {
                    throw new MagikError(404, 'Email not found');
                }
                bcrypt.compare(password, hash)
                    .then(function (res) {
                        if (res) {
                            helpers.findWithEmail(email)
                                .then(function (user) {
                                    if (!user) {
                                        throw new MagikError(404, 'Email not found');
                                    }
                                    resolve(user);
                                });
                        } else {
                            throw new MagikError(401, 'Invalid password');
                        }
                    }).catch(function (err) {
                        reject(err);
                    });
            }).catch(function (err) {
                reject(err);
            });
    });
};

User.getAll = function (fields = 'name email username isSuperAdmin canAccessUsers canAccessBlogs') {
    return User.find().select(fields).exec();
};

User.get = function (id, fields = 'name email username isSuperAdmin canAccessUsers canAccessBlogs') {
    return User.findOne({_id: id}).select(fields).exec();
};

User.update = function (user) {
    return new Promise(function (resolve, reject) {
        User.findByIdAndUpdate(user._id, user)
            .then(function (user) {
                if (user) {
                    resolve(user);
                } else {
                    reject(new MagikError(404, 'User with id requested not found'));
                }
            }).catch(function (err) {
                reject(err);
            });
    });
};

User.delete = function (id) {
    return User.findByIdAndRemove(id)
        .exec();
};

const helpers = {
    findWithEmail: function (email, select = 'name username email isSuperAdmin') {
        return User.findOne({ email: email })
            .select(select)
            .exec();
    },
    findWithUsername: function (username, select = 'name username email isSuperAdmin') {
        return User.findOne({ username: username })
            .select(select)
            .exec();
    },
    getPasswordWithUsername: function (username) {
        return new Promise(function (resolve, reject) {
            helpers.findWithUsername(username, 'password')
                .then(function (user) {
                    resolve(user.password);
                }).catch(function (err) {
                    reject(new MagikError(500, err.message));
                });
        });
    },
    getPasswordWithEmail: function (email) {
        return new Promise(function (resolve, reject) {
            helpers.findWithEmail(email, 'password')
                .then(function (user) {
                    resolve(user.password);
                }).catch(function (err) {
                    reject(new MagikError(500, err.message));
                });
        });
    }
};

module.exports = User;
