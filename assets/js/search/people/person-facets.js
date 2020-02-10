import { LitElement, html, css } from "lit-element";

// usage: (search must match id of vivo-search on page)
// <vivo-search-person-facets search="person-search"></vivo-search-person-facets>
class PeopleFacets extends LitElement {

    // how to update data ...?
    static get properties() {
      return {
        data: { type: Object },
        selected: { type: Boolean, reflect: true },
        // TODO: how to get filters in here to know
        // what to check,uncheck in render?
        filters: { type: Array }
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
      this.selected = true;
      this.filters = [];
      this.handleSearchResultsObtained = this.handleSearchResultsObtained.bind(this);
      this.handleFacetSelected = this.handleFacetSelected.bind(this);
    }
  
    firstUpdated() {
      document.addEventListener('searchResultsObtained', this.handleSearchResultsObtained);
      document.addEventListener('facetSelected', this.handleFacetSelected);
      // NOTE: would need to 'redraw' facets
      // (with 'filters' from search)   
    }
  
    disconnectedCallback() {
      super.disconnectedCallback();
      document.removeEventListener('searchResultsObtained', this.handleSearchResultsObtained);
    }
  
    handleSearchResultsObtained(e) {
      const data = e.detail;
      this.data = data;
    }

    handleFacetSelected(e) {
      const facet = e.detail;
      if (facet.checked) {
        this.addFilter(facet);
      } else {
        this.removeFilter(facet);
      }
    }

    addFilter(filter) {
      this.filters.push({"field": filter.field, "value": filter.value});
    }

    removeFilter(filter) {
      this.filters = _.reject(this.filters, function(o) { 
        return (o.field === filter.field && o.value == filter.value); 
      });
    }


    inFilters(field, facet) {
      let exists = _.find(this.filters, function(f) { 
        return (f.field == field && f.value == facet.value); 
      });
      return exists;
    }

    listFacets(field, entries) {
      let display = entries.content.map(facet => {
        let selected = this.inFilters(field, facet);
        return html`<vivo-search-facet 
          field="${field}"
          ?selected=${selected}
          value="${facet.value}" 
          label="${facet.value}" 
          count="${facet.count}" />`
      });
      return display;
    };

    // add searchResultsObtained listener?
    // #person-facets(DOM) set-data --> data ??
    render() { 
      if (!this.data || !this.data.people || !this.selected == true ) {
        return html``
      }

      // TODO: generic or very specific (e.g. data.people.facets["researchAreas"] etc...)
      // also need 'filters' to tell what checkboxes to check
      let display = this.data.people.facets.map(facet => {
        return html`<h4>${facet.field}</h4>
          ${this.listFacets(facet.field, facet.entries)}
        `
      });

      let facets = html`
          ${display}      
      `;
       
      return html`
          <vivo-search-facets id="person-facets">
            <h3 slot="heading">Filter People</h3>
            <div slot="content">
            ${facets}
            </div>
          </vivo-search-facets>
          `
    }
  };
  
  customElements.define('vivo-search-person-facets', PeopleFacets);
  