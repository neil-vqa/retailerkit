import { store, chartData } from "../store.js";
import { Product, Component } from "../models.js";

export class ProductionPlanner extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });

    this.addEventListener("edit-item", this.handleEdit);
    this.addEventListener("request-delete", this.handleDeleteRequest);
  }

  connectedCallback() {
    this.unsubscribe = store.subscribe(() => this.render());
    this.render();
  }

  disconnectedCallback() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }

  async handleCompute() {
    const computeButton = this.shadowRoot.getElementById("compute");
    computeButton.disabled = true;
    computeButton.textContent = "Computing...";

    try {
      const data = store.getState();
      const componentNameToIdMap = new Map(
        data.components.map((c) => [c.name, c.id])
      );

      const requestPayload = {
        data: {
          general_parameters: data.general_parameters,
          products: data.products.map((p) => ({
            name: p.id,
            selling_price: p.selling_price,
            sales_mix_ratio: p.sales_mix_ratio,
            product_rating: p.product_rating,
            is_focus_item: p.is_focus_item,
            sales_velocity: p.sales_velocity,
            bill_of_materials: Object.entries(p.bill_of_materials).reduce(
              (acc, [componentName, quantity]) => {
                const componentId = componentNameToIdMap.get(componentName);
                if (componentId) {
                  acc[componentId] = quantity;
                }
                return acc;
              },
              {}
            ),
          })),
          components: data.components.map((c) => ({
            name: c.id,
            available: c.stock,
            cost: c.cost,
          })),
        },
      };

      const response = await fetch("http://localhost:3000/solve", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestPayload),
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const result = await response.json();

      // Update the chartData object and re-render the solution-analysis component
      chartData.solutions = result.solutions;
      this.shadowRoot.querySelector("solution-analysis").data = {
        ...chartData,
        products: store.getState().products,
      };
    } catch (error) {
      console.error("Error during computation:", error);
      alert(
        "An error occurred while computing the solution. Please check the console for details."
      );
    } finally {
      computeButton.disabled = false;
      computeButton.textContent = "Compute";
    }
  }

  handleEdit(e) {
    const { type, id } = e.detail;
    const isNew = id === undefined;
    const itemData = this.getItemData(type, id, isNew);
    const title = this.getFormTitle(type, itemData.displayName, isNew);

    if (type === "product") {
      this.openProductModal(itemData, title, type, id);
    } else {
      const formContent = this.renderForm(type, itemData, title);
      const modal = this.shadowRoot.getElementById("edit-modal");
      modal.open(formContent);

      const form = modal.contentElement.querySelector(".modal-form");
      form.addEventListener("submit", (event) => {
        event.preventDefault();
        this.saveForm(event.target, type, id);
        modal.close();
      });
    }
  }

  openProductModal(itemData, title, type, id) {
    const modal = this.shadowRoot.getElementById("edit-modal");
    const formContent = this.renderProductForm(itemData, title);
    modal.open(formContent);

    const form = modal.contentElement.querySelector(".modal-form");
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      this.saveForm(event.target, type, id);
      modal.close();
    });

    // Add listener for adding a BOM item
    const addBomButton = modal.contentElement.querySelector(
      ".add-bom-item button"
    );
    if (addBomButton) {
      addBomButton.addEventListener("click", () => {
        const select = modal.contentElement.querySelector(".add-bom-select");
        const componentName = select.value;
        if (componentName) {
          itemData.bill_of_materials[componentName] = 1; // Default quantity to 1
          this.openProductModal(itemData, title, type, id); // Re-render modal
        }
      });
    }

    // Add listeners for removing BOM items
    const removeBomButtons = modal.contentElement.querySelectorAll(
      ".remove-bom-item-button"
    );
    removeBomButtons.forEach((button) => {
      button.addEventListener("click", (e) => {
        const componentName = e.target.dataset.componentName;
        delete itemData.bill_of_materials[componentName];
        this.openProductModal(itemData, title, type, id); // Re-render modal
      });
    });
  }

  getItemData(type, id, isNew) {
    if (isNew) {
      return this.getNewItem(type);
    }
    const data = store.getState();
    const collection = data[type + "s"];
    const item = { ...collection.find((item) => item.id === id) };
    if (type === "product") {
      item.bill_of_materials = { ...item.bill_of_materials };
    }
    return item;
  }

  getNewItem(type) {
    if (type === "component") {
      return { displayName: "", stock: 0, cost: 0 };
    }
    if (type === "product") {
      return {
        displayName: "",
        selling_price: 0,
        sales_mix_ratio: 1,
        bill_of_materials: {},
        product_rating: 0,
        is_focus_item: false,
        sales_velocity: 0,
      };
    }
    return {};
  }

  getFormTitle(type, name, isNew) {
    const typeName = type.charAt(0).toUpperCase() + type.slice(1);
    if (isNew) {
      return `Add New ${typeName}`;
    }
    return `Edit ${name}`;
  }

  renderForm(type, itemData, title) {
    if (type === "component") {
      return this.renderComponentForm(itemData, title);
    }
    if (type === "product") {
      return this.renderProductForm(itemData, title);
    }
    return "";
  }

  handleDeleteRequest(e) {
    const { type, id } = e.detail;
    const data = store.getState();
    const collection =
      type === "product" ? data.products : data.components;
    const item = collection.find((i) => i.id === id);
    if (!item) return;

    const modal = this.shadowRoot.getElementById("confirm-modal");

    const content = `
        <p id="confirm-message">Are you sure you want to delete <strong>${item.displayName}</strong>?</p>
        <div class="form-actions">
            <button class="cancel-button button">Cancel</button>
            <button id="confirm-delete-button" class="button danger">Delete</button>
        </div>
    `;
    modal.open(content);

    modal.contentElement
      .querySelector("#confirm-delete-button")
      .addEventListener("click", () => {
        const newCollection = collection.filter((i) => i.id !== id);
        if (type === "product") {
          store.setState({ ...data, products: newCollection });
        } else {
          store.setState({ ...data, components: newCollection });
        }
        modal.close();
      });
  }

  saveForm(form, type, id) {
    const formData = new FormData(form);
    const isNew = id === undefined;
    const data = store.getState();

    if (type === "component") {
      const updatedItem = new Component({
        id: isNew ? undefined : id,
        displayName: formData.get("displayName"),
        stock: parseFloat(formData.get("stock")),
        cost: parseFloat(formData.get("cost")),
      });
      const newComponents = isNew
        ? [...data.components, updatedItem]
        : data.components.map((c) => (c.id === id ? updatedItem : c));
      store.setState({ ...data, components: newComponents });
    } else if (type === "product") {
      const bill_of_materials = {};
      const bomInputs = form.querySelectorAll('[name^="bom_"]');
      bomInputs.forEach((input) => {
        const componentName = input.name.replace("bom_", "");
        bill_of_materials[componentName] = parseFloat(input.value);
      });

      const updatedItem = new Product({
        id: isNew ? undefined : id,
        displayName: formData.get("displayName"),
        selling_price: parseFloat(formData.get("selling_price")),
        sales_mix_ratio: parseFloat(formData.get("sales_mix_ratio")),
        product_rating: parseFloat(formData.get("product_rating")),
        is_focus_item: formData.has("is_focus_item"),
        sales_velocity: parseFloat(formData.get("sales_velocity")),
        bill_of_materials,
      });
      const newProducts = isNew
        ? [...data.products, updatedItem]
        : data.products.map((p) => (p.id === id ? updatedItem : p));
      store.setState({ ...data, products: newProducts });
    }
  }

  renderComponentForm(component, title) {
    return `
          <form class="modal-form">
              <h3>${title}</h3>
              <div class="form-group"><label>Name</label><input name="displayName" type="text" value="${
                component.displayName
              }" required></div>
              <div class="form-group"><label>Stock</label><input name="stock" type="number" value="${
                component.stock
              }"></div>
              <div class="form-group"><label>Cost</label><input name="cost" type="number" step="0.01" value="${
                component.cost
              }"></div>
              <div class="form-actions"><button type="button" class="cancel-button button">Cancel</button><button type="submit" class="button primary">Save</button></div>
          </form>
      `;
  }

  renderProductForm(product, title) {
    const data = store.getState();
    const componentNameMap = new Map(
      data.components.map((c) => [c.name, c.displayName])
    );
    const bomItemsHtml = Object.entries(product.bill_of_materials)
      .map(
        ([name, value]) => `
          <div class="bom-item">
              <span>${componentNameMap.get(name) || name}</span>
              <input type="number" name="bom_${name}" value="${value}" min="0" step="any">
              <button type="button" class="remove-bom-item-button text-button danger" data-component-name="${name}">✕</button>
          </div>`
      )
      .join("");

    const availableComponents = data.components.filter(
      (c) => !product.bill_of_materials.hasOwnProperty(c.name)
    );
    const optionsHtml = availableComponents
      .map((c) => `<option value="${c.name}">${c.displayName}</option>`)
      .join("");

    return `
          <form class="modal-form">
              <h3>${title}</h3>
              <div class="form-group"><label>Name</label><input name="displayName" type="text" value="${
                product.displayName
              }" required></div>
              <div class="form-group"><label>Selling Price</label><input name="selling_price" type="number" step="0.01" value="${
                product.selling_price
              }"></div>
              <div class="form-group"><label>Sales Mix Ratio</label><input name="sales_mix_ratio" type="number" value="${
                product.sales_mix_ratio
              }"></div>
              <div class="form-group"><label>Product Rating</label><input name="product_rating" type="number" value="${
                product.product_rating
              }"></div>
              <div class="form-group"><label>Sales Velocity</label><input name="sales_velocity" type="number" value="${
                product.sales_velocity
              }"></div>
              <div class="form-group">
                <label class="checkbox-label" for="is_focus_item">Is Focus Item</label>
                <input name="is_focus_item" type="checkbox" ${
                  product.is_focus_item ? "checked" : ""
                }>
              </div>
              <h4>Bill of Materials</h4>
              <div id="bom-items-container">${bomItemsHtml}</div>
              ${
                availableComponents.length > 0
                  ? `
              <div class="add-bom-item">
                  <select class="add-bom-select" style="flex-grow:1;"><option value="">-- Add component --</option>${optionsHtml}</select>
                  <button type="button" class="button">Add</button>
              </div>`
                  : ""
              }
              <div class="form-actions"><button type="button" class="cancel-button button">Cancel</button><button type="submit" class="button primary">Save</button></div>
          </form>
      `;
  }

  render() {
    const data = store.getState();
    this.shadowRoot.innerHTML = `
      <style>
          .container {display: flex; width: 100%; align-items: start; justify-content: center; gap: 1rem;}
          h1 { font-weight: 500; border-bottom: 1px solid #dee2e6; padding-bottom: 0.5rem; margin-top: 0; }
          #compute { 
            display: block;
            width: 100%;
            padding: 0.8em; 
            border: none; 
            background-color:rgb(0, 0, 0); 
            color: white; 
            border-radius: 5px; 
            cursor: pointer; 
            font-size: 1em; 
            margin: 2rem 0;
            font-weight: 500;
          }
          #compute:disabled {
            background-color: #6c757d;
            cursor: not-allowed;
          }
      </style>

      <section class="container">
        <div>
          <h1>RetailerKit</h1>
          <general-parameters></general-parameters>
          <button id="compute">Compute</button>
          <component-list></component-list>
          <product-list></product-list>
        </div>
        <div>
          <solution-analysis></solution-analysis>
        </div>
      </section>

      <modal-component id="edit-modal"></modal-component>
      <modal-component id="confirm-modal"></modal-component>
    `;

    this.shadowRoot
      .getElementById("compute")
      .addEventListener("click", () => this.handleCompute());

    this.shadowRoot.querySelector("general-parameters").data =
      data.general_parameters;
    this.shadowRoot.querySelector("component-list").data = {
      components: data.components,
      allData: data,
    };
    this.shadowRoot.querySelector("product-list").data = {
      products: data.products,
      components: data.components,
      allData: data,
    };
    this.shadowRoot.querySelector("solution-analysis").data = {
      ...chartData,
      products: data.products,
    };
  }
}
