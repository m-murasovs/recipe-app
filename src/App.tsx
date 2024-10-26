import React, { useEffect, useState } from 'react';
import './App.css';

interface Ingredient {
    idIngredient: string;
    strIngredient: string;
    strDescription: string;
}

interface MealByIngredient {
    strMeal: string;
    strMealThumb: string;
    idMeal: string;
}

interface RecipeRaw {
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

interface IngredientWithMeasure {
    item: string;
    measure: string;
};

interface Recipe {
    idMeal: string;
    strMeal: string;
    strArea: string;
    strInstructions: string;
    strMealThumb: string;
    strYoutube: string;
    ingredients: string[];
    ingredientsWithMeasures: IngredientWithMeasure[];
}

const INGREDIENTS_LIST_URL = 'https://www.themealdb.com/api/json/v1/1/list.php?i=list';
const MEAL_BY_INGREDIENT_URL = 'https://www.themealdb.com/api/json/v1/1/filter.php?i=';
const MEAL_LOOKUP_URL = 'https://www.themealdb.com/api/json/v1/1/lookup.php?i=';

const getMealByIngredientUrl = (ingredient) => {
    return `${MEAL_BY_INGREDIENT_URL}${ingredient.toLowerCase().replace(' ', '_')}`;
};

/**
 * Transform the recipes into usable objects, where the ingredients are an array
 */
const processRecipe = (recipe: RecipeRaw): Recipe => {
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
    console.log('recipe', recipe)
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

const App = () => {
    const [ingredients, setIngredients] = useState<Ingredient[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [mainIngredient, setMainIngredient] = useState('');
    const [mainIngredientOptions, setMainIngredientOptions] = useState<Ingredient[]>([]);
    const [ingredientNotFoundError, setIngredientNotFoundError] = useState(false);
    const [mealsByIngredient, setMealsByIngredient] = useState<Recipe[]>([]);
    // The error shows the ingredient we couldn't find any meals for
    const [mealsByIngredientError, setMealsByIngredientError] = useState('');

    useEffect(() => {
        const fetchIngredients = async () => {
            try {
                setIsLoading(true);
                const response = await fetch(INGREDIENTS_LIST_URL);
                if (!response.ok) {
                    throw new Error(`Error while fetching ingredients: ${response.status}`);
                }
                const data = await response.json() as { meals: Ingredient[]; };
                setIngredients(data.meals);
            } catch (error) {
                console.error(error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchIngredients();
    }, []); // Load ingredients only once

    /**
     * Gets the ingredients that start with the input
     */
    const handleMainIngredientInput = (e) => {
        e.preventDefault();
        setMainIngredient(e.target.value);
        const value = e.target.value.toLowerCase();

        const options = value
            ? ingredients.filter((item) => item.strIngredient.toLowerCase().startsWith(value))
            : [];

        // Clear the fetched meals if the user deletes the input
        if (!value.length) {
            setMainIngredient('');
            setMealsByIngredient([]);
        }

        if (value.length && !options.length) {
            setIngredientNotFoundError(true);
        } else {
            setIngredientNotFoundError(false);
            setMainIngredientOptions(options);
        };
    };

    const handleMainIngredientButtonClick = async (e) => {
        e.preventDefault();
        setMainIngredient(e.target.innerText);
        const mealByIngredientUrl = getMealByIngredientUrl(e.target.innerText);

        try {
            setIsLoading(true);
            const response = await fetch(mealByIngredientUrl);
            if (!response.ok) {
                throw new Error(`Error while fetching meal: ${response.status}`);
            }
            const data = await response.json() as { meals: MealByIngredient[]; };

            // If there aren't any meals for this ingredient, we'll show a message
            if (!data.meals) {
                setMealsByIngredientError(e.target.innerText);
                return;
            }

            // Fetch the recipes for the possible meals and process them
            const mealUrls = data.meals.map(meal => `${MEAL_LOOKUP_URL}${meal.idMeal}`);
            const recipes = await Promise.all(
                mealUrls.map(async (url) => {
                    const response = await fetch(url);
                    const recipeData = await response.json() as { meals: RecipeRaw[]; };
                    // The meals is an array with one item, so this pulls the item out
                    return recipeData.meals[0];
                })
            );
            console.log(recipes)
            const processedRecipes = recipes.map(rec => processRecipe(rec));

            setMealsByIngredientError('');
            setMealsByIngredient(processedRecipes);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <div>
                {isLoading && <div><img src="/favicon.ico" />Loading</div>}
                <h1>Recip-e-asy</h1>
                <div>
                    What is your main ingredient?
                    <input type="text" value={mainIngredient} onChange={handleMainIngredientInput} />
                    <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                        {ingredientNotFoundError
                            ? <div>Nothing found</div>
                            : mainIngredientOptions.map(opt => {
                                return <div key={opt.strIngredient}>
                                    <button onClick={handleMainIngredientButtonClick}>
                                        {opt.strIngredient}
                                    </button>
                                </div>;
                            })
                        }
                    </div>

                    <div>
                        {mealsByIngredientError
                            ? <div>No meals fort <strong>{mealsByIngredientError}</strong> found</div>
                            : mealsByIngredient.map(meal => {
                                return <div key={meal.strMeal}>
                                    <img src={`${meal.strMealThumb}`} width={40} alt={meal.strMeal} />
                                    {meal.strMeal}
                                </div>;
                            })
                        }
                    </div>
                </div>
            </div>
        </>
    );
};

export default App;
