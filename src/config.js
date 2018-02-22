module.exports = {
  // Telegram API token - contact @BotFather to get one
  token:  process.env.TOKEN,

  // for multiple admins use spaces: ADMINS="123 999 234"
  admins: process.env.ADMINS ?
            process.env.ADMINS.split(',').map(s => (parseInt(s, 10))) :
            [],

  // URLs that wil be downloaded
  urls: {
    orario:   'https://www.vittgam.net/orario-inf-unipi.json',
    storage:  'http://storage.informateci.org/scan.php'
  },

  // Local files that will be loaded
  files: {
    books: './data/books.json',
    shortcuts: './data/shortcuts.json'
  },

  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || '6379',
    password: process.env.REDIS_PASS,
    db: process.env.REDIS_DB || 0
  }
}
