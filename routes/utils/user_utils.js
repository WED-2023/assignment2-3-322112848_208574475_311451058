const DButils = require("./DButils");
const recipes_utils = require("./recipes_utils");

// favorite recipes
async function markAsFavorite(user_id, recipe_id){
    await DButils.execQuery(`insert into favoriterecipes values ('${user_id}',${recipe_id})`);
}

async function getFavoriteRecipes(user_id){
    const recipes_id = await DButils.execQuery(`select recipe_id from favoriterecipes where user_id='${user_id}'`);
    return recipes_id;
}

// last watched recipes
async function markAsLastWatched(user_id, recipe_id){
    await DButils.execQuery(`insert into lastwatchedrecipes values ('${user_id}',${recipe_id})`);
}

async function getLastWatched(user_id){
    const recipes_id = await DButils.execQuery(`select recipe_id from lastwatchedrecipes where user_id='${user_id}'`);
    return recipes_id;
}

// user recipes
async function getUsersRecipes(user_id){
    const recipes = await DButils.execQuery(`select * from User_Recipes where user_id='${user_id}'`);
    return recipes_utils.getRecipesPreview(recipes);
}

async function addUserRecipe(user_id, recipe_id, image, title, readyInMinutes, vegan, vegetarian, glutenFree, summary){
    await DButils.execQuery(`insert into Favorite_Recipes
         values ('${recipe_id}',${title},${summary},${readyInMinutes},${image},${glutenFree},${vegetarian},${vegan},${user_id})`);
}

exports.markAsLastWatched = markAsLastWatched;
exports.getLastWatched = getLastWatched;
exports.addUserRecipe = addUserRecipe;
exports.getUsersRecipes = getUsersRecipes;
exports.markAsFavorite = markAsFavorite;
exports.getFavoriteRecipes = getFavoriteRecipes; 
