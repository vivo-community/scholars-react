import { LitElement, html, css } from "lit-element";

import peopleQuery from "./query";
import { unsafeHTML } from 'lit-html/directives/unsafe-html.js';

import './person-card';
import './person-image';

class PersonSearch extends LitElement {

    // NOTE: this 'query' is the graphql statement
    // not crazy about JSON.stringify below
    static get properties() {
      return {
        query: { type: Object },
        data: { type: Object },
        countData: { type: Object }
      }
    }
  
    static get styles() {
      return css`
        vivo-person-card-image {
            float:left;
            width: 10%;
        }
        vivo-person-card {
            float: left;
            width: 90%;
        }
        :host {
            display: block;
            clear: both;
        }
        
      `
    }
  
    constructor() {
      super();
      this.query = peopleQuery;
      this.handleSearchResultsObtained = this.handleSearchResultsObtained.bind(this);
      this.handleCountResultsObtained = this.handleCountResultsObtained.bind(this);
    }
  
    firstUpdated() {
      document.addEventListener('searchResultsObtained', this.handleSearchResultsObtained);
      document.addEventListener('countResultsObtained', this.handleCountResultsObtained);
    }
  
    disconnectedCallback() {
      super.disconnectedCallback();
      document.removeEventListener('searchResultsObtained', this.handleSearchResultsObtained);
      document.addEventListener('countResultsObtained', this.handleCountResultsObtained);
    }
  
    handleSearchResultsObtained(e) {
      this.data = e.detail;
    }
  
    handleCountResultsObtained(e) {
      this.countData = e.detail;
      // NOTE: alias of 'peopleCount' doesn't seem to work
      var personCount = this.countData ? this.countData.people.page.totalElements : 0;
      let tab = document.querySelector('#person-search-tab');
      tab.textContent = `People (${personCount})`;
  
      //var pubCount = this.countData ? this.countData.documents.page.totalElements : 0;
      //let tab2 = document.querySelector('#publication-search-tab');
      //tab2.textContent = `Publications (${pubCount})`;
  
    }
  
    // need this so we can pass through
    search() {
      let search = this.shadowRoot.querySelector('vivo-search');
      search.search();
    }
  
    // TODO: not sure it's good to have to remember to call search AND counts
    counts() {
      let search = this.shadowRoot.querySelector('vivo-search');
      search.counts();
    }
  
    setPage(num) {
      let search = this.shadowRoot.querySelector('vivo-search');
      search.setPage(num);
    }
  
    render() {
      var results = [];
      if (this.data && this.data.people.content) {
        let content = this.data.people.content;
        _.each(content, function (item) {
          results.push(item);
        });
      }
  
  
      var resultsDisplay = html`<div>
        ${_.map(results, function (i) {
        let title = i.preferredTitle || i.id;
  
        // NOTE: the custom elements here might be better named with 'results'
        // e.g. vivo-search-person-results, or maybe just search-person-results?
        return html`<vivo-person-card-image thumbnail="${i.thumbnail}"></vivo-person-card-image>
                <vivo-person-card>
                  <div slot="title">${title}</div>
                  <a slot="name" href="/entities/person/${i.id}">
                    ${i.name}
                  </a>
                  ${i.overview ?
            html`<vivo-truncated-text>${unsafeHTML(i.overview)}</vivo-truncated-text>` :
            html``
          } 
                </vivo-person-card>
              `
      })
        }
      </div>`
  
      let pagination = html``;
  
      // let facets = html``;
  
      if (this.data) {
        pagination = html`<vivo-search-pagination 
              number="${this.data.people.page.number}"
              size="${this.data.people.page.size}"
              totalElements="${this.data.people.page.totalElements}"
              totalPages="${this.data.people.page.totalPages}"
          />`
      }
  
      return html`
         <vivo-search graphql=${JSON.stringify(this.query)}>
         ${resultsDisplay}
         ${pagination}
         </vivo-search>`
    }
  
  }
  
  customElements.define('vivo-person-search', PersonSearch);
  