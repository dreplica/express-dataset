var express = require('express');
const { getAllActors, updateActor, getStreak } = require('../controllers/actors');
var router = express.Router();

// Routes related to actor.
router.get('/', async (req, res) => {
	const result = await getAllActors();
	console.log(result);
	return res.status(200).json(result);
});

router.get('/streak', async (req, res) => {
	const result = await getAllActors();
	return res.status(200).json(result);
});

router.put('/', (req, res) => {
	updateActor(req.body)
		.then((actor) => {
			res.statusCode = 200;
			res.status(200).json({});
		})
		.catch(({ error, code }) => {
			res.statusCode = code;
			return res.status(code).json({ error: error });
		});
});

module.exports = router;
