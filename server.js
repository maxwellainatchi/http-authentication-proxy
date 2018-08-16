let Express = require("express");
let session = require("express-session");
let uuid = require("uuid/v4");
const FileStore = require('session-file-store')(session);
const bodyParser = require('body-parser');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const fs = require("fs");
const crypto = require("crypto");
const httpProxy = require("http-proxy");
let path = require('path');

let userInfo = fs.readFileSync("./password.txt").toString().split("\n");
let user = {
	username: userInfo[0],
	passwordHash: userInfo[1]
};

// configure passport.js to use the local strategy
passport.use(new LocalStrategy({ usernameField: 'username' },
	(username, password, done) => {
		let passwordHash = crypto.createHash("sha256").update(password).digest("hex");
		let sanitize = s => s.trim().toLowerCase() 
		if (sanitize(username) === sanitize(user.username) && sanitize(passwordHash) === sanitize(user.passwordHash)) {
			return done(null, user);
		}
		return done(null, null);
	}
));

passport.serializeUser((user, done) => {
	done(null, user.username);
});

passport.deserializeUser((username, done) => {
	if (username === user.username) {
		return done(null, user)
	}
	return done(null, false)
});  

let target = process.env.PROXY_TARGET;
var proxy = httpProxy.createProxyServer({});

let app = Express();

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(session({
	genid: (req) => {
		return uuid() // use UUIDs for session IDs
	},
	store: new FileStore(),
	secret: 'keyboard cat',
	resave: false,
	saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
	console.log(`HTTP ${req.httpVersion} ${req.method} ${req.originalUrl}`);
	next();
})

app.get('/login.css', (req, res) => {
	res.sendFile(path.normalize(__dirname + '/login.css'));
})

app.get('/login', (req, res) => {
	if (req.isAuthenticated()) {
		return res.redirect("/");
	}
	res.sendFile(path.normalize(__dirname + '/login.html'));
})

app.post('/login', passport.authenticate("local"), (req, res, next) => {
	res.redirect("/")
})
  
app.use((req, res, next) => {
	if (!req.isAuthenticated()) {
		return res.redirect("/login");
	}
	proxy.web(req, res, { target });
})

app.use((err, req, res, next) => {
	console.error(err);
	res.sendStatus(500);
})

let port = process.env.PORT || 3000;
app.listen(port, () => {
	console.log('Listening on localhost:' + port)
})
