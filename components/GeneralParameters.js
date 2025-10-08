import { store } from "../store.js";

export class GeneralParameters extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._localData = null;
  }

  set data(newData) {
    this._data = newData;
    if (newData) {
      this._localData = JSON.parse(JSON.stringify(newData));
      this._localData.model_type = "production_planning_adv";
    }
    this.render();
  }

  get data() {
    return this._data;
  }

  connectedCallback() {
    if (!this.shadowRoot.innerHTML) {
      this.render();
    }
  }

  handleSave() {
    const currentState = store.getState();
    store.setState({ ...currentState, general_parameters: this._localData });

    const saveButton = this.shadowRoot.getElementById("save-button");
    if (saveButton) {
      saveButton.textContent = "Saved!";
      setTimeout(() => {
        saveButton.textContent = "Save Changes";
      }, 1500);
    }
  }

  render() {
    if (!this._localData) return;

    const advancedParameters = `
          <div class="form-group">
            <label for="w_profit">Weight Profit</label>
            <input type="number" step="0.1" id="w_profit" value="${this._localData.w_profit}">
          </div>
          <div class="form-group">
            <label for="w_rating">Weight Rating</label>
            <input type="number" step="0.1" id="w_rating" value="${this._localData.w_rating}">
          </div>
          <div class="form-group">
            <label for="w_focus">Weight Focus</label>
            <input type="number" step="0.1" id="w_focus" value="${this._localData.w_focus}">
          </div>
          <div class="form-group">
            <label for="w_velocity">Weight Velocity</label>
            <input type="number" step="0.1" id="w_velocity" value="${this._localData.w_velocity}">
          </div>
          <div class="form-group">
            <label for="lowerbound_score_multiplier">Lowerbound Score Multiplier</label>
            <input type="number" step="0.01" id="lowerbound_score_multiplier" value="${this._localData.lowerbound_score_multiplier}">
          </div>
        `;

    this.shadowRoot.innerHTML = `
      <style>
          h3 { font-weight: 500; border-bottom: 1px solid #dee2e6; padding-bottom: 0.5em; margin-top: 2em; margin-bottom: 1em; display: flex; justify-content: space-between; align-items: center; }
          .form-group { margin-bottom: 1em; display: flex; align-items: center; justify-content: space-between; }
          .form-group label { margin-bottom: 0; font-weight: 500; font-size: 0.9em; color: #495057; }
          .form-group input, .form-group select { width: 50%; padding: 0.5em; box-sizing: border-box; border: 1px solid #ced4da; border-radius: 4px; font-family: inherit; font-size: inherit; }
          .form-group input[type="checkbox"] { width: auto; }
      </style>
      <section>
          <h3>General Parameters</h3>
          <div class="form-group">
              <label for="max_production">Max Production</label>
              <input type="number" id="max_production" value="${
                this._localData.max_production
              }">
          </div>
          <div class="form-group">
              <label for="enforce_sales_mix">Enforce Sales Mix</label>
              <input type="checkbox" id="enforce_sales_mix" ${
                this._localData.enforce_sales_mix ? "checked" : ""
              }>
          </div>
          
          ${advancedParameters}

          <button id="save-button">Save Changes</button>
      </section>
    `;

    this.shadowRoot
      .getElementById("save-button")
      .addEventListener("click", () => this.handleSave());

    this.shadowRoot.querySelectorAll("input").forEach((el) => {
      el.addEventListener("change", (e) => {
        const { id, type, checked, value } = e.target;

        this._localData[id] =
          type === "checkbox" ? checked : parseFloat(value) || value;
      });
    });
  }
}
