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
    var postData = {
	  product: {
	    title: 'Dummy 151',
	    body_html: '<strong>Good T-Shirt!</strong>',
	    vendor: 'Nike',
	    product_type: 'T-Shirt',
	    variants: [
	      {
	        option1: 'First',
	        price: '10.00',
	        sku: '123'
	      },
	      {
	        option1: 'Second',
	        price: '20.00',
	        sku: '123'
	      }
	    ]
	  }
	};

	shopify.post('/admin/products.json', postData, function(err, resp, headers) {
	  console.log(data); // Data contains product json information 
	  console.log(headers); // Headers returned from request 
	  // if(err) throw err;
	  // return res.json(resp);
	});
});

app.post('/orders', function(req, res) {
    var postData = {
	  product: {
	    title: 'Dummy 151',
	    body_html: '<strong>Good T-Shirt!</strong>',
	    vendor: 'Nike',
	    product_type: 'T-Shirt',
	    variants: [
	      {
	        option1: 'First',
	        price: '10.00',
	        sku: 123
	      },
	      {
	        option1: 'Second',
	        price: '20.00',
	        sku: '123'
	      }
	    ]
	  }
	};

	shopify.post('/admin/orders.json', postData, function(err, resp) {
	  // if(err) throw err;
	  // return res.json(resp);
	  console.log(data); // Data contains product json information 
	  console.log(headers);
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
    });
}


app.use(function(err, req, res, next) {
    res.status(err.status || 500);
});

var server_ip_address = '127.0.0.1';
app.set('port', process.env.PORT || 5000);
var server = app.listen(app.get('port'), server_ip_address, function() {
  console.log('Express server listening on port ' + server.address().port);
});

module.exports = app;

