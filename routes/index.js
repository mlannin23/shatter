var express = require('express');
var router = express.Router();
var request = require('request');

/* GET home page. */
router.get('/', function(req, res) {

    //get featured posts
    request('http://ec2-54-67-30-230.us-west-1.compute.amazonaws.com/?json=get_tag_posts&slug=featured', function(error, response, body) {
        if (!error && response.statusCode == 200) {
            var posts = JSON.parse(body).posts,
                featuredPosts = [],
                i;

            for (i = 0; i < posts.length; i++) {
                var title = posts[i].title,
                    author = posts[i].author,
                    thumbnailUrl = (posts[i].thumbnail_images) ? posts[i].thumbnail_images.medium.url : 'http://placehold.it/300x200',
                    url = '/article?id=' + posts[i].id;
                
                featuredPosts.push({
                    'title': title,
                    'author': author,
                    'thumbnailUrl': thumbnailUrl,
                    'url': url
                });
            }

            //get latest posts
            request('http://ec2-54-67-30-230.us-west-1.compute.amazonaws.com/?json=get_recent_posts', function(error, response, body) {
                if (!error && response.statusCode == 200) {
                    var posts = JSON.parse(body).posts,
                        recentPosts = [],
                        i;

                    for (i = 0; i < posts.length; i++) {
                        var title = posts[i].title,
                            author = posts[i].author,
                            thumbnailUrl = (posts[i].thumbnail_images) ? posts[i].thumbnail_images.medium.url : false,
                            url = '/article?id=' + posts[i].id;
                        
                        recentPosts.push({
                            'title': title,
                            'author': author,
                            'thumbnailUrl': thumbnailUrl,
                            'url': url
                        });
                    }

                    res.render('index', { 
                        featuredPosts: featuredPosts,
                        recentPosts: recentPosts
                    });
                }
            });
        }
    });
});

/* GET article page */
router.get('/article', function(req, res) {
    res.render('article', { title: 'Article Title' });
});

module.exports = router;
