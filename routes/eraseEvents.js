var express = require('express');
const { eraseEvents } = require('../controllers/events');
var router = express.Router();

// Route related to delete events
router.delete("/", (req, res) => {
    try {
        eraseEvents();
        return res.status(200).json({})  
    } catch (error) {
        return res
    }
})


module.exports = router;