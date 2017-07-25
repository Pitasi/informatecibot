const config = require('./config.js')
const replies = require('./replies.js')

const Telegraf = require('telegraf')
const { Router } = require('telegraf')
const app = new Telegraf(config.token)

// Register bot username locally
app.telegram.getMe().then(botInfo => {
  app.options.username = botInfo.username
  console.log('Bot logged in as @' + app.options.username)
})

// Route callbackqueries to the correct methods
// (based on query.data first part, e.g. "aule:3" => action=aule)
const actionRouter = new Router((ctx) => {
  if (!ctx.callbackQuery.data)
    return Promise.resolve()

  const parts = ctx.callbackQuery.data.split(':') || [null]
  return Promise.resolve({
    route: parts[0],
    state: {
      payload: parts.slice(1)
    }
  })
})
app.on('callback_query', actionRouter.middleware())
app.actionRouter = actionRouter

// Util function for handling callback queries:
// if message is older than 5 minutes -> send a new one
app.context.db = {
  editOrSendMessage: (ctx, params) => {
    const FIVE_MINUTES = 5*60*1000
    const check_time = (unix_timestamp) =>
                       (new Date() - new Date(unix_timestamp*1000) < FIVE_MINUTES)
    let query = ctx.update.callback_query

    if (query && check_time(query.message.date))
      return ctx.editMessageText.apply(null, params)
    else
      return ctx.reply.apply(null, params)
  }
}

module.exports = app
