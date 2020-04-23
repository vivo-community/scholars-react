import { LitElement, html, css } from "lit-element";

class SearchFacetGroupToggle extends LitElement {

    static get properties() {
        return {
          shown: { type: Boolean }
        }
      }
    
      
    constructor() {
        super();
        this.shown = false;
        this.handleToggleFilters = this.handleToggleFilters.bind(this);
    }

    static get styles() {
        return css`
        a {
          font-weight: bold;
        }
        a:hover {
          cursor: pointer;
        }`
    }

    handleToggleFilters(e) {
        this.dispatchEvent(new CustomEvent('toggleFilters', {
            detail: { show: !this.shown }, // not sure what to put
            bubbles: true,
            cancelable: false,
            composed: true
        }));
        this.shown = !this.shown;
    }

    render() {
        let cmd = this.shown ? 'Hide' : 'Show';
        return html`<button @click="${this.handleToggleFilters}">
           ${cmd} filters
        </button>`
    }
}

customElements.define('vivo-facet-group-toggle', SearchFacetGroupToggle);