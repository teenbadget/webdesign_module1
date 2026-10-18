const { randomUUID } = require("node:crypto");
const orderStore = require("../store/order-store");

const DEFAULT_ORDER_STATUS = "created";

function roundMoney(value) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function calculateTotal(items) {
  return roundMoney(
    items.reduce((sum, item) => sum + item.quantity * item.price, 0),
  );
}

function validateCreateOrder(body) {
  const problems = [];

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    problems.push("Request body must be a JSON object");
    return problems;
  }

  if (
    typeof body.customerName !== "string" ||
    body.customerName.trim().length === 0
  ) {
    problems.push("customerName is required");
  }

  if (!Array.isArray(body.items) || body.items.length === 0) {
    problems.push("At least one item is required");
    return problems;
  }

  body.items.forEach((item, index) => {
    if (!item || typeof item !== "object" || Array.isArray(item)) {
      problems.push(`items[${index}] must be an object`);
      return;
    }

    if (typeof item.name !== "string" || item.name.trim().length === 0) {
      problems.push(`items[${index}].name is required`);
    }

    if (
      typeof item.quantity !== "number" ||
      !Number.isFinite(item.quantity) ||
      item.quantity <= 0
    ) {
      problems.push(`items[${index}].quantity must be greater than zero`);
    }

    if (
      typeof item.price !== "number" ||
      !Number.isFinite(item.price) ||
      item.price <= 0
    ) {
      problems.push(`items[${index}].price must be greater than zero`);
    }
  });

  return problems;
}

function normalizeItems(items) {
  return items.map((item) => ({
    name: item.name.trim(),
    quantity: item.quantity,
    price: item.price,
  }));
}

// Keep the public representation separate from the stored record.
function toOrderResponse(order) {
  return {
    id: order.id,
    customerName: order.customerName,
    items: order.items.map((item) => ({
      name: item.name,
      quantity: item.quantity,
      price: item.price,
    })),
    total: order.total,
    status: order.status,
  };
}

function createOrder(body) {
  const validationErrors = validateCreateOrder(body);
  if (validationErrors.length > 0) {
    return { ok: false, validationErrors };
  }

  const items = normalizeItems(body.items);
  const order = {
    id: `ord-${randomUUID().slice(0, 8)}`,
    customerName: body.customerName.trim(),
    items,
    total: calculateTotal(items),
    status: DEFAULT_ORDER_STATUS,
  };

  orderStore.add(order);
  return { ok: true, order: toOrderResponse(order) };
}

function listOrders() {
  const orders = orderStore.getAll().map(toOrderResponse);
  return { orders, count: orders.length };
}

function getOrder(id) {
  const order = orderStore.findById(id);
  return order ? toOrderResponse(order) : null;
}

function deleteOrder(id) {
  return orderStore.removeById(id);
}

module.exports = {
  createOrder,
  deleteOrder,
  getOrder,
  listOrders,
  validateCreateOrder,
};
