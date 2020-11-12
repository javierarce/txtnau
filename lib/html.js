'use strict'

const fs = require('fs')
const Tools = require('./tools')

module.exports = class HTML {
  constructor () {
    this.tools = new Tools()
  }

  build () {
    fs.readFile('tweets.txt', (err, data) => {
      if (err) {
        throw err;
      }

      let lines = data.toString().trim().split('\n');

      let body = []

      lines.reverse().forEach((line) => {
        body.push(`<span>${this.tools.articlice(line)},</span> `)
      })

      body.push('<span>I see&hellip;</span>')
      body = body.join('')

      let top = '<!DOCTYPE html> <html lang="en"> <head> <meta charset="UTF-8"><title>txtnau</title><meta http-equiv="X-UA-Compatible" content="IE=edge"> <meta name="viewport" content="width=device-width, initial-scale=1"> <meta name="theme-color" content="#ffffff"> <meta property="og:title" content="txtnau" /> <meta property="og:site_name" content="txtnau" /> <meta name="twitter:title" content="txtnau"> <meta name="description" content="I\'m a bot that looks at @artnau and tweet what I see." /> <meta property="og:description" content="I\'m a bot that looks at @artnau and tweet what I see." /> <meta property="twitter:description" content="I\'m a bot that looks at @artnau and tweet what I see." /> <meta name=twitter:image content="https://txtnau.javierarce.com/cover.png"> <meta property="og:image" content="https://txtnau.javierarce.com/cover.png"/> <meta name="twitter:card" content="summary_large_image"/><style> body { font-size: 1.8em; line-height: 145%; font-weight: normal; margin: 3em; text-rendering: optimizeLegibility; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; } span { opacity: 0; transition: opacity 800ms ease-in-out; } span.is-visible { opacity: 1; } .Content { width: 60%; margin: auto; } </style> <script> window.onload = () => { let i = 0; document.querySelectorAll("span").forEach((item) => { i += 200; item.style.transitionDelay = `${i}ms`; item.classList.add("is-visible"); }) } </script> </head> <body> <div class="Content">'

      let bottom = '</div> </body> </html>'
      const html = `${top}${body}${bottom}`

      let fileName = 'www/index.html'
      let stream = fs.createWriteStream(fileName)

      stream.once('open', (fd) => {
        stream.end(html)
      })
    })
  }
}
