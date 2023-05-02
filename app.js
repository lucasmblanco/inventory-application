var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const mongoose = require("mongoose"); 
const methodOverride = require('method-override')
require('dotenv').config()


var indexRouter = require('./routes/index');
//var usersRouter = require('./routes/users');
const inventoryRouter = require('./routes/inventory')
const artistsRouter = require("./routes/artistsRoute"); 
const albumsRouter = require("./routes/albumsRoute"); 
const songsRouter = require("./routes/songsRoute"); 
const genreRouter = require("./routes/genresRoute"); 
const testRouter = require("./routes/testRoute"); 

var app = express();

//------ Connect with db -------



const db = process.env.MONGODB_URL|| dev_db_url; 
mongoose.set("strictQuery", false);
main().catch(err => console.log(err)); 

async function main(){
  await mongoose.connect(db)
}

// -----------------------------

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(methodOverride('_method')); 


app.use('/', indexRouter);
app.use('/inventory', inventoryRouter); 
app.use('/artists', artistsRouter); 
app.use('/albums', albumsRouter);
app.use('/songs', songsRouter);
app.use('/genres', genreRouter)


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
