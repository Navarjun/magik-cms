var express = require('express');
var router = express.Router();
var Model = require('../magikDB/MagikDB');

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index', { title: 'Express' });
});

router.get('/:type/:uri', function (req, res, next) {
    const type = req.params.type;
    const uri = req.params.uri;
    switch (type) {
    case 'page':
        Model.page.findByUri(uri)
            .then(function (page) {
                if (page) {
                    res.render('page', {page: page});
                } else {
                    res.status(404);
                    next();
                }
            });
        break;
    default:
        res.status(200).send({message: `No entity of ${type} exists`});
    }
});

module.exports = router;
