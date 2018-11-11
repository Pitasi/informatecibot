const actionLogger = require('../action_logger.js')
const { Extra, Markup } = require('telegraf')

// Home message options
const message_markup = Extra.HTML().webPreview(false).markup(m => (
  m.inlineKeyboard([
    [
      m.urlButton('Forum', 'http://informateci.it/'),
    ],
    [
      //m.callbackButton('Orario', 'orario'),
      m.urlButton('Aule Libere', 'https://t.me/GAPUNIPI_Bot'),
      m.callbackButton('Download', 'download')
    ]
  ])
))

const txt = 'Ciao!\nSeleziona un bottone qui sotto per iniziare.'

const handler = (ctx, next) => {
  if (ctx.chat.type !== 'private') {
    ctx.reply('Contattami in privato!')
  }
  else {
    let query = ctx.update.callback_query
    ctx.db.editOrSendMessage(ctx, [txt, message_markup])
    if (query) ctx.answerCallbackQuery()
  }

  if (next) next()
}

module.exports = (app) => {
  app.command(['start', 'help'], handler)
  app.actionRouter.on('home', actionLogger, handler)
}
