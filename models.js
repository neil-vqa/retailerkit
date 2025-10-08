export class Component {
  constructor({ name, cost, stock }) {
    this.name = name;
    this.cost = cost;
    this.stock = stock;
  }
}

export class Product {
  constructor({
    name,
    selling_price,
    sales_mix_ratio,
    bill_of_materials,
    product_rating,
    is_focus_item,
    sales_velocity,
  }) {
    this.name = name;
    this.selling_price = selling_price;
    this.sales_mix_ratio = sales_mix_ratio;
    this.bill_of_materials = bill_of_materials;
    this.product_rating = product_rating;
    this.is_focus_item = is_focus_item;
    this.sales_velocity = sales_velocity;
  }
}
