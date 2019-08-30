class PublicationList extends HTMLElement {
  constructor() {
    super();
    const shadowRoot = this.attachShadow({mode: 'open'});
  }

  connectedCallback() {
    this.shadowRoot.innerHTML =  `
        <ul>
          <slot />
        </ul>
    `;
  }
}

customElements.define('vivo-publication-list', PublicationList)

//export default PublicationList
