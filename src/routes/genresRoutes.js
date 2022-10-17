const express = require('express');
const router = express.Router();
const {list,nombre,detail} = require('../controllers/genresController')

/* /genres */
router.get('/',list);
router.get('/name/:name?', nombre)
router.get('/:id',detail);//  detalle


module.exports = router;