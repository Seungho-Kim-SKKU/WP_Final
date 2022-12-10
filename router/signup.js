const express = require('express');
const path = require('path');
const router = express.Router();

router.get('/', function(req, res) {
    res.sendFile(path.join((__dirname + '/../public/html/signup.html')));
});

module.exports = router;