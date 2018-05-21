var express = require('express');
var router = express.Router();
var Helper = require('../modules/helpers');

/* GET home page. */
router.get('/', function (req, res) {
    if (!req.session.logged_in) {
        res.redirect('login');
        return;
    }

    var helper = new Helper();

    res.render('index', {
        // XXX: グローバル参照
        room: Room,
        index_status: helper.index_status(Room)
    });
});

module.exports = router;