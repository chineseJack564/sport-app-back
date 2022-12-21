const KoaRouter = require('koa-router');
const jwt = require('koa-jwt');
const { apiSetCurrentUser } = require('../../middlewares/auth');

const router = new KoaRouter();

// Unprotected routes
router.get('api.routines.index', '/', async (ctx) => {
  const routines = await ctx.orm.routine.findAll({
    include: [{ model: ctx.orm.user, attributes: ['username', 'id'] },
      { model: ctx.orm.user, as: 'liker', attributes: ['id'] }],
  });
  const response = routines.map((routine) => {
    const r = {
      id: routine.id,
      title: routine.title,
      description: routine.description,
      cover: routine.cover,
      cathegory: routine.cathegory,
      createdAt: routine.createdAt,
      updatedAt: routine.updatedAt,
      user: routine.user,
      likes: routine.liker.length,
    };
    return r;
  });
  ctx.body = { routines: response };
});

router.get('api.routines.index', '/most_likes', async (ctx) => {
  const routines = await ctx.orm.routine.findAll({ include: { model: ctx.orm.user, as: 'liker', attributes: ['id'] } });
  routines.sort((a, b) => b.liker.length - a.liker.length);
  const response = routines.map((routine) => {
    const r = {
      id: routine.id,
      title: routine.title,
      description: routine.description,
      cover: routine.cover,
      likes: routine.liker.length,
    }; return r;
  });
  ctx.body = { routines: response.slice(0, 5) };
});

router.get('api.routines.show', '/:id', async (ctx) => {
  try {
    const routine = await ctx.orm.routine.findOne({
      where: { id: ctx.params.id },
      include: [{ model: ctx.orm.user, attributes: ['username', 'id', 'isAdmin', 'isCertified'] }],
    });
    const exerciseAppended = await routine.getExercises();
    const reviews = await routine.getReviews({ include: [{ model: ctx.orm.user, attributes: ['username', 'id', 'profilePhoto'] }] });
    const responde = { routine, exerciseAppended, reviews };
    ctx.body = responde;
  } catch (error) {
    ctx.throw(404);
  }
});

// Protected routes
router.use(jwt({ secret: process.env.JWT_SECRET, key: 'authData' }));
router.use(apiSetCurrentUser);

router.get('api.routines.show', '/:id/personal', async (ctx) => {
  try {
    const routine = await ctx.orm.routine.findOne({
      where: { id: ctx.params.id },
      include: [{ model: ctx.orm.user, attributes: ['username', 'id'] }, { model: ctx.orm.user, as: 'liker', attributes: ['id'] }],
    });
    const exerciseAppended = await routine.getExercises();
    let liked = false;
    for (let index = 0; index < routine.liker.length; index += 1) {
      const element = routine.liker[index];
      if (element.id === ctx.state.currentUser.id) {
        liked = true;
        break;
      }
    }
    const review = await routine.getReviews({ include: [{ model: ctx.orm.user, attributes: ['username', 'id', 'profilePhoto'] }] });
    const r2 = await ctx.orm.routine.findOne({
      where: { id: ctx.params.id },
      include: [{ model: ctx.orm.user, attributes: ['username', 'id', 'isAdmin', 'isCertified'] }],
    });
    const responde = {
      routine: r2, exerciseAppended, liked, reviews: review,
    };
    ctx.body = responde;
  } catch (error) {
    ctx.throw(404);
  }
});

router.post('api.routines.create', '/', async (ctx) => {
  const { cloudinary } = ctx.state;
  const routine = ctx.orm.routine.build(ctx.request.body);
  routine.userId = ctx.state.currentUser.id;
  // const owner = await ctx.orm.user.findByPk(routine.userId);
  try {
    if (process.env.NODE_ENV !== 'test') {
      const { cover } = ctx.request.files;
      if (cover && cover.size > 0) {
        const { url } = await cloudinary.uploader.upload(cover.path);
        routine.cover = url;
      } else {
        await routine.save({ fields: ['title', 'description', 'userId', 'cathegory'] });
      }
      await routine.save({ fields: ['title', 'description', 'userId', 'cathegory', 'cover'] });
    } else {
      await routine.save({ fields: ['title', 'description', 'userId', 'cathegory'] });
    }
    ctx.body = { routine };
    ctx.status = 201;
  } catch (ValidationError) {
    ctx.throw(400);
  }
});

router.get('api.routines.edit', '/:id/edit', async (ctx) => {
  try {
    const routine = await ctx.orm.routine.findByPk(ctx.params.id);
    const owner = await ctx.orm.user.findByPk(routine.userId);
    if (ctx.state.currentUser.id === owner.id || ctx.state.currentUser.isAdmin === 1) {
      ctx.body = { routine };
    } else {
      ctx.throw(401);
    }
  } catch (error) {
    ctx.throw(404);
  }
});

router.patch('api.routines.update', '/:id', async (ctx) => {
  try {
    const routine = await ctx.orm.routine.findByPk(ctx.params.id);
    const owner = await ctx.orm.user.findByPk(routine.userId);
    const { cloudinary } = ctx.state;
    if (ctx.state.currentUser.id === owner.id || ctx.state.currentUser.isAdmin === 1) {
      const { title, description, cathegory } = ctx.request.body;

      if (process.env.NODE_ENV !== 'test') {
        const { cover } = ctx.request.files;
        if (cover && cover.size > 0) {
          const { url } = await cloudinary.uploader.upload(cover.path);
          await routine.update({
            title, description, cathegory, cover: url,
          });
        } else {
          await routine.update({ title, description, cathegory });
        }
      } else {
        await routine.update({ title, description, cathegory });
      }
      ctx.body = { routine };
    } else {
      ctx.throw(401);
    }
  } catch (error) {
    ctx.throw(404);
  }
});

router.del('api.routines.delete', '/:id', async (ctx) => {
  const routine = await ctx.orm.routine.findByPk(ctx.params.id);
  const owner = await ctx.orm.user.findByPk(routine.userId);
  if (ctx.state.currentUser.id === owner.id || ctx.state.currentUser.isAdmin === 1) {
    await routine.destroy();
    ctx.status = 204;
  } else {
    ctx.throw(401);
  }
});

router.get('api.routines.add.exercise', '/:id/add_exer', async (ctx) => {
  try {
    const routine = await ctx.orm.routine.findByPk(ctx.params.id);
    const owner = await ctx.orm.user.findByPk(routine.userId);
    if (ctx.state.currentUser.id === owner.id || ctx.state.currentUser.isAdmin === 1) {
      const exerciseAppended = await routine.getExercises();
      const exercises = await ctx.orm.exercise.findAll();
      const exerciseFree = [];
      for (let i = 0; i < exercises.length; i += 1) {
        const exist = exerciseAppended.find((ex) => ex.id === exercises[i].id);
        if (!exist) {
          exerciseFree.push(exercises[i]);
        }
      }
      ctx.body = { routine, exerciseAppended, exerciseFree };
      ctx.status = 200;
    } else {
      ctx.throw(401);
    }
  } catch (error) {
    ctx.throw(404);
  }
});

router.put('api.routines.append.exercise', '/:id/add_exer/:exerciseId', async (ctx) => {
  try {
    const routine = await ctx.orm.routine.findByPk(ctx.params.id);
    const owner = await ctx.orm.user.findByPk(routine.userId);
    if (ctx.state.currentUser.id === owner.id || ctx.state.currentUser.isAdmin === 1) {
      const exercise = await ctx.orm.exercise.findByPk(ctx.params.exerciseId);
      await routine.addExercise(exercise);
      ctx.status = 200;
    } else {
      ctx.throw(401);
    }
  } catch (error) {
    ctx.throw(404);
  }
});

router.del('api.routines.remove.exercise', '/:id/del_exer/:exerciseId', async (ctx) => {
  try {
    const routine = await ctx.orm.routine.findByPk(ctx.params.id);
    const owner = await ctx.orm.user.findByPk(routine.userId);
    if (ctx.state.currentUser.id === owner.id || ctx.state.currentUser.isAdmin === 1) {
      const exercise = await ctx.orm.exercise.findByPk(ctx.params.exerciseId);
      await routine.removeExercise(exercise);
      ctx.status = 200;
    } else {
      ctx.throw(401);
    }
  } catch (error) {
    ctx.throw(404);
  }
});

module.exports = router;
