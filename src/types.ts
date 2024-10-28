
export interface Ingredient {
    idIngredient: string;
    strIngredient: string;
    strDescription: string;
}

export interface MealByIngredient {
    strMeal: string;
    strMealThumb: string;
    idMeal: string;
}

export interface RecipeRaw {
    idMeal: string;
    strMeal: string;
    strDrinkAlternate: string;
    strCategory: string;
    strArea: string;
    strInstructions: string;
    strMealThumb: string;
    strTags: string;
    strYoutube: string;
    [key: string]: string;
}

export interface IngredientWithMeasure {
    item: string;
    measure: string;
};

export interface Recipe {
    idMeal: string;
    strMeal: string;
    strArea: string;
    strInstructions: string;
    strMealThumb: string;
    strYoutube: string;
    ingredients: string[];
    ingredientsWithMeasures: IngredientWithMeasure[];
}
