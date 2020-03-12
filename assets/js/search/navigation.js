import { LitElement, html, css } from "lit-element";
import qs from "qs";
/*
TODO: maybe make a tabbed-search component
that contains search-text and tabs/searches etc..
and have it take care of the search switching?

then make this *only* hangle navigation
(so search still works without it) like the tab-navigation
on profile
*/
class SearchNavigation extends LitElement {

    constructor() {
      super();
      this.browsingState = {}; // maybe rename to searchStructure
      //this.navFrom = this.navFrom.bind(this);
      //this.navTo = this.navTo.bind(this);
      this.handleSearchSubmitted = this.handleSearchSubmitted.bind(this);
      this.handleTabSelected = this.handleTabSelected.bind(this);
      this.handlePageSelected = this.handlePageSelected.bind(this);
      this.handleSortSelected = this.handleSortSelected.bind(this);
      this.handleSearchStarted = this.handleSearchStarted.bind(this);
    }
  
    firstUpdated() {
      //document.addEventListener('DOMContentLoaded', this.navFrom);
      document.addEventListener('tabSelected', this.handleTabSelected);
      document.addEventListener('searchSubmitted', this.handleSearchSubmitted);
      // NOTE: these are search specific - should maybe be in searcher.js
      // code instead of here
      document.addEventListener('pageSelected', this.handlePageSelected);
      document.addEventListener('sortSelected', this.handleSortSelected);
      document.addEventListener('searchStarted', this.handleSearchStarted);
      
      // make search-box show text of search sent in (from home page)
      let searchBox = document.querySelector(`vivo-site-search-box`);
      // parse all other params here?
      const params = qs.parse(window.location.search.substring(1));
      let search = params.search;
      const defaultQuery = search ? search : "*";

      searchBox.query = defaultQuery;

      let searchTab = params["search-tab"];
      let matchedSearch = document.querySelector(`#${searchTab}`);
      if (matchedSearch) {
        matchedSearch.setActive(true);
        this.browsingState.activeSearch = matchedSearch;
        const tabs = this.getMainTabs();
        if (tabs) {
          // NOTE: naming convention is a little fragile - could find
          // parent parent, sibling etc... 
          tabs.selectTabById(`${searchTab}-tab`);
        }
        //matchedSearch.setUp();
        //matchedSearch.search();
      } else {
        let defaultSearch = document.querySelector(`[implements="vivo-search"]`);
        defaultSearch.setActive(true);
        this.browsingState.activeSearch = defaultSearch;
        //defaultSearch.setUp();
        //defaultSearch.search();
        //matchedSearch.doSearch(defaultQuery);
      }   
      // NOTE: which facets to display depends on active search  
      this.findCorrectFacetsToDisplay(params.filters);
    }
  
    getMainTabs() {
      return document.querySelector('vivo-tabs');
    }

    disconnectedCallback() {
      super.disconnectedCallback();
      //document.removeEventListener('DOMContentLoaded', this.navFrom);
      document.removeEventListener('tabSelected', this.handleTabSelected);
      document.removeEventListener('searchSubmitted', this.handleSearchSubmitted);
      document.removeEventListener('pageSelected', this.handlePageSelected);
      document.removeEventListener('sortSelected', this.handleSortSelected);
      document.removeEventListener('searchStarted', this.handleSearchStarted);
    }
  
    getNextSibling(elem, selector) {
      // Get the next sibling element
      var sibling = elem.nextElementSibling;
    
      // If there's no selector, return the first sibling
      if (!selector) return sibling;
    
      // If the sibling matches our selector, use it
      // If not, jump to the next sibling and continue the loop
      while (sibling) {
        if (sibling.matches(selector)) return sibling;
        sibling = sibling.nextElementSibling
      }
    };

    handleTabSelected(e) {
      const tab = e.detail;
      // FIXME: this seems to be called by clicking anywhere on tab panel
      // not sure it's really an error
      if (tab == null) {
        console.error("called handleTabSelected with wrong event");
        return;
      }
      this.browsingState.currentTab = tab.id

      // first de-activate ?
      this.browsingState.activeSearch.setActive(false);

      // search is either active or dormant
      // only one can be active at a time

      // TODO: all searches are in vivo-tab-panels
      // might be better to enable non-tabbed searching 
      let panel = this.getNextSibling(tab, 'vivo-tab-panel');
      let search = panel.querySelector(`[implements="vivo-search"]`);
      this.browsingState.activeSearch = search;

      // only one active search at a time? ...
      search.setActive(true);

      // TODO: may need to clear out filters and orders from URL when switching tabs
      if (search) {
        search.search();  
        // TODO: add active-search to URL as /people, /publications etc... ?
      } else {
          console.error("could not find search");
      }

      // TODO: not sure how to reset 'orders' when switching tab
      // (in URL)
      this.findCorrectFacetsToDisplay();
    }
  
    handleSearchSubmitted(e) {
      const search = (e.detail != '') ? e.detail : "*";

      this.browsingState.currentQuery = search;
      let activeSearch = this.browsingState.activeSearch;
  
      // could get active search from route ? e.g.
      // /search/person?query=*
      // /search/publications?query=* etc...
      
      // set the query on all - so if we switch tabs it has
      // the new query to run
      let searches = document.querySelectorAll(`[implements="vivo-search"]`);
      searches.forEach(s => {
        s.setQuery(search);
        s.setPage(0);
      })

      // clear all the 'filters' 
      let facets = document.querySelectorAll('vivo-facet-group');
      facets.forEach(s => {
        s.setFilters([]);
      })

      activeSearch.doSearch(search);

      this.findCorrectFacetsToDisplay();
    }
  
    // NOTE: different than 'searchSubmitted' because it's the graphql
    // query (could be faceting, paging, sorting etc... not just new search)
    handleSearchStarted(e) {
      // TODO: not sure what to do here yet - 
      // perhaps a global 'waiting' spinner of some sort?
      //console.log(`search started: ${e.detail.time}`);
    }

    // TODO: this feels a little fragile - works/doesn't work
    // depending on precise arrangement on page
    findCorrectFacetsToDisplay(filters = []) {
      let activeSearch = this.browsingState.activeSearch;
      let id = activeSearch.id;

      let facets = document.querySelectorAll('vivo-facet-group');
      // hiding all
      facets.forEach((t) => t.removeAttribute('selected'));
  
      // should this really be multiple?
      let facetGroups = document.querySelectorAll(`[search="${id}"]`);
      facetGroups.forEach(group => {
        group.setAttribute('selected', 'selected');
        if (filters && filters.length > 0) {
          // FIXME: this restores filters for person
          group.setFilters(filters);
        }
      })
    }
    
    // maybe move this and sort to be handled by individual search
    // (maybe in searcher.js file)
    handlePageSelected(e) {
      let search = this.browsingState.activeSearch;
      const page = e.detail;
      this.browsingState.currentPage = page;
      search.setPage(page.value);
      search.search();
    }
  
    handleSortSelected(e) {
      let search = this.browsingState.activeSearch;
      let orders = [e.detail]
      search.setSort(orders);
      search.setPage(0);
      search.search();
    }
  
  }
  
  customElements.define('vivo-search-navigation', SearchNavigation);
  