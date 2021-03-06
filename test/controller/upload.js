module.exports = (app) => {
  const Upload = app.service('Upload');

  app.post('/upload', (req, res) => {
    Upload.single(req, res)
      .then(data => res.status(201).json(data))
      .catch(err => res.status(500).json(err));
  });
};
