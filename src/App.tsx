import React, { ChangeEvent, useEffect, useState } from 'react';
import './App.css';
import { Ingredient, Recipe, RecipeRaw, MealByIngredient } from './types';
import { getMatchingIngredientsNumber, getMealByIngredientUrl, getOptions, INGREDIENTS_LIST_URL, MEAL_LOOKUP_URL, processRecipe, sortMealsByMatchingIngredients } from './helpers';
import { Grid2, Box, Container, Typography, Button, TextField } from '@mui/material';
import { IngredientsWrapper } from './components/wrappers';

const App = () => {
    const [isLoading, setIsLoading] = useState(false);

    const [ingredients, setIngredients] = useState<Ingredient[]>([]);
    const [mainIngredient, setMainIngredient] = useState('');

    const [mealsByIngredient, setMealsByIngredient] = useState<Recipe[]>([]);
    // The error shows the ingredient we couldn't find any meals for
    const [mealsByIngredientError, setMealsByIngredientError] = useState('');

    const [otherIngredientInputValue, setOtherIngredientInputValue] = useState('');
    const [otherIngredients, setOtherIngredients] = useState<string[]>([]);

    const [activeRecipe, setActiveRecipe] = useState<Recipe | null>(null);

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
        const options = getOptions(mainIngredient, ingredients);

        if (mainIngredient.length && !options.length) {
            return <div>We don't have any recipes for <strong>{mainIngredient}</strong></div>;
        }

        return options.map(opt => {
            return <div key={opt.strIngredient}>
                <Button onClick={() => handleMainIngredientButtonClick(opt.strIngredient)}>
                    {opt.strIngredient}
                </Button>
            </div>;
        });
    };

    /**
     * When the user selects the main ingredient, we fetch all the meals that can be made with it
     */
    const handleMainIngredientButtonClick = async (ingredient: string) => {
        if (mainIngredient.toLowerCase() === ingredient.toLowerCase()) return;

        setMainIngredient(ingredient.toLowerCase());
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

    const renderOtherIngredientOptions = () => {
        const options = getOptions(otherIngredientInputValue, ingredients);

        return options.map(opt => {
            return <div key={opt.strIngredient}>
                <Button onClick={() => handleOtherIngredientClick(opt.strIngredient)}>
                    {opt.strIngredient}
                </Button>
            </div>;
        })
    };

    const handleOtherIngredientClick = (ingredient: string) => {
        //Only add the ingredient once
        setOtherIngredients(prev => prev.includes(ingredient) ? prev : [...prev, ingredient])

        // Sort the available meals by most compatible
        if (mealsByIngredient.length) sortMealsByMatchingIngredients(setMealsByIngredient, [mainIngredient, ...otherIngredients]);

        setOtherIngredientInputValue('');
    }

    const handleClearAllClick = () => {
        setMainIngredient('');
        setOtherIngredients([]);
        setActiveRecipe(null);
        setMealsByIngredient([]);
    };

    return (
        <Container sx={{ width: '100%', minHeight: '100%', height: '100vh', margin: '2rem', }}>
            <main>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }} mb='3rem'>
                    <img
                        src='/favicon.ico'
                        width={80}
                        height={80}
                        className={`${isLoading ? 'logo-spin' : ''} logo`}
                    />
                    <Typography variant='h1' sx={{ fontSize: { xs: '3rem', md: '5rem' } }}>
                        Recip-e-asy
                    </Typography>
                </Box>

                <Grid2 container spacing={2}>
                    <Grid2 size={{ xs: 12, md: 6 }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '0.5rem' }}>
                            <Typography variant='h2' sx={{ fontSize: '1.3rem' }}>
                                What is your main ingredient?
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                                <TextField
                                    type='text'
                                    value={mainIngredient}
                                    onChange={(e) => setMainIngredient(e.target.value)}
                                    placeholder='Search main ingredient'
                                />
                                {mainIngredient
                                    ? <Button onClick={handleClearAllClick}>X</Button>
                                    : null
                                }
                            </Box>
                        </Box>
                        <IngredientsWrapper>
                            {renderMainIngredientOptions()}
                        </IngredientsWrapper>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'left', flexWrap: 'wrap' }} mt='2rem'>
                            <Typography variant='h2' sx={{ fontSize: '1.3rem' }}>
                                What other ingredients do you have? Add them one by one.
                            </Typography>
                            <TextField
                                type='text'
                                onChange={(e) => setOtherIngredientInputValue(e.target.value)}
                                placeholder='Search other ingredients'
                                value={otherIngredientInputValue}
                            />
                        </Box>
                        <IngredientsWrapper>
                            {otherIngredients.map(ingr => {
                                return <Typography key={ingr}>
                                    {ingr}
                                    <Button
                                        onClick={() => setOtherIngredients(prev => prev.filter(item => item !== ingr))}
                                        size='small'
                                        sx={{ padding: '0.2rem', minWidth: '2rem', marginLeft: '0.2rem', marginRight: '0.5rem' }}
                                    >
                                        X
                                    </Button>
                                </Typography>;
                            })}
                        </IngredientsWrapper>

                        <IngredientsWrapper>
                            {renderOtherIngredientOptions()}
                        </IngredientsWrapper>
                    </Grid2>

                    <Grid2 size={{ xs: 12, md: 6 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
                        {mealsByIngredientError
                            ? <div>No meals for <strong>{mealsByIngredientError}</strong> found</div>
                            : mealsByIngredient.map(meal => {
                                return <div>
                                    <div>
                                        <img src={`${meal.strMealThumb}`} width={40} alt={meal.strMeal} />
                                    </div>
                                    <Button onClick={() => setActiveRecipe(meal)}>
                                        {meal.strMeal}
                                    </Button>
                                    {/* TODO: maybe color this according to how many ingredients you have <30% red, 30-70% yellow, rest green  */}
                                    {/* TODO: definitely sort this by most ingredients available */}
                                    <p>Ingredients matching: {
                                        getMatchingIngredientsNumber([mainIngredient, ...otherIngredients], meal.ingredients)
                                    } out of {meal.ingredients.length}</p>
                                </ div>;
                            })
                        }
                        </Box>

                        {activeRecipe
                            ? <div>
                                {activeRecipe.ingredients.map(ing => <span>{ing}</span>)}
                                <Typography>{activeRecipe.strInstructions}</Typography>
                            </div>
                            : null
                        }
                    </Grid2>
                </Grid2>
            </main>
        </Container >
    );
};

export default App;
