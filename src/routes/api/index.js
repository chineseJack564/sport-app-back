require('dotenv').config();
const KoaRouter = require('koa-router');
const jwt = require('koa-jwt');
const { apiSetCurrentUser } = require('../../middlewares/auth');
const routines = require('./routines');
const reviews = require('./reviews');
const users = require('./users');
const auth = require('./auth');
const exercises = require('./exercises');

const router = new KoaRouter({ prefix: '/api' });

router.use('/auth', auth.routes());
router.use('/users', users.routes());

router.use(jwt({ secret: process.env.JWT_SECRET, key: 'authData' }).unless({
  method: 'GET',
}));
router.use(apiSetCurrentUser);
router.use('/routines', routines.routes());
router.use('/reviews', reviews.routes());
router.use('/exercises', exercises.routes());

module.exports = router;
