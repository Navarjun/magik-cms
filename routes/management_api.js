var express = require('express');
var router = express.Router();
const Model = require('../magikDB/MagikDB');
const MagikError = require('../helpers/MagikError');

router.use(function (req, res, next) {
    if (!req.session.user) {
        res.status(401).send({'message': 'You are not logged in'});
        return;
    }
    next();
});

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

router.get('/blogs', function (req, res) {
    Model.blog.findForUser(req.session.user)
        .then(function (blogs) {
            res.status(200).send({ message: 'success', data: blogs });
        }).catch(function (err) {
            err.code
                ? res.status(err.code)
                : res.status(500);
            res.send({message: err.message});
        });
});

router.post('/blog/create', function (req, res) {
    const blog = req.body;
    if (blog.title && blog.title !== '' &&
        blog.uri && /^\w+$/i.test(blog.uri)) {
        // TODO: manage ACL
        Model.blog.create(blog)
            .then(function (x) {
                console.log('x', x);
                blog._id = x._id;
                res.status(200).send({ message: 'success', data: {blog: x} });
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
});
router.post('/delete', function (req, res) {
    const type = req.body.type;
    const id = req.body.id;
    switch (type) {
    case 'blog':
        // TODO: manage ACL
        Model.blog.delete(id)
            .then(function (data) {
                if (!data) {
                    res.status(500).send({ message: 'Database Error' });
                    return;
                }
                res.status(200).send({ message: 'success' });
            }).catch(function (err) {
                res.status(500).send({ message: err.message });
            });
        break;
    default:
        res.status(400).send({ message: 'There is no entity ' + type });
    }
});

module.exports = router;
