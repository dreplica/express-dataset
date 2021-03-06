var express = require('express');
const { addEvent, getAllEvents, getByActor } = require('../controllers/events');
var router = express.Router();

// Routes related to event
router.get('/', async (req, res) => {
	const get_db = await getAllEvents();
	res.statusCode = 200;
	return res.status(200).json(get_db);
});

router.get('/actors/:id', async (req, res) => {
	const actorId = req.params['id'];
	const actor = await getByActor(actorId);
	if (actor.length) {
		res.statusCode = 200;
		return res.status(200).json(actor);
	}
	res.statusCode = 404;
	return res.status(404).json({ error: 'request not found' });
});

router.post('/', (req, res) => {
	addEvent(req.body)
		.then(({ message, code }) => {
			res.statusCode = code;
			return res.status(code).json({});
		})
		.catch(({ error, code }) => {
			res.statusCode = code;
			return res.status(code).send(error);
		});
});

module.exports = router;
