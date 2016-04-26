'use strict'
let ecosiaServer = require('./server.js')
let request = require('supertest')(ecosiaServer);

// helper function for asserting request body content.
function bodyHasText(response) {
  var text = response.body.testText;
  if (!response.text.includes(text)) {
    throw new Error(`The request body does not have the text: ${text}`)
  };
}

describe('Test GET', function() {
  it('GET / Should return 200', function(done) {
    request
      .get('/')
      .set('Accept-language', 'english')
      .expect(function(response){
        response.body.testText = 'Your language is: english'
      })
      .expect(bodyHasText)
      .expect(function(response) {
        response.body.testText = 'You sent a: GET'
      })
      .expect(bodyHasText)
      .expect(200, done);
  });

  it('GET /test Should return 404', function(done) {
    request
      .get('/incorrecturl')
      .set('Accept-language', 'english')
      .expect("There is nothing to see here!\n")
      .expect(404, done);
  });

  it('GET / with no language set in the request header should not fail \
  but rather inform the user about it', function (done) {
      request
        .get('/')
        .expect(200, done);
    });
});


describe('Test POST', function() {
  it('POST should return the HTML data and give the value of the POSTed variable', function(done) {
    request
      .post('/')
      .set('Accept-language', 'english')
      .send('postVar=this is a test')
      .expect(function(response) {
        response.body.testText = 'Your POST variable value: this is a test'
      })
      .expect(bodyHasText)
      .expect(200, done);
  });

  it('POST should return 400 error when the "postVar" is missing.', function(done) {
    request
      .post('/')
      .expect(function(response) {
        response.body.testText = 'The POST request contained no "postVar" parameter.'
      })
      .expect(bodyHasText)
      .expect(400, done);
  })
});


describe('Test requesting using incorrect HTTP verb', function() {
  it('PUT / returns 405 error', function(done) {
    request
      .put('/')
      .expect('The PUT method is not allowed\n')
      .expect(405, done)
  });
  it('PATCH / returns 405 error', function(done) {
    request
      .patch('/')
      .expect('The PATCH method is not allowed\n')
      .expect(405, done)
  })
})
