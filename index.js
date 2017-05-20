const libBase64 = require('./lib/base64');
const libSingle = require('./lib/single');
const modelFile = require('./model/file');

module.exports = function Upload(app, conf) {
  if (!app.hasServices('Mongoose')) {
    return false;
  }

  // init file model
  modelFile(app);

  return {
    base64: libBase64(app, conf),
    single: libSingle(app, conf),
  };
};
