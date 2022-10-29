const path = require('path');
const db = require('../database/models');
const sequelize = db.sequelize;
const { Op } = require("sequelize");
const moment = require('moment');
const {createError, getUrl, getUrlBase} = require('../helpers')



const moviesController = {
    list: async (req, res) => {
        const {limit,order,offset}= req.query;
        let fields = ['title','rating','release_date','length','awards'];
        
        
        try {

            if(order && !fields.includes(order)){
                throw createError(400,`Solo se puede ordenar por los campos ${fields.join(', ')}` );
            }
            let total = await db.Movie.count();
            let movies = await db.Movie.findAll({
                attributes:{
                    exclude :['created_at','updated_at'],
                },
                include:[{
                    association :'genre',
                    attributes:{
                        exclude :['created_at','updated_at']
                    }
                },{
                    association :'actors',
                    attributes:{
                        exclude :['created_at','updated_at']
                    }
                }],
                limit : limit ? +limit :5,
                offset: offset ? +offset :0,
                order :[order ? order : 'id']
            });

            movies.forEach(movie => {
                movie.setDataValue('link',`${getUrl(req)}/${movie.id}`)
            });
            
            return res.status(200).json({
                ok :true,
                meta :{
                    status: 200
                },
                data:{
                items : movies.length,
                total,
                movies
                }
            });

        } catch (error) {
            console.log(error);
            return res.status(error.status || 500).json({
                ok:false,
                status : error.status || 500,
                msg:error.message,
            });
        }
    },
    detail: async (req, res) => {
        const {id} = req.params;
        try {
            if(isNaN(id)){
                throw createError(400,'El ID debe ser un numero');
            }

            const movie = await db.Movie.findByPk(req.params.id,
                {
                    include : [{
                        association : 'genre',
                        attributes :{
                            exclude :['created_at','updated_at']
                        }
                    },
                    {
                        association :'actors',
                        attributes:{
                            exclude :['created_at','updated_at']
                        }
                    }],
                    attributes :{
                        exclude :['created_at','updated_at','genre_id']
                    }
                });

                if(!movie){
                    throw createError(404,'no existe una pelicula con ese ID');
                }
                movie.release_date = moment(movie.release_date).format();

                

                return res.status(200).json({
                    ok :true,
                    meta :{
                        status: 200
                    },
                    data:{
                        movie,
                    }
                });    
            
        } catch (error) {
            console.log(error);
            return res.status(error.status || 500).json({
                ok:false,
                status : error.status || 500,
                msg:error.message,
            });
        }
    },
    newest: async (req, res) => {
        const{limit} = req.query;

        const options = {
            include : [{
                association : 'genre',
                attributes :{
                    exclude :['created_at','updated_at']
                }
            },
            {
                association :'actors',
                attributes:{
                    exclude :['created_at','updated_at']
                }
            }],
            attributes :{
                exclude :['created_at','updated_at','genre_id']
            },
            limit : limit? +limit :5,
            order :[['release_date','DESC']]
        }
        try {
            const movies = await db.Movie.findAll(options);

        const moviesModify = movies.map(movie =>{
            return{
                ...movie.dataValues,
                link : `${getUrlBase(req)}/${movie.id}`
            }
        })

            return res.status(200).json({
                ok :true,
                meta :{
                    status: 200
                },
                data:{
                    movies :moviesModify,
                }
            }); 
        } catch (error) {
            console.log(error);
            return res.status(error.status || 500).json({
                ok:false,
                status : error.status || 500,
                msg:error.message,
            });
            
        }
    },
    recomended: (req, res) => {
        db.Movie.findAll({
            include: ['genre'],
            where: {
                rating: {[db.Sequelize.Op.gte] : 8}
            },
            order: [
                ['rating', 'DESC']
            ]
        })
            .then(movies => {
                res.render('recommendedMovies.ejs', {movies});
            });
    },
    //Aqui dispongo las rutas para trabajar con el CRUD
    
    create: async (req,res) =>{
        const{title, rating,awards,release_date,length,genre_id}= req.body;
        try {
            /* for (const key in req.body) {
                if(!req.body[key]){
                    errors =[
                        ...errors,
                        {
                            field :key,
                            msg :`el campo ${key} es obligatorio`
                        }
                    ]
                }
            } */


            const movie = await db.Movie.create({
                
                    title: title?.trim(),
                    rating,
                    awards,
                    release_date,
                    length,
                    genre_id
            })
            return res.status(201).json({
                ok :true,
                meta :{
                    status: 201
                },
                data:{
                    movie,
                }
            }); 
        } catch (error) {
            console.log(error);
            const showErrors = error.errors.map(error =>{
                return{
                    path:error.path,
                    message :error.message
                }
            })
             return res.status(error.status || 500).json({
                ok:false,
                status : error.status || 500,
                msg:showErrors
            });
        }
    },
    update: async (req,res) => {
        const{title, rating,awards,release_date,length,genre_id}= req.body;
        try {
            let movieId = req.params.id;
        let movie = await db.Movie.update(
            {
                title: title?.trim(),
                rating: rating,
                awards: awards,
                release_date: release_date,
                length: length,
                genre_id: genre_id
            },
            {
                where: {id: movieId}
            })
            return res.status(201).json({
                ok :true,
                meta :{
                    status: 200
                },
                msg:'Pelicula actualizada con exito'
            }); 
        } catch (error) {
            return res.status(error.status || 500).json({
                ok:false,
                status : error.status || 500,
                msg:showErrors
            });
        }
    },
    destroy: async (req,res) =>{
        try {
            let movieId = req.params.id;

            /* await db.Actor.update({
                favorite_movie_id :null
            },
            {
                where :{
                    favorite_movie_id :movieId
                }
            })
            await db.ActorMovie.destroy({
                where :{
                    movie_id : movieId
                }
            }) */

           await db.Movie.destroy({
            where: {
                id: movieId
            },
            force: true
        })
        return res.status(201).json({
            ok :true,
            meta :{
                status: 201
            },
            msg:'pelicula eliminada con existo'
        });  
        } catch (error) {
            console.log(error)
            return res.status(error.status || 500).json({
                ok:false,
                status : error.status || 500,
                message : error.message || 'upss, error'
            });
        }
        
    }
}

module.exports = moviesController;  