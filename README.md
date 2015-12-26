# The Backseat

## Installation

First install [Node.js](https://nodejs.org/). Then use npm to install the Node packages from the `package.json` file. These will be placed in `node_modules/`.

    npm install

To run the app:

	npm start

Then load [http://localhost:9000](http://localhost:9000) in your browser to access the app. Changes to views or assets will be reflected in the browser automatically. Changes to server files (i.e. `routes/index.js`) will require the server to be restarted before changes can be seen.

## Deployment

Deploying to [Heroku](https://www.heroku.com/) is simple.

	git push heroku master

The app will now be running at [www.the-backseat.com](http://www.the-backseat.com/). Make sure any changes you want pushed are committed to your local git repo and pushed to GitHub before deploying. 