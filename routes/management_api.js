var express = require('express');
var router = express.Router();
const Model = require('../magikDB/MagikDB');
const MagikError = require('../helpers/MagikError');
const slugify = require('slugify');

router.use(function (req, res, next) {
    if (!req.session.user && req.method !== 'GET') {
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
            res.status(err.code || 500).send({message: err.message || 'Server error'});
        });
});

// GET LIST OF THINGS
router.get('/:type', function (req, res) {
    const type = req.params.type;
    switch (type) {
    case 'blog':
        Model.blog.findForUser(req.session.user)
            .then(function (blogs) {
                res.status(200).send({ blogs: blogs });
            }).catch(function (err) {
                err.code
                    ? res.status(err.code)
                    : res.status(500);
                res.send({message: err.message});
            });
        break;
    case 'post':
        if (req.query.blogId) {
            if (req.session.user.canAccessBlogs.indexOf(req.query.blogId) !== -1) {
                Model.post.findByBlogId(req.query.blogId, req.query.limit || 10, req.query.skip || 0)
                    .then(function (posts) {
                        res.status(200).send(posts);
                    }).catch(function (err) {
                        res.status(err.code || 500).send({message: err.message || 'Server error'});
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
                res.status(err.code || 500).send({message: err.message || 'Server error'});
            });
        break;
    case 'page':
        Model.page.get()
            .then(function (pages) {
                res.status(200).send({pages: pages});
            })
            .catch(function (err) {
                res.status(err.code || 500).send({message: err.message || 'Server error'});
            });
        break;
    case 'container':
        Model.container.get()
            .then(function (containers) {
                res.status(200).send({containers: containers});
            })
            .catch(function (err) {
                res.status(500).send({message: err.message});
            });
        break;
    case 'user':
        if (!req.session.user.canAccessUsers) {
            res.status(401).send({message: 'You are unauthorised to access users'});
            return;
        }
        Model.user.getAll()
            .then(function (users) {
                res.status(200).send({users: users});
            })
            .catch(function (err) {
                res.status(err.code || 500).send({message: err.message || 'Server error'});
            });
        break;
    default:
        res.status(400).send({ message: 'There is no entity ' + type });
    }
});

// GET SPECIFIC ITEM BY ID
router.get('/:type/:id', function (req, res) {
    const type = req.params.type;
    const id = req.params.id;

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
        Model.post.getById(id)
            .then(function (post) {
                if (req.session.user.canAccessBlogs.filter(d => { return post.blogId.equals(d); }).length !== 0 || post.authorId.equals(req.session.user._id)) {
                    res.status(200).send({post: post});
                } else {
                    res.status(401).send({message: 'You don\'t have access to this blog post'});
                }
            })
            .catch(function (err) {
                res.status(err.code || 500).send({message: err.message || 'Server error'});
            });
        break;
    case 'navigation':
        Model.navigation.get()
            .then(function (navigations) {
                res.status(200).send({navItems: navigations});
            })
            .catch(function (err) {
                res.status(err.code || 500).send({message: err.message || 'Server error'});
            });
        break;
    case 'page':
        Model.page
            .findById(id).exec()
            .then(function (page) {
                res.status(200).send({page: page});
            })
            .catch(function (err) {
                res.status(err.code || 500).send({message: err.message || 'Server error'});
            });
        break;
    case 'container':
        Model.container.get()
            .then(function (containers) {
                res.status(200).send({containers: containers});
            })
            .catch(function (err) {
                res.status(500).send({message: err.message});
            });
        break;
    case 'user':
        if (!req.session.user.canAccessUsers) {
            res.status(401).send({message: 'You are unauthorised to access users'});
            return;
        }
        Model.user.getAll()
            .then(function (users) {
                res.status(200).send({users: users});
            })
            .catch(function (err) {
                res.status(err.code || 500).send({message: err.message || 'Server error'});
            });
        break;
    default:
        res.status(400).send({ message: 'There is no entity ' + type });
    }
});

// FOR UPDATING THINGS
router.post('/:type', function (req, res) {
    const type = req.params.type;
    const object = req.body;
    switch (type) {
    case 'blog':
        if (req.session.user.canAccessBlogs.indexOf(object._id) === -1) {
            res.status(401).send({message: 'Unauthorised access'});
            return;
        }
        if (object.title) {
            object.uri = slugify(object.title, {lower: true});
        }
        Model.blog.update(object)
            .then(function (blog) {
                res.status(200).send({blog: blog});
            }).catch(function (err) {
                res.status(err.code || 500).send({ message: err.message || 'Server error' });
            });
        break;
    case 'post':
        Model.post.getById(req.body._id)
            .then(function (post) {
                if (post) {
                    if (req.session.user.canAccessBlogs.filter(d => { return post.blogId.equals(d); }).length === 0) {
                        res.status(401).send({message: 'Unauthorised access'});
                    } else {
                        Model.post.findById(object._id)
                            .then(function (post) {
                                if (!post) {
                                    res.status(404).send({message: 'Post id you are requesting doesn\'t exist'});
                                }
                                if (req.session.user.canAccessBlogs.filter(d => { return post.blogId.equals(d); }).length === 0 && (req.session.user._id + '' !== '' + post.authorId)) {
                                    res.status(401).send({message: 'Unauthorised request: current user doesn\'t have access to this post'});
                                } else {
                                    Model.post.update(object)
                                        .then(function (post) {
                                            res.status(200).send({post: post});
                                        }).catch(function (err) {
                                            res.send(500).send({message: err.message});
                                        });
                                }
                            })
                            .catch(function (err) {
                                res.status(err.code || 500).send({message: err.message || 'Server error'});
                            });
                    }
                } else {
                    res.status(404).send({message: 'Post id you requested wasn\'t found'});
                }
            })
            .catch(function (err) {
                res.status(err.code || 500).send({message: err.message || 'Server Error'});
            });
        break;
    case 'navigation':
        Model.navigation.update(object)
            .then(function (obj) {
                res.status(200).send({navigation: obj});
            })
            .catch(function (err) {
                res.status(err.code || 500).send({message: err.message || 'Server error'});
            });
        break;
    case 'page':
        Model.page.update(object)
            .then(function (obj) {
                res.status(200).send({page: obj});
            })
            .catch(function (err) {
                res.status(err.code || 500).send({message: err.message || 'Server error'});
            });
        break;
    case 'container':
        Model.container.update(object)
            .then(function (obj) {
                res.status(200).send({container: obj});
            })
            .catch(function (err) {
                res.status(err.code || 500).send({message: err.message || 'Server error'});
            });
        break;
    case 'user':
        if (!req.session.user.canAccessUsers) {
            res.status(401).send({message: 'Unauthorised request'});
            return;
        }
        Model.user.update(object)
            .then(function (obj) {
                res.status(200).send({user: obj});
            })
            .catch(function (err) {
                res.status(err.code || 500).send({message: err.message || 'Server error'});
            });
        break;
    default:
        res.status(400).send({ message: 'There is no entity ' + type });
    }
});

// INSERT NEW ITEMS
router.put('/:type', function (req, res, next) {
    const type = req.params.type;
    const object = req.body;

    switch (type) {
    case 'blog':
        if (object.title && object.title !== '') {
            object.uri = slugify(object.title, {lower: true});
            Model.blog.create(object)
                .then(function (x) {
                    Model.user.update({_id: req.session.user._id, canAccessBlogs: req.session.user.canAccessBlogs.concat([x._id])})
                        .then(function (user) {
                            req.session.user = user;
                            console.log(user);
                            res.status(200).send({blog: x});
                        }).catch(function (err) {
                            res.status(err.code || 500).send({message: err.message || 'Server error'});
                        });
                })
                .catch(function (err) {
                    res.status(err.code || 500).send({message: err.message || 'Server error'});
                });
        } else {
            res.status(412).send({ message: 'Request must have blog title and uri' });
        }
        break;
    case 'post':
        if (!object.title || !object.blogId) {
            res.status(400).send({message: 'title and blog are must to create a post'});
            return;
        }
        if (req.session.user.canAccessBlogs.indexOf(object.blogId) === -1) {
            res.send(401).send({message: 'Unauthorised request'});
            return;
        }
        object.authorId = req.session.user._id;
        Model.post.create(object)
            .then(function (obj) {
                res.status(200).send({post: obj});
            })
            .catch(function (err) {
                res.status(err.code || 500).send({message: err.message || 'Server error'});
            });
        break;
    case 'navigation':
        Model.navigation.create(object)
            .then((obj) => {
                res.status(200).send({navigation: obj});
            })
            .catch((err) => {
                res.status(err.code || 500).send({message: err.message || 'Server error'});
            });
        break;
    case 'page':
        Model.page.create(object)
            .then((obj) => {
                res.status(200).send({page: obj});
            })
            .catch((err) => {
                res.status(err.code || 500).send({message: err.message || 'Server error'});
            });
        break;
    case 'container':
        Model.container.create(object)
            .then((obj) => {
                res.status(200).send({container: obj});
            })
            .catch((err) => {
                res.status(err.code || 500).send({ message: err.message || 'Server Error' });
            });
        break;
    case 'user':
        if (!req.session.user.canAccessUsers) {
            res.status(401).send({message: 'Unauthorised request'});
            return;
        }
        Model.user.addUser(object.name, object.username, object.email, object.password)
            .then((obj) => {
                res.status(200).send({user: obj});
            })
            .catch((err) => {
                res.status(err.code || 500).send({message: err.message || 'Server error'});
            });
        break;
    default:
        res.status(400).send({ message: 'There is no entity ' + type });
    }
});

// delete things
router.delete('/:type', function (req, res) {
    const type = req.params.type;
    const id = req.body.id;

    switch (type) {
    case 'blog':
        if (req.session.user.canAccessBlogs.indexOf(id) !== -1) {
            Model.blog.delete(id)
                .then(function (x) {
                    Model.user.deleteBlog(id)
                        .then(function (x) {
                            res.status(200).send({ message: x });
                        }).catch(function (err) {
                            res.status(err.code || 500).send({ message: err.message || 'Server error' });
                        });
                })
                .catch(function (err) {
                    res.status(err.code || 500).send({ message: err.message || 'Server error' });
                });
        } else {
            res.status(401).send({ message: 'Unauthorised request' });
        }
        break;
    case 'post':
        Model.post.getById(id)
            .then(function (post) {
                if (!post) {
                    res.status(404).send({message: 'Post id you are requesting doesn\'t exist'});
                    return;
                }
                if (req.session.user.canAccessBlogs.filter(d => { return post.blogId.equals(d); }).length !== 0 || '' + post.authorId === '' + req.session.user._id) {
                    Model.post.delete(id)
                        .then(function () {
                            res.status(200).send({message: 'success'});
                        }).catch(function (err) {
                            res.status(err.code || 500).send({message: err.message || 'Server error'});
                        });
                } else {
                    res.status(401).send({message: 'Unauthorised request'});
                }
            })
            .catch(function (err) {
                res.status(err.code || 500).send({message: err.message || 'Server error'});
            });
        break;
    case 'navigation':
        Model.navigation.delete(id)
            .then(function (res) {
                res.status(200).send({message: 'success'});
            }).catch(function (err) {
                res.status(err.code || 500).send({message: err.message || 'Server error'});
            });
        break;
    case 'page':
        Model.page.delete(id)
            .then(function (x) {
                res.status(200).send({message: 'success'});
            }).catch(function (err) {
                res.status(err.code || 500).send({message: err.message || 'Server error'});
            });
        break;
    case 'container':
        Model.container.delete(id)
            .then(function (x) {
                res.status(200).send({message: 'success'});
            }).catch(function (err) {
                res.status(err.code || 500).send({message: err.message || 'Server error'});
            });
        break;
    case 'user':
        if (!req.session.user.canAccessUsers) {
            res.status(401).send({message: 'Unauthorised request'});
            return;
        }
        Model.navigation.delete(id)
            .then(function (x) {
                res.status(200).send({message: 'success'});
            }).catch(function (err) {
                res.status(err.code || 500).send({message: err.message || 'Server error'});
            });
        break;
    default:
        res.status(400).send({ message: 'There is no entity ' + type });
    }
});

module.exports = router;
