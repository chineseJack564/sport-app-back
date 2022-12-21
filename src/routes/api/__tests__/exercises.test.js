const supertest = require('supertest');
const app = require('../../../app');

const request = supertest(app.callback());

describe('API exercise endpoints', () => {
  let response;
  let exercise;

  beforeAll(async () => {
    await app.context.orm.sequelize.sync({ force: true });
    // Sincroniza lo que está en el modelo mapeando con la base de datos
  });

  afterAll(async () => {
    await app.context.orm.sequelize.close();
  });

  describe('Unprotected exercises routes', () => {
    describe('GET /api/exercises', () => {
      const getExercises = () => request.get('/api/exercises');

      describe('when there are no exercises', () => {
        beforeAll(async () => {
          response = await getExercises();
        });

        test('returns an empty array', () => {
          expect(response.body.data).toEqual([]);
        });
      });
    });

    describe('GET /api/exercises/:id', () => {
      const exerciseData = {
        name: 'Test Exercise 1',
        description: 'Test Description 1',
        workZoneP: 'Test WorkZone 1',
        workZoneS: 'Test WorkZone 2',
      };

      const getExercise = (id) => request.get(`/api/exercises/${id}`);

      beforeAll(async () => {
        exercise = await app.context.orm.exercise.create(exerciseData);
        // Create hace un build, save y retorna exercise
      });

      describe('When passed id corresponds to an existing exercise', () => {
        beforeAll(async () => {
          response = await getExercise(exercise.id);
        });

        test('Returns status code 200', () => {
          expect(response.status).toBe(200);
        });
      });

      describe('When passed id does not correspond to an existing exercise', () => {
        test('Returns status code 404', async () => {
          response = await getExercise(exercise.id * -1);
          expect(response.status).toBe(404);
        });
      });
    });
  });

  describe('Protected exercises routes', () => {
    let token;
    const userData = {
      username: 'TestUser',
      password: 'TestPassword',
      mail: '1@uc.cl',
    };
    const { mail, password } = userData;

    const postAuth = (body) => request
      .post('/api/auth')
      .set('Content-type', 'application/json')
      .send(body);

    describe('POST /api/exercises', () => {
      const exerciseData = {
        name: 'Test Exercise 2',
        description: 'Test Description 2',
        workZoneP: 'Test WorkZone 2.1',
        workZoneS: 'Test WorkZone 2.2',
        userId: 1,
        cover: 'https://res.cloudinary.com/jack6688/image/upload/v1638841322/classes-2_r3mkrk.jpg',
      };

      const unauthCreateExercise = (body) => request
        .post('/api/exercises')
        .set('Content-type', 'application/json')
        .send(body); // Usuario no autorizado

      const authCreateExercise = (body, accessToken) => request
        .post('/api/exercises')
        .send(body)
        .set('Authorization', `Bearer ${accessToken}`); // Usuario autorizado

      beforeAll(async () => {
        await app.context.orm.user.create(userData);
      });

      describe('When user is not authorized', () => {
        beforeAll(async () => {
          response = await unauthCreateExercise(exerciseData);
        });

        test('Returns status code 401', () => {
          expect(response.status).toBe(401);
        });

        test('Should not have created an exercise', async () => {
          const exerciseCount = await app.context.orm.exercise.count();
          expect(exerciseCount).toBe(1);
        });
      });

      describe('When user is authorized', () => {
        let invalidExercise = { ...exerciseData };

        describe('When name is empty', () => {
          invalidExercise = { ...exerciseData };
          invalidExercise.name = '';

          beforeAll(async () => {
            const authResponse = await postAuth({ mail, password });
            token = authResponse.body.access_token;
            response = await authCreateExercise(invalidExercise, token);
          });

          test('Should return a 400 status code', () => {
            expect(response.status).toBe(400);
          });
        });

        describe('When exercise is valid', () => {
          beforeAll(async () => {
            const authResponse = await postAuth({ mail, password });
            token = authResponse.body.access_token;
            response = await authCreateExercise(exerciseData, token);
            exercise = response.body.data;
          });

          test('Returns status code 201', () => {
            expect(response.status).toBe(201);
          });

          test('Should have created an exercise', async () => {
            const exerciseCount = await app.context.orm.exercise.count();
            expect(exerciseCount).toBe(2);
          });

          test('response attributes match saved exercise', () => {
            expect(response.body.data.attributes).toEqual(exerciseData);
          });
        });
      });
    });

    describe('GET /api/exercises/:id/edit', () => {
      const exerciseData = {
        name: 'Test Exercise 3',
        description: 'Test Description 3',
        workZoneP: 'Test WorkZone 3.1',
        workZoneS: 'Test WorkZone 3.2',
      };

      const authEditRequest = (body, id, accessToken) => request
        .get(`/api/exercises/${id}/edit`)
        .set('Authorization', `Bearer ${accessToken}`)
        .set('Content-type', 'application/json')
        .send(body);

      beforeAll(async () => {
        await app.context.orm.exercise.create(exerciseData);
      });

      describe('When passed id corresponds to an existing exercise', () => {
        beforeAll(async () => {
          response = await authEditRequest(exerciseData, exercise.id, token);
        });

        test('Returns status code 200', () => {
          expect(response.status).toBe(200);
        });
      });
    });

    describe('PATCH /api/exercises/:id', () => {
      const exerciseData = {
        name: 'Test Exercise 4',
        description: 'Test Description 4',
        workZoneP: 'Test WorkZone 4.1',
        workZoneS: 'Test WorkZone 4.2',
      };

      const updatedData = {
        name: 'Test Exercise 4.1 updated',
        description: 'Test Description 4.1 updated',
        workZoneP: 'Test WorkZone 4.1 updated',
        workZoneS: 'Test WorkZone 4.2 updated',
      };

      const authUpdateRequest = (id, accessToken) => request
        .patch(`/api/exercises/${id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .set('Content-type', 'application/json')
        .send(updatedData);

      beforeAll(async () => {
        await app.context.orm.exercise.create(exerciseData);
      });

      test('The exercise is updated', async () => {
        response = await authUpdateRequest(exercise.id, token);
        const foundExercise = await app.context.orm.exercise.findByPk(exercise.id);
        const {
          name, description, workZoneP, workZoneS,
        } = foundExercise;
        expect({
          name, description, workZoneP, workZoneS,
        }).toEqual(updatedData);
      });
    });

    describe('DELETE /api/exercises/:id', () => {
      const deleteExercise = (id, accessToken) => request
        .del(`/api/exercises/${id}`)
        .set('Authorization', `Bearer ${accessToken}`);

      describe('When exercise id is valid and user is authenticated', () => {
        beforeAll(async () => {
          response = await deleteExercise(exercise.id, token);
        });

        test('Should have deleted an exercise', async () => {
          const exerciseCount = await app.context.orm.exercise.count();
          expect(exerciseCount).toBe(3);
        });

        test('Returns status code 204', () => {
          expect(response.status).toBe(204);
        });
      });
    });
  });
});
