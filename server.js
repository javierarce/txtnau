'use strict'
require('dotenv').config()

const fs = require('fs')

const Vision = require('./lib/eye')
const Eye = new Vision()
const Twit = require('twit')

let metadata = require('./metadata.json')

const PUBLISH = true
const SEE = true

const TWITTER_CONFIG = {
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  access_token: process.env.TWITTER_CONSUMER_ACCESS_TOKEN,
  access_token_secret: process.env.TWITTER_CONSUMER_ACCESS_TOKEN_SECRET,
  timeout_ms: 60*1000
}

const T = new Twit(TWITTER_CONFIG)

const wasTweetPublished = (newID) => {
  let savedID = metadata.id

  return newID > savedID
}

const writeMetadata = (data) => {
  fs.writeFileSync('metadata.json', JSON.stringify(data))
}


const onResponse = (err, data, response) => {
  analyzeTweet(data[0])
}

const hasImages = (tweet) => {
  return tweet && tweet.entities && tweet.entities.media.length
}

const publishTweet = (status) => {
  if (!PUBLISH) {
    return
  }

  T.post('statuses/update', { status }, (err, data, response) => {
    console.log(data)
  })
}


const getDescription = (result) => {
  if (result && result.description && result.description.captions.length) {
    return result.description.captions[0].text
  }

  return undefined
}

const analyzeTweet = (tweet) => {

  if (!wasTweetPublished(tweet.id)) {
    console.log('Tweet already published')
    return
  }

  if (!hasImages(tweet))  {
    console.log('No images found')
    return
  }

  let URL = tweet.entities.media[0].media_url_https

  if (!SEE) {
    return
  }

  Eye.see(URL).then((result) => {
    writeMetadata({ id: tweet.id, created_at: tweet.created_at })
    const description = getDescription(result) 

    if (description) {
      console.log(description)
      publishTweet(description)
    }

  })
}

T.get('statuses/user_timeline', { user_id: process.env.TWITTER_USER_ID, count: 1 }, onResponse)
