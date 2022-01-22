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
                setIngredientList([])
                setIngredientListDefault(data)
    });}
    
    const updateInput = async (input) => {
        const filtered = ingredientListDefault.filter(ingredient => {
            return ingredient.name.common.toLowerCase().includes(input.toLowerCase())
        })

        if (input===''){
            setIngredientList([])
        } else {
            setIngredientList(filtered);
        }
        setInput(input);
    }

    useEffect( () => {fetchData()},[]);

    return (
        <>
            <SearchBar keyword={input} setKeyword={updateInput}/>
            <h1>Ingredient List</h1>
            <IngredientList ingredientList={ingredientList}/>
        </>
    );
}

export default SearchPage