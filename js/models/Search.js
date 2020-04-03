import axios from 'axios'; // path to the module needs to be specified, but npm module installed from external source no need. just name appearing.


export default class Search {
    constructor(query) {
        this.query = query;
    }
    async getResults() {
        try {
            const res = await axios(`https://forkify-api.herokuapp.com/api/search?q=${this.query}`);
            this.result = res.data.recipes;
            //console.log(this.result);
        } catch (error) {
            alert(error);
        }
    }
}





