const express = require('express');
const { MongoClient } = require('mongodb');

const DB_HOST = 'localhost';
const DB_PORT = 27017;
const DB_URL = `mongodb://${DB_HOST}/${DB_PORT}`;
const DB_NAME = 'cocktail_db';
const DB_COLLECTION_NAME = 'cocktails';
const app = express();
const port = 3001;

app.get('/', (req, res) => {
  const htmlPage = `
        <h1>Cocktail Raffle!</h1>
        <h2>API Docs - V1</h2>
        <ul>
            <li>/cocktail/random - returns a random cocktail.</li>
            <li>
                <p>/cocktail/random/ingredients - returns a random cocktail that contains all the ingredients being searched by.</p>
                <p>Can search by one or more ingredients</p>
                <p>e.g: /cocktail/random/ingredients?ingredient=Vermouth&ingredient=Sugar Syrup</p>
            </li>
        </ul>
    `;
  res.send(htmlPage);
});

app.get('/cocktail/random', async (req, res) => {
  try {
    const client = await MongoClient.connect(DB_URL);
    const db = client.db(DB_NAME);
    const collection = db.collection(DB_COLLECTION_NAME);
    const results = await collection.aggregate([{ $sample: { size: 1 } }]).toArray();
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
    const results = await collection.aggregate([
      { $match: { 'ingredients.ingredient': { $all: ingredientList } } },
      { $sample: { size: 1 } },
    ]).toArray();

    if (results.length > 0) {
      let result = results[0];
      // calculate percentage of ingredients needed vs ingredients you have
      const percentageMatch = ingredientList.length / result.ingredients.length;
      result = {
        ...result,
        percentageMatch,
      };
      res.status(200);
      res.send(result);
    } else {
      res.status(200);
      res.send({});
    }
  } catch (err) {
    console.error(err);
    res.status(500);
    res.send([]);
  }
});

app.listen(port, () => {
  console.log(`Cocktail Raffle server listening on port ${port}`);
});
