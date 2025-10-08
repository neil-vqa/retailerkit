export class ComponentList extends HTMLElement {
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
         #component-items {max-height: 200px; overflow-y: scroll;} 
          h3 { font-weight: 500; border-bottom: 1px solid #dee2e6; padding-bottom: 0.5em; margin-top: 2em; margin-bottom: 1em; }
          .button { font-size: 0.9em; padding: 0.5em 1em; border: 1px solid #abacaf; background-color: #f8f9fa; color: #212529; border-radius: 5px; cursor: pointer; margin-top: 1em;}
          .button:hover { background-color: #e9ecef; }
      </style>
      <section>
          <h3>Components</h3>
          <div id="component-items"></div>
          <button id="add-component">Add Component</button>
      </section>`;
    const container = this.shadowRoot.getElementById("component-items");
    container.innerHTML = "";
    this.data.components.forEach((component, index) => {
      const item = document.createElement("component-item");
      item.data = { component, index, allData: this.data.allData };
      container.appendChild(item);
    });
    this.shadowRoot
      .getElementById("add-component")
      .addEventListener("click", () => {
        this.dispatchEvent(
          new CustomEvent("edit-item", {
            bubbles: true,
            composed: true,
            detail: { type: "component" },
          })
        );
      });
  }
}
