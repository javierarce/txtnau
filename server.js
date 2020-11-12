'use strict'
require('dotenv').config({ path: __dirname + '/.env' })

const fs = require('fs')
const Twit = require('twit')

const Lite = require('twitter-lite')

const lite = new Lite({
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  access_token_key: process.env.TWITTER_CONSUMER_ACCESS_TOKEN,
  access_token_secret: process.env.TWITTER_CONSUMER_ACCESS_TOKEN_SECRET,
})

const Eye = require('./lib/eye')
const eye = new Eye()

const Tools = require('./lib/tools')
const tools = new Tools()

const HTML = require('./lib/html')
const html = new HTML() 

let metadata = require('./metadata.json')

const PUBLISH = true
const SEE = true
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

const publishTweet = (status) => {

  log(`${PUBLISH}. I'm going to publish`)

  if (!PUBLISH) {
    return
  }

  status = tools.articlice(status)
  console.log(`... ${status}`);

  client.post("statuses/update", { status }).then(() => {
    log(`Tweet published: ${status}`)
    saveTweet(status)
  }).catch((e) => {
    console.log(e)
  })
}

const getDescription = (result) => {
  if (result && result.description && result.description.captions.length) {
    return result.description.captions[0].text
  }

  return undefined
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

  if (SEE) {
    let URL = tweet.entities.media[0].media_url_https

    eye.see(URL).then((result) => {
      onSeeResult(result, tweet)
    })
  }
}

const onSeeResult = (result, tweet) => {
  writeMetadata({ id: tweet.id, created_at: tweet.created_at })

  const description = getDescription(result) 

  if (description) {
    log(`(${tweet.id}) ${description}`)

    try {
      publishTweet(description)
    } catch (e) {
      log(`Error: ${e}`)
    }

    html.build()
  }
}

T.get('statuses/user_timeline', { user_id: process.env.TWITTER_USER_ID, count: TWITTER_COUNT }, onResponse)
