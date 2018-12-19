"use strict";

//// This function tests whether localStorage is available ////

function localAvailable() {
  try {
    var test = '__storageTest__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch (error) {
    return false;
  }
}

//// This gets the initial set of recipes, either from localStorage or a pre-set list ////

var start = [{ id: 1, name: "Stroganoff", ingredients: "ground beef, onions, Cream of Mushroom soup, mushrooms, sour cream, Worcestershire sauce", directions: "Cook onions, then ground beef, then add everything else and heat through", vis: false }, { id: 2, name: "Tuna Salad", ingredients: "tuna, Miracle Whip, mustard, hardboiled eggs, green onions", directions: "mix together, put on bread", vis: false }, { id: 3, name: "BBQ Chicken", ingredients: "chicken, BBQ sauce, sides", directions: "cook chicken, add sauce", vis: false }];
var numStart = 3;
var startJSON = JSON.stringify(start);

var initialize = [];
var numInitial = 0;
if (localAvailable() && localStorage.getItem('_brianlevay_recipes')) {
  initialize = JSON.parse(localStorage.getItem('_brianlevay_recipes'));
  for (var i = 0; i < initialize.length; i++) {
    if (initialize[i].id > numInitial) {
      numInitial = initialize[i].id;
    }
    if (initialize[i].vis === true) {
      initialize[i].vis = false;
    }
  }
} else {
  initialize = start;
  numInitial = numStart;
}

//// This is the root React class, the RecipeBox ////

var RecipeBox = React.createClass({
  displayName: "RecipeBox",

  getInitialState: function getInitialState() {
    return {
      recipes: initialize,
      counter: numInitial,
      recipeID: 0, formName: "", formIngredients: "", formDirections: "",
      formVis: false, formForUpdate: false
    };
  },
  updateName: function updateName(e) {
    this.setState({ formName: e.target.value });
  },
  updateIngredients: function updateIngredients(e) {
    this.setState({ formIngredients: e.target.value });
  },
  updateDirections: function updateDirections(e) {
    this.setState({ formDirections: e.target.value });
  },
  setForAdd: function setForAdd() {
    this.setState({ formVis: true, formForUpdate: false });
  },
  addRecipe: function addRecipe() {
    if (this.state.formName && this.state.formIngredients) {
      var newNumAdd = this.state.counter + 1;
      var newRecipesAdd = this.state.recipes.concat([{ id: newNumAdd, name: this.state.formName, ingredients: this.state.formIngredients, directions: this.state.formDirections }]);
      this.setState({ recipes: newRecipesAdd });
      this.setState({ counter: newNumAdd });
      this.setState({ recipeID: 0, formName: "", formIngredients: "", formDirections: "", formVis: false, formForUpdate: false });
      if (localAvailable()) {
        localStorage.setItem('_brianlevay_recipes', JSON.stringify(newRecipesAdd));
      }
    }
  },
  setForUpdate: function setForUpdate(id, name, ingredients, directions) {
    this.setState({ recipeID: id, formName: name, formIngredients: ingredients, formDirections: directions });
    this.setState({ formVis: true, formForUpdate: true });
  },
  updateRecipe: function updateRecipe() {
    var newRecipesUpdate = this.state.recipes.slice(0);
    for (var i = 0; i < newRecipesUpdate.length; i++) {
      if (newRecipesUpdate[i].id == this.state.recipeID) {
        newRecipesUpdate[i].name = this.state.formName;
        newRecipesUpdate[i].ingredients = this.state.formIngredients;
        newRecipesUpdate[i].directions = this.state.formDirections;
      }
    }
    this.setState({ recipes: newRecipesUpdate });
    this.setState({ recipeID: 0, formName: "", formIngredients: "", formDirections: "", formVis: false, formForUpdate: false });
    if (localAvailable()) {
      localStorage.setItem('_brianlevay_recipes', JSON.stringify(newRecipesUpdate));
    }
  },
  deleteRecipe: function deleteRecipe(id) {
    var newRecipesDelete = this.state.recipes.filter(function (r) {
      return r.id !== id;
    });
    this.setState({ recipes: newRecipesDelete });
    if (localAvailable()) {
      localStorage.setItem('_brianlevay_recipes', JSON.stringify(newRecipesDelete));
    }
  },
  toggleVis: function toggleVis(id) {
    var newRecipesVis = this.state.recipes.slice(0);
    for (var i = 0; i < newRecipesVis.length; i++) {
      if (newRecipesVis[i].id == id) {
        if (newRecipesVis[i].vis === true) {
          newRecipesVis[i].vis = false;
        } else {
          newRecipesVis[i].vis = true;
        }
      }
    }
    this.setState({ recipes: newRecipesVis });
  },
  cancelForm: function cancelForm() {
    this.setState({ recipeID: 0, formName: "", formIngredients: "", formDirections: "", formVis: false, formForUpdate: false });
  },
  resetToInitial: function resetToInitial() {
    var newRecipesReset = JSON.parse(startJSON);
    var newNumReset = numStart;
    this.setState({ recipes: newRecipesReset });
    this.setState({ counter: newNumReset });
    this.setState({ recipeID: 0, formName: "", formIngredients: "", formDirections: "", formVis: false, formForUpdate: false });
    if (localAvailable()) {
      localStorage.setItem('_brianlevay_recipes', JSON.stringify(newRecipesReset));
    }
  },
  render: function render() {
    return React.createElement(
      "div",
      { className: "recipeBox" },
      React.createElement(RecipeList, {
        recipes: this.state.recipes,
        toggleVis: this.toggleVis,
        setForUpdate: this.setForUpdate,
        deleteRecipe: this.deleteRecipe
      }),
      React.createElement(
        "div",
        { className: "addNew" },
        React.createElement(
          "button",
          {
            className: "addBtn",
            onClick: this.setForAdd
          },
          "Add New Recipe"
        ),
        React.createElement(
          "button",
          {
            className: "resetBtn",
            onClick: this.resetToInitial
          },
          "Reset to Default"
        )
      ),
      React.createElement(RecipeForm, {
        recipeID: this.state.recipeID,
        formName: this.state.formName,
        formIngredients: this.state.formIngredients,
        formDirections: this.state.formDirections,
        formVis: this.state.formVis,
        formForUpdate: this.state.formForUpdate,
        updateName: this.updateName,
        updateIngredients: this.updateIngredients,
        updateDirections: this.updateDirections,
        addRecipe: this.addRecipe,
        updateRecipe: this.updateRecipe,
        cancelForm: this.cancelForm
      })
    );
  }
});

//// This is the React class that creates the array of individual Recipes ////

var RecipeList = React.createClass({
  displayName: "RecipeList",

  render: function render() {
    var toggleVisFn = this.props.toggleVis;
    var setForUpdateFn = this.props.setForUpdate;
    var deleteRecipeFn = this.props.deleteRecipe;
    var recipeSet = this.props.recipes;
    var recipes = recipeSet.map(function (recipe) {
      return React.createElement(Recipe, {
        id: recipe.id,
        name: recipe.name,
        ingredients: recipe.ingredients,
        directions: recipe.directions,
        vis: recipe.vis,
        toggleVis: toggleVisFn,
        setForUpdate: setForUpdateFn,
        deleteRecipe: deleteRecipeFn
      });
    });
    return React.createElement(
      "div",
      { className: "recipeList" },
      recipes
    );
  }
});

//// This is the React class for the Recipe Form, used to add and edit ////

var RecipeForm = React.createClass({
  displayName: "RecipeForm",

  render: function render() {
    if (this.props.formVis === true) {
      var formClass = "recipeForm";
    } else {
      var formClass = "recipeForm notShown";
    }
    if (this.props.formForUpdate === true) {
      var addSpanClass = "formTitle notShown";
      var updateSpanClass = "formTitle";
      var addBtnClass = "formBtn notShown";
      var updateBtnClass = "formBtn";
    } else {
      var addSpanClass = "formTitle";
      var updateSpanClass = "formTitle notShown";
      var addBtnClass = "formBtn";
      var updateBtnClass = "formBtn notShown";
    }

    return React.createElement(
      "div",
      { className: formClass },
      React.createElement(
        "span",
        { className: addSpanClass },
        "Add Recipe"
      ),
      React.createElement(
        "span",
        { className: updateSpanClass },
        "Edit Recipe"
      ),
      React.createElement("br", null),
      "(Use commas to separate ingredients)",
      React.createElement("br", null),
      React.createElement("br", null),
      React.createElement(
        "div",
        { className: "recipeSubTitle" },
        "Name: "
      ),
      React.createElement("textarea", {
        className: "nameTextArea",
        value: this.props.formName,
        onChange: this.props.updateName
      }),
      React.createElement(
        "div",
        { className: "recipeSubTitle" },
        "Ingredients: "
      ),
      React.createElement("textarea", {
        className: "contentTextArea",
        value: this.props.formIngredients,
        onChange: this.props.updateIngredients
      }),
      React.createElement(
        "div",
        { className: "recipeSubTitle" },
        "Directions: "
      ),
      React.createElement("textarea", {
        className: "contentTextArea",
        value: this.props.formDirections,
        onChange: this.props.updateDirections
      }),
      React.createElement(
        "button",
        {
          className: addBtnClass,
          onClick: this.props.addRecipe
        },
        "Add"
      ),
      React.createElement(
        "button",
        {
          className: updateBtnClass,
          onClick: this.props.updateRecipe
        },
        "Update"
      ),
      React.createElement(
        "button",
        {
          className: "formBtn",
          onClick: this.props.cancelForm
        },
        "Cancel"
      )
    );
  }
});

//// This is the React class for the individual Recipes ////

var Recipe = React.createClass({
  displayName: "Recipe",

  render: function render() {
    var _this = this;

    var ingredientArr = this.props.ingredients.split(",");
    var ingredientList = ingredientArr.map(function (ingredient) {
      return React.createElement(
        "div",
        { className: "ingredient" },
        ingredient
      );
    });
    if (this.props.vis === true) {
      var recipeContentClass = "recipeContents";
    } else {
      var recipeContentClass = "recipeContents notShown";
    }

    return React.createElement(
      "div",
      { className: "recipe" },
      React.createElement(
        "div",
        { className: "recipeName",
          onClick: function onClick() {
            return _this.props.toggleVis(_this.props.id);
          }
        },
        this.props.name
      ),
      React.createElement(
        "div",
        { className: recipeContentClass },
        React.createElement(
          "div",
          { className: "ingredientList" },
          React.createElement(
            "div",
            { className: "recipeSubTitle" },
            "Ingredients: "
          ),
          ingredientList
        ),
        React.createElement(
          "div",
          { className: "directions" },
          React.createElement(
            "div",
            { className: "recipeSubTitle" },
            "Directions: "
          ),
          this.props.directions
        ),
        React.createElement(
          "div",
          null,
          React.createElement(
            "button",
            {
              className: "editBtn",
              onClick: function onClick() {
                return _this.props.setForUpdate(_this.props.id, _this.props.name, _this.props.ingredients, _this.props.directions);
              }
            },
            "Edit"
          ),
          React.createElement(
            "button",
            {
              className: "deleteBtn",
              onClick: function onClick() {
                return _this.props.deleteRecipe(_this.props.id);
              }
            },
            "Delete"
          )
        )
      )
    );
  }
});

// This renders the virtual DOM contents //

ReactDOM.render(React.createElement(RecipeBox, null), document.getElementById('contentSect'));