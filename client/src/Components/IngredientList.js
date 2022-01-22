import React from "react";

const IngredientList = ({ingredientList=[]}) => {
    return(
        <>
            {ingredientList.map((data,index) => {
                if (data) {
                    return (
                        <div key={data.name.common}>
                            <h1>{data.name.common}</h1>
                        </div>
                    )
                }
                return null
            })}
        </>
    );
}

export default IngredientList