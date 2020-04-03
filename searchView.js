import { elements } from './base';

export const getInput = () => elements.searchInput.value; // 'return' can be omitted when only one line in the function 

export const clearInput = () => {
    elements.searchInput.value = ''; //when {} is used, no return with only one line in the function
};

export const clearResults = () => {
    elements.searchResList.innerHTML = '';
    elements.searchResPages.innerHTML = '';
};

export const highlightSelected = id => {
    const resultsArr = Array.from(document.querySelectorAll('.results__link'));
    resultsArr.forEach(el => {
        el.classList.remove('results__link--active');
    });

    document.querySelector(`a[href="#${id}"]`).classList.add('results__link--active');
}

/*
example: pasta with tomato and spinach
1. acc:0 acc + cur.length:5 newTitle: ['pasta']
2. acc:5 acc + cur.length:9 newTitle: ['pasta', 'with']
3. acc:9 acc + cur.length:15 newTitle: ['pasta', 'with', 'tomato']
4. acc:15 acc + cur.length:18 newTitle: ['pasta', 'with', 'tomato']
5. acc:18 acc + cur.length:24 newTitle: ['pasta', 'with', 'tomato']
*/
const limitRecipeTitle = (title, limit = 17) => {
    const newTitle = [];
    if(title.length > limit) {
        title.split(' ').reduce((acc, cur) => {
            if (acc + cur.length <= limit) {
                newTitle.push(cur);
            }
            return acc + cur.length;
        }, 0);
        return `${newTitle.join(' ')} ...`;
    }
    return title;
};

const renderRecipe = recipe => {
    const markup = `
        <li>
            <a class="results__link" href="#${recipe.recipe_id}">
                <figure class="results__fig">
                    <img src="${recipe.source_url}" alt="${recipe.title}">
                </figure>
                <div class="results__data">
                    <h4 class="results__name">${limitRecipeTitle(recipe.title)}</h4>
                    <p class="results__author">${recipe.publisher}</p>
                </div>
            </a>
        </li>
    `;
    elements.searchResList.insertAdjacentHTML('beforeend', markup);
};
//type: prev or next
const createButton = (page, type) => `
    <button class="btn-inline results__btn--${type}", data-goto = "${type === 'prev'? page-1 : page+1}">
        <span>Page ${type === 'prev'? page-1 : page+1} </span>
        <svg class="search__icon">
            <use href="img/icons.svg#icon-triangle-${type === 'prev'? 'left' : 'right'}"></use>
        </svg>
    </button>

`;

const renderButtons = (page, numResults, resPerPage) => {
    const pages = Math.ceil(numResults/resPerPage); // Math.ceil alwasy rounds up the number. Math.ceil(3.2) = 4

    let button; // const is not suitable here because we want button to be modified accordingly.
    if (page === 1 && pages > 1) {
        // only button to go to next page 
        button = createButton(page, 'next');
    } else if ( page < pages) {
        // both buttons
        button = `
            ${createButton(page, 'prev')}
            ${createButton(page, 'next')}
        `;

    } else if (page === pages && pages > 1) {
        // only button to go to prev page
        button = createButton(page, 'prev');
    }

    elements.searchResPages.insertAdjacentHTML('afterbegin', button);
};

export const renderResults = (recipes, page = 1, resPerPage = 10) => {
    //render results of current page
    const start = (page - 1)*resPerPage;
    const end = page*resPerPage;

    recipes.slice(start, end).forEach(renderRecipe);
    
    //render page buttons
    renderButtons(page, recipes.length, resPerPage);
};

























