import React, { ChangeEvent, useCallback, useEffect, useState } from 'react';
import './App.css';
import { Ingredient, Recipe, RecipeRaw, MealByIngredient } from './types';
import { getMealByIngredientUrl, INGREDIENTS_LIST_URL, MEAL_LOOKUP_URL, processRecipe } from './helpers';

const App = () => {
    const [isLoading, setIsLoading] = useState(false);

    const [ingredients, setIngredients] = useState<Ingredient[]>([]);

    const [mainIngredient, setMainIngredient] = useState('');

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

    /** Get the ingredients that start with the input */
    const renderMainIngredientOptions = () => {
        const options = mainIngredient.length
            ? ingredients.filter((item) => item.strIngredient.toLowerCase().startsWith(mainIngredient.toLowerCase()))
            : [];

        if (mainIngredient.length && !options.length) return <div>Nothing found</div>;

        return options.map(opt => {
            return <div key={opt.strIngredient}>
                <button onClick={() => handleMainIngredientButtonClick(opt.strIngredient)}>
                    {opt.strIngredient}
                </button>
            </div>;
        });
    };

    const handleMainIngredientButtonClick = async (ingredient: string) => {
        setMainIngredient(ingredient);
        const mealByIngredientUrl = getMealByIngredientUrl(ingredient);

        try {
            setIsLoading(true);
            const response = await fetch(mealByIngredientUrl);
            if (!response.ok) {
                throw new Error(`Error while fetching meal: ${response.status}`);
            }
            const data = await response.json() as { meals: MealByIngredient[]; };

            // If there aren't any meals for this ingredient, we'll show a message
            if (!data.meals) {
                setMealsByIngredientError(ingredient);
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
            const processedRecipes = recipes.map(rec => processRecipe(rec));

            setMealsByIngredientError('');
            setMealsByIngredient(processedRecipes);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleOtherIngredientInput = (e: ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        const value = e.target.value.toLowerCase();

        const options = value
            ? ingredients.filter((item) => item.strIngredient.toLowerCase().startsWith(value))
            : [];

        setOtherIngredientOptions(options);
    };

    const handleOtherIngredientClick = (ingredient: string) => {
        // Only add the other ingredients once
        setOtherIngredients(prev => prev.includes(ingredient) ? prev : [...prev, ingredient]);
    };

    const handleDeleteOtherIngredient = (ingredient: string) => {
        setOtherIngredients(prev => prev.filter(item => item !== ingredient));
    };

    const handleRecipeClick = (recipe: Recipe) => {
        setActiveRecipe(recipe);
    };

    const handleClearAllClick = () => {
        setMainIngredient('');
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
                    <input type='text' value={mainIngredient} onChange={(e) => setMainIngredient(e.target.value)} />
                    {mainIngredient ? <button onClick={handleClearAllClick}>X</button> : null}
                    <div>
                        {renderMainIngredientOptions()}
                    </div>
                    <p>What other ingredients do you have? Add them one by one</p>
                    <input type='text' onChange={handleOtherIngredientInput} />
                    {otherIngredients.map(ingr => {
                        return <p key={ingr}>
                            {ingr}
                            <button onClick={(e) => handleDeleteOtherIngredient(ingr)}>X</button>
                        </p>;
                    })}
                    {otherIngredientOptions.length
                        ? otherIngredientOptions.map(opt => {
                            return <div key={opt.strIngredient}>
                                <button onClick={() => handleOtherIngredientClick(opt.strIngredient)}>
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
                                    <button onClick={(e) => handleRecipeClick(meal)}>
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
