var express = require("express");
var router = express.Router();
const DButils = require("./utils/DButils");
const user_utils = require("./utils/user_utils");
const recipe_utils = require("./utils/recipes_utils");

/**
 * Authenticate all incoming requests by middleware
 */
router.use(async function (req, res, next) {
  if (req.session && req.session.user_id) {
    DButils.execQuery("SELECT user_id FROM users").then((users) => {
      if (users.find((x) => x.user_id === req.session.user_id)) {
        req.user_id = req.session.user_id;
        next();
      }
    }).catch(err => next(err));
  } else {
    res.sendStatus(401);
  }
});


/**
 * This path gets body with recipeId and save this recipe in the favorites list of the logged-in user
 */
router.post('/favorites', async (req,res,next) => {
  try{
    if (!req.session && !req.session.user_id){
      throw { status: 409, message: "not logged in" };
    }
    const user_id = req.session.user_id;
    if (!req.body.recipe_id){
      throw { status: 408, message: " cant find recipe id" };
    }
    const recipe_id = req.body.recipe_id;

    // // check if user already liked the recipe
    // favorite_recipes = await user_utils.getFavoriteRecipes(user_id);

    // if (favorite_recipes.find((x) => x.recipe_id === parseInt(recipe_id)))
    //   throw { status: 408, message: "already liked" };

    user_utils.markAsFavorite(user_id,recipe_id); 
    res.status(200).send("The Recipe successfully saved as favorite");
    } catch(error){
    next(error);
    }
  });

/**
 * This path returns the favorites recipes that were saved by the logged-in user
 */
router.get('/favorites', async (req,res,next) => {
  try{
    if (!req.session && !req.session.user_id){
      throw { status: 409, message: "not logged in" };
    }

    const user_id = req.session.user_id;
    const recipes = await user_utils.getFavoriteRecipes(user_id);
    res.status(200).send(recipes);
  } catch(error){
    next(error); 
  }
});

/**
 * This path adds the recipe the logged-in user contracted
 */
router.post('/myRecipes', async (req,res,next) => {
  try{
    if (!req.session && !req.session.user_id){
      throw { status: 409, message: "not logged in" };
    }

    // extract the needed parameters 
    const user_id = req.session.user_id;
    const recipe_id = req.body.recipe.id;
    let image;
    if (req.body.recipe.image){
      image = req.body.recipe.image;
    }else {
      image = "https://images.squarespace-cdn.com/content/v1/6341e6a4afa32423fdb0b286/a01c570d-c067-4f18-9009-77b8416aece7/food.png"
    }
    const title = req.body.recipe.title;
    const readyInMinutes = req.body.recipe.time;
    const vegan = req.body.recipe.vegan;
    const vegetarian = req.body.recipe.vegetarian;
    const summary = req.body.recipe.description;
    const glutenFree = req.body.recipe.glutenFree;

    // add the the data base 
    //recipe_utils.addToLikedRecipes(likes,recipe_id);
    user_utils.addUserRecipe(user_id, recipe_id, image, title, readyInMinutes, vegan, vegetarian, glutenFree, summary,0);

    res.status(200).send("recipe added successfully");
  } catch(error){
    next(error); 
  }
});

/**
 * This path returns the recipes that were added by the logged-in user
 */
router.get('/myRecipes', async (req,res,next) => {
  try{
    if (!req.session && !req.session.user_id){
      throw { status: 409, message: "not logged in" };
    }

    const user_id = req.session.user_id;
    const recipes_ids = await user_utils.getUsersRecipes(user_id);

    res.status(200).send(recipes_ids);
  } catch(error){
    next(error); 
  }
}); 

/**
 * This path returns the recipes that were added by the logged-in user
 */
router.get('/lastWatched', async (req,res,next) => {
  try{
    if (!req.session && !req.session.user_id){
      throw { status: 409, message: "not logged in" };
    }
    const user_id = req.session.user_id;
    const recipes = await user_utils.getLastWatched(user_id);
    res.status(200).send(recipes);
  } catch(error){
    next(error); 
  }
});


router.post('/lastWatched', async (req,res,next) => {
  try{
    if (!req.session && !req.session.user_id){
      throw { status: 409, message: "not logged in" };
    }

    const user_id = req.session.user_id;
    const recipe_id = req.body.recipe_id;
    const currentTime = new Date().toISOString().slice(0, 19).replace('T', ' ');
    //const last_recipes = await user_utils.getLastWatched(user_id);
    const check_recipe = await user_utils.checkLastWatched(user_id);
    const isMatchFound = check_recipe.some(recipe => recipe.recipe_id === recipe_id);
    if (isMatchFound){
      user_utils.updateLastWatched(user_id,recipe_id,currentTime);
    }
    else {
      removeOldRecipes(check_recipe);
      // add the recipe to the database 
      user_utils.markAsLastWatched(user_id,recipe_id, currentTime);
    }
    res.status(200).send("last Watched Updated");
  } catch(error){
    next(error); 
  }
});

function removeOldRecipes(last_recipes){
  if (last_recipes.length>2){
    let oldestDate = new Date(last_recipes[0].create_time); // Start with the first date
    let idx = 0
    for (let i = 1; i < last_recipes.length; i++) {
        let currentDate = new Date(last_recipes[i].create_time);
        if (currentDate < oldestDate) {
            idx =i;
            oldestDate = currentDate;
        }
    }
  user_utils.removeLastWatchedRecipe(last_recipes[idx].user_id,last_recipes[idx].recipe_id);
  }
}
module.exports = router;
