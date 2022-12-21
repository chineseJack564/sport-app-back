const KoaRouter = require('koa-router');

const router = new KoaRouter();

router.get('exercises.new', '/new', async (ctx) => {
  const exercise = ctx.orm.exercise.build();
  if (ctx.session.currentUserId) {
    await ctx.render('exercises/new', {
      exercise,
      submitPath: ctx.router.url('exercises.create'),
    });
  } else {
    const exercises = await ctx.orm.exercise.findAll({ include: ctx.orm.user });
    await ctx.render('exercises/index', {
      exercises,
      errors: 'You need to login to create',
      newExercisePath: ctx.router.url('exercises.new'),
      exercisePath: (e) => ctx.router.url('exercises.show', { id: e.id }),
    });
  }
});

router.post('exercises.create', '/', async (ctx) => {
  const exercise = ctx.orm.exercise.build(ctx.request.body);
  exercise.userId = ctx.state.currentUser.id;
  await exercise.save({ fields: ['name', 'description', 'userId', 'workZoneP', 'workZoneS'] });
  try {
    ctx.redirect(ctx.router.url('exercises.show', { id: exercise.id }));
  } catch (ValidationError) {
    await ctx.render('exercises/new', {
      errors: ValidationError.errors,
      exercise,
      submitPath: ctx.router.url('exercises.create'),
    });
  }
});

router.get('exercises.index', '/', async (ctx) => {
  const exercises = await ctx.orm.exercise.findAll({ include: ctx.orm.user });
  await ctx.render('exercises/index', {
    exercises,
    newExercisePath: ctx.router.url('exercises.new'),
    exercisePath: (e) => ctx.router.url('exercises.show', { id: e.id }),
  });
});

router.get('exercises.show', '/:id', async (ctx) => {
  const exercise = await ctx.orm.exercise.findByPk(ctx.params.id);
  const owner = await ctx.orm.user.findByPk(exercise.userId);

  if (await owner.checkID(ctx.session.currentUserId) || ctx.state.currentUserIsAdmin) {
    await ctx.render('exercises/show', {
      exercise,
      owner,
      exercisePath: ctx.router.url('exercises.index'),
      editPath: ctx.router.url('exercises.edit', { id: exercise.id }),
      deletePath: ctx.router.url('exercise.delete', { id: exercise.id }),
      user_action: true,
    });
  } else {
    await ctx.render('exercises/show', {
      exercise,
      owner,
      exercisePath: ctx.router.url('exercises.index'),
      editPath: ctx.router.url('exercises.edit', { id: exercise.id }),
      deletePath: ctx.router.url('exercise.delete', { id: exercise.id }),
      user_action: false,
    });
  }
});

router.get('exercises.edit', '/:id/edit', async (ctx) => {
  const exercise = await ctx.orm.exercise.findByPk(ctx.params.id);
  const owner = await ctx.orm.user.findByPk(exercise.userId);
  if (await owner.checkID(ctx.session.currentUserId) || ctx.state.currentUserIsAdmin) {
    await ctx.render('exercises/edit', {
      exercise,
      exercisePath: ctx.router.url('exercises.show', { id: exercise.id }),
      submitPath: ctx.router.url('exercises.update', { id: exercise.id }),
    });
  } else {
    await ctx.render('exercises/show', {
      exercise,
      owner,
      exercisePath: ctx.router.url('exercises.index'),
      editPath: ctx.router.url('exercises.edit', { id: exercise.id }),
      deletePath: ctx.router.url('exercise.delete', { id: exercise.id }),
      user_action: false,
      error: 'Only Exercise owner can edit',
    });
  }
});

router.patch('exercises.update', '/:id', async (ctx) => {
  const exercise = await ctx.orm.exercise.findByPk(ctx.params.id);
  try {
    const { name, description } = ctx.request.body;
    const WP = ctx.request.body.workZoneP;
    const WS = ctx.request.body.workZoneS;
    await exercise.update({
      name, description, workZoneP: WP, workZoneS: WS,
    });
    ctx.redirect(ctx.router.url('exercises.show', { id: exercise.id }));
  } catch (error) {
    await ctx.render('exercises/edit', {
      error,
      exercise,
      exercisePath: ctx.router.url('exercises.show', { id: exercise.id }),
      submitPath: ctx.router.url('exercises.update', { id: exercise.id }),
    });
  }
});

router.del('exercise.delete', '/:id', async (ctx) => {
  const exercise = await ctx.orm.exercise.findByPk(ctx.params.id);
  await exercise.destroy();
  ctx.redirect(ctx.router.url('exercises.index'));
});
module.exports = router;
