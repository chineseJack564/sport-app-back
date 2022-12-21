const supertest = require('supertest');
const app = require('../../../app');

const request = supertest(app.callback());

describe('Test for users API', () => {
  beforeAll(async () => {
    await app.context.orm.sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await app.context.orm.sequelize.close();
  });

  describe('Post api/users/', () => {
    test('Should create a new user', async () => {
      const res = () => request
        .post('/api/users')
        .set('Content-type', 'application/json')
        .send({
          username: 'test',
          mail: '1@uc.cl',
          password: '123456',
        });
      const response = await res();
      expect(response.body.username).toEqual('test');
    });
  });

  describe('Tests for admin or auth user', () => {
    let auth;
    let authAdmin;
    let user1;
    const user = {
      username: 'TestUser',
      mail: 'test@uc.cl',
      password: 'test_passs',
    };

    const adminData = {
      username: 'Test admin',
      mail: 'admin@uc.cl',
      password: 'test_passs',
      isAdmin: 1,
    };

    beforeAll(async () => {
      await app.context.orm.sequelize.sync({ force: true });
      user1 = await app.context.orm.user.create(user);
      await app.context.orm.user.create(adminData);
      const authResponse = await request.post('/api/auth').set('Content-type', 'application/json').send({ mail: user.mail, password: user.password });
      auth = authResponse.body;
      const authResponseAdmin = await request.post('/api/auth').set('Content-type', 'application/json').send({ mail: adminData.mail, password: adminData.password });
      authAdmin = authResponseAdmin.body;
    });

    describe('Get api/users/index', () => {
      const adminRequest = () => request.get('/api/users/index').auth(authAdmin.access_token, { type: 'bearer' });
      const notAdminRequest = () => request.get('/api/users/index').auth(auth.access_token, { type: 'bearer' });
      test('Should return a list of users with admin', async () => {
        const response = await adminRequest();
        expect(response.body.users.length).toBe(2);
      });

      test('Should return 401 when not admin', async () => {
        const response = await notAdminRequest();
        expect(response.status).toBe(401);
      });
    });

    describe('Patch api/users/:id/certify', () => {
      const adminRequest = () => request.patch(`/api/users/${user1.id}/certify`).auth(authAdmin.access_token, { type: 'bearer' })
        .set('Content-type', 'application/json')
        .send({ isCertified: 1 });
      const notAdminRequest = () => request.patch(`/api/users/${user1.id}/certify`).auth(auth.access_token, { type: 'bearer' })
        .set('Content-type', 'application/json')
        .send({ isCertified: 1 });

      test('Should certify user when', async () => {
        await adminRequest();
        const userTemp = await app.context.orm.user.findByPk(user1.id);
        expect(userTemp.isCertified).toBe(1);
      });

      test('Should return 401 when not admin', async () => {
        const response = await notAdminRequest();
        expect(response.status).toBe(401);
      });
    });

    describe('Get api/users/:id', () => {
      const adminRequest = () => request.get(`/api/users/${user1.id}`).auth(authAdmin.access_token, { type: 'bearer' });
      const myRequest = () => request.get(`/api/users/${user1.id}`).auth(auth.access_token, { type: 'bearer' });
      const noAuthRequest = () => request.get(`/api/users/${user1.id}`);

      test('Should return not my profile when admin', async () => {
        const response = await adminRequest();
        expect(response.body.myProfile).toEqual(false);
        expect(response.body.username).toEqual(user1.username);
      });

      test('Should return my profile when is user', async () => {
        const response = await myRequest();
        expect(response.body.myProfile).toEqual(true);
        expect(response.body.username).toEqual(user1.username);
      });

      test('Should return 401 when not auth', async () => {
        const response = await noAuthRequest();
        expect(response.status).toBe(401);
      });
    });

    describe('Patch api/users/:id/update', () => {
      const adminRequest = () => request.patch(`/api/users/${user1.id}/update`).auth(authAdmin.access_token, { type: 'bearer' })
        .set('Content-type', 'application/json')
        .send({
          username: 'changed',
          formerPassword: '123456',
          password: '1234566',
          confirmNewPass: '1234566',
          mail: 'update@mail.cl',
        });
      test('Should update user', async () => {
        await adminRequest();
        const userTemp = await app.context.orm.user.findByPk(user1.id);
        expect(userTemp.username).toEqual('changed');
        expect(userTemp.mail).toEqual('update@mail.cl');
      });
    });

    describe('Delete api/user/:id', () => {
      const adminRequest = () => request.delete(`/api/users/${user1.id}`).auth(authAdmin.access_token, { type: 'bearer' });
      test('Should delete user when admin', async () => {
        await adminRequest();
        const userTemp = await app.context.orm.user.findByPk(user1.id);
        expect(userTemp).toBe(null);
      });
    });
  });
});
