const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
dotenv.config();

const app = express();
const port = 4000;

const mongoURI = process.env.MONGO_URI;

mongoose.connect(mongoURI)
  .then(() => console.log('Connected to DB'))
  .catch(err => console.error('DB connection error:', err));

app.use(bodyParser.json());

// Schema defined for the glossary
const glossarySchema = new mongoose.Schema({
  item: { type: String, required: true },
  definition: { type: String, required: true }
});
const Glossary = mongoose.model('Glossary', glossarySchema);

app.get('/', (req, res) => {
  res.send('Welcome to the Glossary API!');
});

// GET method to receive all items in the glossary
app.get('/api/glossary', async (req, res) => {
  try {
    const glossary = await Glossary.find();
    res.json(glossary);
  } catch (error) {
    res.status(500).send('Error fetching glossary items');
  }
});

// POST method to add a item to the glossary
app.post('/api/glossary', async (req, res) => {
  const { item, definition } = req.body;
  if (!item || !definition) {
    return res.status(400).send('Item and definition are required');
  }

  try {
    const newItem = new Glossary({ item, definition });
    await newItem.save();
    res.status(201).json(newItem);
  } catch (error) {
    res.status(500).send('Error adding glossary item');
  }
});

// GET method to get an item by ID
app.get('/api/glossary/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const item = await Glossary.findById(id);
    if (!item) {
      return res.status(404).send('Glossary item not found');
    }
    res.json(item);
  } catch (error) {
    res.status(500).send('Error fetching glossary item');
  }
});

// PUT method to update item by ID
app.put('/api/glossary/:id', async (req, res) => {
  const { id } = req.params;
  const { item, definition } = req.body;
  if (!item || !definition) {
    return res.status(400).send('Item and definition are required');
  }

  try {
    const updatedItem = await Glossary.findByIdAndUpdate(
      id,
      { item, definition },
      { new: true }
    );
    if (!updatedItem) {
      return res.status(404).send('Glossary item not found');
    }
    res.json(updatedItem);
  } catch (error) {
    res.status(500).send('Error updating glossary item');
  }
});

// DELETE method to delete item by ID
app.delete('/api/glossary/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await Glossary.findByIdAndDelete(id);
    if (!result) {
      return res.status(404).send('Glossary item not found');
    }
    res.json({ message: 'Glossary item has been deleted' });
  } catch (error) {
    res.status(500).send('Error deleting glossary item');
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
