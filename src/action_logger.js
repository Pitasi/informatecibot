// Debug purpose:
// This function gets called before dispatching any action/trigger
// TODO: we could use this for statics
module.exports = (ctx, next) => {
  if (process.env.DEBUG)
    console.log(ctx.from.first_name, ctx.from.username, ':', ctx.callbackQuery.data)
  next()
}
