'use strict'

const request = require('request')

'use strict'

module.exports = class Eye {
  constructor () {
  }

  see (URL) {
    let subscriptionKey = process.env.COMPUTER_VISION_SUBSCRIPTION_KEY
    let endpoint = process.env.COMPUTER_VISION_ENDPOINT

    if (!subscriptionKey) { throw new Error('Set your environment variables for your subscription key and endpoint.'); }

    var uriBase = endpoint + 'vision/v3.1/analyze'


    // Request parameters.
    const params = {
      'visualFeatures': 'Categories,Description,Color',
      'details': '',
      'language': 'en'
    }

    const options = {
      uri: uriBase,
      qs: params,
      body: '{"url": ' + '"' + URL + '"}',
      headers: {
        'Content-Type': 'application/json',
        'Ocp-Apim-Subscription-Key' : subscriptionKey
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
