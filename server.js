// express is a web framework library
const express = require('express');
// bodyParser is a library used for reading form data.
const bodyParser = require('body-parser');
// morgan helps read all the request made by users like get/post
const morgan = require('morgan');
const async = require('async');
// request is used for fetching data from 3rd parties
const request = require('request');
// handlebars is a templating engine
const expressHbs = require('express-handlebars');
const session = require('express-session');
const MongoStore = require('connect-mongo') (session);
// this is for flash messages 
const flash = require('express-flash');


// instantiating the express framework
const app = express()

// mongodb://<dbuser>:<dbpassword>@ds161584.mlab.com:61584/mvpdb

// app middlewares
// this is like the base.html in django. The base layout of every layout.
app.engine('.hbs', expressHbs({ defaultLayout: 'layout', extname: '.hbs'}));
app.set('view engine', 'hbs');
// this middleware helps node know where to find css and js files.
app.use(express.static(__dirname + '/public'));
// this is used for reading json data formats
app.use(bodyParser.json());
// this is used for reading different file formats
app.use(bodyParser.urlencoded({extended: false}));
app.use(morgan('dev'));
app.use(session({
	resave: true,
	saveUninitialized: true,
	secret: "thisisasecret",
	store: new MongoStore({ url:'mongodb://test:abc123@ds161584.mlab.com:61584/mvpdb'})
}));
app.use(flash());

// app routes
// mailchimp api-key: 6c865c8ec33206094d60b26e159312d6-us17
// 'https://us17.api.mailchimp.com/3.0/'
// lists/d787f0d000/members
app.route('/')
	.get((req, res, next) => {
		res.render('main/index', { message: req.flash('success')});
	})
	.post((req, res, next) => {
		// capturing users email
		// console.log(req.body.email);
		request({
			url: 'https://us17.api.mailchimp.com/3.0/lists/d787f0d000/members',
			method: 'POST',
			headers: {
				'Authorization': 'randomUser 6c865c8ec33206094d60b26e159312d6-us17',
				'Content-Type': 'application/json'
			}, 
			json: {
				'email_address': req.body.email,
				'status': 'subscribed'
			}
		}, function(err, response, body){
			if (err) {
				console.log(err);
			} else {
				req.flash('success', 'You have successfully subscribed!');
				res.redirect('/');
			}
		});
	});

// Session = stores memory while that session lasts and to extend that
// data life span we use mongodb or redis

// listening port
app.listen(3030, (err) => {
	if (err) {
		console.log(err);
	} else {
		console.log("Running on port 3030...");
	}
});