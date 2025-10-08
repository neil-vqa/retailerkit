export class ProductItem extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }
  set data(newData) {
    this._data = newData;
    this.render();
  }
  get data() {
    return this._data;
  }
  render() {
    this.shadowRoot.innerHTML = `
      <style>
        .list-item { display: flex; justify-content: space-between; align-items: center; padding: 0.8em 0.2em; border-bottom: 1px solid #e9ecef; }
        .list-item-name { font-weight: 500; }
        .text-button { background: none; border: none; padding: 0; color: #007bff; cursor: pointer; margin: 0 0.5em; font-size: 1em; }
        .text-button:hover { text-decoration: underline; }
        .text-button.danger { color: #dc3545; }
      </style>
      <div class="list-item">
          <span class="list-item-name">${this.data.product.displayName}</span>
          <div>
              <button class="edit-button text-button">Edit</button>
              <button class="remove-button text-button danger">Delete</button>
          </div>
      </div>
    `;
    this.shadowRoot
      .querySelector(".edit-button")
      .addEventListener("click", () => {
        this.dispatchEvent(
          new CustomEvent("edit-item", {
            bubbles: true,
            composed: true,
            detail: { type: "product", id: this.data.product.id },
          })
        );
      });
    this.shadowRoot
      .querySelector(".remove-button")
      .addEventListener("click", () => {
        this.dispatchEvent(
          new CustomEvent("request-delete", {
            bubbles: true,
            composed: true,
            detail: { type: "product", id: this.data.product.id },
          })
        );
      });
  }
}
