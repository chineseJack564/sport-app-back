const supertest = require('supertest');
const { format } = require('date-fns');
const app = require('../../../app');

const request = supertest(app.callback());

describe('Api routes for routines', () => {
  let auth;
  let user1;
  const user = {
    username: 'TestUser',
    mail: 'test@uc.cl',
    password: 'test_passs',
  };

  beforeAll(async () => {
    await app.context.orm.sequelize.sync({ force: true });
    user1 = await app.context.orm.user.create(user);
    const authResponse = await request.post('/api/auth').set('Content-type', 'application/json').send({ mail: user.mail, password: user.password });
    auth = authResponse.body;
  });

  afterAll(async () => {
    await app.context.orm.sequelize.close();
  });

  describe('GET /api/routines', () => {
    let response;
    const r1Data = {
      title: 'Rutine 1',
      description: 'One of the best routine you can get on this page',
      cathegory: 'Build Muscle',
      createdAt: format(new Date(2021, 11, 9), 'yyyy-MM-dd'),
      updatedAt: format(new Date(2021, 11, 9), 'yyyy-MM-dd'),
    };
    const r2Data = {
      title: 'Rutine 2',
      description: 'One of the best routine you can get on this page',
      cathegory: 'Build Muscle',
      createdAt: format(new Date(2021, 11, 9), 'yyyy-MM-dd'),
      updatedAt: format(new Date(2021, 11, 9), 'yyyy-MM-dd'),
    };
    const Indexrequest = () => request.get('/api/routines');
    beforeAll(async () => {
      await app.context.orm.routine.create(r1Data);
      await app.context.orm.routine.create(r2Data);
      response = await Indexrequest();
    });
    test('responde with 200', () => {
      expect(response.status).toBe(200);
    });
    test('responde with json', () => {
      expect(response.type).toEqual('application/json');
    });
  });

  describe('GET /api/routines/:id', () => {
    let r1;
    let response;
    const r1Data = {
      title: 'Rutine 1',
      description: 'One of the best routine you can get on this page',
      cathegory: 'Build Muscle',
      createdAt: format(new Date(), 'yyyy-MM-dd'),
      updatedAt: format(new Date(), 'yyyy-MM-dd'),
    };
    const showrequest = (id) => request.get(`/api/routines/${id}`);
    beforeAll(async () => {
      r1 = await app.context.orm.routine.create(r1Data);
    });
    describe('when passed id exists in routines', () => {
      beforeAll(async () => {
        response = await showrequest(r1.id);
      });
      test('responde with 200', () => {
        expect(response.status).toBe(200);
      });
      test('responde with saved attributes', () => {
        expect(response.body.routine.title).toEqual(r1Data.title);
      });
    });

    describe('when passed id dont exists in routines', () => {
      beforeAll(async () => {
        response = await showrequest(5);
      });
      test('responde with 404', () => {
        expect(response.status).toBe(404);
      });
    });
  });

  describe('POST api/routines/', () => {
    const validData = {
      title: 'Rutine 1',
      description: 'One of the best routine you can get on this page',
      cathegory: 'Build Muscle',
      createdAt: format(new Date(), 'yyyy-MM-dd'),
    };
    const invalidData = {
      title: 'R1',
    };

    const authorizedPost = () => request
      .post('/api/routines')
      .auth(auth.access_token, { type: 'bearer' })
      .set('Content-type', 'application/json')
      .send(validData);

    const authorizedFailPost = () => request
      .post('/api/routines')
      .auth(auth.access_token, { type: 'bearer' })
      .set('Content-type', 'application/json')
      .send(invalidData);

    const noAuthorizedPost = () => request
      .post('/api/routines')
      .set('Content-type', 'application/json')
      .send(validData);

    describe('when user is authorized', () => {
      let response;
      describe('when attributes are valid', () => {
        beforeAll(async () => {
          response = await authorizedPost();
        });

        test('responde with 201', () => {
          expect(response.status).toBe(201);
        });
        test('responde with json', () => {
          expect(response.type).toEqual('application/json');
        });
        test('match attributes', async () => {
          const routine = await app.context.orm.routine.findByPk(response.body.routine.id);
          expect(routine.title).toEqual(validData.title);
          expect(routine.userId).toEqual(auth.id);
        });
      });
      describe('when attributes are not valid', () => {
        beforeAll(async () => {
          response = await authorizedFailPost();
        });
        test('responde with 400', () => {
          expect(response.status).toBe(400);
        });
      });
    });

    describe('when user is not logged', () => {
      let response;
      beforeAll(async () => {
        response = await noAuthorizedPost();
      });
      test('responde with 401', () => {
        expect(response.status).toBe(401);
      });
    });
  });

  describe('Get api/routines/edit', () => {
    let r1;
    let response;
    const editrequest = (id) => request
      .get(`/api/routines/${id}/edit`)
      .auth(auth.access_token, { type: 'bearer' });

    beforeAll(async () => {
      const r1Data = {
        title: 'Rutine 1',
        description: 'One of the best routine you can get on this page',
        cathegory: 'Build Muscle',
        userId: user1.id,
        createdAt: format(new Date(), 'yyyy-MM-dd'),
        updatedAt: format(new Date(), 'yyyy-MM-dd'),
      };
      r1 = await app.context.orm.routine.create(r1Data);
    });
    describe('when passed id exists in routines', () => {
      beforeAll(async () => {
        response = await editrequest(r1.id);
      });
      test('responde with 200', () => {
        expect(response.status).toBe(200);
      });
    });
  });

  describe('Patch api/routines/:id', () => {
    let r1;
    const updateData = {
      title: 'Rutine 1 Update1',
      description: 'One of the best routine you can get on this page',
      cathegory: 'Build Muscle',
    };
    const authedupdatetrequest = (id) => request
      .patch(`/api/routines/${id}`)
      .auth(auth.access_token, { type: 'bearer' })
      .set('Content-type', 'application/json')
      .send(updateData);

    beforeAll(async () => {
      const r1Data = {
        title: 'Rutine 1',
        description: 'One of the best routine you can get on this page',
        cathegory: 'Build Muscle',
        userId: user1.id,
        createdAt: format(new Date(), 'yyyy-MM-dd'),
        updatedAt: format(new Date(), 'yyyy-MM-dd'),
      };
      r1 = await app.context.orm.routine.create(r1Data);
    });

    test('update the correct routine', async () => {
      await authedupdatetrequest(r1.id);
      const routine = await app.context.orm.routine.findByPk(r1.id);
      expect(routine.title).toEqual(updateData.title);
    });
  });

  describe('Delete api/routines/:id', () => {
    let r1;
    const deleteroutine = (id) => request
      .delete(`/api/routines/${id}`)
      .auth(auth.access_token, { type: 'bearer' });

    beforeAll(async () => {
      const r1Data = {
        title: 'Rutine 1',
        description: 'One of the best routine you can get on this page',
        cathegory: 'Build Muscle',
        userId: user1.id,
        createdAt: format(new Date(), 'yyyy-MM-dd'),
        updatedAt: format(new Date(), 'yyyy-MM-dd'),
      };
      r1 = await app.context.orm.routine.create(r1Data);
    });

    test('delete the correct routine', async () => {
      await deleteroutine(r1.id);
      const routine = await app.context.orm.routine.findByPk(r1.id);
      expect(routine).toBeNull();
    });
  });

  describe('Get api/routines/:id/add_exer', () => {
    let r1;
    let e1;
    let response;
    const addexerrequest = (id) => request
      .get(`/api/routines/${id}/add_exer`)
      .auth(auth.access_token, { type: 'bearer' });

    const noAuthAdd = (id) => request
      .get(`/api/routines/${id}/add_exer`);

    beforeAll(async () => {
      const r1Data = {
        title: 'Rutine 1',
        description: 'One of the best routine you can get on this page',
        cathegory: 'Build Muscle',
        userId: user1.id,
        createdAt: format(new Date(), 'yyyy-MM-dd'),
        updatedAt: format(new Date(), 'yyyy-MM-dd'),
      };
      r1 = await app.context.orm.routine.create(r1Data);
      const e1Data = {
        name: 'Test Exercise',
        description: 'Test Description',
        workZoneP: 'Test WorkZone',
        workZoneS: 'Test WorkZone',
      };
      e1 = await app.context.orm.exercise.create(e1Data);
    });

    test('responde with 200 when id exist', async () => {
      response = await addexerrequest(r1.id);
      expect(response.status).toBe(200);
    });

    test('responde with free exercise', async () => {
      response = await addexerrequest(r1.id);
      expect(response.body.exerciseFree[0].name).toEqual(e1.name);
    });

    test('responde with 404', async () => {
      response = await addexerrequest(100);
      expect(response.status).toBe(404);
    });

    test('responde with 401', async () => {
      response = await noAuthAdd(r1.id);
      expect(response.status).toBe(401);
    });
  });

  describe('PUT api/routines/:id/add_exer/:exerciseId', () => {
    let r1;
    let e1;
    const addexerrequest = (id, exerciseId) => request
      .put(`/api/routines/${id}/add_exer/${exerciseId}`)
      .auth(auth.access_token, { type: 'bearer' });

    beforeAll(async () => {
      const r1Data = {
        title: 'Rutine 1',
        description: 'One of the best routine you can get on this page',
        cathegory: 'Build Muscle',
        userId: user1.id,
      };
      r1 = await app.context.orm.routine.create(r1Data);
      const e1Data = {
        name: 'Test Exercise',
        description: 'Test Description',
        workZoneP: 'Test WorkZone',
        workZoneS: 'Test WorkZone',
      };
      e1 = await app.context.orm.exercise.create(e1Data);
    });

    test('add exercise to routine', async () => {
      await addexerrequest(r1.id, e1.id);
      const routine = await app.context.orm.routine.findByPk(r1.id);
      const exercise = await routine.getExercises();
      expect(exercise.length).toEqual(1);
    });
  });

  describe('DELETE api/routines/:id/add_exer/:exerciseId', () => {
    let r1;
    let e1;
    const addexerrequest = (id, exerciseId) => request
      .put(`/api/routines/${id}/add_exer/${exerciseId}`)
      .auth(auth.access_token, { type: 'bearer' });

    const deleteexerrequest = (id, exerciseId) => request
      .delete(`/api/routines/${id}/del_exer/${exerciseId}`)
      .auth(auth.access_token, { type: 'bearer' });

    beforeAll(async () => {
      const r1Data = {
        title: 'Rutine 1',
        description: 'One of the best routine you can get on this page',
        cathegory: 'Build Muscle',
        userId: user1.id,
      };
      r1 = await app.context.orm.routine.create(r1Data);
      const e1Data = {
        name: 'Test Exercise',
        description: 'Test Description',
        workZoneP: 'Test WorkZone',
        workZoneS: 'Test WorkZone',
      };
      e1 = await app.context.orm.exercise.create(e1Data);
    });

    test('delete exercise from routine', async () => {
      await addexerrequest(r1.id, e1.id);
      await deleteexerrequest(r1.id, e1.id);
      const routine = await app.context.orm.routine.findByPk(r1.id);
      const exercise = await routine.getExercises();
      expect(exercise.length).toEqual(0);
    });
  });
});
