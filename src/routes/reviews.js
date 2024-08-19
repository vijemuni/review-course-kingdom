const express = require('express');
const router = express.Router();
const db = require('../db/db');

router.post('/', async (req, res) => {
  try {
    const { name, email, review, rating } = req.body;
    // Check if any required field is missing or undefined
    if (!name || !email || !review || rating === undefined) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    const [result] = await db.execute(
      'INSERT INTO reviews (name, email, review, rating) VALUES (?, ?, ?, ?)',
      [name, email, review, parseInt(rating, 10)]
    );
    res.status(201).json({ id: result.insertId, message: 'Review submitted successfully' });
  } catch (error) {
    console.error('Error submitting review:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM reviews ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;