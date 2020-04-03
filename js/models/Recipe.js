import axios from 'axios';

export default class Recipe {
    constructor(id) {
        this.id = id;
    }

    async getRecipe() {
        try {
            const res = await axios(`https://forkify-api.herokuapp.com/api/get?rId=${this.id}`);
            this.title = res.data.recipe.title;
            this.author = res.data.recipe.publisher;
            this.img = res.data.recipe.image_url;
            this.url = res.data.recipe.source_url;
            this.ingredients = res.data.recipe.ingredients;
        } catch (error) {
            alert(`err getRecipe err`);
        }
    }

    calcTime() {
        const numIng = this.ingredients.length; // ingredients are in an array
        const periods = Math.ceil(numIng/3);
        this.time = periods * 15; //assuming it takes 15min for every 3 ingredients.
    }

    calcServings() {
        this.servings = 4;
    }

    parseIngredients() {

        const unitsLong = ['tablespoons', 'tablespoon', 'ounces', 'ounce', 'teaspoons', 'teaspoon', 'cups', 'pounds'];
        //plural should be before the singular. cause ounces could be ozs from replacing ounce with oz from ounces.
        const unitsShort = ['tbsp', 'tbsp', 'oz', 'oz', 'tsp', 'tsp', 'cup','pound' ];
        const units = [...unitsShort, 'kg', 'g'];

        const newIngredients = this.ingredients.map(el => {
            //1. uniform units
            let ingredient = el.toLowerCase(); // ingredient array will be modified later so 'let' is used.
            unitsLong.forEach((unit, i) => {
                ingredient = ingredient.replace(unit, unitsShort[i])
            });

            //2. remove parentheses
            ingredient = ingredient.replace(/ \([\s\S]*?\)/g, ' ');

            //3. parse ingredients into count, unit, and ingredient
            const arrIng = ingredient.split(' '); //make arrays out of ingredients.
            const unitIndex = arrIng.findIndex(el2 => units.includes(el2));

            let objIng;
            if (unitIndex > -1) {
                // there is an unit
                //ie. 4 1/2 cups, arrCount = [4, 1/2] --> eval("4+1/2") = 4.5
                const arrCount = arrIng.slice(0, unitIndex);

                let count;
                if (arrCount.length === 1) {
                    count = eval(arrIng[0].replace('-', '+')); // in case the number is 1-1/2.
                } else {
                    count = eval(arrIng.slice(0, unitIndex).join('+'));
                }

                objIng = {
                    count,
                    unit: arrIng[unitIndex],
                    ingredient: arrIng.slice(unitIndex+1).join(' ')
                }

            } else if (parseInt(arrIng[0], 10)) {
                // there is no unit but a number. ie) 1 bread
                objIng = {
                    count: parseInt(arrIng[0], 10),
                    unit: '',
                    ingredient: arrIng.slice(1).join(' ')
                }
            } else if (unitIndex === -1) {
                // there is no unit or number
                objIng = {
                    count: 1,
                    unit: '',
                    ingredient //ES6 way. in ES5 'ingredient: ingredient'
                }
            }
            
            return objIng; //'forEach' method needs return unlike 'map' method to store the result.
        });
        this.ingredients = newIngredients;

    }

    updateServings(type) {
        //servings
        const newServings = type === 'dec'? this.servings-1 : this.servings+1;

        //ingredients
        this.ingredients.forEach(ing => {
            ing.count *= (newServings/this.servings);
        });

        this.servings = newServings // it has to be after 'this.ingredients.forEach...' for 'the ing.count'
    }
}