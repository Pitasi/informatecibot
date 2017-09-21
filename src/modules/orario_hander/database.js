const config = require('../../config.js')
const orario = config.downloads.orario
const redis = require('redis')
const bluebird = require('bluebird')
bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);
const CronJob = require('cron').CronJob;

client = redis.createClient({
  host: config.redis.host,
  port: config.redis.port,
  db: config.redis.db,
  password: config.redis.password
})

const deleteUser = async (userId) => {
  let keys = await client.keysAsync('lesson:*')
  keys.forEach(async k => await client.sremAsync(k, `user:${userId}`))
  await client.delAsync(`user:${userId}`)
}

const startCronJob = (sendMessageFunction) => {
  new CronJob('0 * * * *', () => {
    //orario.courseNames.forEach(cdl => {
      const cdl = 'INF-L' // fix needed for same course in differents cdl

      let now = new Date()
      let course = orario.courses[cdl]

      let day = null
      try {
        day = orario.days[now.getDay() - 1]
      }
      catch (err) { return }

      let todayCourses = course.timetable[day]
      if (!todayCourses) return
      let hours = Object.keys(todayCourses).filter(h => {
        let [hours, minutes] = h.split('-')[0].split(':')
        let t = new Date()
        t.setHours(hours)
        t.setMinutes(minutes)
        let nextHour = new Date(now)
        nextHour.setHours(now.getHours() + 1)
        return t > now && t < nextHour
      })

      hours.forEach(h => {
        let courses = todayCourses[h]
        Object.keys(courses).forEach(async lessonFullId => {
          let [lessonId, course] = lessonFullId.split('_')
          let users = await client.smembersAsync(`lesson:${lessonFullId}`)
          if (!users || !users.length)
            return
          users.forEach(id =>
            sendMessageFunction(
              id,
              orario.lessons[lessonId],
              courses[lessonFullId],
              course,
              h
            )
          )
        })
      })
    //})
  }, null, true, 'Europe/Rome')
}

const getLessonFullId = (id, lesson) => {
  let course = lesson.course
  let name = id
  if (course) name += '_' + course
  return name
}

const subscribeUserToLessons = async (lessons, link, userId) => {
  let ids = Object.keys(lessons).map(key => (
    getLessonFullId(key, lessons[key])
  ))

  await deleteUser(userId)

  Object.keys(lessons).forEach(async l => {
    await client.saddAsync(`lesson:${getLessonFullId(l, lessons[l])}`, userId)
  })
  client.set(`user:${userId}`, link)
}

const getUserLink = async userId => (await client.getAsync(`user:${userId}`))

module.exports = {
  subscribeUserToLessons: subscribeUserToLessons,
  getUserLink: getUserLink,
  startCronJob: startCronJob,
  deleteUser: deleteUser
}
