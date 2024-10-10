const DButils = require("./DButils");

async function markAsFavorite(user_id, recipe_id){
    await DButils.execQuery(`insert into favoriterecipes values ('${user_id}',${recipe_id})`);
}

async function getFavoriteRecipes(user_id){
    const recipes_id = await DButils.execQuery(`select recipe_id from favoriterecipes where user_id='${user_id}'`);
    return recipes_id;
}

async function getUsersRecipes(user_id){
    const recipes = await DButils.execQuery(`select * from User_Recipes where user_id='${user_id}'`);
    return recipes;
}

async function addUserRecipe(user_id, recipe_id, image, title, readyInMinutes, aggregateLikes, vegan, vegetarian, glutenFree, summary){
    await DButils.execQuery(`insert into Favorite_Recipes
         values ('${recipe_id}',${title},${summary},${readyInMinutes},${image},${aggregateLikes},${glutenFree},${vegetarian},${vegan},${user_id})`);
}


exports.addUserRecipe = addUserRecipe;
exports.getUsersRecipes = getUsersRecipes;
exports.markAsFavorite = markAsFavorite;
exports.getFavoriteRecipes = getFavoriteRecipes; 
