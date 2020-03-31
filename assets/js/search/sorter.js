import { LitElement, html, css } from "lit-element";

class SearchSorter extends LitElement {

    // NOT multi-select
    static get properties() {
        return {
            options: { type: Array },
            selected: { type: String, attribute: true }
        };
    }

    constructor() {
        super();
        // just hard-coding here for now
        this.options = [];
        this.handleSortSelected = this.handleSortSelected.bind(this);
    }

    handleSortSelected(e) {
        let value = e.target.value;
        if (!value) {
            console.error('no value for sorter');
            return;
        }

        this.selected = value;
        const [field, direction] = value.split("-", 2);

        // also, reset paging?  
        this.dispatchEvent(new CustomEvent('sortSelected', {
            detail: { property: field, direction: direction },
            bubbles: true,
            cancelable: false,
            composed: true
        }));
    }


    isSelected(option) {
        // options look like this: 
        // {label: 'Name (asc)', field: 'name', 'direction': "ASC"},
        // TODO: not crazy about having to make this parseable version
        let flag = (this.selected === `${option.field}-${option.direction}`);
        return flag;
    }

    static get styles() {
        // TODO: should make link color etc...
        return css`
          select {
            font-size: .85em;
            margin-top: 8px;
          }
        `
    }

    render() {
        return html`<select @change="${this.handleSortSelected}">
          ${this.options.map(option => 
            html`
            <option 
              ?selected=${this.isSelected(option)}
              value="${option.field}-${option.direction}">
              ${option.label}
            </option>
          `)}
        </select>`
    }
}

customElements.define('vivo-search-sorter', SearchSorter);