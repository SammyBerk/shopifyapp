var express = require('express');
var querystring= require('querystring');
var path = require('path');
var favicon = require('serve-favicon');
var shopifyAPI = require('shopify-node-api');

var shopify = new shopifyAPI({
  shop: 'rmc-preview',
  shopify_api_key: '6bc87421448b417934abb057276efcd3',
  shopify_shared_secret: 'd2b79721eee3aed2103378d6645d5261',
  shopify_scope: 'write_products',
  redirect_uri: 'http://rmc-preview.myshopify.com/',
  nonce: '' 
});

var config = {
  rate_limit_delay: 10000,
  backoff: 35,
  backoff_delay: 1000
};

var app = express();
var url = shopify.buildAuthURL();
app.use(express.static(path.join(__dirname, 'public')));

app.get('/finish_auth', function(req, res){
   var Shopify = new shopifyAPI(config), // You need to pass in your config here 
    query_params = req.query;
   Shopify.exchange_temporary_token(query_params, function(err, data){
  });
 
});

function callback(err, data, headers) {
  var api_limit = headers['http_x_shopify_shop_api_call_limit'];
  console.log( api_limit ); // "1/40" 
}

app.get('/favicon.ico', function(req, res) {
    res.send(204);
});



shopifyAPI.prototype.exchange_temporary_token = function(query_params, callback) {
 
   if (!self.is_valid_signature(query_params)) {
    return callback(new Error("Signature is not authentic!"));
  }
 }

app.post('/new_product', function(req, res) {
    data = {
     product: {
            title: req.body.title,
            body_html: req.body.body_html,
            images: [
                {
                    src: req.body.image_src
                }
            ],
            vendor: "Vendor",
            product_type: "Type"
        }
    }
    
	shopify.post('/admin/products.json', data, function(err, resp, headers) {
	  if(err) return next(error);
	  return res.json(resp);
	});
});


app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}


app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

var server_ip_address = '127.0.0.1';
app.set('port', process.env.PORT || 5000);
var server = app.listen(app.get('port'), server_ip_address, function() {
  console.log('Express server listening on port ' + server.address().port);
});

module.exports = app;

