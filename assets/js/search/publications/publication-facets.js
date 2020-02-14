import { LitElement, html, css } from "lit-element";

// NOTE: this is not making use of any server data right now
// TODO? use 'selected' attribute to process searchResultsObtained?
class PublicationFacets extends LitElement {

    static get properties() {
      return {
        data: { type: Object },
        selected: { type: Boolean, attribute: true, reflect: true },
        filters: { type: Array },
        search: { type: String, attribute: true } // match up to DOM id on page
      }
    }
    
    static get styles() {
      return css`
      :host { 
        display: none;
      }
      :host([selected]) {
        display: block;
      }
      `
    }
    
    constructor() {
      super();
      this.selected = false;
      this.filters = [];
      this.handleSearchResultsObtained = this.handleSearchResultsObtained.bind(this);
      this.handleFacetSelected = this.handleFacetSelected.bind(this);
      this.handleSearchSubmitted = this.handleSearchSubmitted.bind(this);
    }
  
    firstUpdated() {
      document.addEventListener('searchResultsObtained', this.handleSearchResultsObtained);
      document.addEventListener('facetSelected', this.handleFacetSelected);
      document.addEventListener('searchSubmitted', this.handleSearchSubmitted);
    }
  
    disconnectedCallback() {
      super.disconnectedCallback();
      document.removeEventListener('searchResultsObtained', this.handleSearchResultsObtained);
      document.removeEventListener('facetSelected', this.handleFacetSelected);
      document.removeEventListener('searchSubmitted', this.handleSearchSubmitted);
    }
  
    handleSearchResultsObtained(e) {
      const data = e.detail;
      if (!data || !data.documents) {
        return;
      }

      this.data = data;
    }

    handleSearchSubmitted(e) {
      // clear filters here?
      this.filters = [];
    }
    
    handleFacetSelected(e) {
      // FIXME: every facets implementation has to add this
      // line - and keep track of it's own filters etc...
      if (!(e.detail.category == 'documents')) {
        return;
      }
      if (!this.selected == true ) {
        return;
      } 
      const facet = e.detail;
      if (facet.checked) {
        this.addFilter(facet);
      } else {
        this.removeFilter(facet);
      }
      // search ->?person-search"
      let search = document.querySelector(`[id="${this.search}"]`);
      search.setFilters(this.filters);
      search.search();
    }

    addFilter(filter) {
      this.filters.push({"field": filter.field, "value": filter.value});
    }

    removeFilter(filter) {
      this.filters = _.reject(this.filters, function(o) { 
        return (o.field === filter.field && o.value == filter.value); 
      });
    }

    render() {
      // TODO: gather facets from search data   
      // NOTE: if search == 'documents' - then could use check for
      // match that way
      if (!this.data || !this.data.documents || !this.selected == true ) {
        return html``
      }       

      // 1. get all vivo-search-facet elements ...
      // (how to limit to publications?)
      //<vivo-search-facets key="documents" field="publisher"></vivo-search-facets>
      let facets = Array.from(this.querySelectorAll('vivo-search-facets[key="documents"]'));

      // data - group by field
      let grouped = _.groupBy(this.data.documents.facets, "field");

      // 2. for each vivo-search-facet element, get key and field
      // and assign data (+ filters)
      facets.map(facet => {
         let key = facet.key;
         let field = facet.field;
         if (key == "documents" && grouped[field]) {
           facet.setData(grouped[field]);
           facet.setFilters(this.filters);
         } else if (key == "documents" && !grouped[field]) {
          // NOTE: after a new search, if there are no
          // facets - need to blank out
          facet.setData(null);
          facet.setFilters(this.filters);
        }
      });
  
      // grouping of facets per vivo-sidebar-item
      return html`
         <slot></slot>
      `
    }
  };
  
  customElements.define('vivo-search-publication-facets', PublicationFacets);
  