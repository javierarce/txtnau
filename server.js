'use strict'
require('dotenv').config({ path: __dirname + '/.env' })

const fs = require('fs')
const Twit = require('twit')

const Eye = require('./lib/eye')
const eye = new Eye()

const Tools = require('./lib/tools')
const tools = new Tools()

const HTML = require('./lib/html')
const html = new HTML() 

let metadata = require('./metadata.json')

const PUBLISH = true
const TWITTER_COUNT = 1

const TWITTER_CONFIG = {
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  access_token: process.env.TWITTER_CONSUMER_ACCESS_TOKEN,
  access_token_secret: process.env.TWITTER_CONSUMER_ACCESS_TOKEN_SECRET,
  timeout_ms: 60*1000
}

const T = new Twit(TWITTER_CONFIG)

const saveTweet = (status) => {
  fs.appendFile('tweets.txt', `${status}\n`, (error) => {
    if (error) {
      log(error)
    }
    log(`Tweet saved: ${status}`)
  })
}

const log = (txt) => {
  let status = `${new Date()}: ${txt}\n`
  console.log(status)
  fs.appendFileSync('log.txt', status)
}

const wasTweetPublished = (newID) => {
  let savedID = +metadata.id

  return newID > savedID
}

const writeMetadata = (data) => {
  fs.writeFileSync('metadata.json', JSON.stringify(data))
}

const onResponse = (err, data, response) => {
  analyzeTweet(data[0])
}

const hasImages = (tweet) => {
  return tweet && tweet.entities && tweet.entities.media && tweet.entities.media.length
}

const getDescription = (result) => {
  if (result && result.description && result.description.captions.length) {
    return result.description.captions[0].text
  }

  return undefined
}

const pickMediaURLFromTweet = (tweet) => {
  return tweet.entities.media[0].media_url_https
}

const analyzeTweet = (tweet) => {
  if (!hasImages(tweet))  {
    log(`No images found in ${tweet.id}`)
    return
  }

  if (!wasTweetPublished(tweet.id)) {
    log(`Tweet ${tweet.id} already published`)
    return
  }

  let URL = pickMediaURLFromTweet(tweet) 

  eye.see(URL).then((result) => {
    onSeeResult(result, tweet)
  })
}

const onSeeResult = (result, tweet) => {
  const description = getDescription(result) 

  if (PUBLISH && description) {

    log(`(${tweet.id}) ${description}`)
    log(`${PUBLISH}. I'm going to publish`)

    let status = tools.articlice(description)

    console.log(`... ${status}`);

    T.post('statuses/update', { status }, (error, data, response) => {

      if (error) {
        log(`Error publishing tweet: ${error}`)
        return
      }

      log(`Tweet published: ${status}`)
      writeMetadata({ id: tweet.id, created_at: tweet.created_at })
      saveTweet(description)
      html.build()
    })
  }
}

T.get('statuses/user_timeline', { user_id: process.env.TWITTER_USER_ID, count: TWITTER_COUNT }, onResponse)
