const db = require("../database/models");
const sequelize = db.sequelize;

const genresController = {
  list: async (req, res) => {
    try {
      let {limit} = req.query
      let total = await db.Genre.count()
        let genres = await db.Genre.findAll({
            attributes:{
                    exclude :['created_at','updated_at'],
                },
            limit : limit ? +limit : 5
        });
        return res.status(200).json({
            ok :true,
            meta :{
                items : genres.length,
                total,
            },
            data: genres,
        });
        } catch (error) {
        console.log(error);
        return res.status(error.status || 500).json({
            ok:false,
            msg:error.message,
        });
    }
  },
  detail: async (req, res) => {
    try{
      let genre = await db.Genre.findByPk(req.params.id)
    } catch (error) {
      console.log(error);
      return res.status(error.status || 500).json({
          ok:false,
          msg:error.message,
      });
    }
    
  }
}

module.exports = genresController;
