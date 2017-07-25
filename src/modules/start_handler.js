const replies = require('../replies.js')
const actionLogger = require('../action_logger.js')
const { Extra, Markup } = require('telegraf')

// Home message options
const message_markup = Extra.HTML().webPreview(false).markup(m => (
  m.inlineKeyboard([
    [
      m.urlButton('Forum', 'http://informateci.org/'),
      m.urlButton('Pastebin', 'http://paste.informateci.org')
    ],
    [
      m.callbackButton('Orario', 'orario'),
      m.callbackButton('Aule Libere', 'aule:-1'),
      m.callbackButton('Download', 'download')
    ]
  ])
))

const txt = 'Ciao!\nSeleziona un bottone qui sotto per iniziare.'

const handler = (ctx, next) => {
  let query = ctx.update.callback_query
  ctx.db.editOrSendMessage(ctx, [txt, message_markup])
  if (query) ctx.answerCallbackQuery()
  if (next) next()
}

module.exports = (app) => {
  app.command(['start', 'help'], handler)
  app.actionRouter.on('home', actionLogger, handler)
}
