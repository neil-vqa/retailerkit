export class ProductList extends HTMLElement {
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
          #product-items {max-height: 200px; overflow-y: scroll;} 
          h3 { font-weight: 500; border-bottom: 1px solid #dee2e6; padding-bottom: 0.5em; margin-top: 2em; margin-bottom: 1em; }
          .button { font-size: 0.9em; padding: 0.5em 1em; border: 1px solid #abacaf; background-color: #f8f9fa; color: #212529; border-radius: 5px; cursor: pointer; margin-top: 1em;}
          .button:hover { background-color: #e9ecef; }
      </style>
      <section>
          <h3>Products</h3>
          <div id="product-items"></div>
          <button id="add-product">Add Product</button>
      </section>`;
    const container = this.shadowRoot.getElementById("product-items");
    container.innerHTML = "";
    this.data.products.forEach((product) => {
      const item = document.createElement("product-item");
      item.data = {
        product,
        components: this.data.components,
        allData: this.data.allData,
      };
      container.appendChild(item);
    });
    this.shadowRoot
      .getElementById("add-product")
      .addEventListener("click", () => {
        this.dispatchEvent(
          new CustomEvent("edit-item", {
            bubbles: true,
            composed: true,
            detail: { type: "product" },
          })
        );
      });
  }
}
