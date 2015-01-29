var express = require('express');
var router = express.Router();
var request = require('request');

/* GET coming soon page */
router.get('/', function(req, res) {
    res.render('coming-soon');
});

/* GET home page */
router.get('/home', function(req, res) {

    //get main featured post
    request('http://ec2-54-67-30-230.us-west-1.compute.amazonaws.com/?json=get_tag_posts&slug=main-feature&count=1', function(error, response, body) {
        if (!error && response.statusCode == 200) {
            var rawPost = JSON.parse(body).posts[0],
                title = rawPost.title,
                author = rawPost.author,
                thumbnailUrl = (rawPost.thumbnail) ? rawPost.thumbnail : 'http://placehold.it/825x510',
                url = '/articles/' + rawPost.id;
                mainFeaturedPost = {
                    'title': title,
                    'author': author,
                    'thumbnailUrl': thumbnailUrl,
                    'url': url
                };

            //get featured posts
            request('http://ec2-54-67-30-230.us-west-1.compute.amazonaws.com/?json=get_tag_posts&slug=feature&count=2', function(error, response, body) {
                if (!error && response.statusCode == 200) {
                    var rawPosts = JSON.parse(body).posts,
                        featuredPosts = [],
                        i;

                    for (i = 0; i < rawPosts.length; i++) {
                        var title = rawPosts[i].title,
                            author = rawPosts[i].author,
                            thumbnailUrl = (rawPosts[i].thumbnail_images) ? rawPosts[i].thumbnail_images.medium.url : 'http://placehold.it/300x200',
                            url = '/articles/' + rawPosts[i].id;
                        
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
                            var rawPosts = JSON.parse(body).posts,
                                recentPosts = [],
                                i;

                            for (i = 0; i < rawPosts.length; i++) {
                                var title = rawPosts[i].title,
                                    author = rawPosts[i].author,
                                    thumbnailUrl = (rawPosts[i].thumbnail_images) ? rawPosts[i].thumbnail_images.thumbnail.url : false,
                                    url = '/articles/' + rawPosts[i].id;
                                
                                recentPosts.push({
                                    'title': title,
                                    'author': author,
                                    'thumbnailUrl': thumbnailUrl,
                                    'url': url
                                });
                            }

                            res.render('index', { 
                                mainFeaturedPost: mainFeaturedPost,
                                featuredPosts: featuredPosts,
                                recentPosts: recentPosts
                            });
                        }
                    });
                }
            });
        }
    });
});

/* GET article page */
router.get('/articles/:id', function(req, res) {

    //get article
    request('http://ec2-54-67-30-230.us-west-1.compute.amazonaws.com/?json=get_post&id=' + req.params.id, function(error, response, body) {
        if (!error && response.statusCode == 200) {
            var months = [ 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December' ],
                rawPost = JSON.parse(body).post,
                title = rawPost.title,
                content = rawPost.content,
                rawDate = new Date(rawPost.date),
                date = months[rawDate.getMonth()] + ' ' + rawDate.getDate() + ', ' + rawDate.getFullYear(),
                author = rawPost.author,
                post = {
                    'title': title,
                    'content': content,
                    'date': date,
                    'author': author
                };

            res.render('article', {
                post: post 
            });
        }
    });
});

module.exports = router;
