import React, {useState, useEffect } from "react";
import SearchBar from './SearchBar';
import IngredientList from "./IngredientList";

const SearchPage = (props) => {
    const [input, setInput] = useState('');
    const [ingredientListDefault, setIngredientListDefault] = useState();
    const [ingredientList, setIngredientList] = useState();

    const fetchData = async () => {
        return await fetch('https://restcountries.com/v3.1/all')
            .then(response => response.json())
            .then(data => {
                setIngredientList(data)
                setIngredientListDefault(data)

            });}
    
    const updateInput = async (input) => {
        const filtered = ingredientListDefault.filter(ingredient => {
            return ingredient.name.common.toLowerCase().includes(input.toLowerCase())
        })
        setInput(input);
        setIngredientList(filtered);
    }

    useEffect( () => {fetchData()},[]);

    return (
        <>
            <h1>Ingredient List</h1>
            <SearchBar keyword={input} setKeyword={updateInput}/>
            <IngredientList ingredientList={ingredientList}/>
        </>
    );
}

export default SearchPage