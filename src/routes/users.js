const KoaRouter = require('koa-router');

const router = new KoaRouter();

// Middleware
router.param('id', async (id, ctx, next) => {
  ctx.state.user = await ctx.orm.user.findByPk(id);
  if (!ctx.state.user) return ctx.throw(404);
  return next();
});

router.get('users.new', '/new', async (ctx) => {
  await ctx.render('forms/register', {
    submitUserPath: ctx.router.url('users.create'),
  });
});

router.post('users.create', '/', async (ctx) => {
  const { mail } = ctx.request.body;
  const user = ctx.orm.user.build(ctx.request.body);
  try {
    await user.save({ fields: ['username', 'mail', 'password', 'objective'] });
    const userN = await ctx.orm.user.findOne({ where: { mail } });
    const hash = await userN.getHashID();
    userN.hashedId = hash;
    await userN.save();
    ctx.session.currentUserId = userN.hashedId;
    ctx.redirect('/');
  } catch (ValidationError) {
    await ctx.render('forms/register', {
      errors: ValidationError.errors,
      submitUserPath: ctx.router.url('users.create'),
    });
  }
});

router.get('users.index', '/', async (ctx) => {
  const { user } = await ctx.state;
  const users = await ctx.orm.user.findAll();
  if (ctx.state.currentUser.isAdmin === 1) {
    await ctx.render('users/index', {
      user,
      users,
      userCertifyPath: (u) => ctx.router.url('users.certify', { id: u.id }),
      userDeletePath: (u) => ctx.router.url('users.delete-user', { id: u.id }),
    });
  } else {
    ctx.redirect('/');
  }
});

router.patch('users.certify', '/:id/certify', async (ctx) => {
  const userToCertify = await ctx.orm.user.findByPk(ctx.params.id);
  if (ctx.state.currentUser.isAdmin) {
    const { isCertified } = ctx.request.body;
    await userToCertify.update({ isCertified });
    ctx.redirect(ctx.router.url('users.index'));
  } else {
    ctx.redirect('/');
  }
});

// DELETE A SPECIFIC USER
router.del('users.delete-user', '/:id/delete-user', async (ctx) => {
  const userToDelete = await ctx.orm.user.findByPk(ctx.params.id);
  await userToDelete.destroy();
  ctx.redirect(ctx.router.url('users.index'));
});

router.get('users.show', '/:id', async (ctx) => {
  const { user } = await ctx.state;
  await ctx.render('users/show', {
    user,
    userProfilePath: ctx.router.url('users.profile', { id: user.id }),
  });
});

router.get('users.profile', '/:id/profile', async (ctx) => {
  const { user } = await ctx.state;
  await ctx.render('users/profile', {
    user,
    editPath: ctx.router.url('users.edit', { id: user.id }),
  });
});

router.get('users.edit', '/:id/profile/edit', async (ctx) => {
  const { user } = await ctx.state;
  await ctx.render('users/edit-profile', {
    error: '',
    notice: '',
    user,
    profilePath: ctx.router.url('users.profile', { id: user.id }),
    updatePath: ctx.router.url('users.update', { id: user.id }),
    deletePath: ctx.router.url('users.delete', { id: user.id }),
  });
});

router.patch('users.update', '/:id/update', async (ctx) => {
  const { user } = await ctx.state;
  try {
    const {
      username, formerPassword, password, confirmNewPass, mail, objective,
    } = ctx.request.body;
    let { profession } = ctx.request.body;
    if (typeof (profession) === 'undefined') { profession = 0; }
    if (user.checkPassword(formerPassword) === false) {
      await ctx.render('users/edit-profile', {
        error: '',
        user,
        profilePath: ctx.router.url('users.profile', { id: user.id }),
        updatePath: ctx.router.url('users.update', { id: user.id }),
        deletePath: ctx.router.url('users.delete', { id: user.id }),
        notice: "The password you entered doesn't match your current. Please enter your current password.",
      });
    } else if (password !== confirmNewPass) {
      await ctx.render('users/edit-profile', {
        error: '',
        user,
        profilePath: ctx.router.url('users.profile', { id: user.id }),
        updatePath: ctx.router.url('users.update', { id: user.id }),
        deletePath: ctx.router.url('users.delete', { id: user.id }),
        notice: "Your new password doesn't match with the confirm password field. Please make sure they match.",
      });
    } else {
      await user.update({
        username, password, mail, objective, profession,
      });
      ctx.redirect(ctx.router.url('users.profile', { id: user.id }));
    }
  } catch (err) {
    await ctx.render('users/edit-profile', {
      error: err,
      user,
      profilePath: ctx.router.url('users.profile', { id: user.id }),
      updatePath: ctx.router.url('users.update', { id: user.id }),
      deletePath: ctx.router.url('users.delete', { id: user.id }),
      notice: '',
    });
  }
});

router.del('users.delete', '/:id', async (ctx) => {
  const { user } = await ctx.state;
  ctx.session.currentUserId = null;
  await user.destroy();
  ctx.redirect('/');
});

module.exports = router;
