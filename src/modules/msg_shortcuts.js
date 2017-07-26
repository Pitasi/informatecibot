const actionLogger = require('../action_logger.js')
const config = require('../config.js')

const handler = (ctx, next) => {
  let shortcuts = config.downloads.shortcuts
  let replyToId = ctx.message.reply_to_message ?
                  ctx.message.reply_to_message.message_id :
                  null
  if (ctx.message.text in shortcuts) {
    ctx.reply(shortcuts[ctx.message.text], { reply_to_message_id: replyToId})
    ctx.tg.deleteMessage(ctx.chat.id, ctx.message.message_id)
          .catch( e => console.error(e) )
  }

  if (next) next()
}

module.exports = app => app.hears(/\.(.*)/, actionLogger, handler)
