require('./file_manager.js').download(() => {
  const app = require('./telegram.js')

  // Require each module, passing bot as parameter
  require("fs").readdirSync(__dirname + '/modules')
               .forEach(mod => {
                 console.log('Module loaded:', mod)
                 require(__dirname + '/modules/' + mod)(app)
               })

  app.catch((err) => {
    console.error('Unhandled Telegraf error:')
    console.error(err)
  })
  app.startPolling()
})
