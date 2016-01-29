var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();
var knex = require('./db/knex');

var http = require('http').Server(app);
var io = require('socket.io')(http);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);

// web sockets
io.on('connection', function(socket){
  socket.on('getData', function(){
    buildInitialData.then(function(data){
      io.emit('getData', data)
    })
  });
});

// console.log(buildInitialData());

function buildInitialData (){
  return getCommodityData('GC.1').then(function(gc){
    getCommodityData('SI.1').then(function(si){
      getCommodityData('HG.1').then(function(hg){
        var dataObject = {
          gc: gc,
          si: si,
          hg: hg
        }
        return (dataObject);
      })
    })
  })
}

function getCommodityData (commodity){
  return knex('commodities')
  .where('name', commodity)
  .orderBy('id', 'desc')
  .limit(10)
  .then(function(result){
    return result;
  })
}

// ck interval code to update commodity prices
setInterval(commoditiesUpdate, 10000);

function commoditiesUpdate(){
  var change = genPrices();
  getLastPriceDB('GC.1').then(function(gc){
    getLastPriceDB('SI.1').then(function(si){
      getLastPriceDB('HG.1').then(function(hg){
        writeCommodityToDB('GC.1', (gc.price*(1+change[0])).toFixed(2)).then(function(){
          writeCommodityToDB('SI.1', (si.price*(1+change[1])).toFixed(2)).then(function(){
            writeCommodityToDB('HG.1', (hg.price*(1+change[2])).toFixed(2)).then(function(){
              getLastPriceDB('GC.1').then(function(gc){
                getLastPriceDB('SI.1').then(function(si){
                  getLastPriceDB('HG.1').then(function(hg){
                    console.log('GC.1: ', gc.price, 'SI.1: ', si.price, 'HG.1: ', hg.price);
                  })
                })
              });
            })
          })
        });
      })
    })
  });
}

function genPrices(){
  var plusOrMinus = [
    Math.random() < 0.5 ? -1 : 1,
    Math.random() < 0.5 ? -1 : 1,
    Math.random() < 0.5 ? -1 : 1
  ]
  // console.log(plusOrMinus[0]);
  return [
    Math.random()/100*plusOrMinus[0],
    Math.random()/100*plusOrMinus[1],
    Math.random()/100*plusOrMinus[2]
  ]
}

function getLastPriceDB(commodity){
  return knex('commodities')
  .where('name', commodity)
  .orderBy('id', 'desc')
  .first('id', 'name', 'price', 'update')
  .then(function(result){
    return result;
  })
}

function writeCommodityToDB(commodity, price){
  return knex('commodities').insert({
    name: commodity,
    price: price,
    update: new Date()
  })
}



// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
