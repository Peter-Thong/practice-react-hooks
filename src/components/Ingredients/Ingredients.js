import React, { useMemo, useEffect, useCallback, useReducer } from "react";

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

const httpReducer = (curHttpState, action) => {
  switch (action.type) {
    case "SEND":
      return { loading: true, error: null };
    case "RESPONSE":
      return { ...curHttpState, loading: false };
    case "CATCH":
      return { loading: false, error: action.errorMessage };
    case "CLEAR":
      return { ...curHttpState, error: null };
    default:
      throw new Error("can not reach!");
  }
};

const Ingredients = () => {
  const [userIngredients, dispatch] = useReducer(ingredientReducer, []);
  const [httpState, dispatchHttp] = useReducer(httpReducer, {
    loading: false,
    error: null,
  });
  // const [userIngredients, setUserIngredients] = useState([]);
  // const [isLoading, setIsloading] = useState(false);
  // const [error, setError] = useState();

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

  const addIngredientHandler = useCallback((ingredient) => {
    dispatchHttp({ type: "SEND" });
    fetch("https://react-hook-update-351a0.firebaseio.com/ingredients.json", {
      method: "POST",
      body: JSON.stringify(ingredient),
      headers: { "Content-Type": "application/json" },
    })
      .then((response) => {
        dispatchHttp({ type: "RESPONSE" });
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
        dispatchHttp({
          type: "CATCH",
          errorMessage: "something went wrong !!",
        });
      });
  }, []);

  const removeIngredientHandler = useCallback((id) => {
    dispatchHttp({ type: "SEND" });
    fetch(
      `https://react-hook-update-351a0.firebaseio.com/ingredients/${id}.json`,
      {
        method: "DELETE",
      }
    )
      .then((response) => {
        dispatchHttp({ type: "RESPONSE" });
        // setUserIngredients((prevState) =>
        //   prevState.filter((ingredient) => ingredient.id !== id)
        // );
        dispatch({
          type: "DELETE",
          id: id,
        });
      })
      .catch((error) => {
        dispatchHttp({
          type: "CATCH",
          errorMessage: "something went wrong !!",
        });
      });
  }, []);

  const clearError = useCallback(() => {
    dispatchHttp({ type: "CLEAR" });
  }, []);

  const ingredientList = useMemo(() => {
    return (
      <IngredientList
        ingredients={userIngredients}
        onRemoveItem={removeIngredientHandler}
      />
    );
  }, [userIngredients, removeIngredientHandler]);

  return (
    <div className="App">
      {httpState.error && (
        <ErrorModal onClose={clearError}>{httpState.error}</ErrorModal>
      )}
      <IngredientForm
        onAddIngredient={addIngredientHandler}
        loading={httpState.loading}
      />

      <section>
        <Search onLoadIngredients={loadIngredientsHandler} />
        {ingredientList}
      </section>
    </div>
  );
};

export default Ingredients;
