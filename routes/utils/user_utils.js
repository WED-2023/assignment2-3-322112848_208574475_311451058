const DButils = require("./DButils");
const recipes_utils = require("./recipes_utils");

// favorite recipes
async function markAsFavorite(user_id, recipe_id){
    await DButils.execQuery(`insert into favorite_recipes values (${user_id},${recipe_id})`);
}

async function getFavoriteRecipes(user_id){
    const fullRecipes = await getFavoriteIDs(user_id);
    if (fullRecipes && fullRecipes.length > 0) {
        return await recipes_utils.turnIdsIntoRecipes(fullRecipes, fullRecipes);
      } else {
        return [];
      }
}
async function getFavoriteIDs(user_id){
    const fullRecipes = await DButils.execQuery(`select recipe_id from favorite_recipes where user_id=${user_id}`);
    return fullRecipes;
}

// last watched recipes
async function markAsLastWatched(user_id, recipe_id,curr_time){
    await DButils.execQuery(`insert into last_watched_recipes values (${user_id},${recipe_id},'${curr_time}')`);
}

async function checkLastWatched(user_id){
    const recipes = await DButils.execQuery(`select * from last_watched_recipes where user_id=${user_id}`);
    return recipes;
}

async function getLastWatched(user_id){
    const fullRecipes = await DButils.execQuery(`select recipe_id from last_watched_recipes where user_id=${user_id}`);

    if (fullRecipes && fullRecipes.length > 0) {
        return await recipes_utils.turnIdsIntoRecipes(fullRecipes);
      } else {
        return [];
      }

}

async function removeLastWatchedRecipe(user_id, recipe_id){
    const recipe = await DButils.execQuery(`DELETE FROM last_watched_recipes where user_id=${user_id} and recipe_id=${recipe_id}`);
    return recipe;
}

async function updateLastWatched(user_id, recipe_id, curr_time){
    const recipe = await DButils.execQuery(`UPDATE last_watched_recipes SET create_time='${curr_time}' where user_id=${user_id} and recipe_id=${recipe_id}`);
    return recipe;
}

// user recipes
async function getUsersRecipes(user_id){
    const recipes = await DButils.execQuery(`select * from myrecipes where user_id=${user_id}`);
    return getMyRecipesPreview(recipes);
}

function getMyRecipesPreview(recipes){
    const recipes_array=[]
    for (let idx in recipes) {
        let {
        recipe_id,
        title,
        readyInMinutes,
        image,
        vegan,
        vegetarian,
        glutenFree,
        summary,
        } = recipes[idx];
        
        recipes_array.push({
            id: recipe_id,
            image: image,
            title: title,
            readyInMinutes: readyInMinutes,
            vegetarian: !!vegetarian,
            vegan: !!vegan,
            glutenFree: !!glutenFree,
            summary: summary,
        });
        
    }
    return { recipes: recipes_array };
}

async function addUserRecipe(user_id, recipe_id, image, title, readyInMinutes, vegan, vegetarian, glutenFree, summary, likes){
    await DButils.execQuery(`insert into myrecipes
         values (${recipe_id},'${title}','${summary}',${readyInMinutes},'${image}',${likes},${glutenFree},${vegetarian},${vegan},${user_id})`);
}

exports.getFavoriteIDs = getFavoriteIDs;
exports.updateLastWatched = updateLastWatched;
exports.removeLastWatchedRecipe = removeLastWatchedRecipe;
exports.checkLastWatched = checkLastWatched;
exports.markAsLastWatched = markAsLastWatched;
exports.getLastWatched = getLastWatched;
exports.addUserRecipe = addUserRecipe;
exports.getUsersRecipes = getUsersRecipes;
exports.markAsFavorite = markAsFavorite;
exports.getFavoriteRecipes = getFavoriteRecipes; 
