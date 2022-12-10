const express = require('express');
const path = require('path');
const router = express.Router();

let user = null;

// by using 'ejs', dinamically render userinfo when load profile page
router.get('/', function(req, res) {
    user = req.session.user;
    // console.log(user);
    res.render('profile', {name: user.name, email: user.email, id:user.id});
});

module.exports = router;