Twitter Autoreply
==================

This is a very simple twitter bot designed to reply to a specific word/hashtag


## Implementation
1. [Set up node.js & npm](http://nodejs.org/download/) (if you haven't already).
2. Set up a [Firebase](https://firebase.google.com/) Database.
3. Download this repo with `git clone git@github.com:edouardjamin/twitter-autoreply.git`.
4. Run `npm install` to download dependencies.
5. Open `index.js` and replace the values in the `config` object with your own.
6. [Create a twitter application](https://apps.twitter.com/app/new), grant it the necessary access, and generate your tokens/keys.
7. Deploy the bot to heroku (you can [use these instructions](https://devcenter.heroku.com/articles/getting-started-with-nodejs#introduction) as a guide — a very basic Profile is included).

## Warning

### Firebase
This bot initially worked with Parse. It was recently re-wrote for Firebase. Some bugs can appears. Please [report]() them

### Twitter API
Twitter API have several limitations. First, you cannot make more than 15 GET request per 15 minutes. Second, you cannot reply to _every_ tweet with a specific word, or your application will be banned. That's why Twitter Autoreply will only reply to tweet with a specific word _and_ which mentions a specific account.

Please read [Automation rules](https://support.twitter.com/articles/76915) before using Twitter Autoreply.

## Credit
Twitter Autoreply is written in [node.js](http://nodejs.org/) and mostly based on the work of [Bryan Braun](https://github.com/bryanbraun). He developed [twitter-listbot](https://github.com/bryanbraun/twitter-listbot).
