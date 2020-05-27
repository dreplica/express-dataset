var express = require('express');
const { eraseEvents } = require('../controllers/events');
var router = express.Router();

// Route related to delete events
router.delete("/", (req, res) => {
    const erase = eraseEvents();
    return res.status(200).json(erase)
})


module.exports = router;