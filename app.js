var express = require('express')
  , mongoose =  require('mongoose')
  , http = require('http')
  , path = require('path');
var app = module.exports = express.createServer();
app.use(express.cookieParser());
app.use(express.session({secret: '1234567890QWERTY'}));
var PW = require('./modules/pword');
mongoose.connect("mongodb://localhost/morre");

var LoggerSchema = new mongoose.Schema({
  email_address : String,
  password : String,
  first_name: String,
  last_name: String,
  date_joined: String,
  role : String
});

var posts = mongoose.model("posts",BlogPost);
var logger = mongoose.model("morre",LoggerSchema);


app.configure(function () {
	app.set ('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use( express.static( __dirname + '/public' ));
  app.use( express.logger());
  app.use( express.cookieParser());
  app.use( express.bodyParser());
  app.use( app.router );
  app.use( express.errorHandler({ dumpExceptions : true, showStack : true }));
});

app.get('/logout', function (req, res) {
	delete req.session.userId;
		res.redirect('/');
});

app.get('/', function (req, res, next ) {
if(!islogged(req.session.userId)){ //not logged in
	logger.
    find().
    exec( function ( err, logs ){
      if( err ) return next( err );

      res.render( 'index', {
          title : 'Home',
          logs : logs,
		  error:'',
		  usermail:req.session.userId
      });
    });
	}else{ //logged in
		logger.findOne({email_address:req.session.userId}, function(e, o){
			res.render( 'index', {
          title : 'Home',
          logs : o,
		  error:'',
		  usermail:req.session.userId
      });
		});
	}

});

app.post('/', function (req, res) { //login process
	logger.find({'email_address':req.body.email}).exec(function(err,logs){
		if(logs.length > 0){
			var sss = PW.getpassword(req.body.pword, logs[0].password);
			if(sss){
				req.session.userId = logs[0].email_address;
				res.redirect('/');
			}else{
			res.render( 'index', {
								  title : 'Home',
								  error:'invalid password',
								  usermail:req.session.userId
							  });
			}
		}else{
			res.render( 'index', {
								  title : 'Home',
								  error:'email does not exist',
								  usermail:req.session.userId
							  });
		}

	});
});

		function islogged(theid){
			return (theid);
		}

app.get('/reg', function (req, res, next ) {
	if(islogged(req.session.userId)) //check if logged in
		res.redirect('/');
			  res.render( 'register', {
				  title : 'Register',
				  error : '',
				  usermail:req.session.userId
			  });

});

app.post('/reg', function (req, res) {
logger.find({'email_address':req.body.email}).exec( function ( err, logg ){	//checking if email exists
	console.log(logg.length);
	if(logg.length < 1){
	
				PW.saltAndHash(req.body.pword, function(hash){ //hash the password
					new logger({
					  email_address    : req.body.email,
					  first_name: '',
					  last_name: '',
					  password    : hash,
					  date_joined : Date.now(),
					  role : '1'
				  }).save( function ( err, log, count ){
					if( err ) return next( err );
					//var sss = PW.getpassword('test', hash);


					res.redirect( '/' );
				  });
				});
	}else{
	//if email exist
		res.render( 'register', {
          title : 'logger db',
		  error : 'Sorry this Email is already used',
		  usermail:req.session.userId
      });
	}
	});
});

app.post('/update', function (req, res) {
	logger.findOne({email_address:req.session.userId}, function(e, o){
if (req.body.epword != ''){
	PW.saltAndHash(req.body.epword, function(hash){
				o.password = hash;
		});
}
		o.first_name = req.body.first_name,
		o.last_name = req.body.last_name
		o.save();
	});
		res.redirect('/');
});


app.listen(app.get('port')function () {
	console.log("Express server listening on port" +app.get('port'));

});