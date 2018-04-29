var express = require('express');
var router = express.Router();
const Model = require('../magikDB/MagikDB');
const MagikError = require('../helpers/MagikError');

router.get('/roles', function (req, res) {
    if (req.session.user) {
        Model.user.get(req.session.user._id, 'roles')
            .then(function (user) {
                if (!user) {
                    res.status(404).send({ message: 'User not found' });
                    return;
                }
                res.status(200).send({ message: 'success', data: user });
            }).catch(function (err) {
                res.status(500).send({ message: err.message });
            });
    } else {
        res.status(401).send({'message': 'You are not logged in'});
    }
});

module.exports = router;
