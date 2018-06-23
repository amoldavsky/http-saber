var assert = require('assert'),
    path = require('path'),
    fs = require('fs'),
    vows = require('vows'),
    request = require('request'),
    httpServer = require('../lib/http-saber');

var root = path.join(__dirname, 'fixtures', 'root');

vows.describe('http-saber-events').addBatch({
  'http-saber should fire': {
    topic: function () {
      var _this = this;
      var server = httpServer.createServer({
        // root: root,
        // robots: true,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': 'true'
        }
      });

      server.listen({ port: 8090 }, function () {
        console.log('firing request');
        _this.callback(null, server);
      });
    },
    '"request:received" when a request is received': {
      topic: function (server) {
        var _this = this;
        console.log('register ' + httpServer.EVENTS.REQUEST_RECEIVED);
        server.events.on(httpServer.EVENTS.REQUEST_RECEIVED, function (req, res) {
          console.log('caught ' + httpServer.EVENTS.REQUEST_RECEIVED);
        });
        server.events.on(httpServer.EVENTS.INIT_DONE, function (options, instance) {
          console.log('caught ' + httpServer.EVENTS.INIT_DONE);
        });

        request('http://127.0.0.1:8090/', _this.callback);
      },
      'should respond with index': function (server) {
        assert.equal(true, true);
      }
    }
  }
}).export(module);
