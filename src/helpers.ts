import { Ingredient, IngredientWithMeasure, Recipe, RecipeRaw } from './types';

export const INGREDIENTS_LIST_URL = 'https://www.themealdb.com/api/json/v1/1/list.php?i=list';
export const MEAL_LOOKUP_URL = 'https://www.themealdb.com/api/json/v1/1/lookup.php?i=';
const MEAL_BY_INGREDIENT_URL = 'https://www.themealdb.com/api/json/v1/1/filter.php?i=';

export const getMealByIngredientUrl = (ingredient: string) => {
    return `${MEAL_BY_INGREDIENT_URL}${ingredient.toLowerCase().replace(' ', '_')}`;
};

/**
 * Transform the recipes into usable objects, where the ingredients are an array
 */
export const processRecipe = (recipe: RecipeRaw): Recipe => {
    const ingredients: string[] = [];
    const ingredientsWithMeasures: IngredientWithMeasure[] = [];

    for (let i = 1; i <= 20; i++) {
        const item = recipe[`strIngredient${i}`];
        const measure = recipe[`strMeasure${i}`];
        if (!item) {
            break;
        }
        ingredients.push(item);
        ingredientsWithMeasures.push({ item, measure });
    }

    return {
        idMeal: recipe.idMeal,
        strMeal: recipe.strMeal,
        strArea: recipe.strArea,
        strInstructions: recipe.strInstructions,
        strMealThumb: recipe.strMealThumb,
        strYoutube: recipe.strYoutube,
        ingredients,
        ingredientsWithMeasures,
    };
};

export const sortMealsByMatchingIngredients = (setMealsByIngredient, usersIngredients: string[]) => {
    setMealsByIngredient((prev: Recipe[]) => {
        return prev.sort((a: Recipe, b: Recipe) => {
            const aMatching = getMatchingIngredientsNumber(usersIngredients, a.ingredients);
            const bMatching = getMatchingIngredientsNumber(usersIngredients, b.ingredients);
            return bMatching - aMatching;
        });
    });
};

export const getMatchingIngredientsNumber = (usersIngredients: string[], recipeIngredients: string[]) => {
    let count = 0;
    for (const ingredient of usersIngredients) {
        if (recipeIngredients.includes(ingredient)) {
            count++;
        }
    }
    return count;
};

export const getOptions = (input: string, ingredients: Ingredient[]) => {
    return input.length
        ? ingredients.filter((item) => item.strIngredient.toLowerCase().startsWith(input))
        : ingredients.slice(0, 14); // Always return some ingredients, unless nothing can be found
};
