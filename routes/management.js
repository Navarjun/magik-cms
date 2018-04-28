var express = require('express');
var router = express.Router();
var packageConfig = require('../package.json');
const Model = require('../magikDB/MagikDB');
const MagikError = require('../helpers/MagikError');

/* GET home page. */
router.get('/', function (req, res) {
    var welcome = { title: 'Management console of ' + packageConfig.name };
    if (req.session.user) {
        welcome = { title: '(li) Management console of ' + packageConfig.name };
    }
    res.render('management/index', welcome);
});

router.post('/login', function (req, res) {
    try {
        if (!req.body.password) {
            throw new MagikError(412, 'no password found');
        }
        if (!((req.body.email && !req.body.username) || (!req.body.email && req.body.username))) {
            // if both email and username exist
            // or if none exist
            throw new MagikError(412, 'One of username or email should be sent in the request');
        }
        var promise;
        if (req.body.username) {
            promise = Model.user.loginWithUsername(req.body.username, req.body.password);
        } else {
            promise = Model.user.loginWithEmail(req.body.email, req.body.password);
        }

        promise.then(function (user) {
            req.session.user = user;
            if (user) {
                res.status(200).send({ message: 'logged in successfully', user: user });
            } else {
                res.status(200).send({ message: 'Username/email didn\'t match', user: user });
            }
        }).catch(function (err) {
            req.session.user = undefined;
            res.status(401).send({ message: err.message });
        });
    } catch (err) {
        res.status(err.code).send({ message: err.message });
    }
});

module.exports = router;
