# Recipe app

An app that returns recipes based on a main ingredient.

The specification states: "Your friend is a back-end developer and he assures you he can create a RestAPI that
will return recipes if you query it with the following parameters: ingredients, quantity, available cooking time, number of ingredients and meal type."

Due to the restrictions of the free API, and to keep the UI simple, I narrowed the scope so the app only returns recipes based on a main ingredient. The user can then add other ingredients they have and pick the most compatible recipe. This would be a nice proof of concept, allowing the other features to be added on later.

The app is written in React and TypeScript, built with Vite, and tested with Vitest. For the UI, I decided to try Material UI, which I haven't worked before but was curious about. Due to some complications with setting up Vitest UI, only unit tests are present.
