var express = require('express');
const { getAllActors } = require('../controllers/actors');
var router = express.Router();

// Routes related to actor.
router.get('/', (req, res) => {
    const result = getAllActors()
    return res.status(200).json(result)
})
module.exports = router;