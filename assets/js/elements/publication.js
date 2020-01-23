import { LitElement, html, css } from "lit-element";

class Publication extends LitElement {

  static get styles() {
    return css`
  
      ::slotted([slot="title"]) {
        margin-bottom: 0.5em;
        font-weight: bold;
        color: var(--linkColor);
        text-decoration: none;
      }
      ::slotted([slot="authors"]), ::slotted([slot="publisher"]) {
        margin-right: 0.5em;
      }
      ::slotted([slot="date"])::before, ::slotted([slot="publisher"])::before  {
        content: '·';
        font-weight: bold;
        margin-right: 0.5em;
      }
      slot[name="abstract"] {
        display: block;
        margin-top: 0.5em;
      }
      slot[name="links"] {
        display: flex;
        flex-flow: row wrap;
        margin-top: .75em;
      }
      ::slotted([slot="links"]) {
        color: var(--darkNeutralColor);
        margin-right: 3em;
        white-space: nowrap;
      }
      @media (max-width: 800px) {
        ::slotted([slot="authors"]), ::slotted([slot="publisher"]), ::slotted([slot="date"]) {
          display: block;
        }
        ::slotted([slot="date"])::before, ::slotted([slot="publisher"])::before  {
          display: none;
        }
      }
    `;
  }

  handlePublicationClick(e) {
    this.dispatchEvent(new CustomEvent('publicationClicked', {
      detail: this,
      bubbles: true,
      cancelable: false,
      composed: true
    }));
  }

  render() {
    return html`
      <div class="title">
        <slot name="title" @click="${this.handlePublicationClick}"></slot>
      </div>
      <slot name="authors"></slot>
      <slot name="publisher"></slot>
      <slot name="date"></slot>
      <slot name="abstract"></slot>
      <slot name="links"></slot>
    `;
  }
}

customElements.define("vivo-publication", Publication);
