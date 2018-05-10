var express = require('express');
var router = express.Router();
const Model = require('../magikDB/MagikDB');
const MagikError = require('../helpers/MagikError');
const slugify = require('slugify');

router.use(function (req, res, next) {
    if (!req.session.user) {
        res.status(401).send({'message': 'You are not logged in'});
        return;
    }
    next();
});

// GET user's own profile
router.get('/user/profile', function (req, res) {
    Model.user.get(req.session.user._id)
        .then(function (user) {
            if (!user) {
                res.status(404).send({ message: 'User not found' });
                return;
            }
            res.status(200).send({ message: 'success', data: user });
        }).catch(function (err) {
            if (err.code) {
                res.status(err.code);
            }
            res.send({ message: err.message });
        });
});

router.get('/:type', function (req, res) {
    const type = req.params.type;
    switch (type) {
    case 'blog':
        Model.blog.findForUser(req.session.user)
            .then(function (blogs) {
                res.status(200).send({ message: 'success', data: blogs });
            }).catch(function (err) {
                err.code
                    ? res.status(err.code)
                    : res.status(500);
                res.send({message: err.message});
            });
        break;
    case 'post':
        if (req.query.blogId) {
            if (req.session.user.canAccessBlogs.contains(req.query.blogId)) {
                Model.post.findByBlogId(req.query.blogId)
                    .then(function (posts) {
                        res.status(200).send(posts);
                    }).catch(function (err) {
                        res.status(500).send({message: err.message});
                    });
            } else {
                res.send(401).send({message: 'You don\'t have access to this blog'});
            }
        } else {
            res.status(400).send({message: 'BlogId required to fetch blog posts'});
        }
        break;
    case 'navigation':
        Model.navigation.get()
            .then(function (navigations) {
                res.status(200).send({navItems: navigations});
            })
            .catch(function (err) {
                res.status(500).send({message: err.message});
            });
        break;
    case 'page':
        Model.page.get()
            .then(function (navigations) {
                res.status(200).send({navItems: navigations});
            })
            .catch(function (err) {
                res.status(500).send({message: err.message});
            });
        break;
    case 'container':
        Model.container.get()
            .then(function (navigations) {
                res.status(200).send({navItems: navigations});
            })
            .catch(function (err) {
                res.status(500).send({message: err.message});
            });
        break;
    case 'user':
        if (!req.session.user.canAccessUsers) {
            res.status(401).send({message: 'You are unauthorised to access users'});
        }
        Model.user.getAll()
            .then(function (navigations) {
                res.status(200).send({navItems: navigations});
            })
            .catch(function (err) {
                res.status(500).send({message: err.message});
            });
        break;
    default:
        res.send({message: 'Working on it'});
    }
});

// FOR UPDATING THINGS
router.post('/:type', function (req, res) {
    const type = req.body.type;
    const object = req.body.object;
    switch (type) {
    case 'blog':
        if (!req.session.user.canAccessBlogs.contains(object._id || object.id)) {
            res.status(401).send({message: 'Unauthorised access'});
        }
        if (object.title) {
            object.uri = slugify(object.title, {lowercase: true});
        }
        Model.blog.update(object);
        break;
    case 'post':
        if (object.blog) {
            if (!req.session.user.canAccessBlogs.contains(object.blog)) {
                res.status(401).send({message: 'Unauthorised access'});
            }
        } else {
            Model.post.findById(object._id)
                .then(function (post) {
                    if (!post) {
                        res.status(404).send({message: 'Post id you are requesting doesn\'t exist'});
                    }
                    if (!req.session.user.canAccessBlogs.contains(post.blog)) {
                        Model.post.update(object)
                            .then(function (post) {
                                res.status(200).send({post: post});
                            }).catch(function (err) {
                                res.send(500).send({message: err.message});
                            });
                    }
                })
                .catch(function (err) {
                    res.status(500).send({message: err.message});
                });
        }
        break;
    case 'navigation':
        Model.navigation.update(object)
            .then(function (obj) {
                res.status(200).send({navigation: obj});
            })
            .catch(function (err) {
                res.status(500).send({message: err.message});
            });
        break;
    case 'page':
        Model.page.update(object)
            .then(function (obj) {
                res.status(200).send({page: obj});
            })
            .catch(function (err) {
                res.status(500).send({message: err.message});
            });
        break;
    case 'container':
        Model.container.update(object)
            .then(function (obj) {
                res.status(200).send({container: obj});
            })
            .catch(function (err) {
                res.status(500).send({message: err.message});
            });
        break;
    case 'user':
        if (!req.session.user.canAccessUsers) {
            res.status(401).send({message: 'Unauthorised request'});
            return;
        }
        Model.user.update(object)
            .then(function (obj) {
                res.status(200).send({navigation: obj});
            })
            .catch(function (err) {
                res.status(500).send({message: err.message});
            });
        break;
    default:
        res.status(400).send({ message: 'There is no entity ' + type });
    }
});

// INSERT NEW ITEMS
router.put('/:type', function (req, res) {
    const type = req.body.type;
    const object = req.body.object;

    switch (type) {
    case 'blog':
        if (object.title && object.title !== '') {
            Model.blog.create(object)
                .then(function (x) {
                    Model.user.update({_id: req.session.user._id, canAccessBlogs: req.session.user.canAccessBlogs.push(x._id)})
                        .then(function () {
                            res.status(200).send({ message: 'success', data: {blog: x} });
                        }).catch(function () {
                            res.status(500).send({ message: 'Error adding user to the blog, please ask admin' });
                        });
                })
                .catch(function (err) {
                    if (err && err.toJSON && err.toJSON() && err.toJSON().code && err.toJSON().code === 11000) {
                        res.status(409).send({ message: 'Title and uri of the blog you are trying to create must be unique' });
                    }
                    res.status(500).send({ message: 'Database Error' });
                });
        } else {
            res.status(412).send({ message: 'Request must have blog title and uri' });
        }
        break;
    case 'post':
        if (!object.title || object.blog) {
            res.status(400).send({message: 'title and blog are must to create a post'});
            return;
        }
        if (!req.session.user.canAccessBlogs.contains(object.blog)) {
            res.send(401).send({message: 'Unauthorised request'});
        }
        Model.post.create(object)
            .then(function (obj) {
                res.status(200).send({post: obj});
            })
            .catch(function (err) {
                res.status(500).send({ message: err.message });
            });
        break;
    case 'navigation':
        Model.navigation.create(object)
            .then((obj) => {
                res.status(200).send({navigation: obj});
            })
            .catch((err) => {
                res.status(500).send({ message: err.message });
            });
        break;
    case 'page':
        Model.page.create(object)
            .then((obj) => {
                res.status(200).send({page: obj});
            })
            .catch((err) => {
                res.status(500).send({ message: err.message });
            });
        break;
    case 'container':
        Model.container.create(object)
            .then((obj) => {
                res.status(200).send({container: obj});
            })
            .catch((err) => {
                res.status(500).send({ message: err.message });
            });
        break;
    case 'user':
        if (!req.session.user.canAccessUsers) {
            res.status(401).send({message: 'Unauthorised request'});
            return;
        }
        Model.user.create(object)
            .then((obj) => {
                res.status(200).send({user: obj});
            })
            .catch((err) => {
                res.status(500).send({ message: err.message });
            });
        break;
    }
});

// delete things
router.delete('/:type', function (req, res) {
    const type = req.body.type;
    const id = req.body.id;

    switch (type) {
    case 'blog':
        if (req.session.user.canAccessBlogs.contains(id)) {
            Model.blog.delete(id)
                .then(function (x) {
                    Model.user.delete(id)
                        .then(function () {
                            res.status(200).send({message: 'success'});
                        }).catch(function () {
                            res.status(500).send({ message: 'Error adding user to the blog, please ask admin' });
                        });
                })
                .catch(function (err) {
                    res.status(500).send({ message: err.message });
                });
        } else {
            res.status(401).send({ message: 'Unauthorised request' });
        }
        break;
    case 'post':
        Model.post.delete(id)
            .then(function (post) {
                if (!post) {
                    res.status(404).send({message: 'Post id you are requesting doesn\'t exist'});
                }
                if (!req.session.user.canAccessBlogs.contains(post.blog)) {
                    Model.post.delete(id)
                        .then(function (post) {
                            res.status(200).send({message: 'success'});
                        }).catch(function (err) {
                            res.send(500).send({message: err.message});
                        });
                } else {
                    res.status(401).send({message: 'Unauthorised request'});
                }
            })
            .catch(function (err) {
                res.status(500).send({message: err.message});
            });
        break;
    case 'navigation':
        Model.navigation.delete(id)
            .then(function (res) {
                res.status(200).send({message: 'success'});
            }).catch(function (err) {
                res.status(500).send({message: err.message});
            });
        break;
    case 'page':
        Model.page.delete(id)
            .then(function (res) {
                res.status(200).send({message: 'success'});
            }).catch(function (err) {
                res.status(500).send({message: err.message});
            });
        break;
    case 'container':
        Model.container.deleteMany(id)
            .then(function (res) {
                res.status(200).send({message: 'success'});
            }).catch(function (err) {
                res.status(500).send({message: err.message});
            });
        break;
    case 'user':
        if (!req.session.user.canAccessUsers) {
            res.status(401).send({message: 'Unauthorised request'});
            return;
        }
        Model.navigation.deleteMany(id)
            .then(function (res) {
                res.status(200).send({message: 'success'});
            }).catch(function (err) {
                res.status(500).send({message: err.message});
            });
        break;
    }
});

module.exports = router;
