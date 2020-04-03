import Search from './models/Search';
import Recipe from './models/Recipe';
import List from './models/List';
import Likes from './models/Likes';
import * as searchView from './views/searchView';
import * as recipeView from './views/recipeView';
import * as listView from './views/listView';
import * as likesView from './views/likesView';
import { elements, renderLoader, clearLoader } from './views/base';



/** global state of the app 
 * - Search object
 * - Current recipe object
 * - Shopping list object
 * - Liked recipes
*/
const state = {};
window.state = state;

/**
 * Search controller
 */
const controlSearch = async () => {
    //1. get query from view
    const query = searchView.getInput();

    if (query) {
        //2. new search object and add to state
        state.search = new Search(query);

        //3. prepare UI for results
        searchView.clearInput();
        searchView.clearResults();
        renderLoader(elements.searchRes);
        try {
            //4. search for recipes
            await state.search.getResults(); //getResult() returns promise because it is async function which returns promise

            //5. render results on UI
            clearLoader();
            searchView.renderResults(state.search.result);
            //console.log(state.search.result);      
        } catch (err) {
            alert(`err controlSearch module err`);
            clearLoader();
        }
    }
}

elements.searchForm.addEventListener('submit', e=> {
    e.preventDefault();
    controlSearch();
});


elements.searchRes.addEventListener('click', e => {
    const btn = e.target.closest('.btn-inline'); // help return the button component(parent) when clicking on child components
    //console.log(btn); // when the button is clcked, the exact componet clikced on will show.
    if (btn) {
        const goToPage = parseInt(btn.dataset.goto, 10); // read the value of data-goto. data-"string" => to read this, dataset.string
        // parseInt(btn.dataset.goto, 10) number means base number, with 2, "parseInt" will show number in binary.
        searchView.clearResults();
        searchView.renderResults(state.search.result, goToPage);
    }
});

/**
 * Recipe controller
 */

const controlRecipe = async () => {
    // get ID from url
    const id = window.location.hash.replace('#', '');// window.location= the entire URL, window.location.hash= the hash property
    //.replace('#', ''); replace # to nothing. .repalce method is a string method.

    if (id) {
        // prepare UI for changes
        recipeView.clearRecipe();
        renderLoader(elements.recipe);

        // highlight selected item
        if (state.search) searchView.highlightSelected(id);

        // create new recipe object
        state.recipe = new Recipe(id);
        console.log(state.recipe);
        try {
            // get recipe data and parse ingredients
            await state.recipe.getRecipe();
            state.recipe.parseIngredients();

            // calculate servings and time
            state.recipe.calcTime();
            state.recipe.calcServings();

            // render recipe
            clearLoader();
            recipeView.renderRecipe(
                state.recipe,
                state.likes.isLiked(id)
            );
        } catch (err) {
            console.log(err);
            alert(`err controlRecipe module err`);
        }


    }
};

// window.addEventListener('hashchange', controlRecipe); // set 'evebtListener' in global oject which is window
// window.addEventListener('load', controlRecipe);

['hashchange', 'load'].forEach(event=> window.addEventListener(event, controlRecipe)); // way to call the same funciton on different events.

/**
 * List controller
 */
const controlList = () => {
    //create a new list if there is none yet
    if (!state.list) state.list = new List();

    //add each ingredient to the list and UI
    state.recipe.ingredients.forEach(el => {
        const item = state.list.addItem(el.count, el.unit, el.ingredient);
        listView.renderItem(item);
    });
};


//handling delete and update list item events
elements.shopping.addEventListener('click', e => {
    const id = e.target.closest('.shopping__item').dataset.itemid;

    //handling the delete item
    if (e.target.matches('.shopping__delete, .shopping__delete *')) {
        //delete from state
        state.list.deleteItem(id);

        //delete from UI
        listView.deleteItem(id);
    // handling count update
    } else if (e.target.matches('.shopping__count--value')) {
        const val = parseFloat(e.target.value);
        if (val >= 0) {
            state.list.updateCount(id, val);
        }
    }

});

/**
 * Likes controller
 */
state.likes = new Likes (); //testing
const controlLike = () => {
    if (!state.likes) state.likes = new Likes ();
    const currentID = state.recipe.id;

    // current recipe is not likekd currently
    if (!state.likes.isLiked(currentID)) {
        //add like to the state
        const newLike = state.likes.addLike(
            currentID,
            state.recipe.title,
            state.recipe.author,
            state.recipe.img
        );
        //toggle the like button
        likesView.toggleLikeBtn(true);

        //add like to UI list
        console.log(state.likes);
    } else {
        //remove like to the state
        state.likes.deleteLike(currentID);

        //toggle the like button
        likesView.toggleLikeBtn(false);

        //remove like to UI list
        console.log(state.likes);
    }
    
    likesView.toggleLikeMenu(state.likes.getNumLikes());
};

//handling recipe button clicks
elements.recipe.addEventListener('click', e => {
    if (e.target.matches('.btn-decrease, .btn-decrease *')) { // btn-decrease * means any types under btn-decrease
        // decrease button clikced
        if (state.recipe.servings > 1){
            state.recipe.updateServings('dec');
            recipeView.updateServingsIngredients(state.recipe);
        }
    } else if(e.target.matches('.btn-increase, .btn-increase *')) {
        // increase button clikced
        state.recipe.updateServings('inc');
        recipeView.updateServingsIngredients(state.recipe);

    } else if (e.target.matches('.recipe__btn--add, .recipe__btn--add *')) {
        // add ingredients to shopping list
        controlList();
    } else if (e.target.matches('.recipe__love, .recipe__love *')) {
        controlLike();
    }

});

window.l = new List();










