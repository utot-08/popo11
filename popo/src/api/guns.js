const express = require('express');
const app = express();
const port = 3001; // or any other port you prefer

// In-memory data storage (replace with a database in a real-world app)
const gunTypes = [];
const gunSubtypes = {};
const gunModels = {};

// API endpoints
app.post('/gun-types', (req, res) => {
  const { name } = req.body;
  gunTypes.push({ id: Date.now(), name });
  res.send({ message: 'Gun type added successfully' });
});

app.post('/gun-subtypes', (req, res) => {
  const { typeId, name } = req.body;
  if (!gunSubtypes[typeId]) {
    gunSubtypes[typeId] = [];
  }
  gunSubtypes[typeId].push({ id: Date.now(), name });
  res.send({ message: 'Gun subtype added successfully' });
});

app.post('/gun-models', (req, res) => {
  const { subtypeId, name } = req.body;
  if (!gunModels[subtypeId]) {
    gunModels[subtypeId] = [];
  }
  gunModels[subtypeId].push({ id: Date.now(), name });
  res.send({ message: 'Gun model added successfully' });
});

app.get('/gun-types', (req, res) => {
  res.send(gunTypes);
});

app.get('/gun-subtypes', (req, res) => {
  res.send(gunSubtypes);
});

app.get('/gun-models', (req, res) => {
  res.send(gunModels);
});

app.listen(port, () => {
  console.log(`API listening on port ${port}`);
});