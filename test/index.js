const chai = require('chai');
const request = require('supertest');
const del = require('del');
const r2base = require('r2base');
const r2mongoose = require('r2mongoose');
const r2upload = require('../index');

const expect = chai.expect;
process.chdir(__dirname);

const app = r2base({ baseDir: __dirname, port: 9001 });

app
  .start()
  .serve(r2mongoose, { database: 'r2test' })
  .serve(r2upload, {
    dir: 'public/upload',
    base: 'public',
    options: {
      limits: { fileSize: 1000 },
    },
  })
  .load('controller/upload.js')
  .listen();

describe('r2upload', () => {
  describe('single file', () => {
    it('should upload single text file', (done) => {
      request.agent(app.server);
      request(app)
        .post('/upload')
        .attach('file', `${__dirname}/file/a.txt`)
        .expect(201)
        .end((err, res) => {
          expect(res.body.name).to.equal('a.txt');
          expect(res.body.type).to.equal('txt');
          expect(res.body.mime).to.equal('text/plain');
          expect(res.body.width).to.equal(undefined);
          expect(res.body.height).to.equal(undefined);
          done();
        });
    });

    it('should upload single image file', (done) => {
      request.agent(app.server);
      request(app)
        .post('/upload')
        .attach('file', `${__dirname}/file/r2-40.png`)
        .expect(201)
        .end((err, res) => {
          expect(res.body.name).to.equal('r2-40.png');
          expect(res.body.type).to.equal('png');
          expect(res.body.mime).to.equal('image/png');
          expect(res.body.width).to.not.equal(undefined);
          expect(res.body.height).to.not.equal(undefined);
          done();
        });
    });

    it('should respect file size limit', (done) => {
      request.agent(app.server);
      request(app)
        .post('/upload')
        .attach('file', `${__dirname}/file/r2-200.png`)
        .expect(201)
        .end((err, res) => {
          expect(res.body.code).to.equal('LIMIT_FILE_SIZE');
          done();
        });
    });
  });
});

function dropDatabase(done) {
  this.timeout(0);
  app.service('Mongoose').connection.db.dropDatabase();
  del.sync([`${__dirname}/public/upload/**/*`]);
  done();
}

after(dropDatabase);
