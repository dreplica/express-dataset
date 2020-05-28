var express = require('express');
const { addEvent, getAllEvents, getByActor } = require('../controllers/events');
var router = express.Router();

// Routes related to event
router.get('/', async (req, res) => {
    const get_db = await getAllEvents();
    console.log("this is get_db",get_db)
    res.status(200).json(get_db)
})

router.get('/actors/:id', async (req, res) => {
    const actorId = req.params['id']
    const actor = await getByActor(actorId)
    if (actor){
        return res.status(200).json(actor)
    }
    return res.status(404).json({error:"request not found"})
})

router.post('/', (req, res) => {
    console.log(req.body)
      addEvent(req.body)
        .then(({ message, code }) => res.status(code).send(message))
    .catch(({error,code})=>res.status(code).send(error))
})


module.exports = router;