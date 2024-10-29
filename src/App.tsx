import React, { ChangeEvent, useEffect, useState } from 'react';
import './App.css';
import { Ingredient, Recipe, RecipeRaw, MealByIngredient } from './types';
import { getMatchingIngredientsNumber, getOptions, consolidateIngredients, sortMealsByMatchingIngredients, ingredientsWrapperProps } from './helpers';
import { Grid2, Box, Container, Typography, Button, TextField, Card, CardMedia, CardActionArea, CardContent, List, ListItem, Link } from '@mui/material';

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

    // Load the ingredients on render
    useEffect(() => {
        const fetchIngredients = async () => {
            try {
                setIsLoading(true);
                const response = await fetch('https://www.themealdb.com/api/json/v1/1/list.php?i=list');
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
    }, []); // Load only once

    /** Get the ingredients that start with the input */
    const renderMainIngredientOptions = () => {
        const options = getOptions(mainIngredient.toLowerCase(), ingredients);

        if (mainIngredient.length && !options.length) {
            return <div>No recipes found for <strong>{mainIngredient}</strong></div>;
        };

        return options.map(opt => {
            return <Button
                key={opt.strIngredient}
                onClick={() => setMainIngredient(opt.strIngredient)}
                variant='outlined'
                disabled={mainIngredient === opt.strIngredient}
            >
                {opt.strIngredient}
            </Button>
        });
    };

    /** Fetch and process the possible recipes for the main ingredient */
    const handleSearch = async () => {
        if (!mainIngredient) {
            return;
        }

        try {
            setIsLoading(true);

            const response = await fetch(
                `https://www.themealdb.com/api/json/v1/1/filter.php?i=${mainIngredient.toLowerCase().replace(' ', '_')}`
            );
            if (!response.ok) throw new Error(`Error while fetching meal: ${response.status}`);
            const data = await response.json() as { meals: MealByIngredient[]; };
            if (!data.meals) {
                setMealsByIngredientError(mainIngredient);
                return;
            }

            const mealUrls = data.meals.map(meal => `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${meal.idMeal}`);
            const recipes = await Promise.all(
                mealUrls.map(async (url) => {
                    const response = await fetch(url);
                    const recipeData = await response.json() as { meals: RecipeRaw[]; };
                    // The meals is an array with one item, so this pulls the item out
                    return recipeData.meals[0];
                })
            );
            const recipesWithConsolidatedIngredients = recipes.map(rec => consolidateIngredients(rec));
            const sortedRecipes = sortMealsByMatchingIngredients(
                recipesWithConsolidatedIngredients,
                [mainIngredient, ...otherIngredients]
            );

            setMealsByIngredientError('');
            setMealsByIngredient(sortedRecipes);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const renderOtherIngredientOptions = () => {
        const options = getOptions(otherIngredientInputValue, ingredients);

        if (otherIngredientInputValue.length && !options.length) {
            return <div><strong>{otherIngredientInputValue}</strong> not found</div>;
        };

        return options.map(opt => {
            return <Button
                key={opt.strIngredient}
                onClick={() => handleOtherIngredientClick(opt.strIngredient)}
                variant='outlined'
                disabled={otherIngredients.includes(opt.strIngredient)}
            >
                {opt.strIngredient}
            </Button>
        });
    };

    const handleOtherIngredientClick = (ingredient: string) => {
        // Only add the ingredient once
        setOtherIngredients(prev => prev.includes(ingredient) ? prev : [...prev, ingredient]);
        setOtherIngredientInputValue('');
    }

    const handleClearAllClick = () => {
        setMainIngredient('');
        setOtherIngredients([]);
        setActiveRecipe(null);
        setMealsByIngredient([]);
    };

    const handleActiveRecipeClick = (recipe: Recipe) => {
        setActiveRecipe(recipe);
        document.getElementById('recipe-title-placeholder')!.scrollIntoView({ block: "center", inline: "nearest" });
    }

    return (
        <Container sx={{ minWidth: '100%', minHeight: '100%', height: '100vh', margin: '2rem' }}>
            <main>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }} mb='1rem'>
                    <img
                        src='/favicon.ico'
                        alt='Recip-e-asy logo'
                        className={`${isLoading ? 'logo-spin' : ''} logo`}
                    />
                    <Typography variant='h1' sx={{ fontSize: { xs: '3rem', md: '5rem' } }} gutterBottom>
                        Recip-e-asy
                    </Typography>
                </Box>

                {/* This part displays the search mechanism */}
                <Grid2 container spacing={4} columns={16}>
                    <Grid2 size={{ xs: 12, md: 6 }}>
                        {/* Main ingredient */}
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '0.5rem' }}>
                            <Typography variant='h2' sx={{ fontSize: '1.3rem' }}>
                                What is your main ingredient?
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                                <TextField
                                    type='text'
                                    value={mainIngredient}
                                    onChange={(e) => setMainIngredient(e.target.value)}
                                    placeholder='Type main ingredient'
                                />
                                {mainIngredient
                                    ? <Button onClick={handleClearAllClick}>X</Button>
                                    : null
                                }
                            </Box>
                        </Box>
                        <Box sx={ingredientsWrapperProps.sx} m={ingredientsWrapperProps.m}>
                            {renderMainIngredientOptions()}
                        </Box>

                        {/* Other ingredients */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'left', flexWrap: 'wrap' }} mt='2rem'>
                            <Typography variant='h2' sx={{ fontSize: '1.3rem' }}>
                                What other ingredients do you have? Add them one by one.
                            </Typography>
                            <TextField
                                type='text'
                                onChange={(e) => setOtherIngredientInputValue(e.target.value)}
                                placeholder='Type other ingredients'
                                value={otherIngredientInputValue}
                            />
                        </Box>
                        {otherIngredients.length
                            ? <Box sx={ingredientsWrapperProps.sx} m={ingredientsWrapperProps.m}>
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
                                })
                                }
                            </Box>
                            : null
                        }
                        <Box sx={ingredientsWrapperProps.sx} m={ingredientsWrapperProps.m}>
                            {renderOtherIngredientOptions()}
                        </Box>
                        {/* Search */}
                        <Button onClick={handleSearch} variant='contained' size='large'>
                            Search
                        </Button>
                    </Grid2>

                    {/* This part displays the available meals for the main ingredient */}
                    <Grid2 size={{ xs: 12, md: 8 }}>
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: '1.5rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
                            {mealsByIngredientError
                                ? <Typography component='p'>
                                    No meals for <strong>{mealsByIngredientError}</strong> found
                                </Typography>
                                : mealsByIngredient.map(meal => {
                                    return <Card key={meal.idMeal} sx={{ width: 240, height: 230 }}>
                                        <CardActionArea onClick={() => handleActiveRecipeClick(meal)}>
                                            <CardMedia
                                                component='img'
                                                height='140'
                                                image={meal.strMealThumb}
                                                alt={meal.strMeal}
                                            />
                                            <CardContent>
                                                <Typography component='p' noWrap>
                                                    {meal.strMeal}
                                                </Typography>
                                                <Typography component='p' sx={{ color: 'text.secondary' }}>
                                                    {getMatchingIngredientsNumber([mainIngredient, ...otherIngredients], meal.ingredients)}/{meal.ingredients.length} ingredients available
                                                </Typography>
                                            </CardContent>
                                        </CardActionArea>
                                    </Card>;
                                })
                            }
                        </Box>

                        <div id='recipe-title-placeholder' />
                        {activeRecipe
                            ? <Box mb='3rem'>
                                <Typography variant='h4'>
                                    {activeRecipe.strMeal}
                                </Typography>
                                <List>
                                    {activeRecipe.ingredientsWithMeasures.map(({ item, measure }) => {
                                        return <ListItem key={item}>
                                            {/\d/.test(measure)
                                                ? `${measure} ${item}`
                                                : `${item} ${measure.toLowerCase()}`
                                            }
                                        </ListItem>;
                                    })}
                                </List>
                                <Typography component='p' gutterBottom>
                                    {activeRecipe.strInstructions}
                                </Typography>
                                {activeRecipe.strYoutube
                                    ? <Typography sx={{ color: 'text.secondary' }}>
                                        Follow along with the recipe on <Link href={activeRecipe.strYoutube} target='_blank'>YouTube</Link>
                                    </Typography>
                                    : null
                                }
                            </Box>
                            : <div id='recipe-title-placeholder' />
                        }
                    </Grid2>
                </Grid2>
            </main>
        </Container >
    );
};

export default App;
