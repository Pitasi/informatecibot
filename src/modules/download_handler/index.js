const { Extra, Markup } = require('telegraf')
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

module.exports = app => {
  app.actionRouter.on('download', actionLogger, indexHandler)
  app.actionRouter.on('storage', actionLogger, require('./storage.js'))
  app.actionRouter.on('books', actionLogger, require('./books.js'))
}
