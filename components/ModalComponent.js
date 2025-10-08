export class ModalComponent extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    this.render();
    const modalContainer = this.shadowRoot.querySelector(".modal-container");
    modalContainer.addEventListener("click", (e) => {
      if (
        e.target === modalContainer ||
        e.target.classList.contains("cancel-button")
      ) {
        this.close();
      }
    });
  }

  open(content) {
    this.shadowRoot.querySelector(".modal-content").innerHTML = content;
    this.shadowRoot.querySelector(".modal-container").style.display = "flex";
  }

  close() {
    this.shadowRoot.querySelector(".modal-container").style.display = "none";
  }

  get contentElement() {
    return this.shadowRoot.querySelector(".modal-content");
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        .modal-container {
          position: fixed; top: 0; left: 0; width: 100%; height: 100%;
          background-color: rgba(0,0,0,0.4);
          display: none;
          align-items: center; justify-content: center;
          z-index: 1000;
        }
        .modal-content {
          background-color: white; padding: 2em; border-radius: 8px;
          width: 90%; max-width: 500px;
          box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        }
        .modal-content h3, .modal-content h4 { margin-top: 0; }
        .modal-content h4 { font-weight: 500; margin-bottom: 0.5em; }
        .form-actions {
          text-align: right; margin-top: 2em;
          border-top: 1px solid #e9ecef; padding-top: 1em;
        }
        .bom-item {
          display: grid; grid-template-columns: 1fr 80px auto;
          align-items: center; gap: 1em; margin-bottom: 0.5em;
        }
        .add-bom-item { display: flex; gap: 1em; margin-top: 1em; }
        .text-button {
          background: none; border: none; padding: 0; color: #007bff;
          cursor: pointer; margin: 0 0.5em; font-size: 1em;
        }
        .text-button:hover { text-decoration: underline; }
        .text-button.danger { color: #dc3545; }
        #confirm-message {
          margin-top: 0; font-size: 1.1em; line-height: 1.5;
        }
      </style>
      <div class="modal-container">
        <div class="modal-content"></div>
      </div>
    `;
  }
}
