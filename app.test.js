/* eslint-env jest */
const request = require('supertest');
const app = require('./app');

describe('GET /graphql', () => {
  describe('Users', () => {
    describe('?query={users{id}}', () => {
      it('responds with 200', (done) => {
        request(app)
          .get('/graphql?query={users{id}}')
          .expect(200, done);
      });
    });
    describe('?query={user(id: 1){id}}', () => {
      it('responds with 200', (done) => {
        request(app)
          .get('/graphql?query={user(id: 1){id}}')
          .expect(200, done);
      });
    });
  });

  describe('Rooms', () => {
    describe('?query={rooms{id}}', () => {
      it('responds with 200', (done) => {
        request(app)
          .get('/graphql?query={rooms{id}}')
          .expect(200, done);
      });
    });
    describe('?query={room(id: 1){id}}', () => {
      it('responds with 200', (done) => {
        request(app)
          .get('/graphql?query={room(id: 1){id}}')
          .expect(200, done);
      });
    });
  });
  describe('Events', () => {
    describe('?query={events{id}}', () => {
      it('responds with 200', (done) => {
        request(app)
          .get('/graphql?query={events{id}}')
          .expect(200, done);
      });
    });
    describe('?query={event(id: 1){id}}', () => {
      it('responds with 200', (done) => {
        request(app)
          .get('/graphql?query={event(id: 1){id}}')
          .expect(200, done);
      });
    });
  });
});

describe('POST /graphql', () => {
  describe('User', () => {
    describe('createUser', () => {
      it('responds with 200', (done) => {
        request(app)
          .post('/graphql')
          .send({
            query: 'mutation { createUser(input: {login: "fake login"}) { id }}'
          })
          .expect(200, done);
      });
    });
    describe('updateUser', () => {
      it('responds with 200', (done) => {
        request(app)
          .post('/graphql')
          .send({
            query: 'mutation { updateUser(id: 1, input: {login: "fake login"}) { id }}'
          })
          .expect(200, done);
      });
    });
    describe('removeUser', () => {
      it('responds with 200', (done) => {
        request(app)
          .post('/graphql')
          .send({
            query: 'mutation { removeUser(id: 1) { id }}'
          })
          .expect(200, done);
      });
    });
  });

  describe('Room', () => {
    describe('createRoom', () => {
      it('responds with 200', (done) => {
        request(app)
          .post('/graphql')
          .send({
            query: 'mutation { createRoom(input: {title: "fake title", capacity: 0, floor: 0}) { id }}'
          })
          .expect(200, done);
      });
    });
    describe('updateRoom', () => {
      it('responds with 200', (done) => {
        request(app)
          .post('/graphql')
          .send({
            query: 'mutation { updateRoom(id: 1, input: { title: "fake title", capacity: 0, floor: 0}) { id }}'
          })
          .expect(200, done);
      });
    });
    describe('removeRoom', () => {
      it('responds with 200', (done) => {
        request(app)
          .post('/graphql')
          .send({
            query: 'mutation { removeRoom(id: 1) { id }}'
          })
          .expect(200, done);
      });
    });
  });

  describe('Event', () => {
    describe('createEvent', () => {
      it('responds with 200', (done) => {
        request(app)
          .post('/graphql')
          .send({
            query: 'mutation { createEvent(roomId:2, input: {title: "fake title", dateStart: "2018-01-01T00:00:00.000Z", dateEnd:"2018-01-01T00:00:00.000Z"}) {id }}'
          })
          .expect(200, done);
      });
    });
    describe('updateEvent', () => {
      it('responds with 200', (done) => {
        request(app)
          .post('/graphql')
          .send({
            query: 'mutation { updateEvent(id:2, input: { title: "fake title", dateStart: "2018-01-01T00:00:00.000Z", dateEnd:"2018-01-01T00:00:00.000Z" }) { id }}'
          })
          .expect(200, done);
      });
    });
    describe('removeEvent', () => {
      it('responds with 200', (done) => {
        request(app)
          .post('/graphql')
          .send({
            query: 'mutation { removeEvent(id: 1) { id }}'
          })
          .expect(200, done);
      });
    });
    describe('addUserToEvent', () => {
      it('responds with 200', (done) => {
        request(app)
          .post('/graphql')
          .send({
            query: 'mutation { addUserToEvent(id:2, userId: 2) { id }}'
          })
          .expect(200, done);
      });
    });
    describe('changeEventRoom', () => {
      it('responds with 200', (done) => {
        request(app)
          .post('/graphql')
          .send({
            query: 'mutation { changeEventRoom(id:2, roomId: 2) { id }}'
          })
          .expect(200, done);
      });
    });
    describe('removeUserFromEvent', () => {
      it('responds with 200', (done) => {
        request(app)
          .post('/graphql')
          .send({
            query: 'mutation { removeUserFromEvent(id:2, userId: 2) { id }}'
          })
          .expect(200, done);
      });
    });
  });
});
