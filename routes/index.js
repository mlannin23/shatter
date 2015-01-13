var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Shatter Magazine' });
});

/* GET article page */
router.get('/article', function(req, res) {
  res.render('article', { title: 'Article Title' });
});

module.exports = router;
