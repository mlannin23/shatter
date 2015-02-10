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
    request('http://publish.the-backseat.com/?json=get_tag_posts&slug=main-feature&count=1', function(error, response, body) {
        //check for errors in API request
        if (!error && response.statusCode == 200) {
            var mainFeaturedPost = getMainFeaturedPost(body);

            //get recommended posts
            request('http://publish.the-backseat.com/?json=get_tag_posts&slug=recommended&count=3', function(error, response, body) {
                //check for errors in API request
                if (!error && response.statusCode == 200) {
                    var recommendedPosts = getRecommendedPosts(body);
                

                    //get featured posts
                    request('http://publish.the-backseat.com/?json=get_tag_posts&slug=feature&count=2', function(error, response, body) {
                        //check for errors in API request
                        if (!error && response.statusCode == 200) {
                            var featuredPosts = getFeaturedPosts(body);

                            //get latest posts
                            request('http://publish.the-backseat.com/?json=get_recent_posts', function(error, response, body) {
                                if (!error && response.statusCode == 200) {
                                    var recentPosts = getRecentPosts(body);

                                    res.render('index', { 
                                        mainFeaturedPost: mainFeaturedPost,
                                        recommendedPosts: recommendedPosts,
                                        featuredPosts: featuredPosts,
                                        recentPosts: recentPosts
                                    });
                                }
                            });
                        }
                    });
                }
            })
        }
    });
});

/* GET article page */
router.get('/articles/:id', function(req, res, next) {

    //get article
    request('http://publish.the-backseat.com/?json=get_post&id=' + req.params.id, function(error, response, body) {
        //check for errors in API request
        if (!error && response.statusCode == 200) {
            //check to see if article found
            if (JSON.parse(body).status == 'ok') {
                var post = getPost(body);

                //get main featured post
                request('http://publish.the-backseat.com/?json=get_tag_posts&slug=main-feature&count=1', function(error, response, body) {
                    //check for errors in API request
                    if (!error && response.statusCode == 200) {
                        var mainFeaturedPost = getMainFeaturedPost(body);

                        //get featured posts
                        request('http://publish.the-backseat.com/?json=get_tag_posts&slug=feature&count=2', function(error, response, body) {
                            //check for errors in API request
                            if (!error && response.statusCode == 200) {
                                var featuredPosts = getFeaturedPosts(body);

                                res.render('article', {
                                    post: post,
                                    mainFeaturedPost: mainFeaturedPost,
                                    featuredPosts: featuredPosts
                                });
                            }
                        });
                    }
                });
            } else {
                var err = new Error('Not Found');
                err.status = 404;
                next(err);
            }
        }
    });
});

function getMainFeaturedPost(body) {
    var mainFeaturedPost;

    //check to see if there is a main featured post
    if (JSON.parse(body).count > 0) {
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
    } else {
        mainFeaturedPost = false;
    }

    return mainFeaturedPost;
}

function getFeaturedPosts(body) {
    var featuredPosts;

    //check to see if there is a featured post
    if (JSON.parse(body).count > 0) {
        var rawPosts = JSON.parse(body).posts,
            i;

        featuredPosts = [];

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
    } else {
        featuredPosts = false;
    }

    return featuredPosts;
}

function getRecommendedPosts(body) {
    var featuredPosts;

    //check to see if there is a recommended post
    if (JSON.parse(body).count > 0) {
        var rawPosts = JSON.parse(body).posts,
            i;

        recommendedPosts = [];

        for (i = 0; i < rawPosts.length; i++) {
            var title = rawPosts[i].title,
                author = rawPosts[i].author,
                thumbnailUrl = (rawPosts[i].thumbnail_images) ? rawPosts[i].thumbnail_images.medium.url : 'http://placehold.it/300x200',
                url = '/articles/' + rawPosts[i].id;
            
            recommendedPosts.push({
                'title': title,
                'author': author,
                'thumbnailUrl': thumbnailUrl,
                'url': url
            });
        }
    } else {
        recommendedPosts = false;
    }

    return recommendedPosts;
}

function getRecentPosts(body) {
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

    return recentPosts;
}

function getPost(body) {
    var post;

    var months = [ 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December' ],
        rawPost = JSON.parse(body).post,
        title = rawPost.title,
        content = rawPost.content,
        rawDate = new Date(rawPost.date),
        date = months[rawDate.getMonth()] + ' ' + rawDate.getDate() + ', ' + rawDate.getFullYear(),
        author = rawPost.author,
        thumbnailUrl = (rawPost.thumbnail) ? rawPost.thumbnail : false;
        
    post = {
        'title': title,
        'content': content,
        'date': date,
        'author': author,
        'thumbnailUrl': thumbnailUrl
    };

    return post;
}

module.exports = router;
