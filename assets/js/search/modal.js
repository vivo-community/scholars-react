import { LitElement, html, css } from "lit-element";

import { classMap } from 'lit-html/directives/class-map';

class ModalBox extends LitElement {

    static get properties() {
        return {
            shown: { type: Boolean }
        };
    }

    constructor() {
        super();
        this.classes = {};
        //this.classes = { "modal": true, "show-modal": false }
    }

    //https://sabe.io/tutorials/how-to-create-modal-popup-box
    static get styles() {
        return css`
        .modal {
            position: fixed;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.5);
            opacity: 0;
            visibility: hidden;
            transform: scale(1.1);
        }
        .modal-content {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background-color: white;
            padding: 1rem 1.5rem;
            width: 24rem;
            border-radius: 0.5rem;
        }
        .show-modal {
            opacity: 1;
            visibility: visible;
            transform: scale(1.0);
            transition: visibility 0s linear 0s, opacity 0.25s 0s, transform 0.25s;
        }
        ::slotted(*) {
            display: flex;
            align-items: center;
            justify-content: center;        
        }
        `

    }

    // modal-content
    // this.shadowRoot.querySelector('modal-content').classList.add('show-modal')
    render() {
        this.classes = { "modal": true, "show-modal": this.shown };
        return html`
        <div class="${classMap(this.classes)}">
          <div class="modal-content">
            <slot></slot>
          </div>
       </div>`
    }
}

customElements.define('vivo-modal', ModalBox);