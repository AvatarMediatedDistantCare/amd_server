var express = require('express');
var router = express.Router();

/* GET login view */
router.get('/:role/:console_type', function (req, res) {
    if (!req.session.logged_in) {
        res.redirect('/login');
    }

    var role = req.params.role;
    var console_type = req.params.console_type;


    if (role != "actor" && role != "observer" && role != "audience") {
        console.log("Invalid parameters");
        res.status(500).render();
    }
    if (role == "actor" && Room.is_actor_set()) {
        console.log("Actor already joined.");
        res.redirect('/');
    }
    if (role == "observer" && Room.is_observer_set()) {
        console.log("Observer already joined.");
        res.redirect('/');
    }

    var name_view = "room_for_" + console_type;

    res.render(name_view, {
        role: role
    });
});

module.exports = router;