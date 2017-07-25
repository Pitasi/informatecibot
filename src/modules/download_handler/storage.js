const { Extra, Markup } = require('telegraf')

module.exports = (ctx, next) => {
  ctx.answerCallbackQuery('// TODO.')
     .catch( e => console.error(e) )
}
