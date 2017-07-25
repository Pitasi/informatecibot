const { Extra, Markup } = require('telegraf')
const actionLogger = require('../action_logger.js')
const config = require('../config.js')

// TODO: make this shit readable
// i don't really remember whats going on here
const handler = (ctx, next) => {
  let today = new Date()
  let day = today.getDay()-1 // 0 is Sunday
  let hours = today.getHours()
  if (day > 4)
    return ctx.answerCallbackQuery('Non ci sono lezioni oggi!').catch(()=>{})

  let days = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven']
  let allHours = ['9:00-11:00', '11:00-13:00', '14:00-16:00', '16:00-18:00']

  let buildReply = time => {
    let range = allHours[time]
    let dayname = days[day]
    let rooms = config.downloads.orario.availableRooms[dayname][range]

    let r = `[ ${dayname} ]\n[ ${range} ]\n\n`
    let keys = Object.keys(rooms || {})
    if (keys.length == 0) r += `Nessuna aula disponibile!`
    else keys.forEach(i => {
      r += `<b>Aula ${i}</b> \n${rooms[i][0]}\n\n`
    })
    return r
  }

  let command = parseInt(ctx.state.payload[0], 10)
  let edit = i => {
    if (i < 0 || i > 3) return
    let btns = []
    if (i > 0) btns.push(Markup.callbackButton('<', `aule:${i-1}`))
    if (i < 3) btns.push(Markup.callbackButton('>', `aule:${i+1}`))

    let opt = Extra.HTML().markup(m=>(m.inlineKeyboard([
      btns,
      [   m.callbackButton('Home', 'home')    ]
    ])))
    ctx.db.editOrSendMessage(ctx, [buildReply(i), opt]).then(() => {
      ctx.answerCallbackQuery().catch(e=>{console.error(e)})
    })
  }
  if (command >= 0)
    edit(command)
  else {
    if      (hours < 11) edit(0)
    else if (hours < 13) edit(1)
    else if (hours < 16) edit(2)
    else if (hours < 18) edit(3)
    else edit(0)
  }

  if (next) next()
}

module.exports = app => app.actionRouter.on('aule', actionLogger, handler)
