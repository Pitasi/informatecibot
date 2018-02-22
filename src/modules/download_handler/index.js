const { Extra, Markup } = require('telegraf')
const { admins } = require('../../config')
const actionLogger = require('../../action_logger.js')

const indexHandler = (ctx, next) => {
  let opt = Extra.HTML().webPreview(false).markup(m => (
    m.inlineKeyboard([
      [
        m.callbackButton('File condivisi', 'storage'),
        m.callbackButton('Libri', 'books')
      ],
      [ m.callbackButton('Home', 'home') ]
    ])
  ))
  ctx.db.editOrSendMessage(ctx, ['Seleziona se navigare tra i file di storage.informateci.org oppure tra la raccolta di libri in PDF piovuta dal cielo.', opt])
    .then(() => ctx.answerCallbackQuery()
                   .catch( e => console.error(e) )
         )

  if (next) next()
}

const forwardDocumentToAdmins = (ctx, next) => {
  admins.forEach(adminId => {
    ctx.telegram.forwardMessage(adminId, ctx.chat.id, ctx.message.message_id)
    ctx.telegram.sendMessage(adminId, ctx.message.document.file_id)
  })
  ctx.reply('Grazie! Il file verrà esaminato ed eventualmente aggiunto al più presto.');

  if (next) {
    return next();
  }
}

module.exports = app => {
  app.actionRouter.on('download', actionLogger, indexHandler)
  app.actionRouter.on('storage', actionLogger, require('./storage.js'))
  app.actionRouter.on('books', actionLogger, require('./books.js'))
  app.on('document', actionLogger, forwardDocumentToAdmins)
}
