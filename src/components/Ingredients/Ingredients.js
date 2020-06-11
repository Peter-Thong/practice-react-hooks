import React, { useState, useEffect, useCallback, useReducer } from "react";

import IngredientForm from "./IngredientForm";
import Search from "./Search";
import IngredientList from "./IngredientList";
import ErrorModal from "../UI/ErrorModal";

const ingredientReducer = (currentIngredients, action) => {
  switch (action.type) {
    case "SET":
      return action.ingredients;
    case "ADD":
      return [...currentIngredients, action.ingredient];
    case "DELETE":
      return currentIngredients.filter((ing) => ing.id !== action.id);
    default:
      throw new Error("can not perform the action");
  }
};

const Ingredients = () => {
  const [userIngredients, dispatch] = useReducer(ingredientReducer, []);
  // const [userIngredients, setUserIngredients] = useState([]);
  const [isLoading, setIsloading] = useState(false);
  const [error, setError] = useState();

  useEffect(() => {
    console.log("useEffect rendering", userIngredients);
  }, [userIngredients]);

  const loadIngredientsHandler = useCallback((filterIngredients) => {
    // setUserIngredients(filterIngredients);
    dispatch({
      type: "SET",
      ingredients: filterIngredients,
    });
  }, []);

  const addIngredientHandler = (ingredient) => {
    setIsloading(true);
    fetch("https://react-hook-update-351a0.firebaseio.com/ingredients.json", {
      method: "POST",
      body: JSON.stringify(ingredient),
      headers: { "Content-Type": "application/json" },
    })
      .then((response) => {
        setIsloading(false);
        return response.json();
      })
      .then((responseData) => {
        // setUserIngredients((prevState) => [
        //   ...prevState,
        //   { id: responseData.name, ...ingredient },
        // ]);
        dispatch({
          type: "ADD",
          ingredient: { id: responseData.name, ...ingredient },
        });
      })
      .catch((error) => {
        setError("something went wrong !!");
        setIsloading(false);
      });
  };

  const removeIngredientHandler = (id) => {
    setIsloading(true);
    fetch(
      `https://react-hook-update-351a0.firebaseio.com/ingredients/${id}.json`,
      {
        method: "DELETE",
      }
    )
      .then((response) => {
        setIsloading(false);
        // setUserIngredients((prevState) =>
        //   prevState.filter((ingredient) => ingredient.id !== id)
        // );
        dispatch({
          type: "DELETE",
          id: id,
        });
      })
      .catch((error) => {
        setError("something went wrong !!");
        setIsloading(false);
      });
  };

  const clearError = () => {
    setError(null);
  };

  return (
    <div className="App">
      {error && <ErrorModal onClose={clearError}>{error}</ErrorModal>}
      <IngredientForm
        onAddIngredient={addIngredientHandler}
        loading={isLoading}
      />

      <section>
        <Search onLoadIngredients={loadIngredientsHandler} />
        <IngredientList
          ingredients={userIngredients}
          onRemoveItem={removeIngredientHandler}
        />
      </section>
    </div>
  );
};

export default Ingredients;
