# Recipe app

Stuck for something to cook? No fear - just input what you have in your fridge and this app will give you a recipe to make with those ingredients!

The multi-ingredient API is restricted to premium users, so this app will search the recipes by main ingredient.

## Plan

- [] API already exists, so we just need to hit it
- [] Show a form that contains
    - [] A list of ingredients, by category (I don't think we need the pictures or descriptions for these). There might be a lot of them, so we might need to paginate. For this, hit the API for 20 at a time.
    - [] quantity (this is not too clear in the description - is it the number of people to feed?) - might not measure this, since a person isn't gonna weigh their flour bag before they use this, but we'll show the amounts
    - [x] cooking time - the API doesn't return cooking time
    - [] number of ingredients
    - [] meal type
- [] Based on selected things, we will construct a URL that will hit the endpoint
- [] While loading, show a nice loader
- [] For frontend, use material UI? Make components and use them. aka, card, etc


## Building by feature

1. Display the ingredients so the user can pick the main ingredient.

www.themealdb.com/api/json/v1/1/list.php?i=list

2. Let the user select the ingredients they have

Use the form and add the ingredients to the state

3.


## two options

1. Option one - since the filter by many ingredients is premium-only, I would go by one ingredient, and then fetch the meals for that ingredient.

In another input, they can add the other ingredients they have.

So, the user will select the meal and we'll fetch it by ID. Then we'll show how many of their ingredients match with that meal.

To be fancy, we could fetch all the meals on the list for that ingredient and rank them by how many of the ingredients match

## showing ingredients

Maybe we could show two buttons - one for main ingredient, the other for other stuff. single text input that will show the ingredients and add them to array?

Then we press search
