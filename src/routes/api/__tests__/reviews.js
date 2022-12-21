const supertest = require('supertest');
const app = require('../../../app');

const request = supertest(app.callback());

describe('API review endpoints', () => {
  beforeAll(async () => {
    await app.context.orm.sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await app.context.orm.sequelize.close();
  });

  describe('Unprotected reviews routes', () => {
    let u1;
    let u2;
    let routine;
    let response;

    const u1Data = {
      username: 'testUser1',
      password: 'test123',
      mail: 'testuser1@gmail.com',
      objective: 'test muscle',
      isCertified: 0,
      isAdmin: 0,
    };

    const u2Data = {
      username: 'testUser2',
      password: 'test123',
      mail: 'testuser2@gmail.com',
      objective: 'test muscle',
      isCertified: 0,
      isAdmin: 0,
      profession: '',
    };

    const routineData = {
      title: 'Test routine',
      description: 'With this test routine you will gain muscle!',
      cathegory: 'Build muscle',
    };

    describe('GET /api/reviews', () => {
      const getReview = () => request.get('/api/reviews');

      beforeAll(async () => {
        u1 = await app.context.orm.user.create(u1Data);
        u2 = await app.context.orm.user.create(u2Data);
        routine = await app.context.orm.routine.create(routineData);
        routine.userId = u1.id;
        const reviewData = {
          title: 'Test review',
          description: 'With this test review you will gain muscle!',
          score: 5,
          userId: u2.id,
          routineId: routine.id,
        };
        await app.context.orm.review.create(reviewData);
      });

      describe('Returns a list of reviews', () => {
        beforeAll(async () => {
          response = await getReview();
        });

        test('responds with 200 status code', () => {
          expect(response.status).toBe(200);
        });

        test('response contains a list of reviews', () => {
          expect(response.body.data.length).toEqual(1);
        });
      });
    });
  });

  describe('Protected reviews routes', () => {
    let u3;
    let routine;

    const u3Data = {
      username: 'testUser3',
      password: 'test123',
      mail: 'testuser3@gmail.com',
      objective: 'test muscle',
      isCertified: 0,
      isAdmin: 0,
    };

    const u4Data = {
      username: 'testUser4',
      password: 'test123',
      mail: 'testuser4@gmail.com',
      objective: 'test muscle',
      isCertified: 0,
      isAdmin: 0,
      profession: '',
    };

    const routineData1 = {
      title: 'Test routine 1',
      description: 'With this test routine you will gain muscle!',
      cathegory: 'Build muscle',
    };

    const postAuth = () => request
      .post('/api/auth')
      .set('Content-type', 'application/json')
      .send({ mail: u4Data.mail, password: u4Data.password });

    const postAuth2 = () => request
      .post('/api/auth')
      .set('Content-type', 'application/json')
      .send({ mail: u3Data.mail, password: u3Data.password });

    beforeAll(async () => {
      await app.context.orm.sequelize.sync({ force: true });
      u3 = await app.context.orm.user.create(u3Data);
      await app.context.orm.user.create(u4Data);
      routine = await app.context.orm.routine.create(routineData1);
    });

    afterAll(async () => {
      await app.context.orm.sequelize.close();
    });

    describe('POST /api/reviews', () => {
      let response;
      let reviewData;
      let routineTemp;
      const unauthCreateReview = (rId) => request
        .post(`/api/reviews/${rId}`)
        .set('Content-type', 'application/json')
        .send(reviewData); // Unauth user

      const authCreateReview = (rId, body, accessToken) => request
        .post(`/api/reviews/${rId}`)
        .auth(accessToken, { type: 'bearer' })
        .set('Content-type', 'application/json')
        .send(body);

      beforeAll(async () => {
        const routineData11 = {
          title: 'Test routine temp',
          description: 'With this test routine you will gain muscle!',
          cathegory: 'Build muscle',
        };
        reviewData = {
          title: 'Test review',
          description: 'With this test review you will gain muscle!',
          score: 5,
          userId: u3.id,
        };
        routineTemp = await app.context.orm.routine.create(routineData11);
      });

      describe('When user is not authorized by token', () => {
        beforeAll(async () => {
          response = await unauthCreateReview(routineTemp.id);
        });

        test('Returns status code 401', () => {
          expect(response.status).toBe(401);
        });

        test('Should not have created an review', async () => {
          const reviewCount = await app.context.orm.review.count();
          expect(reviewCount).toBe(0);
        });
      });

      describe('When user is authorized', () => {
        describe('Create a review successfully', () => {
          beforeAll(async () => {
            const authResponse = await postAuth();
            const token = authResponse.body.access_token;
            response = await authCreateReview(routineTemp.id, reviewData, token);
          });

          test('expect a review with correct title', () => {
            expect(response.body.data.attributes.title).toEqual(reviewData.title);
          });
        });
      });
    });

    describe('PATCH /api/reviews/:id', () => {
      let updateData;
      let r1;
      const authedUpdatetRequest = (id, body, accessToken) => request.patch(`/api/reviews/${id}`)
        .auth(accessToken, { type: 'bearer' })
        .set('Content-type', 'application/json')
        .send(body);

      beforeAll(async () => {
        const reviewData = {
          title: 'Test review',
          description: 'With this test review you will gain muscle!',
          score: 5,
          userId: u3.id,
          routineId: routine.id,
        };
        r1 = await app.context.orm.review.create(reviewData);

        updateData = {
          title: 'Test review update',
          description: 'With this test review you will gain muscle!',
          score: 5,
          userId: u3.id,
          routineId: routine.id,
        };
      });

      test('update the correct routine', async () => {
        const authResponse = await postAuth2();
        const token = authResponse.body.access_token;
        await authedUpdatetRequest(r1.id, updateData, token);
        const review = await app.context.orm.review.findByPk(r1.id);
        expect(review.title).toEqual(updateData.title);
      });
    });
    describe('GET api/reviews/:id', () => {
      let response;
      let rev;
      const getRequest = (id, accessToken) => request
        .get(`/api/reviews/${id}`)
        .auth(accessToken, { type: 'bearer' });

      beforeAll(async () => {
        const reviewData = {
          title: 'Test review 4',
          description: 'With this test review you will gain muscle!',
          score: 5,
          userId: u3.id,
          routineId: routine.id,
        };
        rev = await app.context.orm.review.create(reviewData);
      });

      test('Get correct review', async () => {
        const authResponse = await postAuth2();
        const token = authResponse.body.access_token;
        response = await getRequest(rev.id, token);
        expect(response.body.data.attributes.title).toEqual(rev.title);
      });
    });

    describe('DELETE /api/reviews/:id', () => {
      let response;
      let r2;
      const deleteReview = (id, accessToken) => request
        .delete(`/api/reviews/${id}`)
        .auth(accessToken, { type: 'bearer' });

      describe('When review id is valid and user is authenticated', () => {
        beforeAll(async () => {
          const reviewData = {
            title: 'Test review 3',
            description: 'With this test review you will gain muscle!',
            score: 5,
            userId: u3.id,
            routineId: routine.id,
          };
          r2 = await app.context.orm.review.create(reviewData);
        });

        test('deletes the review', async () => {
          const authResponse = await postAuth2();
          const token = authResponse.body.access_token;
          response = await deleteReview(r2.id, token);
          expect(response.status).toBe(204);
        });
      });
    });
  });
});
