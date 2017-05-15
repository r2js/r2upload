const fs = require('fs');
const multer = require('multer');
const mkdirp = require('mkdirp');
const getMime = require('mime-types');
const promisify = require('es6-promisify');
const probe = require('probe-image-size');
const filesize = require('filesize');
const log = require('debug')('r2:upload:single');

module.exports = (app, conf) => {
  const getConfig = conf || app.config('upload/local');
  if (!getConfig) {
    return log('upload config not found!');
  }

  const baseDir = app.get('baseDir');
  const File = app.service('Mongoose').model('file');

  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const folder = app.utils.random(8);
      const dirName = `${conf.dir}/${folder}/`;
      mkdirp(`${baseDir}/${dirName}`, () => {
        cb(null, dirName);
      });
    },
    filename: (req, file, cb) => {
      const fileName = app.utils.random(24);
      const fileExt = getMime.extension(file.mimetype);
      cb(null, `${fileName}.${fileExt}`);
    },
  });

  const { options = {} } = conf;
  const upload = promisify(multer(Object.assign({}, { storage }, options)).single('file'));
  const stats = promisify(fs.stat);

  // TODO: genel işlemleri utils içine al
  return (req, res) => {
    const fileData = {};

    return upload(req, res)
      .then(() => {
        if (!req.file) {
          return Promise.reject('file not found!');
        }

        const { originalname, mimetype, path } = req.file;
        const fullPath = `${baseDir}/${path}`;
        Object.assign(fileData, {
          path: fullPath.replace(`${baseDir}/${conf.base}/`, ''),
          name: originalname,
          type: getMime.extension(mimetype),
          mime: mimetype,
          fullPath,
        });

        return stats(fullPath);
      })
      .then((statsData) => {
        const { size } = statsData;
        return Object.assign(fileData, {
          humanSize: filesize(size), size,
        });
      })
      .then(() => probe.sync(fs.readFileSync(fileData.fullPath)))
      .then((dimensions) => {
        if (dimensions) {
          const { width, height } = dimensions;
          Object.assign(fileData, { width, height });
        }
        return fileData;
      })
      .then(() => File.saveNew(fileData));
  };
};
