const router = require("express").Router();
const Sequelize = require("sequelize");
const Op = Sequelize.Op;
const { Recipe, Diet } = require("../../db");

router.post("/", async (req, res) => {
  try {
    let { name, summary, score, healthScore, steps, diets } = req.body;
    if (!name || !summary)
      return res.status(422).json({ message: "NAME and SUMMARY are required" });
    if (score < 0 || score > 100)
      return res.status(422).send({ message: "SCORE must be between 0-100" });
    if (healthScore < 0 || healthScore > 100)
      return res
        .status(422)
        .json({ message: "HEALTHSCORE must be between 0-100" });
    score = score ? score : 0;
    healthScore = healthScore ? healthScore : 0;

    let newRecipe = await Recipe.create({
      name,
      summary,
      score: score,
      healthScore: healthScore,
      steps,
      image: "https://i.stack.imgur.com/ZupHq.gif",
    });


    //   Asignacion de dietas

    let formated = Array.isArray(diets) ? diets : [diets]; // verifico que el vavlor sea un array
    // verifico que existan en la tabla de dietas y las selecciono
    const matchingDiets = await Diet.findAll({
      where: {
        name: {
          [Op.in]: formated,
        },
      },
    });

    // asigno al objeto que estoy guardando las dietas que seleccione
    await newRecipe.setDiets(matchingDiets);
    res.status(201).json(newRecipe); // devuelvo la respuesta
  } catch (error) {
    res.status(400).send("Failed at POST ", error.message)
  }
});

module.exports = router;
