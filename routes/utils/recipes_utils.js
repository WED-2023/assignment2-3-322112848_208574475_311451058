const axios = require("axios");
const DButils = require("./DButils");
const api_domain = "https://api.spoonacular.com/recipes";

/**
 * Get recipes list from spooncular response and extract the relevant recipe data for preview
 * @param {*} recipes_info
 */

async function getRecipeInformation(recipe_id) {
  return await axios.get(`${api_domain}/${recipe_id}/information`, {
    params: {
      includeNutrition: false,
      apiKey: process.env.spooncular_apiKey,
    },
  });
}

async function getRecipeDetails(recipe_id) { 
  let recipe_info = await getRecipeInformation(recipe_id);
  let {
    id,
    title,
    readyInMinutes,
    image,
    aggregateLikes,
    vegan,
    vegetarian,
    glutenFree,
  } = recipe_info.data;

  return {
    id: id,
    title: title,
    readyInMinutes: readyInMinutes,
    image: image,
    popularity: aggregateLikes,
    vegan: vegan,
    vegetarian: vegetarian,
    glutenFree: glutenFree,
  };
}

function getRecipesPreview(recipes) {
    const recipes_array=[]
    for (let idx in recipes) {
        let {
        id,
        title,
        readyInMinutes,
        image,
        aggregateLikes,
        vegan,
        vegetarian,
        glutenFree,
        summary,
        } = recipes[idx];
        // get the current likes of the recipe 
        getLikedRecipes(id).then((recipe) => {
          if (!recipe) {
              // Fire and forget for addToLikedRecipes
              addToLikedRecipes(aggregateLikes, id);
          }
          else{
            aggregateLikes = recipe.likes;
          }
      });
        
        recipes_array.push({
            id: id,
            image: image,
            title: title,
            readyInMinutes: readyInMinutes,
            aggregateLikes: aggregateLikes,
            vegetarian: vegetarian,
            vegan: vegan,
            glutenFree: glutenFree,
            summary: summary,
        });
        
    }
    return { recipes: recipes_array };
    }


async function randomRecipes() {
  const response = await axios.get(`${api_domain}/random`, {
    params: {
      number: 3,
      apiKey: process.env.spooncular_apiKey,
    },
  });
  return { recipes: getRecipesPreview(response.data.recipes)};
}

async function searchRecipe(recipeName, cuisine, diet, intolerance, number) {
  const response = await axios.get(`${api_domain}/complexSearch`, {
    params: {
      query: recipeName,
      cuisine: cuisine,
      diet: diet,
      intolerances: intolerance,
      number: number,
      apiKey: process.env.spooncular_apiKey,
    },
  });

  return getRecipesPreview(response);
}

async function getLikedRecipes(recipe_id){
  const recipes_id = await DButils.execQuery(`select * from Liked_Recipes where recipe_id='${recipe_id}'`);
  return recipes_id;
}

async function addToLikedRecipes(likes,recipe_id){
  await DButils.execQuery(`insert into likedrecipes values ('${likes}',${recipe_id})`);
}

async function likeRecipes(recipe_id){
  const likes = await DButils.execQuery(`select likes from Liked_Recipes where recipe_id='${recipe_id}'`);
  await DButils.execQuery(`UPDATE likedrecipes SET likes='${likes+1}' where recipe_id='${recipe_id}'`);
}

   

exports.getLikedRecipes = getLikedRecipes;
exports.addToLikedRecipes = addToLikedRecipes;
exports.likeRecipes = likeRecipes;
exports.randomRecipes = randomRecipes;
exports.getRecipeDetails = getRecipeDetails;
exports.searchRecipe = searchRecipe;
exports.getRecipesPreview = getRecipesPreview;
