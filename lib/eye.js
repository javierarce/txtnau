'use strict'

const request = require('request')

const SUBSCRIPTION_KEY = process.env.COMPUTER_VISION_SUBSCRIPTION_KEY
const ENDPOINT = process.env.COMPUTER_VISION_ENDPOINT

module.exports = class Eye {
  constructor () {
  }

  see (URL) {
    if (!SUBSCRIPTION_KEY) { 
      throw new Error('Set your environment variables for your subscription key and endpoint.'); 
    }

    const params = {
      'visualFeatures': 'Faces,ImageType,Categories,Description,Color,Objects',
      'details': '',
      'language': 'en'
    }

    const options = {
      uri: `${ENDPOINT}vision/v3.1/analyze`,
      qs: params,
      body: `{"url": "${URL}"}`,
      headers: {
        'Content-Type': 'application/json',
        'Ocp-Apim-Subscription-Key': SUBSCRIPTION_KEY
      }
    }

    return new Promise((resolve, reject) => {
      request.post(options, (error, response, body) => {
        if (error) {
          console.log('Error: ', error)
          reject(error)
          return
        }

        resolve(JSON.parse(body))
      })
    })
  }
}
