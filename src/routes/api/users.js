const KoaRouter = require('koa-router');
const jwt = require('koa-jwt');
const jwtgenerator = require('jsonwebtoken');
const { apiSetCurrentUser } = require('../../middlewares/auth');

function generateToken(user) {
  return new Promise((resolve, reject) => {
    jwtgenerator.sign(
      { sub: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '2h' },
      (err, tokenResult) => (err ? reject(err) : resolve(tokenResult)),
    );
  });
}

const usersNoSecret = (users) => users.map((user) => {
  const userTemp = { ...user };
  const { password, hashedId, ...userNoSecret } = userTemp.dataValues;
  return userNoSecret;
});

const router = new KoaRouter();

router.post('api.users.create', '/', async (ctx) => {
  const { cloudinary } = ctx.state;
  const user = ctx.orm.user.build(ctx.request.body);
  try {
    if (process.env.NODE_ENV !== 'test') {
      const { profilePhoto } = ctx.request.files;

      if (profilePhoto && profilePhoto.size > 0) {
        const { url } = await cloudinary.uploader.upload(profilePhoto.path);
        user.profilePhoto = url;
        await user.save({ fields: ['username', 'mail', 'password', 'objective', 'profilePhoto', 'profession'] });
      } else {
        await user.save({ fields: ['username', 'mail', 'password', 'objective', 'profession'] });
      }
    } else {
      await user.save({ fields: ['username', 'mail', 'password', 'objective', 'profession'] });
    }
    const token = await generateToken(user);
    ctx.status = 201;
    ctx.body = {
      id: user.id,
      profilePhoto: user.profilePhoto,
      username: user.username,
      mail: user.mail,
      objective: user.objective,
      profession: user.profession,
      isAdmin: user.isAdmin,
      isCertified: user.isCertified,
      access_token: token,
      token_type: 'Bearer',
    };
  } catch (error) {
    ctx.throw(400, error);
  }
});

// Protected routes
router.use(jwt({ secret: process.env.JWT_SECRET, key: 'authData' }));
router.use(apiSetCurrentUser);

router.get('api.users.resource', '/resources', async (ctx) => {
  const user = ctx.state.currentUser;
  if (user.isAdmin === 1) {
    const routines = await ctx.orm.routine.findAll();
    const exercises = await ctx.orm.exercise.findAll();
    const reviews = await ctx.orm.review.findAll(({ include: ctx.orm.user }));
    const repreviews = reviews.filter((review) => review.isReported === 1);
    const users = await ctx.orm.user.findAll();
    ctx.body = {
      routines, exercises, reviews, users, repreviews, favRoutines: [],
    };
    ctx.status = 200;
  } else {
    const routines = await user.getRoutines();
    const exercises = await user.getExercises();
    const reviews = await user.getReviews();
    const favRoutines = await user.getFavorite();
    ctx.body = {
      routines, exercises, reviews, favRoutines, repreviews: [],
    };
    ctx.status = 200;
  }
});

router.get('api.users.index', '/index', async (ctx) => {
  if (ctx.state.currentUser.isAdmin === 1) {
    const users = await ctx.orm.user.findAll();
    const respUser = usersNoSecret(users);
    ctx.body = { users: respUser };
  } else {
    ctx.throw(401);
  }
});

router.patch('api.users.certify', '/:id/certify', async (ctx) => {
  const userToCertify = await ctx.orm.user.findByPk(ctx.params.id);
  if (ctx.state.currentUser.isAdmin) {
    const { isCertified } = ctx.request.body;
    await userToCertify.update({ isCertified });
    const users = await ctx.orm.user.findAll();
    const respUser = usersNoSecret(users);
    ctx.body = { users: respUser };
  } else {
    ctx.throw(401);
  }
});

router.del('api.delete.user', '/:id', async (ctx) => {
  const userToDelete = await ctx.orm.user.findByPk(ctx.params.id);
  if (ctx.state.currentUser.isAdmin || userToDelete.id === ctx.state.currentUser.id) {
    await userToDelete.destroy();
    ctx.status = 204;
  } else {
    ctx.throw(401);
  }
});

router.get('api.user.profile', '/:id', async (ctx) => {
  const user = await ctx.orm.user.findByPk(ctx.params.id);
  if (!user) {
    ctx.throw(404);
  }
  if (user.id === ctx.state.currentUser.id) {
    ctx.body = {
      id: user.id,
      username: user.username,
      profilePhoto: user.profilePhoto,
      mail: user.mail,
      objective: user.objective,
      profession: user.profession,
      isAdmin: user.isAdmin,
      isCertified: user.isCertified,
      myProfile: true,
    };
  } else {
    ctx.body = {
      id: user.id,
      username: user.username,
      profilePhoto: user.profilePhoto,
      mail: user.mail,
      objective: user.objective,
      profession: user.profession,
      isAdmin: user.isAdmin,
      isCertified: user.isCertified,
      myProfile: false,
    };
  }
});

router.patch('api.users.update', '/:id/update', async (ctx) => {
  try {
    const user = await ctx.orm.user.findByPk(ctx.params.id);
    const { cloudinary } = ctx.state;
    if (user.id === ctx.state.currentUser.id || ctx.state.currentUser.isAdmin) {
      const {
        username, formerPassword, password, mail, objective, profession,
      } = ctx.request.body;

      if (process.env.NODE_ENV !== 'test') {
        if (await user.checkPassword(formerPassword) === false) {
          ctx.throw(401, 'Wrong password');
        } else {
          const { profilePhoto } = ctx.request.files;
          if (profilePhoto && profilePhoto.size > 0) {
            const { url } = await cloudinary.uploader.upload(profilePhoto.path);
            await user.update({
              username, password, mail, objective, profession, profilePhoto: url,
            });
          } else {
            await user.update({
              username, password, mail, objective, profession,
            });
          }
          const token = await generateToken(user);
          ctx.body = {
            id: user.id,
            profilePhoto: user.profilePhoto,
            username: user.username,
            mail: user.mail,
            objective: user.objective,
            profession: user.profession,
            isAdmin: user.isAdmin,
            isCertified: user.isCertified,
            access_token: token,
            token_type: 'Bearer',
          };
          ctx.status = 200;
        }
      } else {
        await user.update({
          username, password, mail, objective, profession,
        });
      }
    } else {
      ctx.throw(401, "You can't update this user");
    }
  } catch (error) {
    ctx.throw(404, error);
  }
});

router.get('api.users.fav.routine', '/:uid/fav_routines', async (ctx) => {
  const user = await ctx.orm.user.findByPk(ctx.params.uid);
  if (ctx.state.currentUser.id === user.id || ctx.state.currentUser.isAdmin === 1) {
    const favRoutines = await user.getFavorite();
    ctx.body = { favRoutines };
  } else {
    ctx.throw(401);
  }
});

router.put('api.users.append.routine', '/add_routine/:routineId', async (ctx) => {
  try {
    const user = ctx.state.currentUser;
    const routine = await ctx.orm.routine.findByPk(ctx.params.routineId);
    await user.addFavorite(routine);
    ctx.status = 200;
  } catch (error) {
    ctx.throw(404);
  }
});

router.del('api.users.remove.routine', '/del_routine/:routineId', async (ctx) => {
  try {
    const user = ctx.state.currentUser;
    const routine = await ctx.orm.routine.findByPk(ctx.params.routineId);
    await user.removeFavorite(routine);
    ctx.status = 200;
  } catch (error) {
    ctx.throw(404);
  }
});

module.exports = router;
