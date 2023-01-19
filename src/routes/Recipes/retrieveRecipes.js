const router = require("express").Router();
const Sequelize = require("sequelize");
const { Recipe, Diet } = require("../../db");
const { allAPI, recipeName, recipeId } = require("../../utils/recipesCalls");
const { dietIndexer } = require("../controllers/dietIndexer");
const Op = Sequelize.Op;
const RecipeFormater = require("../controllers/FormatRecipe");

router.get("/", async function (req, res) {
  if (!req.query.name) {
    //verifica si hay query, si no busca todas las recetas
    try {
      let dbResult = await Recipe.findAll({
        include: [{ model: Diet, through: { attributes: [] } }],
      });

      let dbFormated = [];
      dbResult.map((e) => {
        let diets = e["diets"];
        let formated = [];
        diets.map((d) => formated.push(d["name"]));
        let obj = RecipeFormater(
          e.id,
          e.name,
          e.healthScore,
          e.image,
          formated
        );
        dbFormated.push(obj);
      });

      let apiResult = await allAPI(); //buscando en la API
      if (apiResult === null)
        return res.status(404).json({ message: "key over-used" });

      dietIndexer(apiResult); //agregando recetas desde la base de datos
      let total = dbFormated.concat(apiResult); //contando el total de recetas --> api+db

      //en caso que no haya recetas con ese nombre
      if (total.length === 0)
        res.status(400).json({
          message:
            "Can't find nothing... there are some problem with the API connection",
        });
      res.status(200).json(total);
    } catch (error) {
      console.log("error in get from api");
      res.status(404).send({ error: "Can't reach API resources" });
    }
  } else {
    let { name } = req.query; //siempre valor a buscar sera valido por que se verifica en el front
    try {
      let dbResult = await Recipe.findAll({
        //buscando en DB
        where: { name: { [Op.like]: `%${name}%` } },
        include: [
          { model: Diet, attributes: ["name"], through: { attributes: [] } },
        ],
      });

      let dbFormated = []; // formateando la respuesta
      dbResult.map((e) => {
        let diets = e["diets"];
        let formated = [];
        diets.map((d) => formated.push(d["name"]));
        let obj = RecipeFormater(
          e.id,
          e.name,
          e.healthScore,
          e.image,
          formated
        );
        dbFormated.push(obj);
      });

      let apiResult = await recipeName(name); //buscando en la API
      if (apiResult == null) return res.json({ message: "key over-used" });

      dietIndexer(apiResult); //agregando recetas desde la base de datos
      let total = dbFormated.concat(apiResult); //contando el total de recetas --> api+db

      if (total.length === 0)
        //en caso que no haya recetas con ese nombre
        res.json({
          message: "Can't find nothing... Are you sure it' well written?",
        });
      res.status(200).json(total);
    } catch (error) {
      console.log("error getting by 'recipe name'");
      res.status(402).send({error: error.message});
    }
  }
});

router.get("/:id/", async function (req, res) {
  try {
    let { id } = req.params;

    if (
      id.match(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      )
    ) {
      let dbResult = await Recipe.findOne({
        //busqueda en la base de datos
        where: { id: id },
        include: [
          { model: Diet, attributes: ["name"], through: { attributes: [] } },
        ],
      });
      if (dbResult === null)
        return res.json({
          message: "Can't find nothing... The ID is correct?", //envia mensaje si no encuentra resultados
        });

      let formated = [];
      dbResult.diets.map((e) => formated.push(e["name"]));

      let obj = {
        id: dbResult["id"],
        name: dbResult["name"],
        score: dbResult["score"],
        image: dbResult["image"],
        diets: formated,
        summary: dbResult["summary"],
        healthScore: dbResult["healthScore"],
        steps: dbResult["steps"],
        dishTypes: dbResult["dishTypes"],
      };

      return res.json(obj);
    } else {
      //Busqueda en la API
      let apiResult = await recipeId(id);
      return apiResult.length === 0
        ? res.json({ message: "error getting by 'ID'" })
        : res.json(apiResult);
    }
  } catch (error) {
    console.log("error looking for ID", error.message);
    res.status(402).send({error: error.message});
  }
});

module.exports = router;
