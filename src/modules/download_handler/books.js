const { Extra, Markup } = require('telegraf')
const config = require('../../config.js')

module.exports = (ctx, app) => {
  let data = ctx.state.payload
  switch (data.length) {
    case 0: {
      let opt = Extra.HTML().webPreview(false).markup(m => (
        m.inlineKeyboard([
          [
            m.callbackButton('1° Anno', 'books:primo'),
            m.callbackButton('2° Anno', 'books:secondo'),
            m.callbackButton('3° Anno', 'books:terzo')
          ],
          [
            m.callbackButton('<', 'download'),
            m.callbackButton('Home', 'home')
          ]
        ])
      ))
      ctx.db.editOrSendMessage(ctx, ['Seleziona l\'anno che ti interessa.', opt]).then(
        () => (ctx.answerCallbackQuery().catch(e=>{console.error(e)}))
      )
      break
    }

    case 1: {
      let year = data[0]

      let keys = Object.keys(config.downloads.books[year] || {}).sort()
      if (keys.length == 0)
        return ctx.answerCallbackQuery('Nessun libro disponibile!').catch(e=>{console.error(e)})

      let allBtns = []
      keys.forEach(code => {
        let books = config.downloads.books[year][code]
        allBtns.push(
          Markup.callbackButton(code.toUpperCase(), `books:${year}:${code}`)
        )
      })

      let realBtns = [] // split rows
      allBtns.forEach((v, i) => {
        if (i % 3 == 0) realBtns.push([v])
        else realBtns[Math.floor(i/3)].push(v)
      })

      realBtns.push([
        Markup.callbackButton('<', 'books'),
        Markup.callbackButton('Home', 'home')
      ])
      let opt = Extra.HTML().webPreview(false).markup(m => (
        m.inlineKeyboard(realBtns)
      ))

      ctx.db.editOrSendMessage(ctx, ['Seleziona il corso che ti interessa.', opt]).then(
        () => (ctx.answerCallbackQuery().catch(e=>{console.error(e)}))
      )
      break
    }

    case 2: {
      let year = data[0]
      let code = data[1]

      let btns = config.downloads.books[year][code].map((book, i) => (
        [Markup.callbackButton(book.name, `books:${year}:${code}:${i}`)]
      ))
      btns.push([
        Markup.callbackButton('<', `books:${year}`),
        Markup.callbackButton('Home', 'home')
      ])

      let opt = Extra.HTML().webPreview(false).markup(m => (
        m.inlineKeyboard(btns)
      ))

      ctx.db.editOrSendMessage(ctx, ['Seleziona il libro che ti interessa.', opt]).then(
        () => (ctx.answerCallbackQuery().catch(e=>{console.error(e)}))
      )
      break
    }

    case 3: {
      let year = data[0]
      let code = data[1]
      let idx = parseInt(data[2])

      ctx.replyWithDocument(config.downloads.books[year][code][idx].file_id, {
        caption: 'Buono studio!\n\n' +
                'Premi /start per ricominciare dall\'inizio.'
      })
      .then(
        () => (ctx.answerCallbackQuery().catch(e=>{console.error(e)}))
      )
      .catch(e => {
        ctx.telegram.sendMessage(config.admin,
          `Errore\n`+
          `Libro ${year}/${code}/${idx}.\n\n` +
          `${e.message}`
        )
        ctx.reply('Errore nella ricerca del file.')
        console.error(config.downloads.books[year][code][idx].file_id, e)
      })
      break
    }

    default: console.error('[books] Caso non previsto!')
  }
}
