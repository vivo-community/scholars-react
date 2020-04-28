import { LitElement, html, css } from "lit-element";

import Faceter from './faceter.js'

import * as config from './config.js'
class SearchFacets extends Faceter(LitElement) {

  static get properties() {
    return {
        field: { type: String }, // e.g. researchAreas
        key: { type: String }, // e.g. people
        tag: { type: String, attribute: true }, // e.g. SOLR "tag"
        opKey: { type: String, attribute: true } // EQUALS, RAW etc...
    }
  }

  constructor() {
    super();
    this.tag = ""; // default no tagging
    this.opKey = "EQUALS"; // default to EQUALS compare
    this.popupThreshold = config.FACET_POPUP_THRESHOLD;
    this.showCount = config.FACETS_SHOW;
    this.togglePopup = this.togglePopup.bind(this);

    this.toggleList = this.toggleList.bind(this);
  }

  static get styles() {
    return css`
      :host {
        display: block;
        line-height: 1.6em;
        padding-bottom: 1em;
      }
      vivo-search-facet[selected=""] {
        font-weight: bold;
      }
      :host p {
        opacity: 50%;
        font-size: 1em;
        font-weight: normal;
        margin: 0;
        text-decoration: underline;
      }
      :host p:hover {
        cursor: pointer;
      }
      .entire-facet-list {
        padding: 0;
        margin: 0;
        display: block;
      }
      ::slotted(h4) {
        padding: 0;
        margin: 0;
      }
      @media screen and (max-width: 1000px) {
        .entire-facet-list {
          display: none;
        }     
        ::slotted(h4:hover) {
          cursor: pointer;
        }
        ::slotted(h4)::after {
           content: " >";
        }
      }      
    `
  }

  togglePopup() {
    let popup = this.shadowRoot.querySelector("#popup-facets");

    if (popup.getAttribute("open")) {
      popup.closeDown();
    } else {
      popup.openUp();
      // when open popup - need to 'reset' filters
      popup.setFilters(this.filters);
    }
  }

  toggleList(e) {
    let list = this.shadowRoot.querySelector(".entire-facet-list");
    if (list.style.display == 'none' || !list.style.display) {
      list.style.display = 'block';
    } else {
      list.style.display = 'none';
    }
  }

  generateFacetToggle(showList) {
    var results = html`<vivo-search-facet-toggle>
      ${this.generateFacetList(showList)}
    </vivo-search-facet-toggle>`
    return results;
  }

  generateFacetPopup(showList) {
    // FIXME: this is getting the title of popup from
    // <h4> which means <h4> is required in slot
    let heading = this.querySelector("h4");
    let headingText = heading.innerText;
    var results = html`
    <p id="toggle-facet" @click=${this.togglePopup}>Show More</p>
    <vivo-facet-popup-message id="popup-facets">
      <div slot="heading">Filter ${headingText}</div> 
      ${this.generateFacetList(showList)}
    </vivo-facet-popup-message>`;
    return results;
  }

 generateHiddenFacetList(content, hideList) {
  if (content.length > this.popupThreshold) { 
    // make selected drift to top?
    // the pop-up needs all options
    return this.generateFacetPopup(content)
  } else  {
    return this.generateFacetToggle(hideList);
  }
 }

  generateFacetList(content) {
    let facetList = content.map(facet => {
      let selected = this.inFilters(this.field, facet);   
      return html`<vivo-search-facet
        category="${this.key}"
        tag="${this.tag}"
        opKey="${this.opKey}"
        field="${this.field}"
        ?selected=${selected}
        value="${facet.value}" 
        label="${facet.value}" 
        count="${facet.count}">
        </vivo-search-facet>`
      });
    return facetList;
  }

  render() {
    if (!this.data) {
      return html``
    }
    // NOTE: it's an array - but only want first
    let content = this.data[0].entries.content;

    var showList = content.slice(0,this.showCount);
    var hideList = content.slice(this.showCount);

    let hiddenSelected = hideList.filter(facet => 
       this.inFilters(this.field, facet)
    );

    // shown selected list need to be removed
    // from show list and added to hiddenSelected
    // so can be appended to top of list
    let shownSelected = showList.filter(facet => 
      this.inFilters(this.field, facet)
    );

    let isPopup = (content.length > this.popupThreshold) ? true : false; 
    
    // if it's NOT a popup - then make a selected facet
    // show up on sidebar - no matter if show more/less is chosen
    if (!isPopup) {
      showList = _.concat(showList, hiddenSelected);
      hideList = _.difference(hideList, hiddenSelected);
    } else {
      // otherwise, put selected on top
      // sort by count (need to watch for nonHidden selected)
      let reorder = true;

      if (reorder) {
        // 1. remove already visible selected
        showList = _.difference(showList, shownSelected);
        // 2. so that can be added to the pre-append list
        let selected = _.concat(shownSelected, hiddenSelected);
        
        // before was just this:
        //showList = _.concat(hiddenSelected, showList);
        showList = _.concat(selected, showList);
        //showList = showList.slice(0,this.showCount + hiddenSelected.length)  
      } else {
        showList = _.concat(showList, hiddenSelected);
        // and then fall back to only showing cut-off display number
        // (but make sure to show hiddenSelected)
        //showList = showList.slice(0,this.showCount + hiddenSelected.length)  
      }
    }
    
    let showHtml  = this.generateFacetList(showList);
    let hideHtml = (hideList.length > 0) ? this.generateHiddenFacetList(content, hideList): html``;
    
    return html`
        <slot @click="${this.toggleList}"></slot>
        <div class="entire-facet-list">
        ${showHtml}
        ${hideHtml}
        </div>
      `
    }

}
  
customElements.define('vivo-search-facets', SearchFacets);
  