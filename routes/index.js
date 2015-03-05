var express = require('express');
var router = express.Router();
var request = require('request');

var LARGE = 0;
var MEDIUM = 1;

/* Homepage */
router.get('/', function(req, res) {

    //get main featured post
    request('http://publish.the-backseat.com/?json=get_tag_posts&slug=main-feature&count=1', function(error, response, body) {
        //check for errors in API request
        if (!error && response.statusCode == 200) {
            var mainFeaturedPost = getPosts(body, LARGE)[0];

            //get recommended posts
            request('http://publish.the-backseat.com/?json=get_tag_posts&slug=recommended&count=3', function(error, response, body) {
                //check for errors in API request
                if (!error && response.statusCode == 200) {
                    var recommendedPosts = getPosts(body, MEDIUM); 

                    //get featured posts
                    request('http://publish.the-backseat.com/?json=get_tag_posts&slug=feature&count=2', function(error, response, body) {
                        //check for errors in API request
                        if (!error && response.statusCode == 200) {
                            var featuredPosts = getPosts(body, MEDIUM);

                            //get latest posts
                            request('http://publish.the-backseat.com/?json=get_recent_posts', function(error, response, body) {
                                if (!error && response.statusCode == 200) {
                                    var recentPosts = getPosts(body);

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

/* Posts page */
router.get('/posts', function(req, res, next) {

    //get posts by author
    request('http://publish.the-backseat.com/?json=get_recent_posts&count=100', function(error, response, body) {
        //check for errors in API request
        if (!error && response.statusCode == 200) {
            //check to see if post found
            if (JSON.parse(body).status == 'ok') {
                var posts = getPosts(body);

                res.render('posts', {
                    title: 'All Posts',
                    label: false,
                    header: 'All Posts',
                    posts: posts,
                    description: false,
                    message: 'There are currently no posts'
                });
            } else {
                var err = new Error('Not Found');
                err.status = 404;
                next(err);
            }
        }
    });
});

/* Post page */
router.get('/posts/:slug', function(req, res, next) {

    //get post
    request('http://publish.the-backseat.com/?json=get_post&slug=' + req.params.slug, function(error, response, body) {
        //check for errors in API request
        if (!error && response.statusCode == 200) {
            //check to see if post found
            if (JSON.parse(body).status == 'ok') {
                var post = getPost(body);

                //get main featured post
                request('http://publish.the-backseat.com/?json=get_tag_posts&slug=main-feature&count=1', function(error, response, body) {
                    //check for errors in API request
                    if (!error && response.statusCode == 200) {
                        var mainFeaturedPost = getPosts(body, LARGE)[0];

                        //get featured posts
                        request('http://publish.the-backseat.com/?json=get_tag_posts&slug=feature&count=2', function(error, response, body) {
                            //check for errors in API request
                            if (!error && response.statusCode == 200) {
                                var featuredPosts = getPosts(body, MEDIUM);

                                //get latest posts
                                request('http://publish.the-backseat.com/?json=get_recent_posts', function(error, response, body) {
                                    if (!error && response.statusCode == 200) {
                                        var recentPosts = getPosts(body);

                                        res.render('post', {
                                            post: post,
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
            } else {
                var err = new Error('Not Found');
                err.status = 404;
                next(err);
            }
        }
    });
});

/* Author page */
router.get('/authors/:slug', function(req, res, next) {

    //get posts by author
    request('http://publish.the-backseat.com/?json=get_author_posts&slug=' + req.params.slug, function(error, response, body) {
        //check for errors in API request
        if (!error && response.statusCode == 200) {
            //check to see if post found
            if (JSON.parse(body).status == 'ok') {
                var author = getAuthor(body),
                    posts = getPosts(body);

                res.render('posts', {
                    title: author.name,
                    label: 'posts by',
                    header: author.name,
                    posts: posts,
                    description: author.description,
                    message: 'This person has not authored any posts'
                });
            } else {
                var err = new Error('Not Found');
                err.status = 404;
                next(err);
            }
        }
    });
});

/* Tag page */
router.get('/tags/:slug', function(req, res, next) {

    //get posts by author
    request('http://publish.the-backseat.com/?json=get_tag_posts&slug=' + req.params.slug, function(error, response, body) {
        //check for errors in API request
        if (!error && response.statusCode == 200) {
            //check to see if tag found
            if (JSON.parse(body).status == 'ok') {
                var tag = getTag(body),
                    posts = getPosts(body);

                res.render('posts', {
                    title: 'Posts tagged with &apos;' + tag.title + '&apos;',
                    label: 'posts tagged with',
                    header: '&apos;' + tag.title + '&apos;',
                    posts: posts,
                    description: false,
                    message: 'There are no posts with this tag'
                });
            } else {
                var err = new Error('Not Found');
                err.status = 404;
                next(err);
            }
        }
    });
});

function getPosts(body, thumbnailSize) {
    var posts;

    //check to see if there are posts
    if (JSON.parse(body).count > 0) {
        var rawPosts = JSON.parse(body).posts,
            i;

        posts = [];

        for (i = 0; i < rawPosts.length; i++) {
            var title = rawPosts[i].title,
                author = rawPosts[i].author,
                url = '/posts/' + rawPosts[i].slug;
            
            if (thumbnailSize === LARGE) {
                thumbnailUrl = (rawPosts[i].thumbnail) ? rawPosts[i].thumbnail : 'http://placehold.it/825x510';
            } else if (thumbnailSize === MEDIUM) {
                thumbnailUrl = (rawPosts[i].thumbnail_images) ? rawPosts[i].thumbnail_images.medium.url : 'http://placehold.it/300x200';
            } else {
                thumbnailUrl = (rawPosts[i].thumbnail_images) ? rawPosts[i].thumbnail_images.thumbnail.url : false;
            }

            posts.push({
                'title': title,
                'author': author,
                'url': url,
                'thumbnailUrl': thumbnailUrl
            });
        }
    } else {
        posts = false;
    }

    return posts;
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

function getAuthor(body) {
    var author = JSON.parse(body).author;

    return author;
}

function getTag(body) {
    var tag = JSON.parse(body).tag;

    return tag;
}

module.exports = router;
