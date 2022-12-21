const KoaRouter = require('koa-router');
const jwt = require('koa-jwt');
const JSONAPISerializer = require('jsonapi-serializer').Serializer;
const { apiSetCurrentUser } = require('../../middlewares/auth');

const ExerciseSerializer = new JSONAPISerializer('exercises', {
  attributes: ['name', 'description', 'workZoneP', 'workZoneS', 'cover', 'userId', 'username'],
  keyForAttribute: 'camelCase',
});

const router = new KoaRouter();

// throw error if exercise is not found
router.param('id', async (id, ctx, next) => {
  ctx.state.exercise = await ctx.orm.exercise.findByPk(id, { include: { model: ctx.orm.user, attributes: ['username', 'id'] } });
  if (!ctx.state.exercise) {
    ctx.throw(404, 'Exercise not found');
  }
  return next();
});

// Unprotected routes

// Exercises index
router.get('api.exercises.index', '/', async (ctx) => {
  const exercises = await ctx.orm.exercise.findAll({ include: { model: ctx.orm.user, attributes: ['username', 'id'] } });
  ctx.body = ExerciseSerializer.serialize(exercises);
});

// Exercise show
router.get('api.exercises.show', '/:id', async (ctx) => {
  const { exercise } = ctx.state;
  ctx.body = { exercise };
});

// Protected routes
router.use(jwt({ secret: process.env.JWT_SECRET, key: 'authData' }));
router.use(apiSetCurrentUser);

// Exercise create
router.post('api.exercises.create', '/', async (ctx) => {
  const { cloudinary } = ctx.state;
  const exercise = ctx.orm.exercise.build(ctx.request.body);
  exercise.userId = ctx.state.currentUser.id;
  exercise.userUsername = ctx.state.currentUser.username;
  try {
    if (process.env.NODE_ENV !== 'test') {
      const { cover } = ctx.request.files;

      if (cover && cover.size > 0) {
        const { url } = await cloudinary.uploader.upload(cover.path);
        exercise.cover = url;
      }
      await exercise.save({ fields: ['name', 'description', 'workZoneP', 'workZoneS', 'userId', 'userUsername', 'cover'] });
    } else {
      await exercise.save({ fields: ['name', 'description', 'workZoneP', 'workZoneS', 'userUsername', 'userId'] });
    }
    ctx.body = ExerciseSerializer.serialize(exercise);
    ctx.status = 201;
  } catch (ValidationError) {
    ctx.throw(400);
  }
});

// Exercise edit
router.get('api.exercises.edit', '/:id/edit', async (ctx) => {
  try {
    const exercise = await ctx.orm.exercise.findByPk(ctx.params.id);
    const owner = await ctx.orm.user.findByPk(exercise.userId);
    if (ctx.state.currentUser.id === owner.id || ctx.state.currentUser.isAdmin === 1) {
      ctx.body = ExerciseSerializer.serialize(exercise);
      ctx.status = 200;
    } else {
      ctx.throw(401);
    }
  } catch (error) {
    ctx.throw(404);
  }
});

// Exercise update
router.patch('api.exercises.update', '/:id', async (ctx) => {
  try {
    const exercise = await ctx.orm.exercise.findByPk(ctx.params.id);
    const owner = await ctx.orm.user.findByPk(exercise.userId);
    const { cloudinary } = ctx.state;
    if (ctx.state.currentUser.id === owner.id || ctx.state.currentUser.isAdmin === 1) {
      try {
        const {
          name, description, workZoneP, workZoneS,
        } = ctx.request.body;

        if (process.env.NODE_ENV !== 'test') {
          const { cover } = ctx.request.files;
          if (cover && cover.size > 0) {
            const { url } = await cloudinary.uploader.upload(cover.path);
            await exercise.update({
              name, description, workZoneP, workZoneS, cover: url,
            });
          } else {
            await exercise.update({
              name, description, workZoneP, workZoneS,
            });
          }
        } else {
          await exercise.update({
            name, description, workZoneP, workZoneS,
          });
        }
        ctx.body = ExerciseSerializer.serialize(exercise);
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

// Exercise delete
router.delete('api.exercises.delete', '/:id', async (ctx) => {
  try {
    const exercise = await ctx.orm.exercise.findByPk(ctx.params.id);
    const owner = await ctx.orm.user.findByPk(exercise.userId);
    if (ctx.state.currentUser.id === owner.id || ctx.state.currentUser.isAdmin === 1) {
      await exercise.destroy();
      ctx.status = 204;
    } else {
      ctx.throw(401);
    }
  } catch (error) {
    ctx.throw(404);
  }
});

module.exports = router;
