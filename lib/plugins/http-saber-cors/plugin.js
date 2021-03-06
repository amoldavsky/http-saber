/**
 * A test plugin for http-saber
 * @author Assaf Moldavsky
 * @author Chunky Space Robot
 */

var httpServer = require('../../http-saber'),
    corser = require('corser');

module.exports = plugin;

function plugin() {
  return {
    usage: usage,
    init: init
  };
}

function usage() {
  console.log([
    'usage: http-saber --cors [option]',
    '',
    'options:',
    '  headers   Enable CORS via the "Access-Control-Allow-Origin" header',
    '            Optionally provide CORS headers list separated by commas'
  ]);
}

function init(host) {
  host.events.on(httpServer.EVENTS.INIT, cors);
}

// TODO: example arguments to accept CLI optoons
function cors(options, unionOptions, instance) {
  if (options.cors) {
    instance.headers['Access-Control-Allow-Origin'] = '*';
    instance.headers['Access-Control-Allow-Headers'] = 'Origin, X-Requested-With, Content-Type, Accept, Range';
    if (options.corsHeaders) {
      options.corsHeaders.split(/\s*,\s*/)
          .forEach(function (h) { instance.headers['Access-Control-Allow-Headers'] += ', ' + h; }, instance);
    }
    var corsReqHandler = corser.create(options.corsHeaders ? {
      requestHeaders: instance.headers['Access-Control-Allow-Headers'].split(/\s*,\s*/)
    } : null);
    unionOptions.before.push(corsReqHandler);
  }
}
