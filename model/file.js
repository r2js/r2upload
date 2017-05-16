const log = require('debug')('r2:upload:file');

module.exports = (app) => {
  const mongoose = app.service('Mongoose');
  if (!mongoose) {
    return log('service [Mongoose] not found!');
  }

  const query = app.service('Query');
  const { Schema } = mongoose;
  const ObjectId = mongoose.Schema.Types.ObjectId;

  const schema = Schema({
    profile: { type: ObjectId, ref: 'profile' },
    path: { type: String, required: true },
    name: { type: String },
    size: { type: Number },
    humanSize: { type: String },
    fullPath: { type: String },
    width: { type: Number },
    height: { type: Number },
    type: { type: String },
    mime: { type: String },
  }, {
    timestamps: true,
  });

  if (query) {
    schema.plugin(query.plugin);
  }

  return mongoose.model('file', schema);
};

