import _ from "lodash";

import client from "../lib/apollo";
import countQuery from "./count-query";

// NOTE: one way to do this, not the only way
// http://exploringjs.com/es6/ch_classes.html
// http://justinfagnani.com/2015/12/21/real-mixins-with-javascript-classes/
let Searcher = (superclass) => class extends superclass {

   static get properties() {
     return {
        data: { type: Object },
        countData: { type: Object },
        active: { type: Boolean }
      }
    }

    deriveQueryFromParameters() {     
      let params = new URLSearchParams(window.location.search); 
      
      let search = params.get("search"); 
      const defaultQuery = search ? search : "*";
      
      let page = params.get("page");
      const defaultPage = page ? page : 0;

      // TODO: not sure what to do about list things
      let facets = params.getAll("facets");
      const defaultFacets = facets ? facets : [];
      // params.getAll("filters")
      // parmams.getAll("orders");
      return [defaultQuery, defaultPage];
    }

    defaultSort() {
      return [{ direction: "ASC", property: "name" }]
    }

    // TODO: maybe search should listen for page request (and sort)
    setUp(orders) {
      const [ query, page ] = this.deriveQueryFromParameters();
      this.query = query;
      this.page = page;
      this.filters = [];
      // TODO: each search should probably implement it's own default
      this.orders = orders ? orders : this.defaultSort();

      this.pushHistory();
      this.counts();
      this.search();
    }
    
    runCounts() {
      const fetchData = async () => {
        try {
          const { data } = await client.query({
            query: countQuery,
            variables: {
                search: this.query
              }
          });
          this.countData = data;
        } catch (error) {
          console.error(error);
          throw error;
        }
      };
      return fetchData();
    }
  
    runSearch() {
      // this.pushHistory();?
      //window.history.replaceState({},'', `${window.location.pathname}?${searchParams.toString()}`);
      // change URL here?
      this.dispatchEvent(new CustomEvent('searchStarted', {
        detail: { time: Date(Date.now()) },
        bubbles: true,
        cancelable: false,
        composed: true
      }));
      // so UI can know - might be useful for 'waiting' watcher
      // or to know state of filters etc...
      const fetchData = async () => {
        try {

          const { data } = await client.query({
            query: this.graphql,
            variables: {
              pageNumber: this.page,
              search: this.query,
              filters: this.filters,
              orders: this.orders
            }
          });
          this.data = data;
        } catch (error) {
          console.error(error);
          throw error;
        }
      };
      return fetchData();
    }
  
    setFilters(filters = []) {
      this.filters = filters;
    }
  
    setPage(page = 0) {
      this.page = page;
    }
  
    setQuery(query = "*") {
      this.query = query;
    }

    setActive(b = false) {
      this.active = b;
    }

    // needs to look like this ...
    setSort(orders = []) {
      this.orders = orders
    }

    counts() {
      this.runCounts()
        .then(() => {
          this.dispatchEvent(new CustomEvent('countResultsObtained', {
            detail: this.countData,
            bubbles: true,
            cancelable: false,
            composed: true
          }));
        })
        .catch((e) => console.error(`Error running counts:${e}`));
    }
  
    search() {
      // TODO: maybe add time stopped to detail?
      this.runSearch()
        .then(() => {
          this.dispatchEvent(new CustomEvent('searchResultsObtained', {
            detail: this.data,
            bubbles: true,
            cancelable: false,
            composed: true
          }));
        })
        .catch((e) => console.error(`Error running search:${e}`));
    }
  
    pushHistory() {;
      //see https://javascriptplayground.com/url-search-params/
      
      var searchParams = new URLSearchParams(window.location.search);
      //var searchParams = new URLSearchParams();
      searchParams.set("search", this.query);
      //searchParams.set("page", this.page);
      var newRelativePathQuery = window.location.pathname + '?' + searchParams.toString();
      history.pushState(null, '', newRelativePathQuery);
      
      /*
      TODO: maybe manipulating URL to store search would start like this?:

      var searchParams = new URLSearchParams(window.location.search);
      searchParams.set("search", this.query);
      var newPath = window.location.pathname + 'people?' + searchParams.toString();
      
      history.pushState(
        null, 
        "",
        newPath
      );
      */
      
    }

    // NOTE: only called by handleSearchSubmitted in navigation.js
    doSearch(query) {
      // assumes not blank string (checked already)
      this.query = query;
      this.pushHistory();
      this.counts();
      this.search();
    }  

  }
  
export default Searcher;