const KoaRouter = require('koa-router');

const hello = require('./routes/hello');
const index = require('./routes/index');
const session = require('./routes/session');
const users = require('./routes/users');
const routines = require('./routes/routines');
const exercises = require('./routes/exercises');
const reviews = require('./routes/reviews');

const router = new KoaRouter();

router.use(async (ctx, next) => {
  if (ctx.session.currentUserId) {
    ctx.state.currentUser = await ctx.orm.user.findOne({
      where: { hashedId: ctx.session.currentUserId },
    });
    if (ctx.state.currentUser.isAdmin) {
      ctx.state.currentUserIsAdmin = true;
    } else {
      ctx.state.currentUserIsAdmin = false;
    }
  } else {
    ctx.state.currentUserIsAdmin = false;
  }
  return next();
});

router.use(async (ctx, next) => {
  Object.assign(ctx.state, {
    paths: {
      destroySession: ctx.router.url('session.destroy'),
      newSession: ctx.router.url('session.new'),
      register: ctx.router.url('users.new'),
      routine_index_path: ctx.router.url('routines.index'),
      front_page: '/',
      exercise_index_path: ctx.router.url('exercises.index'),
      exercise_show_path: (id) => ctx.router.url('exercises.show', { id }),
      routine_new_path: ctx.router.url('routines.new'),
      // review_new_path: ctx.router.url('reviews.new'),
      exercise_new_path: ctx.router.url('exercises.new'),
      user_index_path: ctx.router.url('users.index'),
      edit_user_path: (id) => ctx.router.url('users.edit', { id }),
      userPath: (id) => ctx.router.url('users.show', { id }),
      userProfilePath: (id) => ctx.router.url('users.profile', { id }),
      routine_show_path: (id) => ctx.router.url('routines.show', { id }),
    },
  });
  return next();
});

router.use('/', index.routes());
router.use('/hello', hello.routes());
router.use('/session', session.routes());
router.use('/users', users.routes());
router.use('/routines', routines.routes());
router.use('/exercises', exercises.routes());
router.use('/reviews', reviews.routes());

module.exports = router;
