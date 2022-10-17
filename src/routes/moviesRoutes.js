const express = require('express');
const router = express.Router();
const {list,newest,recomended,detail,create,update,destroy} = require('../controllers/moviesController');

/* /movies */
router.get('/',list);
router.get('/new',newest);
router.get('/recommended',recomended);
router.get('/:id',detail);
router.post('/',create);
router.put('/:id',update);
router.delete('/:id',destroy);

module.exports = router;