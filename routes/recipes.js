var express = require("express");
var router = express.Router();
const recipes_utils = require("./utils/recipes_utils");
const user_utils = require("./utils/user_utils");

router.get("/", (req, res) => res.send("im here"));

/**
 * This path is for searching recipes
 */
router.get("/search", async (req, res, next) => {
  try {
    const recipeName = req.query.recipeName;
    const cuisine = req.query.cuisine;
    const diet = req.query.diet;
    const intolerance = req.query.intolerance;
    const number = req.query.number || 5;
    const results = await recipes_utils.searchRecipe(recipeName, cuisine, diet, intolerance, number);
    let full_recipes = [];
    const recipePromises = results.data.results.map(async (recipe) => {
      const recipeInfo = await recipes_utils.getRecipeInformation(recipe.id);
      full_recipes.push(recipeInfo.data);
    });
    await Promise.all(recipePromises);
    const recipes = recipes_utils.getRecipesPreview(full_recipes);
    res.status(200).send(recipes);
  } catch (error) {
    next(error);
  }
});

/**
 * This path returns recipes from the api
 */
router.get("/random", async (req, res, next) => {
  try {
    let favorite_recipes = [];
    if (req.session && req.session.user_id){
      favorite_recipes = await user_utils.getFavoriteIDs(req.session.user_id);
    }
    const results = await recipes_utils.randomRecipes(favorite_recipes);

    res.status(200).send(results);
  } catch (error) {
    next(error);
  }
});

/**
 * This path returns a full details of a recipe by its id
 */
router.get("/:recipeId", async (req, res, next) => {
  try {
    const recipe = await recipes_utils.getRecipeDetails(req.params.recipeId);
    res.send({ recipe: recipe });
  } catch (error) {
    next(error);
  }
});


module.exports = router;