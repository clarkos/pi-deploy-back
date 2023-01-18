const RecipeFormater = function (id, name, healthScore, image, diets) {
  let obj = {
    id: id,
    name: name,
    image: image,
    healthScore: healthScore,
    diets: diets,
  };

  return obj;
};

module.exports = RecipeFormater;
