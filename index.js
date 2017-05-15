const base64 = require('./lib/base64');
const single = require('./lib/single');
const file = require('./model/file');
const log = require('debug')('r2:upload');

module.exports = function Upload(app, conf) {
  const mongoose = app.service('Mongoose');
  if (!mongoose) {
    return log('service [Mongoose] not found!');
  }

  // init file model
  file(app);

  return {
    base64: base64(app, conf),
    single: single(app, conf),
  };
};
