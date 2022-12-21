const KoaRouter = require('koa-router');
const jwt = require('koa-jwt');
const JSONAPISERIALIZER = require('jsonapi-serializer').Serializer;
const { apiSetCurrentUser } = require('../../middlewares/auth');

const ReviewSerializer = new JSONAPISERIALIZER('reviews', {
  attributes: ['userId', 'routineId', 'title', 'score', 'content', 'isReported'],
  keyForAttribute: 'camelCase',
});

const router = new KoaRouter();

// throw error if review is not found
router.param('id', async (id, ctx, next) => {
  ctx.state.review = await ctx.orm.review.findByPk(id);
  if (!ctx.state.review) {
    ctx.throw(404, 'Review not found');
  }
  return next();
});

// Unprotected routes
router.get('api.reviews.index', '/', async (ctx) => {
  const reviews = await ctx.orm.review.findAll({ include: ctx.orm.user });
  ctx.body = ReviewSerializer.serialize(reviews);
});

// Protected routes
router.use(jwt({ secret: process.env.JWT_SECRET, key: 'authData' }));
router.use(apiSetCurrentUser);

router.get('api.reviews.show', '/:id', async (ctx) => {
  const { review } = ctx.state;
  const owner = await ctx.orm.user.findByPk(review.userId);
  if (await owner.id === review.userId || ctx.state.currentUser.isAdmin) {
    ctx.body = ReviewSerializer.serialize(review);
    ctx.status = 200;
  } else {
    ctx.throw(401);
  }
});

router.post('api.reviews.create', '/:routine_id', async (ctx) => {
  const routine = await ctx.orm.routine.findByPk(ctx.params.routine_id);
  const review = ctx.orm.review.build(ctx.request.body);
  review.userId = ctx.state.currentUser.id;
  review.routineId = routine.id;
  try {
    await review.save({ fields: ['userId', 'routineId', 'title', 'score', 'content'] });
    ctx.body = ReviewSerializer.serialize(review);
    ctx.status = 201;
  } catch (ValidationError) {
    ctx.throw(400);
  }
});

router.get('api.reviews.edit', '/:id/edit', async (ctx) => {
  try {
    const review = await ctx.orm.review.findByPk(ctx.params.id);
    const owner = await ctx.orm.user.findByPk(review.userId);
    if (ctx.state.currentUser.id === owner.id || ctx.state.currentUser.isAdmin === 1) {
      ctx.state = 200;
      ctx.body = ReviewSerializer.serialize(review);
    } else {
      ctx.throw(401);
    }
  } catch (error) {
    ctx.throw(404);
  }
});

router.patch('api.reviews.update', '/:id', async (ctx) => {
  try {
    const review = await ctx.orm.review.findByPk(ctx.params.id);
    const owner = await ctx.orm.user.findByPk(review.userId);
    if (ctx.state.currentUser.id === owner.id || ctx.state.currentUser.isAdmin === 1) {
      try {
        const { title, score, content } = ctx.request.body;
        await review.update({ title, score, content });
        const response = { ...review.dataValues, user: { id: owner.id, username: owner.username } };
        ctx.body = response;
        ctx.status = 200;
      } catch (ValidationError) {
        ctx.throw(400, `${ValidationError.errors}`);
      }
    } else {
      ctx.throw(401);
    }
  } catch (error) {
    ctx.throw(404);
  }
});

router.del('api.reviews.delete', '/:id', async (ctx) => {
  try {
    const review = await ctx.orm.review.findByPk(ctx.params.id);
    const owner = await ctx.orm.user.findByPk(review.userId);
    if (ctx.state.currentUser.id === owner.id || ctx.state.currentUser.isAdmin === 1) {
      await review.destroy();
      ctx.status = 204;
    } else {
      ctx.throw(401);
    }
  } catch (error) {
    ctx.throw(404);
  }
});

router.patch('api.reviews.report', '/:id/report', async (ctx) => {
  const reviewToReport = await ctx.orm.review.findByPk(ctx.params.id);
  try {
    const { isReported } = ctx.request.body;
    await reviewToReport.update({ isReported });
    ctx.body = reviewToReport;
    ctx.status = 200;
  } catch (ValidationError) {
    ctx.throw(400);
  }
});

module.exports = router;
