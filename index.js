/*
* twitter-autoreply
* Based on the work of @bryanbraun
* (c) Édouard JAMIN 2017
* @edouardjamin
*/

// START HEROKU SETUP
var express = require("express");
var app = express();
var firebase = require('firebase');
app.get('/', function(req, res){ res.send('The robot is happily running.'); });
app.listen(process.env.PORT || 5000);
// END HEROKU SETUP

// Configs

// connect to database
var firebaseConfig = {
	apiKey: "",
	authDomain: "",
	databaseURL: "",
	storageBucket: "",
	messagingSenderId: "",

};
firebase.initializeApp(firebaseConfig);

var config = {
    me: 'edouardjamin', // Account mentionned
    word_to_search: '', // word or hashtag to look for
    regexFilter: '', // Accept only tweets matching this regex pattern.
    regexReject: '(RT)', // AND reject any tweets matching this regex pattern.

    text_to_tweet: '', // Long text to tweet
    text_to_tweet_short: '', // short text to tweet

    keys: {
        // keys of Twitter apps
        consumer_key: "",
        consumer_secret: "",
        access_token_key: "",
        access_token_secret: ""
    },
};

/*
* saveTweetToFirebase()
* Save votes to Firebase
*/
function saveTweetToFirebase(tweet, hashtag) {
  // connect to the correct database in Parse
  const ref = firebase.database().ref('/Tweets/');

  // create new Tweet
  let newTweet = {};

  // get infos from the _id_str and add to newTweet
  tu.show({id: tweet.in_reply_to_status_id_str}, function(err, previous_tweet) {
    // infos
    newTweet = {
      id_str: previous_tweet.id_str,
      tweet: previous_tweet.text,
      date: previous_tweet.created_at,
      username: previous_tweet.user.screen_name
    }

    // save it
    ref.set(newTweet);
  });
}

/*
* onTweet()
* What to do after we tweet something.
*/
function onTweet(err, tweet) {
    if (err) {
        // if tweet failed, explain why
        console.error("tweeting failed :(");
        console.error(err);
    } else {
      // if not, save tweet to Parse
      console.log("tweeting worked!")
      saveTweetToFirebase(tweet);
    }
}


// The application itself.
// Use the tuiter node module to get access to twitter.
var tu = require('tuiter')(config.keys);

/*
* searchHashtag()
* Initial function
* look for tweet mentionning account + hashtag
*/
function searchHashtag(hashtag) {
  // transform hashtag
  var hashtag = hashtag.toLowerCase();
  console.log("Searching tweets mentionning " + config.me);
  // use tu to look for hashtag in the mentions timeline
  tu.mentionsTimeline({}, function(err, tweets) {
    if (!err){
      // if retreived correctly, loop through mentions
      console.log(tweets.length);
      for (var i = 0, length = tweets.length; i < length; i++) {

        // transform tweet text
        var tweet_text = tweets[i].text.toLowerCase();

        // alphabet array
        var alphabet = 'abcdefghijklmnopqrstuvwxyz'.split('');

        // loop 28 times (1 for each alphabet letter)
        for (var j = 0, alphabetLength = alphabet.length; j < alphabetLength; j++) {

          // add hashtag + an alphabet letter (to make sure, they do not tweet only the hashtag)
          var completeHashtag = hashtag.concat(alphabet[j]);

          // if tweet has hashtag, do something
          if (tweet_text.indexOf(completeHashtag) > -1) {
            foundTweet(tweets[i]);
          } else {
          // if not, go to the following mentions
          }
        }

      }
    } else {
      // print errors, if so
      console.log(err);
    }
  });

}

/*
* foundTweet()
* Function is launched if a tweet is found
* Will reject RT and check if we acted on tweet
*/
function foundTweet(tweetFound) {
  var regexReject = new RegExp(config.regexReject, 'i');
  var regexFilter = new RegExp(config.regexFilter, 'i');

  // look if it is a RT or not
  if (tweetFound.retweeted) {
      console.log("Tweet is a RT");
      return;
  }

  // look if regex
  if (config.regexReject !== '' && regexReject.test(tweetFound.text)) {
      console.log("Tweet rejected");
      return;
  }

  // look in Parse database if we acted on the tweet of not
  var alreadyTweeted = true;
  const ref = firebase.database().ref('/Tweets');
  ref.once('value').then( function(tweets) {
      if(tweets.hasChildren()) {

        // look for tweet in database
        tweets = tweets.filter( function(tweet) {
          if(tweet.val().id_str == tweetFound.id_str) {
            return tweet
          }
        })

        if(tweets.length < 1) {
          // if no result = never acted
          if (regexFilter.test(tweetFound.text) && tweetFound.user.screen_name != config.me) {
              // get random number
              var meme_number = Math.floor(Math.random() * config.meme.length);

              console.log("RT: " + tweetFound.text);
              // replies to the tweet and launch onTweet
              if ((140 - tweetFound.user.screen_name.length - config.text_to_tweetFound) <= 0) {
                tu.update({
                  status: "@" + tweetFound.user.screen_name + " " + config.text_to_tweet + " " + config.meme[meme_number],
                  in_reply_to_status_id: tweetFound.id_str
                }, onTweet);
              } else {
                tu.update({
                  status: "@" + tweetFound.user.screen_name + " " + config.text_to_tweet_short + " " + config.meme[meme_number],
                  in_reply_to_status_id: tweetFound.id_str
                }, onTweet);
              }
          }
        }

        if(tweets.length > 1) {
          console.log("Already acted on this tweet");
        }
      }
  })
}

// launch the function once
searchHashtag(config.word_to_search)

// run the function every 2 minutes
setInterval(function(){
  searchHashtag(config.word_to_search)
}, 120000);
