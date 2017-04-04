var express = require('express');
var querystring= require('querystring');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var crypto = require('crypto');
var bodyParser = require('body-parser');
var request = require('request');
var config = require('./settings')
var session = require('express-session')
var app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({secret: 'keyboard cat'}));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/shopify_auth', function(req, res) {
    if (req.query.shop) {
        req.session.shop = req.query.shop;
        res.render('embedded_app_redirect', {
            shop: req.query.shop,
            api_key: config.oauth.api_key,
            scope: config.oauth.scope,
            redirect_uri: config.oauth.redirect_uri
        });
    }
})

app.get('/access_token', verifyRequest, function(req, res) {
    if (req.query.shop) {
        var params = { 
            client_id: config.oauth.api_key,
            client_secret: config.oauth.client_secret,
            code: req.query.code
        }
        var req_body = querystring.stringify(params);
        console.log(req_body)
        request({
            url: 'https://' + req.query.shop + '/admin/oauth/access_token', 
            method: "POST",
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': Buffer.byteLength(req_body)
            },
            body: req_body
        }, 
        function(err,resp,body) {
            console.log(body);
            body = JSON.parse(body);
            req.session.access_token = body.access_token;
            console.log(req.session);
            res.redirect('/');
        })
    }
})


app.get('/install', function(req, res) {
    res.render('app_install', {
        title: 'Shopify App'
    });
})


app.get('/modal_content', function(req, res) {
    res.render('modal_content', {
        title: 'Embedded App Modal'
    });
})

app.get('/', function(req, res) {
    if (req.session.access_token) {
        res.render('index', {
            title: 'Home',
            api_key: config.oauth.api_key,
            shop: req.session.shop
        });
    } else {
        res.redirect('/install');
    }
})

app.get('/add_product', function(req, res) {
    res.render('add_product', {
        title: 'Add A Product', 
        api_key: config.oauth.api_key,
        shop: req.session.shop,
    });
})

app.get('/products', function(req, res) {
    var next, previous, page;
    page = req.query.page ? ~~req.query.page:1;

    next = page + 1;
    previous = page == 1 ? page : page - 1;

    request.get({
        url: 'https://' + req.session.shop + '.myshopify.com/admin/products.json?limit=5&page=' + page,
        headers: {
            'X-Shopify-Access-Token': req.session.access_token
        }
    }, function(error, response, body){
        if(error)
            return next(error);
        body = JSON.parse(body);
        res.render('products', {
            title: 'Products', 
            api_key: config.oauth.api_key,
            shop: req.session.shop,
            next: next,
            previous: previous,
            products: body.products
        });
    })  
})

app.post('/products', function(req, res) {
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
    req_body = JSON.stringify(data);
    console.log(data);
    console.log(req_body);
    request({
        method: "POST",
        url: 'https://' + req.session.shop + '.myshopify.com/admin/products.json',
        headers: {
            'X-Shopify-Access-Token': req.session.access_token,
            'Content-type': 'application/json; charset=utf-8'
        },
        body: req_body
    }, function(error, response, body){
        if(error)
            return next(error);
        console.log(body);
        body = JSON.parse(body);
        if (body.errors) {
            return res.json(500);
        } 
        res.json(201);
    })  
})

function verifyRequest(req, res, next) {
    var map = JSON.parse(JSON.stringify(req.query));
    delete map['signature'];
    delete map['hmac'];

    var message = querystring.stringify(map);
    var generated_hash = crypto.createHmac('sha256', config.oauth.client_secret).update(message).digest('hex');
    console.log(generated_hash);
    console.log(req.query.hmac);
    if (generated_hash === req.query.hmac) {
        next();
    } else {
        return res.json(400);
    }

}




// var express = require('express');
// var app = express();

// app.set('port', (process.env.PORT || 5000));

// app.use(express.static(__dirname + '/public'));

// app.get('/', function(request, response) {
//   response.sendFile(__dirname + '/public/index.html');
// });

// app.listen(app.get('port'), function() {
//   console.log('Node app is running on port', app.get('port'));
// });


// const path = require('path');
// var express = require('express');
//
// // Create our app
// var app = express();
// const PORT = process.env.PORT || 3000;
//
// app.use(function (req, res, next){
//   if (req.headers['x-forwarded-proto'] === 'https') {
//     res.redirect('http://' + req.hostname + req.url);
//   } else {
//     next();
//   }
// });
//
// app.use(express.static(path.join(__dirname, 'public')));
//
// app.get('*', function(req, res) {
//   response.render('public/index.html');
// });
//
// app.listen(PORT, function () {
//   console.log('Express server is up on port ' + PORT);
// });
