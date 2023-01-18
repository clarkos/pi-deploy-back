const axios = require("axios").default;
const { API_KEY } = process.env;
const RecipeFormater = require("../routes/controllers/FormatRecipe");

/* const callMaker = async (index, urlModifier, urlParameter) => {
  let apiKey;
  switch (index) {
    case 1:
      apiKey = API_KEY1;
    case 2:
      apiKey = API_KEY2;
    case 3:
      apiKey = API_KEY3;
    
    default:
      apiKey = API_KEY1;
  }
  try {
    let result = await axios.get(API_URL+urlModifier+apiKey+urlParameter);
    if (result.status(402)) {
      index++;
      return index
    }
    return result;
  } catch (e) {
    if (result.status(404) || result.status(500)) return result;
    return 4;
  }
}; */

async function allAPI() {
  try {
    let response = await axios.get(
      `https://api.spoonacular.com/recipes/complexSearch?apiKey=${API_KEY}&addRecipeInformation=true&number=100`
    );
    // let index = 1;
    // let response;
    // while (response <= 3 || response.status !== 200) {
    //   response = callMaker( index, `complexSearch`, `&addRecipeInformation=true&number=100` )
    // }
    let callResponse = [];
    if (response.data.results) {
      response.data.results.map((item) => {
        let obj = RecipeFormater(
          item.id,
          item.title,
          item.healthScore,
          item.image,
          item.diets
        );
        callResponse.push(obj);
      });
      return callResponse;
    }
  } catch (error) {
    console.log("Something goes wrong when calling without name param");
    console.log(response.data);
    console.log(error.message);
  }
}

async function recipeName(name) {
  try {
    let response = await axios.get(
      `https://api.spoonacular.com/recipes/complexSearch?apiKey=${API_KEY}&query=${name}&addRecipeInformation=true&number=100`
    );
    // let index = 1;
    // let response;
    // while (response <= 3 || response.status !== 200) {
    //   response = callMaker( index, `complexSearch`, `&query=${name}&addRecipeInformation=true&number=100` )
    // }
    let callNameResp = [];
    if (response.data.results) {
      response.data.results.map((item) => {
        let obj = RecipeFormater(
          item.id,
          item.title,
          item.healthScore,
          item.image,
          item.diets
        );
        callNameResp.push(obj);
      });
      return callNameResp;
    }
  } catch (error) {
    console.log("Something goes wrong when calling with name param");
    console.log(error.message);
  }
}

async function recipeId(id) {
  try {
    let item = await axios.get(
      `https://api.spoonacular.com/recipes/${id}/information?apiKey=${API_KEY}`
    );
    // let index = 1;
    // let item;
    // while (item <= 3 || item.status !== 200) {
    //   item = callMaker( index, `/${id}/information`, "" )
    // }
    let data = item.data;
    const dietList = [...data.diets];

    let filtered = [...new Set(dietList)];

    let stepsFormated = [];
    data.analyzedInstructions.map((item) => {
      let nested = [];
      item.steps.map((step) => {
        nested.push([step.number, step.step]);
      });
      stepsFormated.push([item.name, nested]);
      return nested;
    });

    const text = data.summary.replace(/<[^>]+>/g, "");
    let obj = {
      name: data.title,
      id: data.id,
      image: data.image,
      summary: text,
      dishTypes: data.dishTypes,
      diets: filtered,
      healthScore: data.healthScore,
      steps: stepsFormated,
    };
    return obj;
  } catch (error) {
    console.log("Something goes wrong when calling by ID");
    console.log(error.message);
    return [];
  }
}

module.exports = {
  allAPI,
  recipeName,
  recipeId,
};
