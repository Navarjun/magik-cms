const mongoose = require('mongoose');
const Schema = require('mongoose').Schema;
const bcrypt = require('bcrypt');
const passwordSalt = bcrypt.genSaltSync(require('../magik.config').encryption.passwordSaltRounds);
const MagikError = require('../helpers/MagikError');
const Role = require('./Role');

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
                    bcrypt.hash('admin', passwordSalt)
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
                }
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

User.get = function (id, fields = 'name email username roles') {
    if (Array.isArray(id)) {
        return new Promise(function (resolve, reject) {
            User.find({
                _id: { $in: id.map(d => mongoose.Types.ObjectId(d)) }
            }).select(fields)
                .exec()
                .then(function (users) {
                    if (!users) {
                        reject(new MagikError(404, 'User not found'));
                        return;
                    }
                    if (fields.indexOf('roles') !== -1) {
                        const usersWithRoles = [];
                        const getRoles = function (user) {
                            return new Promise(function (resolve, reject) {
                                if (user.roles && user.roles.length > 0) {
                                    Role.get(user.roles)
                                        .then(function (roles) {
                                            if (roles) {
                                                user.roles = roles;
                                            }
                                            usersWithRoles.push(user);
                                        })
                                        .catch(function (err) {
                                            reject(err);
                                        });
                                }
                            });
                        };
                        getRoles(users[0])
                            .then(function (users) {
                                if (!users) {
                                    reject(new MagikError(404, 'Users not found'));
                                }
                                resolve(users);
                            })
                            .catch(function (err) {
                                reject(err);
                            });
                    }
                }).catch(function (err) {
                    reject(err);
                });
        });
    } else {
        return new Promise(function (resolve, reject) {
            User.findById(id)
                .select(fields)
                .exec()
                .then(function (user) {
                    if (!user) {
                        reject(new MagikError(404, 'User not found'));
                        return;
                    }
                    if (fields.indexOf('roles') !== -1 && user.roles && user.roles.length > 0) {
                        Role.get(user.roles)
                            .then(function (roles) {
                                if (!roles) {
                                    reject(new MagikError(404));
                                }
                                user.roles = roles;
                                resolve(user);
                            })
                            .catch(function (err) {
                                reject(err);
                            });
                    }
                }).catch(function (err) {
                    reject(err);
                });
        });
    }
};

const helpers = {
    findWithEmail: function (email, select = 'name username email') {
        return User.findOne({ email: email })
            .select(select)
            .exec();
    },
    findWithUsername: function (username, select = 'name username email') {
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
    },
    getRoleWithId: function (roleId) {
        return Role.get(roleId);
    }
};

module.exports = User;
