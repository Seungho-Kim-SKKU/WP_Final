// packages
const express = require('express');
const cookieParser = require('cookie-parser');
const sessions = require('express-session');
const http = require('http');
var parseUrl = require('body-parser');
const path = require('path');

var mysql = require('mysql');

const app = express();
const port = 3000;

app.use(express.static('public'));

app.set('views', './public/html');
app.set('view engine', 'ejs');

let encodeUrl = parseUrl.urlencoded({ extended: false});

var router = express.Router();

// session middleware
app.use(
    sessions({
        secret: "secretkey_web_programming",
        saveUninitialized: true,
        cookie: { maxAge: 1000 * 60 * 60 * 24 },
        resave: false
    })
);

app.use(cookieParser());

// mysql setting
var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "1234",
    database: "wp"
});

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/html/login.html');
});

// by using session, allow or not to connect main.html page
app.get('/main', (req, res) => {
    if (req.session.user) {
        res.sendFile(__dirname + '/public/html/main.html');
    }
    else {
        res.redirect('/login');
    }
});


// expire session when logout
app.get('/logout', (req, res) => {    
    req.session.destroy(function() {
        req.session;
    })
    res.redirect('/');    
});


// using router for other pages
const login = require('./router/login');
app.use('/login', login);

const signup = require('./router/signup');
app.use('/signup', signup);

// const main = require('./router/main');
// app.use('/main', main);

const pwgen = require('./router/pwgen');
app.use('/pwgen', pwgen);

const profile = require('./router/profile');
app.use('/profile', profile);

const hash = require('./router/hash');
const session = require('express-session');
app.use('/hash', hash);

// post for signup 
app.post('/sign-up', encodeUrl, (req, res) => {
    var name = req.body.name;
    var email = req.body.email;
    var id = req.body.id;
    var pw = req.body.pw;

    // signup query, store data in mysql database
    con.query(`SELECT * FROM users WHERE username = '${id}'`, function(err, result) {
        console.log(result);
        if (err) {
            console.log(err);
        }
        if (Object.keys(result).length > 0) {
            res.send("<script>window.location.href = '/signup'; alert('This ID already exists. Please use a different ID.');</script>");
        }
        else {
            var sql = `INSERT INTO users (name, email, username, pw) VALUES ('${name}', '${email}', '${id}', '${pw}')`;
            con.query(sql, function (err, result) {
                if (err) {
                    console.log(err);
                }
                else {
                    res.redirect('/login');
                }
            });
        }
    });
});

// post for login
app.post("/log-in", encodeUrl, (req, res) => {
    var id = req.body.id;
    var pw = req.body.pw;

    // find user info in mysql database
    con.query(`SELECT * FROM users WHERE username = '${id}' AND pw = '${pw}'`, function(err, result) {
        if (err) {
            console.log(err);
        }

        function user() {
            req.session.user = {
                name: result[0].username,
                email: result[0].email,
                id: id,
                pw: pw
            }
        }       

        if (Object.keys(result).length > 0) {
            user();
            res.send("<script>window.location.href = '/main';</script>");            
        }
        else {
            res.send("<script>window.location.href = '/login'; alert('Unregistered user. Please check.');</script>");
        }
    });
});

app.listen(port, () => {
    console.log("Server running on port 3000");
});