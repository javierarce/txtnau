'use strict'
require('dotenv').config()
const readline = require('readline');

const fs = require('fs')

const Vision = require('./lib/eye')
const Eye = new Vision()
const Twit = require('twit')
const Articles = require('articles')

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
    console.log(error);
  })
}

const log = (txt) => {
  let status = `${new Date()}: ${txt}\n`
  console.log(status)
  fs.appendFileSync('log.txt', status)
}

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
    log(`Tweet published: ${status}`)
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
    log(`Tweet ${tweet.id} already published`)
    return
  }

  if (!hasImages(tweet))  {
    log(`No images found in ${tweet.id}`)
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
      log(`(${tweet.id}) ${description}`)

      publishTweet(description)
      saveTweet(description)
      buildHTML()
    }
  })
}

const buildHTML = () => {
  fs.readFile('tweets.txt', function(err, data) {
    if (err) {
      throw err;
    }

    let lines = data.toString().trim().split('\n');

    let body = []

    lines.reverse().forEach((line) => {

      if (/^[a|an] /.test(line)) {
        line = `I see ${line},`
      } else {
        const [head, ...rest] = line.split(' '); 
        let article = Articles.articlize(head)
        line = `I see ${article} ${rest.join(', ')}`
      }

      body.push(`<span>${line}</span> `)
    })

    body.push('<span>I see&hellip;</span>')
    body = body.join('')

    let top = '<!DOCTYPE html> <html lang="en"> <head> <meta charset="UTF-8"><title>txtnau</title><style> body { font-size: 1.8em; line-height: 145%; font-weight: normal; margin: 3em; text-rendering: optimizeLegibility; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; } span { opacity: 0; transition: opacity 800ms ease-in-out; } span.is-visible { opacity: 1; } .Content { width: 800px; margin: auto; } </style> <script> window.onload = () => { let i = 0; document.querySelectorAll("span").forEach((item) => { i += 200; item.style.transitionDelay = `${i}ms`; item.classList.add("is-visible"); }) } </script> </head> <body> <div class="Content">'

    let bottom = '</div> </body> </html>'
    const html = `${top}${body}${bottom}`

    let fileName = 'www/index.html'
    let stream = fs.createWriteStream(fileName)

    stream.once('open', (fd) => {
      stream.end(html)
    })
  })
}


T.get('statuses/user_timeline', { user_id: process.env.TWITTER_USER_ID, count: TWITTER_COUNT }, onResponse)


