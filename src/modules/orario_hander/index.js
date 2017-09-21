const { URL } = require('url')
const actionLogger = require('../../action_logger.js')
const orario = require('../../config.js').downloads.orario
const db = require('./database.js')
const got = require('got')
const { Extra, Markup } = require('telegraf')

const callbackHandler = async (ctx, next) => {
    ctx.answerCallbackQuery()
       .catch(e => { console.error(e) })

    let link = await db.getUserLink(ctx.chat.id)

    if (!link) {
      // New user!
      ctx.db.editOrSendMessage(
        ctx,
        [
          '<b>Alert personalizzati</b>\n'+
          'Puoi registrare i corsi che frequenti per ottenere notifiche un\'ora '+
          'prima dell\'inizio della lezione.\n\n'+
          '1. Vai su http://orario.org\n'+
          '2. Seleziona i corsi che ti interessano\n'+
          '3. Manda qui il link della pagina (anche quello breve funziona!)\n\n' +
          '<i>Nota:</i> invia il messaggio scrivendo solo un url valido.',
          {
            parse_mode: 'HTML',
            reply_markup: Markup.inlineKeyboard([[Markup.callbackButton('Home', 'home')]])
          }
        ]
      )
    }
    else {
      // Already has a link, remind him
      ctx.db.editOrSendMessage(
        ctx,
        [
          '<b>Alert personalizzati</b>\n'+
          'Il tuo link:\n'+
          `${link}\n\n`+
          '<i>Mandando un nuovo link sovrascrivi il precedente.</i>',
          {
            parse_mode: 'HTML',
            reply_markup: Markup.inlineKeyboard([[Markup.callbackButton('Disativa notifiche', 'orario_delete')]])
          }
        ]
      )

    }

    next && next()
}

const deleteCallbackHandler = async (ctx, next) => {
  await db.deleteUser(ctx.chat.id)
  ctx.db.editOrSendMessage(ctx,
    [
      [
        'Tutte le notifiche <b>disattivate</b>!',
        'Puoi riabilitarle in qualsiasi momento mandandomi un link di http://orario.org.'
      ].join('\n'),
      {
        parse_mode: 'HTML',
        reply_markup: Markup.inlineKeyboard([[Markup.callbackButton('Home', 'home')]])
      }
    ]
  )
}

const parseUrl = async (ctx, next) => {
  try {
    let u = new URL(ctx.message.text)
    if (u.hostname === 'orario.org') {
      let redirect = await got(u.href, {
        followRedirect: false
      })
      u = new URL(redirect.headers.location)
    }
    ctx.parsedUrl = u
    next && next()
  }
  catch (err) {
    // not a valid url, skip
  }
}

const getLessonsFromIdList = ({
  list,
  course,
  override
}) => {
  let res = {}
  for (let i in list) {
    let lesson = list[i]
    let details = orario.lessons[lesson]
    if (details.partitions)
      details = Object.assign(details, {course: override[lesson] || course})
    res[lesson] = orario.lessons[lesson]
  }
  return res
}

const getLessonsFromYear = ({
  cdl,
  year,
  course,
  override
}) => {
  const cdlLessons = Object.keys(orario.courses[cdl].lessonsmap)
  const list = []
  for (let i in cdlLessons) {
    let lesson = cdlLessons[i]
    if (
      orario.courses[cdl].lessonsmap[lesson].year === year &&
      !orario.courses[cdl].lessonsmap[lesson].optional
    )
      list.push(lesson)
  }
  return getLessonsFromIdList({
    list: list,
    course: course,
    override: override
  })
}

const lessonsToString = lessons => {
  let res = ''
  for (let id in lessons) {
    let l = lessons[id]
    let course = l.course
    let name = l.displayname || l.name
    let professor = l.professor || (course && l.partitions[course].professor)
    let url = l.url || (course && l.partitions[course].url)
    let link = url ? `<a href="${url}">${name}</a>` : name

    res += `- ${link}\n` +
      `<i>${professor}</i>\n`
  }
  return res
}

const urlHandler = (ctx, next) => {
  let params = ctx.parsedUrl.searchParams
  let cdl = params.get('cdl')
  let year = params.get('year')
  let show = params.get('show')
  let course = params.get('course')
  let partitionoverrides = params.get('partitionoverrides')
  let override = {}
  if (partitionoverrides) {
    partitionoverrides.split(',').forEach(o => {
      let lesson = o.split('-')
      override[lesson[0]] = lesson[1]
    })
  }

  const isValidCdl = orario.courseNames.indexOf(cdl) !== -1
  if (isValidCdl) {
    // two cases:
    // 1. all courses of a certain year
    // 2. custom list of lessons
    if (year) {
      const lessons = getLessonsFromYear({
        cdl: cdl, year: year, course: course, override: override
      })
      db.subscribeUserToLessons(lessons, ctx.parsedUrl.href, ctx.chat.id)
      ctx.reply(
        `Orario salvato correttamente!\n\n` +
        `<b>CDL</b>: ${cdl}\n` +
        `<b>ANNO</b>: ${year}\n` +
        (course ? `<b>CORSO</b>: ${course}\n` : '') +
        `<b>LEZIONI:</b>\n${lessonsToString(lessons)}`,
        { parse_mode: 'HTML' }
      )

    }
    else if (show) {
      const lessons = getLessonsFromIdList({
        course: course, list: show.split(','), override: override
      })
      db.subscribeUserToLessons(lessons, ctx.parsedUrl.href, ctx.chat.id)
      ctx.reply(
        `Orario salvato correttamente!\n\n` +
        `<b>CDL</b>: ${cdl}\n` +
        (course ? `<b>CORSO</b>: ${course}\n` : '') +
        `<b>LEZIONI:</b>\n${lessonsToString(lessons)}`,
        { parse_mode: 'HTML' }
      )
    }
    else {
      ctx.reply('Nessun corso selezionato, riprova!')
    }
  }

  next && next()
}

module.exports = app => {
  db.startCronJob((id, lesson, rooms, course, hours) => {
    let professor = lesson.professor || lesson.partitions[course].professor

    app.telegram.sendMessage(
      id,
      `🔔 Hai una lezione in programma! \n\n` +
      `<b>[ ${hours} ]</b>\n` +
      `<b>${lesson.name}</b>\n` +
      `<i>${professor}</i>\n` +
      `Aula: <b>${rooms.join(', ')}</b>`,
      { parse_mode: 'HTML' })
      .catch(err => { /* probably bot blocked by user */ })
  })
  app.actionRouter.on('orario', actionLogger, callbackHandler)
  app.actionRouter.on('orario_delete', actionLogger, deleteCallbackHandler)
  app.hears(/(vittgam|orario)/i, parseUrl, actionLogger, urlHandler)
}
