const express = require('express');
const pool = require('./db');
const app = express();
const cors = require('cors');

const PORT = process.env.PORT || 3000;
app.use(cors());

app.use(express.json());

// GET all taglines or filter by housewife name
app.get('/taglines', async (req, res) => {
  const { housewife } = req.query;
  try {
    const query = housewife
      ? 'SELECT * FROM taglines WHERE housewife ILIKE $1'
      : 'SELECT * FROM taglines';
    const values = housewife ? [`%${housewife}%`] : [];

    const result = await pool.query(query, values);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch taglines' });
  }
});

// POST a new tagline
app.post('/taglines', async (req, res) => {
  const { housewife, city, season, text } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO taglines (housewife, city, season, text)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [housewife, city, season, text]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to add tagline' });
  }
});

// DELETE a tagline
app.delete('/taglines/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM taglines WHERE id = $1', [id]);
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete tagline' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
