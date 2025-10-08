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
  products: [
    {
      name: "Coffee",
      selling_price: 3.0,
      sales_mix_ratio: 1,
      bill_of_materials: { Coffee_Inv: 1, Cake_Slice_Inv: 0 },
      product_rating: 8,
      is_focus_item: false,
      sales_velocity: 3,
    },
    {
      name: "Cake_Slice",
      selling_price: 4.0,
      sales_mix_ratio: 1,
      bill_of_materials: { Coffee_Inv: 0, Cake_Slice_Inv: 1 },
      product_rating: 7,
      is_focus_item: false,
      sales_velocity: 3,
    },
    {
      name: "Morning_Deal",
      selling_price: 6.5,
      sales_mix_ratio: 1,
      bill_of_materials: { Coffee_Inv: 1, Cake_Slice_Inv: 1 },
      product_rating: 10,
      is_focus_item: true,
      sales_velocity: 10,
    },
  ],
  components: [
    { name: "Coffee_Inv", available: 100, cost: 0.5 },
    { name: "Cake_Slice_Inv", available: 50, cost: 1.0 },
  ],
};

const chartData = {
  solutions: [
    {
      production_plan: { Coffee: 54, Cake_Slice: 4, Morning_Deal: 46 },
      financial_summary: {
        gross_profit: 377,
        total_revenue: 477,
        total_cogs: 100,
      },
      strategic_summary: {
        total_rating_score: 920,
        total_focus_score: 46,
        total_velocity_score: 634,
        total_value_score: 5423.8,
      },
    },
    {
      production_plan: { Coffee: 53, Cake_Slice: 3, Morning_Deal: 47 },
      financial_summary: {
        gross_profit: 376.5,
        total_revenue: 476.5,
        total_cogs: 100,
      },
      strategic_summary: {
        total_rating_score: 915,
        total_focus_score: 47,
        total_velocity_score: 638,
        total_value_score: 5434.1,
      },
    },
    {
      production_plan: { Coffee: 52, Cake_Slice: 2, Morning_Deal: 48 },
      financial_summary: {
        gross_profit: 376,
        total_revenue: 476,
        total_cogs: 100,
      },
      strategic_summary: {
        total_rating_score: 910,
        total_focus_score: 48,
        total_velocity_score: 642,
        total_value_score: 5444.4,
      },
    },
    {
      production_plan: { Coffee: 51, Cake_Slice: 1, Morning_Deal: 49 },
      financial_summary: {
        gross_profit: 375.5,
        total_revenue: 475.5,
        total_cogs: 100,
      },
      strategic_summary: {
        total_rating_score: 905,
        total_focus_score: 49,
        total_velocity_score: 646,
        total_value_score: 5454.7,
      },
    },
    {
      production_plan: { Coffee: 50, Cake_Slice: 0, Morning_Deal: 50 },
      financial_summary: {
        gross_profit: 375,
        total_revenue: 475,
        total_cogs: 100,
      },
      strategic_summary: {
        total_rating_score: 900,
        total_focus_score: 50,
        total_velocity_score: 650,
        total_value_score: 5465,
      },
    },
  ],
};

class Store {
  constructor() {
    this.listeners = new Set();
    this.state = this._loadState();
  }

  _loadState() {
    const savedState = localStorage.getItem("productionPlan");
    if (savedState) {
      const parsed = JSON.parse(savedState);
      return {
        general_parameters: parsed.general_parameters,
        products: parsed.products.map((p) => new Product(p)),
        components: parsed.components.map((c) => new Component(c)),
      };
    }
    return {
      general_parameters: rawInitialState.general_parameters,
      products: rawInitialState.products.map((p) => new Product(p)),
      components: rawInitialState.components.map(
        (c) => new Component({ name: c.name, cost: c.cost, stock: c.available })
      ),
    };
  }

  _saveState() {
    localStorage.setItem("productionPlan", JSON.stringify(this.state, null, 2));
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
