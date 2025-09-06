const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({ message: 'Periods endpoint' });
});

module.exports = router;
