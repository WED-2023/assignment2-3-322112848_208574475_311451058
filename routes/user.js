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
    const recipe_id = req.body.recipe_id;

    // check if user already liked the recipe
    favorite_recipes = await user_utils.getFavoriteRecipes(user_id);
    if (favorite_recipes.find((x) => x.recipe_id === parseInt(recipe_id)))
      throw { status: 409, message: "already liked" };

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
    const recipes_ids = await user_utils.getFavoriteRecipes(user_id);
    const results = recipe_utils.getRecipesPreview(recipes_ids);
    res.status(200).send(results);
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
    const recipe_id = req.body.recipe_id;
    const image = req.body.image;
    const title = req.body.title;
    const readyInMinutes = req.body.readyInMinutes;
    const vegan = req.body.vegan;
    const vegetarian = req.body.vegetarian;
    const summary = req.body.summary;
    const glutenFree = req.body.glutenFree;
    const likes = req.body.aggregateLikes;

    // add the the data base 
    recipe_utils.addToLikedRecipes(likes,recipe_id);
    user_utils.addUserRecipe(user_id, recipe_id, image, title, readyInMinutes, vegan, vegetarian, glutenFree, summary);

    res.status(200).send(results);
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
    
    if (!req.session && !req.session.user_id){
      throw { status: 409, message: "not logged in" };
    }

    const user_id = req.session.user_id;
    const recipes_ids = await user_utils.getUsersRecipes(user_id);
    const results = recipe_utils.getRecipesPreview(recipes_ids);
    res.status(200).send(results);
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
    // get the full recipes ids from the data base 
    const recipes_ids = await user_utils.getLastWatched(user_id);
    const results = recipe_utils.getRecipesPreview(recipes_ids);
    res.status(200).send(results);
  } catch(error){
    next(error); 
  }
});

module.exports = router;
