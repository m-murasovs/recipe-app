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
    const [MainingredientNotFoundError, setMainIngredientNotFoundError] = useState(false);
    const [mealsByIngredient, setMealsByIngredient] = useState<Recipe[]>([]);
    // The error shows the ingredient we couldn't find any meals for
    const [mealsByIngredientError, setMealsByIngredientError] = useState('');
    const [activeRecipe, setActiveRecipe] = useState<Recipe | null>(null);
    const [otherIngredients, setOtherIngredients] = useState<string[]>([]);
    const [otherIngredientOptions, setOtherIngredientOptions] = useState<Ingredient[]>([]);

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
            setMainIngredientNotFoundError(true);
        } else {
            setMainIngredientNotFoundError(false);
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

    const handleOtherIngredientInput = (e) => {
        e.preventDefault();
        const value = e.target.value.toLowerCase();

        const options = value
            ? ingredients.filter((item) => item.strIngredient.toLowerCase().startsWith(value))
            : [];

        setOtherIngredientOptions(options);
    };

    const handleOtherIngredientClick = (e) => {
        e.preventDefault();
        const value = e.target.innerText;
        // Only add the other ingredients once
        setOtherIngredients(prev => prev.includes(value) ? prev : [...prev, value]);
    };

    const handleDeleteOtherIngredient = (e, ingredient) => {
        e.preventDefault();
        setOtherIngredients(prev => prev.filter(item => item !== ingredient));
    };

    const handleRecipeClick = (e, recipe) => {
        e.preventDefault();
        setActiveRecipe(recipe);
    };

    const handleClearClick = (e) => {
        e.preventDefault();
        setMainIngredient('');
        setIngredients([]);
        setMainIngredientOptions([]);
        setActiveRecipe(null);
        setMealsByIngredient([]);
    };

    const getMatchingIngredientsNumberForRecipe = (recipe: Recipe) => {
        const allIngredients = [mainIngredient, ...otherIngredients];
        let count = 0;
        for (let i = 0; i < allIngredients.length; i++) {
            if (recipe.ingredients.includes(allIngredients[i])) count++;
        }
        return count;
    }

    return (
        <>
            <div>
                {isLoading && <div><img src='/favicon.ico' />Loading</div>}
                <h1>Recip-e-asy</h1>
                <div>
                    <p>What is your main ingredient?</p>
                    <input type='text' value={mainIngredient} onChange={handleMainIngredientInput} />
                    {mainIngredient ? <button onClick={handleClearClick}>X</button> : null}
                    <div>
                        {MainingredientNotFoundError
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
                    <p>What other ingredients do you have? Add them one by one</p>
                    <input type='text' onChange={handleOtherIngredientInput} />
                    {otherIngredients.map(ingr => {
                        return <p key={ingr}>
                            {ingr}
                            <button onClick={(e) => handleDeleteOtherIngredient(e, ingr)}>X</button>
                        </p>;
                    })}
                    {otherIngredientOptions.length
                        ? otherIngredientOptions.map(opt => {
                            return <div key={opt.strIngredient}>
                                <button onClick={handleOtherIngredientClick}>
                                    {opt.strIngredient}
                                </button>
                            </div>;
                        })
                        : null
                    }
                    {/* Display the items here. These should be clearable. */}
                    {/* That should give us all the functionality we need. After that, we juse tidy up the code, add thests, and do the visuals */}

                    <div>
                        {mealsByIngredientError
                            ? <div>No meals for <strong>{mealsByIngredientError}</strong> found</div>
                            : mealsByIngredient.map(meal => {
                                return <div key={meal.strMeal}>
                                    <div>
                                        <img src={`${meal.strMealThumb}`} width={40} alt={meal.strMeal} />
                                    </div>
                                    <button onClick={(e) => handleRecipeClick(e, meal)}>
                                        {meal.strMeal}
                                    </button>
                                    {/* TODO: maybe color this according to how many ingredients you have <30% red, 30-70% yellow, rest green  */}
                                    <p>Ingredients matching: {getMatchingIngredientsNumberForRecipe(meal)} out of {meal.ingredients.length}</p>
                                </div>;
                            })
                        }
                    </div>

                    <div>
                        {activeRecipe
                            ? <div>
                                {activeRecipe.ingredients.map(ing => <span>{ing}</span>)}
                                <p>{activeRecipe.strInstructions}</p>
                            </div>
                            : null
                        }
                    </div>
                </div>
            </div>
        </>
    );
};

export default App;
