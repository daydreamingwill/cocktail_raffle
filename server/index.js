const express = require('express');
const { MongoClient } = require('mongodb');

const DB_HOST = 'localhost';
const DB_PORT = 27017;
const DB_URL = `mongodb://${DB_HOST}/${DB_PORT}`;
const DB_NAME = 'cocktail_db';
const DB_COLLECTION_NAME = 'cocktails';
const app = express();
const port = 3000;

app.get('/', (req, res) => {
    res.send('<h1>Cocktail Raffle!</h1><ul><li>/getRandomCocktail - returns a random cocktail</li></ul>');
})

app.get('/getRandomCocktail', async (req, res) => {
    const client = await MongoClient.connect(DB_URL);
    const db = client.db(DB_NAME);
    const collection = db.collection(DB_COLLECTION_NAME);
    const results = await collection.aggregate([{ $sample: { size: 1 }}]).toArray();
    res.send(results);
});

app.listen(port, () => {
    console.log(`Cocktail Raffle server listening on port ${port}`)
})
