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
    res.send('<h1>Cocktail Raffle!</h1><ul><li>/cocktail/random - returns a random cocktail</li></ul>');
})

app.get('/cocktail/random', async (req, res) => {
    try{
        const client = await MongoClient.connect(DB_URL);
        const db = client.db(DB_NAME);
        const collection = db.collection(DB_COLLECTION_NAME);
        const results = await collection.aggregate([{ $sample: { size: 1 }}]).toArray();
        res.status(200);
        res.send(results);
    }catch(err){
        console.error(err);
        res.status(500);
        res.send({})
    }
});

app.listen(port, () => {
    console.log(`Cocktail Raffle server listening on port ${port}`)
})
