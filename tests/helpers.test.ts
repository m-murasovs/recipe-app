import { describe, it, expect } from 'vitest';
import {
    consolidateIngredients,
    sortMealsByMatchingIngredients,
    getMatchingIngredientsNumber,
    getOptions,
} from '../src/helpers.ts';
import type {
    RecipeRaw,
    Recipe,
} from '../src/types.ts';
import { ingredients, recipesRaw } from './mocks.js';

describe('consolidateIngredients', () => {
    it('should consolidate ingredients and measures correctly', () => {
        const recipe: RecipeRaw = recipesRaw[1];
        const result = consolidateIngredients(recipe);

        expect(result.ingredients).toEqual(['Haddock', 'Potatoes', 'Green Chilli']);
        expect(result.ingredientsWithMeasures).toEqual([
            { item: 'Haddock', measure: '600g' },
            { item: 'Potatoes', measure: '300g' },
            { item: 'Green Chilli', measure: '1 chopped' },
        ]);
    });

    it('should stop consolidating when it encounters an empty ingredient', () => {
        const recipe: RecipeRaw = recipesRaw[2];
        const result = consolidateIngredients(recipe);

        expect(result.ingredients).toEqual(['Garlic']);
        expect(result.ingredientsWithMeasures).toEqual([{ item: 'Garlic', measure: '1 clove' }]);
    });
});

describe('sortMealsByMatchingIngredients', () => {
    it('should sort recipes by the number of matching ingredients with user ingredients', () => {
        const recipes: Recipe[] = recipesRaw.map(rec => consolidateIngredients(rec));
        const userIngredients = ['Haddock', 'Potatoes', 'Green Chilli', 'Pork', 'White wine'];

        const result = sortMealsByMatchingIngredients(recipes, userIngredients);

        expect(result[0].strMeal).toBe('Fish fofos');
        expect(result[1].strMeal).toBe('Portuguese barbecued pork (Febras assadas)');
        expect(result[2].strMeal).toBe('Portuguese prego with green piri-piri');
    });
});

describe('getMatchingIngredientsNumber', () => {
    it('should return the correct count of matching ingredients', () => {
        const recipeIngredients = ['Chicken', 'Rice', 'Onion'];
        const userIngredients = ['Onion', 'Chicken', 'Pepper'];
        const count = getMatchingIngredientsNumber(userIngredients, recipeIngredients);
        expect(count).toBe(2);
    });

    it('should be case-insensitive when counting matching ingredients', () => {
        const recipeIngredients = ['Beef', 'Garlic', 'Tomato'];
        const userIngredients = ['garlic', 'beef'];
        const count = getMatchingIngredientsNumber(userIngredients, recipeIngredients);
        expect(count).toBe(2);
    });
});

describe('getOptions', () => {
    it('should return ingredients that match the input prefix', () => {
        const input = 'Ba';
        const result = getOptions(input, ingredients);
        expect(result).toEqual([{ strIngredient: 'Basil', idIngredient: '3', strDescription: 'Sweet basil' }]);
    });

    it('should return up to 14 ingredients when input is empty', () => {
        const result = getOptions('', ingredients);
        expect(result.length).toBeLessThanOrEqual(14);
    });
});
