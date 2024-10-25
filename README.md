# Recipe app

Stuck for something to cook? No fear - just input what you have in your fridge and this app will give you a recipe to make with those ingredients!

The multi-ingredient API is restricted to premium users, so this app will search the recipes by main ingredient.

## Plan

- [] API already exists, so we just need to hit it
- [] Show a form that contains
    - [] A list of ingredients, by category (I don't think we need the pictures or descriptions for these). There might be a lot of them, so we might need to paginate. For this, hit the API for 20 at a time.
    - [] quantity (this is not too clear in the description - is it the number of people to feed?)
    - [] cooking time
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
