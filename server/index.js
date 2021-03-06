const express = require('express');
const { MongoClient } = require('mongodb');

const DB_HOST = 'localhost';
const DB_PORT = 27017;
const DB_URL = `mongodb://${DB_HOST}/${DB_PORT}`;
const DB_NAME = 'cocktail_db';
const DB_COLLECTION_NAME = 'cocktails';
const app = express();
const port = 3001;

const parseOptionalNumberParameter = (numParameter, defaultValue) => {
  const parsedNumberParameter = numParameter ? parseInt(numParameter, 10) : defaultValue;
  return parsedNumberParameter;
};

app.get('/', (req, res) => {
  const htmlPage = `
        <h1>Cocktail Raffle!</h1>
        <h2>API Docs - V1</h2>
        <h3>/cocktail</h3>
        <h4>/cocktail/random</h4>
        <p>Returns a random cocktail.</p>
        <p>e.g: /cocktail/random?count=3</p>
        <p>count: the number of cocktails to return. Defaults to a value of 1</p>
        <h4>/cocktail/random/ingredients</h4>
        <p>Returns random cocktails that contains all the ingredients being searched by.</p>
        <p>Can search by one or more ingredients</p>
        <p>ingredients: name of an ingredient</p>
        <p>count: the number of cocktails to return. Defaults to a value of 1</p>
        <p>e.g: /cocktail/random/ingredients?ingredient=Vermouth&ingredient=Sugar Syrup&count=3</p>
        <h3>/ingredients</h3>
        <h4>/ingredients</h4>
        <p>Returns all ingredients in the DB as an array</p>
    `;
  res.send(htmlPage);
});

app.get('/cocktail/random', async (req, res) => {
  let { count } = req.query;
  count = parseOptionalNumberParameter(count, 1);
  try {
    const client = await MongoClient.connect(DB_URL);
    const db = client.db(DB_NAME);
    const collection = db.collection(DB_COLLECTION_NAME);
    const results = await collection.aggregate([{ $sample: { size: count } }]).toArray();
    res.status(200);
    res.send(results);
  } catch (err) {
    console.error(err);
    res.status(500);
    res.send({});
  }
});

app.get('/cocktail/random/ingredients', async (req, res) => {
  const { ingredient } = req.query;
  let { count } = req.query;
  count = parseOptionalNumberParameter(count, 1);
  try {
    let ingredientList;
    if (ingredient && typeof ingredient === 'string') {
      ingredientList = [ingredient];
    } else {
      ingredientList = [...ingredient];
    }

    ingredientList = ingredientList.map((ingredientListItem) => {
      const upperCaseIngredient = ingredientListItem
        .charAt(0).toUpperCase() + ingredientListItem.slice(1);
      return upperCaseIngredient;
    });

    const client = await MongoClient.connect(DB_URL);
    const db = client.db(DB_NAME);
    const collection = db.collection(DB_COLLECTION_NAME);

    // returns one result which contains all of the parameters queried by
    let results = await collection.aggregate([
      { $match: { 'ingredients.ingredient': { $all: ingredientList } } },
      { $sample: { size: count } },
    ]).toArray();

    if (results.length > 0) {
      results = results.map((result) => {
        // calculate percentage of ingredients needed vs ingredients you have
        const percentageMatch = ingredientList.length / result.ingredients.length;
        const resultWithPercentageMatch = {
          ...result,
          percentageMatch,
        };
        return resultWithPercentageMatch;
      });

      res.status(200);
      res.send(results);
    } else {
      res.status(200);
      res.send([]);
    }
  } catch (err) {
    console.error(err);
    res.status(500);
    res.send([]);
  }
});

app.get('/ingredients', async (req, res) => {
  console.log('connected to end point');
  try {
    const client = await MongoClient.connect(DB_URL);
    const db = client.db(DB_NAME);
    const collection = db.collection(DB_COLLECTION_NAME);
    const results = await collection
      .find({})
      .project({
        _id: 0, name: 0, isAlcoholic: 0, glass: 0, instructions: 0, 'ingredients.measure': 0,
      })
      .toArray();
    const ingredientList = results.flatMap((ingredientsForCocktail) => {
      const { ingredients } = ingredientsForCocktail;
      const ingredientStrings = ingredients.map((ingredient) => ingredient.ingredient);
      return ingredientStrings;
    });

    const ingredientSet = new Set(ingredientList);
    ingredientSet.delete(null);
    const uniqueIngredientsList = Array.from(ingredientSet.values());
    res.status(200);
    res.send(uniqueIngredientsList);
  } catch (err) {
    console.error(err);
    res.status(500);
    res.send([]);
  }
});

app.listen(port, () => {
  console.log(`Cocktail Raffle server listening on port ${port}`);
});
