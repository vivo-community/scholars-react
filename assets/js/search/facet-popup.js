import { LitElement, html, css } from "lit-element";

class FacetPopupMessage extends LitElement{

  static get properties() {
    return {
      open: {
        attribute: "open",
        type: Boolean,
        reflect: true
      },
    };
  }

  constructor() {
      super();
      this.handleFacetSelected = this.handleFacetSelected.bind(this);
  }

  firstUpdated() {
    this.addEventListener("click",this.togglePopup);
    // might need to listen for 'facetSelected' event
    this.addEventListener('facetSelected', this.handleFacetSelected);
  }

  disconnectedCallback() {
    this.removeEventListener('click', this.togglePopup);
  }

  handleFacetSelected(e) {
      // 1. close popup ->
      // 2. add to list of filters ..
      // 3. facets of filters selected should
      //    show up on sidebar
  }

  static get styles() {
    return css`
    :host {
      display: none;
    }
    :host([open]) {
      display: block;
      box-sizing: border-box;
      overflow: scroll;
      /* position: fixed; */
      position: absolute;
      font-size: 1.5em;
      text-align: center;
      line-height: normal;
      height: 50%;
      width: 50%;
      transform: translate(0,-50%);
      border: 1px solid black;
      border-radius: 25px;
      background-color: var(--highlightBackgroundColor);
      padding: 1em;
      z-index: 99;
    }
    :host([open]) .fas {
      display: inline-block;
      font-style: normal;
      font-variant: normal;
      text-rendering: auto;
      font-size: 2em;
      display: flex;
      flex-direction: row-reverse;
      -webkit-font-smoothing: antialiased;
    }
    :host([open]) .fa-times::before {
      font-family: 'Font Awesome 5 Free';
      font-weight: 900;
      content: "\\f00d";
    }
    ::slotted(a) {
      text-decoration: none;
      color: black;
      font-weight: bold;
    }

  @media(max-width: 1230px) {
    :host([open]) {
      width: 55%;
    }
  }
  @media(max-width: 1100px) {
    :host([open]) {
      width: 60%;
    }
  }
  @media(max-width: 1100px) {
    :host([open]) {
      width: 70%;
    }
  }
  @media(max-width: 800px) {
    :host([open]) {
      width: 90%;
      margin: auto;
    }
  }
    `;
  }

  togglePopup(){
    this.open = !this.open;
  }


  render() {
    return html`
    <i class="fas fa-times"></i>
    <slot></slot>
    `;
  }
}

customElements.define("vivo-facet-popup-message", FacetPopupMessage);
