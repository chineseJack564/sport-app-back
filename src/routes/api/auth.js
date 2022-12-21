const KoaRouter = require('koa-router');
const jwtgenerator = require('jsonwebtoken');

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

const router = new KoaRouter();

router.post('api.auth.login', '/', async (ctx) => {
  const { mail, password } = ctx.request.body;
  const user = await ctx.orm.user.findOne({ where: { mail } });
  if (!user) ctx.throw(404, 'No user found with input email');
  const auth = user && await user.checkPassword(password);
  if (!auth) ctx.throw(401, 'Invalid password');
  const token = await generateToken(user);
  ctx.body = {
    id: user.id,
    username: user.username,
    mail: user.mail,
    profilePhoto: user.profilePhoto,
    objective: user.objective,
    profession: user.profession,
    isAdmin: user.isAdmin,
    isCertified: user.isCertified,
    access_token: token,
    token_type: 'Bearer',
  };
});

module.exports = router;
