const KoaRouter = require('koa-router');

const { QueryTypes } = require('sequelize');

const router = new KoaRouter();

router.get('routines.new', '/new', async (ctx) => {
  const routine = ctx.orm.routine.build();
  if (ctx.session.currentUserId) {
    await ctx.render('routines/new', {
      routine,
      submitPath: ctx.router.url('routines.create'),
    });
  } else {
    const routines = await ctx.orm.routine.findAll({ include: ctx.orm.user });
    await ctx.render('routines/index', {
      errors: 'You need to login to create',
      routines,
      newRoutinePath: ctx.router.url('routines.new'),
      routinePath: (r) => ctx.router.url('routines.show', { id: r.id }),
    });
  }
});

router.post('routines.create', '/', async (ctx) => {
  const routine = ctx.orm.routine.build(ctx.request.body);
  routine.userId = ctx.state.currentUser.id;
  try {
    await routine.save({ fields: ['title', 'description', 'userId', 'cathegory'] });
    ctx.redirect(ctx.router.url('routines.show', { id: routine.id }));
  } catch (ValidationError) {
    await ctx.render('routines/new', {
      errors: ValidationError.errors,
      routine,
      submitPath: ctx.router.url('routines.create'),
    });
  }
});

router.get('routines.index', '/', async (ctx) => {
  const routines = await ctx.orm.routine.findAll({ include: ctx.orm.user });
  await ctx.render('routines/index', {
    routines,
    newRoutinePath: ctx.router.url('routines.new'),
    routinePath: (r) => ctx.router.url('routines.show', { id: r.id }),
  });
});

router.get('routines.show', '/:id', async (ctx) => {
  const routine = await ctx.orm.routine.findByPk(ctx.params.id);
  const owner = await ctx.orm.user.findByPk(routine.userId);
  const reviews = await ctx.orm.review.findAll({ include: ctx.orm.user });
  const exerciseAppended = await routine.getExercises();
  if (await owner.checkID(ctx.session.currentUserId) || ctx.state.currentUserIsAdmin) {
    await ctx.render('routines/show', {
      routine,
      reviews,
      owner,
      currentUser: ctx.state.currentUser,
      user_action: true,
      editPath: ctx.router.url('routines.edit', { id: routine.id }),
      deletePath: ctx.router.url('routines.delete', { id: routine.id }),
      newReviewPath: ctx.router.url('reviews.new', { r_id: routine.id }),
      editReviewPath: (r) => ctx.router.url('reviews.edit', { id: r.id, routine_id: routine.id }),
      deleteReviewPath: (r) => ctx.router.url('reviews.delete', { id: r.id, routine_id: routine.id }),
      exerciseAppended,
      add_exercise_path: ctx.router.url('routines.add.exercise', { id: routine.id }),
    });
  } else {
    await ctx.render('routines/show', {
      routine,
      reviews,
      owner,
      currentUser: ctx.state.currentUser,
      editPath: ctx.router.url('routines.edit', { id: routine.id }),
      deletePath: ctx.router.url('routines.delete', { id: routine.id }),
      newRoutinePath: ctx.router.url('routines.new'),
      newReviewPath: ctx.router.url('reviews.new', { r_id: routine.id }),
      editReviewPath: (r) => ctx.router.url('reviews.edit', { id: r.id, routine_id: routine.id }),
      deleteReviewPath: (r) => ctx.router.url('reviews.delete', { id: r.id, routine_id: routine.id }),
      exerciseAppended,
      user_action: false,
      add_exercise_path: ctx.router.url('routines.add.exercise', { id: routine.id }),

    });
  }
});

router.get('routines.edit', '/:id/edit', async (ctx) => {
  const routine = await ctx.orm.routine.findByPk(ctx.params.id);
  const owner = await ctx.orm.user.findByPk(routine.userId);
  if (await owner.checkID(ctx.session.currentUserId) || ctx.state.currentUserIsAdmin) {
    await ctx.render('routines/edit', {
      routine,
      user_action: true,
      routinePath: ctx.router.url('routines.show', { id: routine.id }),
      submitPath: ctx.router.url('routines.update', { id: routine.id }),
    });
  } else {
    const reviews = await ctx.orm.review.findAll({ include: ctx.orm.user });
    const exerciseAppended = await routine.getExercises();
    await ctx.render('routines/show', {
      routine,
      reviews,
      owner,
      currentUser: ctx.state.currentUser,
      editPath: ctx.router.url('routines.edit', { id: routine.id }),
      deletePath: ctx.router.url('routines.delete', { id: routine.id }),
      newRoutinePath: ctx.router.url('routines.new'),
      newReviewPath: ctx.router.url('reviews.new', { r_id: routine.id }),
      editReviewPath: (r) => ctx.router.url('reviews.edit', { id: r.id, routine_id: routine.id }),
      deleteReviewPath: (r) => ctx.router.url('reviews.delete', { id: r.id, routine_id: routine.id }),
      exerciseAppended,
      user_action: false,
      add_exercise_path: ctx.router.url('routines.add.exercise', { id: routine.id }),
      error: 'Only Routine owner can edit',
    });
  }
});

router.patch('routines.update', '/:id', async (ctx) => {
  const routine = await ctx.orm.routine.findByPk(ctx.params.id);
  try {
    const { title, description, cathegory } = ctx.request.body;
    await routine.update({ title, description, cathegory });
    ctx.redirect(ctx.router.url('routines.show', { id: routine.id }));
  } catch (error) {
    await ctx.render('routines/edit', {
      error,
      routine,
      routinePath: ctx.router.url('routines.show', { id: routine.id }),
      submitPath: ctx.router.url('routines.update', { id: routine.id }),
    });
  }
});

router.del('routines.delete', '/:id', async (ctx) => {
  const routine = await ctx.orm.routine.findByPk(ctx.params.id);
  await routine.destroy();
  ctx.redirect(ctx.router.url('routines.index'));
});

router.get('routines.add.exercise', '/:id/add_exer', async (ctx) => {
  const routine = await ctx.orm.routine.findByPk(ctx.params.id);
  const exerciseAppended = await routine.getExercises();
  const exerciseFree = await ctx.orm.sequelize.query(`
        SELECT * FROM exercises
        Where id not in(
            Select "exerciseId" From routine_exercises
            Where "routineId" = ${routine.id}
         )
    `, { type: QueryTypes.SELECT });
  await ctx.render('routines/add_exercise', {
    routine,
    exerciseAppended,
    exerciseFree,
    routine_show_path: ctx.router.url('routines.show', { id: routine.id }),
    add_exer_path: (exer) => ctx.router.url('routines.append.exercise', { id: routine.id, exerciseId: exer.id }),
    del_exer_path: (exer) => ctx.router.url('routines.remove.exercise', { id: routine.id, exerciseId: exer.id }),
  });
});

router.put('routines.append.exercise', '/:id/add_exer/:exerciseId', async (ctx) => {
  const routine = await ctx.orm.routine.findByPk(ctx.params.id);
  const exercise = await ctx.orm.exercise.findByPk(ctx.params.exerciseId);
  await routine.addExercise(exercise);
  ctx.redirect(ctx.router.url('routines.add.exercise', { id: routine.id }));
});

router.del('routines.remove.exercise', '/:id/del_exer/:exerciseId', async (ctx) => {
  const routine = await ctx.orm.routine.findByPk(ctx.params.id);
  const exercise = await ctx.orm.exercise.findByPk(ctx.params.exerciseId);
  await routine.removeExercise(exercise);
  ctx.redirect(ctx.router.url('routines.add.exercise', { id: routine.id }));
});

module.exports = router;
