'use strict'
// some ES6 features in node require strict mode
let http = require('http');
let qs = require('querystring');
let url = require('url');
let fs = require('fs');

const PORT = 8000;

// helper function for templating the HTML files
function template(s, obj){
  for(var key in obj)
    s = s.replace(new RegExp('{{'+key+'}}','g'), obj[key]);
  return s;
}

function handleRequest(request, response) {

  let urlPath = url.parse(request.url);

  // if the URL is malformed, return a 404
  if (urlPath.pathname != '/') {
    response.writeHead(404, {'Content-Type': 'text/html'});
    response.write('There is nothing to see here!\n');
    response.end();
  }

  else {
    if (request.method == 'POST') {
      var body = '';

      request.on('data', function (data) {
        body += data;
        // Too much POST data, kill the connection!
        if (body.length > 1e6)
          request.connection.destroy();
      });

      request.on('end', function () {
        let postVar = qs.parse(body)['postVar'];
        buildResponse(request, response, postVar);
      });
    }

    else if (request.method == 'GET') {
      buildResponse(request, response);
    }

    else {
      // we used a disallowed HTTP method
      response.writeHead(405, {'Content-Type': 'text/html'});
      response.write(`The ${request.method} method is not allowed\n`);
      response.end();
    }
  }
}

function buildResponse(request, response, postVar) {

  if (request.method == 'POST' && postVar == undefined) {
    fs.readFile('400.html', 'utf-8', function(err, data) {
      response.writeHead(400,
        {'Content-Type': 'text/html',
        'Content-Length': data.length});
      response.write(data);
      response.end();
    });
    return
  }

  try {
    let acceptedLanguages = request.headers['accept-language'];
    // the first string before the comma should denote the user's preferred
    // language abbreviation.
    var userLanguage = acceptedLanguages.split(',')[0];
  } catch (e) {
    if (e instanceof TypeError) {
      // not really impossible, but given the constraints of the task,
      // we have to watch out for missing/malformed header.
      var userLanguage = "impossible to determine";
    }
  }

  fs.readFile('response.html', 'utf-8', function(err, data) {
    let html = template(data, {
      language: userLanguage,
      method: request.method,
      postVar: request.method == 'GET' ? "" : `Your POST variable value: ${postVar}`
    })
    response.writeHead(200,
      {'Content-Type': 'text/html',
      'Content-Length': html.length});
    response.write(html);
    response.end();
  });
}

module.exports = http.createServer(handleRequest).listen(PORT);
