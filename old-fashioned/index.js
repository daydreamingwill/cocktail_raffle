import got from 'got';
import { MongoClient } from 'mongodb'

const host = 'localhost';
const port = 27017;
const DB_URL = `mongodb://${host}/${port}`;
const DB_NAME = 'cocktail_db';
const DB_COLLECTION_NAME = 'cocktails';

const alphabet = 'abcdefghijklmnopqrstuvwxyz'.split('');
const searchByLetter = async (letter) => {
    const data = await got.get(`https://www.thecocktaildb.com/api/json/v1/1/search.php?f=${letter}`).json();
    return data;
};

console.log("#########################");
console.log("#     Old Fashioned     #");
console.log("#########################");

console.log("\nScraping www.thecocktaildb.com API...");

const scrapeAndUploadCocktailData = async () => {
    let data = [];

    const scrapedData = alphabet.map(async (letter) => {

        const res = await searchByLetter(letter);
        if(res?.drinks?.length > 0){
            const restructuredCocktails = res.drinks.map(async (cocktail) => {
                const { 
                    strDrink,
                    strAlchoholic,
                    strGlass,
                    strInstructions,
                } = cocktail;

                let restructuredCocktail = {
                    name: strDrink,
                    isAlcoholic: (strAlchoholic !== 'Non_Alcoholic'),
                    glass: strGlass,
                    instructions: strInstructions,
                }

                const ingredientKey = 'strIngredient';
                const measureKey = 'strMeasure';
                let ingredients = [];
                for(var i = 1; i <= 15; i++){
                    if(cocktail[`${ingredientKey}${i}`] || cocktail[`${measureKey}${i}`]) {
                        ingredients.push({
                            ingredient: cocktail[`${ingredientKey}${i}`],
                            measure: cocktail[`${measureKey}${i}`],
                        });
                    }
                }
                restructuredCocktail.ingredients = ingredients;

                try {
                    const client = await MongoClient.connect(DB_URL);
                    const db = client.db(DB_NAME);
                    const collection = db.collection(DB_COLLECTION_NAME);
                    collection.insertOne(restructuredCocktail, function(err, res) {
                        if (err) throw err;
                        client.close();
                    });
                } catch (err) {
                    console.error(err);
                }

                return restructuredCocktail;
            });
            return restructuredCocktails;
        }
    });
}

scrapeAndUploadCocktailData();