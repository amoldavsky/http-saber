var assert = require('assert');
var path = require('path');
var fs = require('fs');
var vows = require('vows');
var request = require('request');
var httpSaber = require('../lib/http-saber');
var chai = require('chai');
var assert = require('assert');
var expect = require('chai').expect;
var should = require('chai').should();

var root = path.join(__dirname, 'fixtures', 'root');

describe( 'http-saber', function() {

    describe( 'When http-saber is listening on 8080', function(done) {

        var server = httpSaber.createServer({
            root: root
        });

        beforeEach(function() {
            return new Promise( function( resolve, reject ) {
                server.listen(8080, resolve);
            });
        });

        afterEach(function() {
            server.close();
        });

        it('it should serve files from root directory', function(done) {
            request('http://127.0.0.1:8080/file', function (err, res, body) {
                assert.equal( res.statusCode, 200, 'status code should be 200' );
                done();
            });
        });

        it('file content should match content of served file', function(done) {
            request('http://127.0.0.1:8080/file', function (err, res, body) {
                assert.equal( res.statusCode, 200, 'status code should be 200' );

                fs.readFile(path.join(root, 'file'), 'utf8', function (err, file) {
                    assert.equal(body.trim(), file.trim(), 'file content should match content of served file');
                    done();
                });
            });
        });

        it('non-existent file should result in 404', function(done) {
            request('http://127.0.0.1:8080/494', function (err, res, body) {
                assert.equal( res.statusCode, 404, 'status code should be 404' );
                done();
            });
        });

        it('requesting / should respond with index', function(done) {
            request('http://127.0.0.1:8080/', function (err, res, body) {
                assert.equal(res.statusCode, 200);
                assert.include(body, '/file');
                assert.include(body, '/canYouSeeMe');
                done();
            });
        });

    });

    // TODO: move to robots plugin
    describe( 'When robots options is activated', function(done) {

        var server = httpSaber.createServer({
            root: root,
            robots: true,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': 'true'
            }
        });

        beforeEach(function() {
           return new Promise( function( resolve, reject ) {
               server.listen(8080, resolve);
           });
        });

        afterEach(function() {
            server.close();
        });

        it('should respond with status code 200 to /robots.txt', function(done) {
            request('http://127.0.0.1:8080/', function (err, res, body) {
                assert.equal(res.statusCode, 200);
                done();
            });
        });

        it('should respond with headers set via options', function(done) {
            request('http://127.0.0.1:8080/robots.txt', function (err, res, body) {
                assert.equal(res.headers['access-control-allow-origin'], '*');
                assert.equal(res.headers['access-control-allow-credentials'], 'true');
                done();
            });
        });

    });

});
// var root = path.join(__dirname, 'fixtures', 'root');
//
// vows.describe('http-saber').addBatch({
//     'When http-saber is proxying from 8081 to 8080': {
//       topic: function () {
//         var _this = this;
//         var proxyServer = httpSaber.createServer({
//           proxy: 'http://127.0.0.1:8080/',
//           root: path.join(__dirname, 'fixtures')
//         });
//         proxyServer.listen(8081, function () {
//           _this.callback(null, proxyServer);
//         });
//       },
//       'it should serve files from the proxy server root directory': {
//         topic: function () {
//           request('http://127.0.0.1:8081/root/file', this.callback);
//         },
//         'status code should be the endpoint code 200': function (res) {
//           assert.equal(res.statusCode, 200);
//         },
//         'and file content': {
//           topic: function (res, body) {
//             var self = this;
//             fs.readFile(path.join(root, 'file'), 'utf8', function (err, data) {
//               self.callback(err, data, body);
//             });
//           },
//           'should match content of the served file': function (err, file, body) {
//             assert.equal(body.trim(), file.trim());
//           }
//         }
//       },
//       'it should fallback to the proxied server': {
//         topic: function () {
//           request('http://127.0.0.1:8081/file', this.callback);
//         },
//         'status code should be the endpoint code 200': function (res) {
//           assert.equal(res.statusCode, 200);
//         },
//         'and file content': {
//           topic: function (res, body) {
//             var self = this;
//             fs.readFile(path.join(root, 'file'), 'utf8', function (err, data) {
//               self.callback(err, data, body);
//             });
//           },
//           'should match content of the proxied served file': function (err, file, body) {
//             assert.equal(body.trim(), file.trim());
//           }
//         }
//       }
//     }
//   },
//   'When cors is enabled': {
//     topic: function () {
//       var _this = this;
//       var server = httpSaber.createServer({
//         root: root,
//         cors: true,
//         corsHeaders: 'X-Test'
//       });
//
//       server.listen(8082, function () {
//         _this.callback(null, server);
//       });
//     },
//     'and given OPTIONS request': {
//       topic: function () {
//         request({
//           method: 'OPTIONS',
//           uri: 'http://127.0.0.1:8082/',
//           headers: {
//             'Access-Control-Request-Method': 'GET',
//             Origin: 'http://example.com',
//             'Access-Control-Request-Headers': 'Foobar'
//           }
//         }, this.callback);
//       },
//       'status code should be 204': function (err, res) {
//         assert.equal(res.statusCode, 204);
//       },
//       'response Access-Control-Allow-Headers should contain X-Test': function (err, res) {
//         assert.ok(res.headers['access-control-allow-headers'].split(/\s*,\s*/g).indexOf('X-Test') >= 0, 204);
//       }
//     }
//   },
//   'When logger is given': {
//     topic: function () {
//       function Logger() {
//         var _this = this;
//         this.log = function (/* arguments */) {
//           _this.callbacks.forEach(function (cb) {
//             cb.apply(this, arguments);
//           });
//         };
//       }
//       Logger.prototype.callbacks = [];
//       var logger = new Logger();
//       var server = httpSaber.createServer({
//         root: root,
//         logFn: logger.log
//       });
//       var _this = this;
//       server.listen({ port: 8083 }, function () {
//         _this.callback(null, server, logger);
//       });
//     },
//     'for a well formed request': {
//       topic: function (server, logger) {
//         var loggerResp = { isCalled: false };
//         logger.callbacks.push(function () {
//           loggerResp.isCalled = true;
//         });
//         var _this = this;
//         request({
//           method: 'OPTIONS',
//           uri: 'http://127.0.0.1:8083/'
//         }, function () {
//           _this.callback(null, loggerResp);
//         });
//       },
//       'logger should be called': function (loggerResp) {
//         assert.equal(loggerResp.isCalled, true);
//       }
//     },
//     'for a bad request': {
//       topic: function (server, logger) {
//         var loggerResp = { err: false };
//         logger.callbacks.push(function (req, res, err) {
//           loggerResp.err = err;
//         });
//         var _this = this;
//         request({
//           method: 'BOO',
//           uri: 'http://127.0.0.1:8083/'
//         }, function () {
//           _this.callback(null, loggerResp);
//         });
//       },
//       'error should be logged': function (loggerResp) {
//         assert.equal(!!loggerResp.err, true);
//       }
//     }
//   }
// }).export(module);
