const express = require('express');
const router = express.Router();
const {list,nombre,detail} = require('../controllers/genresController')

/* /genres */
router.get('/',list);//no me lista los generos si no doy un order de parameto ej:http://localhost:3001/genres?order=name
router.get('/name/:name?', nombre)
router.get('/:id',detail);//  detalle


module.exports = router;