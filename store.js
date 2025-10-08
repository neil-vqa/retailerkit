import { Product, Component } from "./models.js";

const rawInitialState = {
  general_parameters: {
    max_production: 100,
    enforce_sales_mix: false,
    model_type: "production_planning_adv",
    w_profit: 1,
    w_rating: 2,
    w_focus: 0.8,
    w_velocity: 5,
    lowerbound_score_multiplier: 0.95,
    lowerbound_profit_multiplier: 0.8,
  },
  products: [],
  components: [],
};

const chartData = {
  solutions: [],
};

class Store {
  constructor() {
    this.listeners = new Set();
    this.state = this._loadState();
  }

  _loadState() {
    const savedGeneralParameters = localStorage.getItem(
      "productionPlan_general_parameters"
    );
    const savedProducts = localStorage.getItem("productionPlan_products");
    const savedComponents = localStorage.getItem("productionPlan_components");

    const general_parameters = savedGeneralParameters
      ? JSON.parse(savedGeneralParameters)
      : rawInitialState.general_parameters;

    const products = savedProducts
      ? JSON.parse(savedProducts).map((p) => new Product(p))
      : rawInitialState.products.map((p) => new Product(p));

    const components = savedComponents
      ? JSON.parse(savedComponents).map((c) => new Component(c))
      : rawInitialState.components.map(
          (c) =>
            new Component({ name: c.name, cost: c.cost, stock: c.available })
        );

    return { general_parameters, products, components };
  }

  _saveState() {
    localStorage.setItem(
      "productionPlan_general_parameters",
      JSON.stringify(this.state.general_parameters, null, 2)
    );
    localStorage.setItem(
      "productionPlan_products",
      JSON.stringify(this.state.products, null, 2)
    );
    localStorage.setItem(
      "productionPlan_components",
      JSON.stringify(this.state.components, null, 2)
    );
  }

  _notify() {
    for (const listener of this.listeners) {
      listener();
    }
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  getState() {
    return this.state;
  }

  setState(newState) {
    this.state = { ...this.state, ...newState };
    this._saveState();
    this._notify();
  }
}

const store = new Store();

export { store, chartData };
