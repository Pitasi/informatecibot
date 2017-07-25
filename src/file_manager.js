const http = require('http')
const https = require('https')
const fs = require('fs')
const config = require('./config.js')

// Initialize downloads cache
config.downloads = {}

// Set amount of time (milliseconds) for updating cache
const TIMEOUT = 1000 * 60 * 60 * 24

// Download a certain url
const download = (url, done) => {
  let full_url = config.urls[url]
  let protocol = full_url.split(':')[0]
  let mod = null
  if (protocol == 'https')
    mod = https;
  else
    mod = http;
  mod.get(full_url, res => {
    let body = ''
    res.on('data', chunk=> body += chunk)
    res.on('end', () => {
      config.downloads[url] = JSON.parse(body)
      if (done) done()
    })
  })
  .on('error', err => console.error(err, url))
}

// Load and download every url (asyncronous) in config.urls,
// when all urls are downloaded, call the callback
const downloadAll = cb => {
  let urlId = Object.keys(config.urls)
  let cnt = urlId.length
  let done = () => {
    cnt--
    if (cnt == 0 && cb) cb()
  }
  urlId.forEach(url => download(url, done))
}

// Load static files in config.files (synchronous)
const loadAll = () => {
  Object.keys(config.files).forEach(f => {
    config.downloads[f] = JSON.parse(fs.readFileSync(config.files[f], 'utf8'))
  })
}

module.exports.download = cb => {
  loadAll()
  downloadAll(cb)
  setInterval(
    downloadAll,
    TIMEOUT
  )
}
