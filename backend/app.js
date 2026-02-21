require('dotenv').config();
const connectDB = require('./config/database');
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors');

// Existing routes
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var apiRouter = require('./routes/api');


// FleetFlow routes
var authRouter = require('./routes/auth');
var vehiclesRouter = require('./routes/vehicles');
var driversRouter = require('./routes/drivers');
var tripsRouter = require('./routes/trips');
var maintenanceRouter = require('./routes/maintenanceLogs');
var fuelRouter = require('./routes/fuelLogs');
var analyticsRouter = require('./routes/analytics');

// Connect to MongoDB
connectDB();

var app = express();

// Enable CORS - MUST BE EARLY
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// Middleware - MUST COME BEFORE ROUTES
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Legacy Routes
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/api', apiRouter);


// FleetFlow API Routes
app.use('/api/auth', authRouter);
app.use('/api/vehicles', vehiclesRouter);
app.use('/api/drivers', driversRouter);
app.use('/api/trips', tripsRouter);
app.use('/api/maintenance', maintenanceRouter);
app.use('/api/fuel', fuelRouter);
app.use('/api/analytics', analyticsRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;