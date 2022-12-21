const KoaRouter = require('koa-router');

const router = new KoaRouter();

router.get('reviews.new', '/:r_id/new', async (ctx) => {
  const review = ctx.orm.review.build();
  const routine = ctx.orm.routine.findByPk(ctx.params.r_id);

  if (ctx.session.currentUserId) {
    await ctx.render('reviews/new', {
      review,
      routine,
      submitPath: ctx.router.url('reviews.create', { id: ctx.params.r_id }),
      reviewPath: (r) => ctx.router.url('reviews.show', { id: r.id }),
    });
  } else {
    const reviews = await ctx.orm.review.findAll({ include: ctx.orm.user });
    await ctx.render('reviews/index', {
      errors: 'You need to login to create a new review',
      reviews,
      newReviewPath: ctx.router.url('reviews.new'),
      reviewPath: (r) => ctx.router.url('reviews.show', { id: r.id }),
    });
  }
});

router.post('reviews.create', '/:id', async (ctx) => {
  const review = ctx.orm.review.build(ctx.request.body);
  review.routineId = ctx.params.id;
  review.userId = ctx.state.currentUser.id;
  try {
    await review.save({ fields: ['userId', 'routineId', 'title', 'score', 'content'] });
    ctx.redirect(ctx.router.url('routines.show', { id: ctx.params.id }));
  } catch (ValidationError) {
    await ctx.render('reviews/new', {
      errors: ValidationError.errors,
      review,
      submitPath: ctx.router.url('reviews.create', { id: ctx.params.id }),
      reviewPath: (r) => ctx.router.url('reviews.show', { id: r.id }),
    });
  }
});

router.get('reviews.index', '/', async (ctx) => {
  const reviews = await ctx.orm.review.findAll({ include: ctx.orm.user });
  // console.log(reviews);
  await ctx.render('reviews/index', {
    reviews,
    reviewPath: (r) => ctx.router.url('reviews.show', { id: r.id }),
  });
});

router.get('reviews.show', '/:id', async (ctx) => {
  const review = await ctx.orm.review.findByPk(ctx.params.id);
  const owner = await ctx.orm.user.findByPk(review.userId);
  if (await owner.checkID(ctx.session.currentUserId) || ctx.state.currentUserIsAdmin) {
    await ctx.render('reviews/show', {
      review,
      owner,
      user_action: true,
      editPath: ctx.router.url('reviews.edit', { id: review.id }),
      deletePath: ctx.router.url('reviews.delete', { id: review.id }),
      indexPath: ctx.router.url('reviews.index'),
    });
  } else {
    await ctx.render('reviews/show', {
      review,
      owner,
      user_action: false,
      editPath: ctx.router.url('reviews.edit', { id: review.id }),
      deletePath: ctx.router.url('reviews.delete', { id: review.id }),

    });
  }
});

router.get('reviews.edit', '/:id/edit/:routine_id', async (ctx) => {
  const review = await ctx.orm.review.findByPk(ctx.params.id);
  const routine = await ctx.orm.routine.findByPk(ctx.params.routine_id);
  const owner = await ctx.orm.user.findByPk(review.userId);
  if (await owner.checkID(ctx.session.currentUserId) || ctx.state.currentUserIsAdmin) {
    await ctx.render('reviews/edit', {
      review,
      user_action: true,
      reviewPath: ctx.router.url('reviews.show', { id: review.id }),
      submitPath: ctx.router.url('reviews.update', { id: review.id, routine_id: routine.id }),
    });
  } else {
    await ctx.render('reviews/show', {
      review,
      owner,
      user_action: false,
      editPath: ctx.router.url('reviews.edit', { id: review.id }),
      deletePath: ctx.router.url('reviews.delete', { id: review.id }),
      error: 'Only owner can edit',
    });
  }
});

router.patch('reviews.update', '/:id/:routine_id', async (ctx) => {
  const review = await ctx.orm.review.findByPk(ctx.params.id);
  const routine = await ctx.orm.routine.findByPk(ctx.params.routine_id);
  try {
    const { title, score, content } = ctx.request.body;
    await review.update({ title, score, content });
    ctx.redirect(ctx.router.url('routines.show', { id: routine.id }));
  } catch (error) {
    await ctx.render('reviews/edit', {
      error,
      review,
      reviewPath: ctx.router.url('reviews.show', { id: review.id }),
      submitPath: ctx.router.url('reviews.update', { id: review.id }),
    });
  }
});

router.del('reviews.delete', '/:id/:routine_id', async (ctx) => {
  const review = await ctx.orm.review.findByPk(ctx.params.id);
  const routine = await ctx.orm.routine.findByPk(ctx.params.routine_id);
  await review.destroy();
  ctx.redirect(ctx.router.url('routines.show', { id: routine.id }));
});

module.exports = router;
