const actionLogger = require('../action_logger.js')

const handler = (ctx, next) => {
    ctx.answerCallbackQuery('// TODO.')
       .catch(e => { console.error(e) })
    if (next) next()
}

module.exports = app => app.actionRouter.on('orario', actionLogger, handler)
