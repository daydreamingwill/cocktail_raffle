# cocktail_raffle

## Requirements
* MongoDB

## Set-up 
* Run the `old-fashioned` script: `cd old-fashioned && node index.js`. This will scrape www.thecocktaildb.com and insert each cocktail into your running mongo instance. The parameters for this can be changed from within the `old-fashioned/index.js` file.
* Run `index.js` in the `server/` directory: `node index.js`, to run the api for this project.