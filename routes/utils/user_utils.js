const DButils = require("./DButils");

async function markAsFavorite(user_id, recipe_id){
    await DButils.execQuery(`insert into Favorite_Recipes values ('${recipe_id}',${user_id})`);
}

async function markAsLiked(user_id, recipe_id){
    await DButils.execQuery(`insert into Liked_Recipes values ('${recipe_id}',${user_id})`);
}

async function addUserRecipe(user_id, recipe_id){
    await DButils.execQuery(`insert into Favorite_Recipes values ('${recipe_id}',${user_id},${user_id},${user_id},${user_id})`);
}

async function getFavoriteRecipes(user_id){
    const recipes_id = await DButils.execQuery(`select recipe_id from Favorite_Recipes where user_id='${user_id}'`);
    return recipes_id;
}


async function getLikedRecipes(user_id){
    const recipes_id = await DButils.execQuery(`select recipe_id from Liked_Recipes where user_id='${user_id}'`);
    return recipes_id;
}


async function getUsersRecipes(user_id){
    const recipes_id = await DButils.execQuery(`select recipe_id from User_Recipes where user_id='${user_id}'`);
    return recipes_id;
}



exports.markAsFavorite = markAsFavorite;
exports.getFavoriteRecipes = getFavoriteRecipes;
