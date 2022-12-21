const KoaRouter = require('koa-router');

const router = new KoaRouter();

router.get('session.new', '/new', (ctx) => ctx.render('session/new', {
  submitPath: ctx.router.url('session.create'),
}));

router.post('session.create', '/', async (ctx) => {
  const { mail, password } = ctx.request.body;
  const user = await ctx.orm.user.findOne({ where: { mail } });
  const auth = user && await user.checkPassword(password);
  if (user && auth) {
    ctx.session.currentUserId = user.hashedId;
    ctx.redirect('/');
  } else {
    await ctx.render('session/new', {
      error: 'Incorrect Email or password',
      submitPath: ctx.router.url('session.create'),
    });
  }
});
router.delete('session.destroy', '/', async (ctx) => {
  ctx.session.currentUserId = null;
  ctx.redirect('/');
});
module.exports = router;
