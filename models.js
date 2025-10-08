export class Component {
  constructor({ id, name, cost, stock }) {
    const baseId = (id || crypto.randomUUID()).replaceAll("-", "");
    this.id = baseId.startsWith("component_")
      ? baseId
      : `component_${baseId}`;
    this.name = name;
    this.cost = cost;
    this.stock = stock;
  }
}

export class Product {
  constructor({
    id,
    name,
    selling_price,
    sales_mix_ratio,
    bill_of_materials,
    product_rating,
    is_focus_item,
    sales_velocity,
  }) {
    const baseId = (id || crypto.randomUUID()).replaceAll("-", "");
    this.id = baseId.startsWith("product_") ? baseId : `product_${baseId}`;
    this.name = name;
    this.selling_price = selling_price;
    this.sales_mix_ratio = sales_mix_ratio;
    this.bill_of_materials = bill_of_materials;
    this.product_rating = product_rating;
    this.is_focus_item = is_focus_item;
    this.sales_velocity = sales_velocity;
  }
}
