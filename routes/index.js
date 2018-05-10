var express = require('express');
var router = express.Router();
var Model = require('../magikDB/MagikDB');

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index', { title: 'Express' });
});

router.get('/blog/:blogUri', function (req, res, next) {
    var limit = req.query.limit || 10,
        skip = req.query.skip || 0;
    Model.blog.findByUri(req.params.blogUri)
        .then(function (blog) {
            if (blog) {
                Model.post.findByBlogId(blog._id, limit, skip)
                    .then(function (posts) {
                        if (posts) {
                            res.render('blog', { blog: blog, posts: posts });
                        } else {
                            res.status(404).send({ message: 'Blog you are requesting doesn\'t have any posts' });
                        }
                    }).catch(function (err) {
                        res.status(500).send({ message: err.message });
                    });
            } else {
                res.status(404).send({ message: 'Blog you are requesting not found' });
            }
        }).catch(function (err) {
            res.status(500).send({ message: err.message });
        });
});

module.exports = router;
