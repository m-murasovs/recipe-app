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

interface Recipe {
    idMeal: string;
    strMeal: string;
    strDrinkAlternate: string;
    strCategory: string;
    strArea: string;
    strInstructions: string;
    strMealThumb: string;
    strTags: string;
    strYoutube: string;
    strIngredient1: string;
    strIngredient2: string;
    strIngredient3: string;
    strIngredient4: string;
    strIngredient5: string;
    strIngredient6: string;
    strIngredient7: string;
    strIngredient8: string;
    strIngredient9: string;
    strIngredient10: string;
    strIngredient11: string;
    strIngredient12: string;
    strIngredient13: string;
    strIngredient14: string;
    strIngredient15: string;
    strIngredient16: string;
    strIngredient17: string;
    strIngredient18: string;
    strIngredient19: string;
    strIngredient20: string;
    strMeasure1: string;
    strMeasure2: string;
    strMeasure3: string;
    strMeasure4: string;
    strMeasure5: string;
    strMeasure6: string;
    strMeasure7: string;
    strMeasure8: string;
    strMeasure9: string;
    strMeasure10: string;
    strMeasure11: string;
    strMeasure12: string;
    strMeasure13: string;
    strMeasure14: string;
    strMeasure15: string;
    strMeasure16: string;
    strMeasure17: string;
    strMeasure18: string;
    strMeasure19: string;
    strMeasure20: string;
    strSource: string;
    strImageSource: string;
    strCreativeCommonsConfirmed: string;
    dateModified: string;
}

const INGREDIENTS_LIST_URL = 'https://www.themealdb.com/api/json/v1/1/list.php?i=list';
const MEAL_BY_INGREDIENT_URL = 'https://www.themealdb.com/api/json/v1/1/filter.php?i=';

const getMealByIngredientUrl = (ingredient) => {
    return `${MEAL_BY_INGREDIENT_URL}${ingredient.toLowerCase().replace(' ', '_')}`;
};

// const processRecipe = (recipe) => {

// };

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

            // Fetch the recipes for the possible meals
            const mealUrls = data.meals.map(meal => {
                return `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${meal.idMeal}`;
            });

            const recipes = await Promise.all(
                mealUrls.map(async (url) => {
                    const response = await fetch(url);
                    const recipeData = await response.json() as { meals: Recipe[]; };
                    // The meals is an array with one item, so this pulls the item out
                    return recipeData.meals[0];
                })
            );

            setMealsByIngredientError('');
            setMealsByIngredient(recipes);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    console.log(mealsByIngredient);

    return (
        <>
            <div>
                {isLoading && <div><img src="/favicon.ico" />Loading</div>}
                <h1>Recip-e-asy</h1>
                <div>
                    What is your main ingredient?
                    <input type="text" value={mainIngredient} onChange={handleMainIngredientInput} />
                    <div>
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
