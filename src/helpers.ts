import { Ingredient, IngredientWithMeasure, Recipe, RecipeRaw } from './types';

export const ingredientsWrapperProps = {
    sx: {
        display: 'flex',
        alignItems: 'center',
        gap: '.5rem',
        flexWrap: 'wrap'
    },
    m: '1rem 0'
}
/**
 * Transform the recipes into usable objects, where the ingredients are an array
 */
export const consolidateIngredients = (recipe: RecipeRaw): Recipe => {
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

export const sortMealsByMatchingIngredients = (recipes: Recipe[], usersIngredients: string[]) => {
    return recipes.sort((a: Recipe, b: Recipe) => {
        const aMatching = getMatchingIngredientsNumber(usersIngredients, a.ingredients);
        const bMatching = getMatchingIngredientsNumber(usersIngredients, b.ingredients);
        return bMatching - aMatching;
    });
};

export const getMatchingIngredientsNumber = (usersIngredients: string[], recipeIngredients: string[]) => {
    let count = 0;
    const recipeIngredientsLower = recipeIngredients.map((item) => item.toLowerCase());
    for (const ingredient of usersIngredients) {
        if (recipeIngredientsLower.includes(ingredient.toLowerCase())) {
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
