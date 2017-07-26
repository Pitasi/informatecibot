module.exports = {
  // Telegram API token - contact @BotFather to get one
  token:  process.env.TOKEN,

  // for multiple admins use spaces: ADMINS="123 999 234"
  admins: (process.env.ADMINS || '').split(' '),

  // URLs that wil be downloaded
  urls: {
    orario:   'https://www.vittgam.net/orario-inf-unipi.json',
    storage:  'http://storage.informateci.org/scan.php'
  },

  // Local files that will be loaded
  files: {
    books: './data/books.json',
    shortcuts: './data/shortcuts.json'
  }
}
