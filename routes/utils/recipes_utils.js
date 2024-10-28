const axios = require("axios");
const DButils = require("./DButils");
const user_utils = require("./user_utils");
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
    analyzedInstructions,
    instructions,
    extendedIngredients,
    aggregateLikes,
    readyInMinutes,
    image,
    title
  } = recipe_info.data;

  return {
    id: recipe_id,
    title: title,
    readyInMinutes: readyInMinutes,
    image: image,
    popularity: aggregateLikes,
    analyzedInstructions: analyzedInstructions,
    instructions: instructions,
    extendedIngredients: extendedIngredients
  };
}

function getRecipesPreview(recipes,liked_recipes) {
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
          if (recipe.length===0 && id) {
              // Fire and forget for addToLikedRecipes
              addToLikedRecipes(aggregateLikes, id);
          }
          else{
            aggregateLikes = recipe.likes;
          }
        });
        
        let liked = false;
        if (liked_recipes){
          const recipesIDs = liked_recipes.map(obj => obj.recipe_id);
          if (recipesIDs.includes(id)){
            liked = true;
          }
        } 
        
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
            liked: liked
        });
        
    }
    return { recipes: recipes_array };
    }


async function randomRecipes(favorite_recipes) {
  const response = await axios.get(`${api_domain}/random`, {
    params: {
      number: 3,
      apiKey: process.env.spooncular_apiKey,
    },
  });
  return getRecipesPreview(response.data.recipes, favorite_recipes);
}

async function turnIdsIntoRecipes(ids,favorite_IDs){
  let ids_string = ids.map(item => item.recipe_id).join(',');
  const response = await axios.get(`${api_domain}/informationBulk?ids=${ids_string}`, {
    params: {
      includeNutrition: false,
      apiKey: process.env.spooncular_apiKey,
    }
  });
  return getRecipesPreview(response.data,favorite_IDs);
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

  return response;
}

async function getLikedRecipes(recipe_id){
  const recipes_id = await DButils.execQuery(`select * from Liked_Recipes where recipe_id='${recipe_id}'`);
  return recipes_id;
}

async function addToLikedRecipes(likes,recipe_id){
  await DButils.execQuery(`insert into liked_recipes values ('${likes}',${recipe_id})`);
}

async function likeRecipes(recipe_id){
  const likes = await DButils.execQuery(`select likes from liked_Recipes where recipe_id='${recipe_id}'`);
  await DButils.execQuery(`UPDATE liked_recipes SET likes='${likes+1}' where recipe_id='${recipe_id}'`);
}

// function insertLikes(recipesJson){
//   if (req.session.user_id){

//     if (recipesJson.recipes){
//       recipesJson.recipes.map(recipe => {
//         if (liked_recipes.includes(recipe.recipe_id)) {
//           recipe.liked = true; // Set liked to true
//       }
//     });}
//   }
  
//}


   

exports.turnIdsIntoRecipes = turnIdsIntoRecipes;
exports.getLikedRecipes = getLikedRecipes;
exports.addToLikedRecipes = addToLikedRecipes;
exports.likeRecipes = likeRecipes;
exports.randomRecipes = randomRecipes;
exports.getRecipeDetails = getRecipeDetails;
exports.searchRecipe = searchRecipe;
exports.getRecipesPreview = getRecipesPreview; 
exports.getRecipeInformation = getRecipeInformation;