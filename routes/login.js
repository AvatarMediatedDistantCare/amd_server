var express = require('express');
var router = express.Router();

/* GET login view */
router.get('/', function (req, res) {
    if (req.session.logged_in) {
        console.log("already logged in.");
        res.redirect('/');
        return;
    }
    res.render('login', {
        msg: {
            level: "warning",
            content: "You need to login."
        }
    });
}).post('/', function (req, res) {
    var password = req.body.key;
    var master_password = require('config').master_password;

    if (password != master_password) {
        res.render('login', {
            msg: {
                level: "danger",
                content: "Password is incorrect."
            }
        });
        return;
    }

    req.session.logged_in = true;
    res.redirect('/');
});

module.exports = router;
