var express = require('express');
const { getAllActors, updateActor } = require('../controllers/actors');
var router = express.Router();

// Routes related to actor.
router.get('/', (req, res) => {
    const result = getAllActors()
    return res.status(200).json(result)
})

router.put('/', async (req, res) => {
    const update = await updateActor(req.body);
    return res.status(200).json([])
})

module.exports = router;