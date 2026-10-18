const { test } = require("node:test");
const assert = require("node:assert/strict");
const ordersService = require("../src/services/orders-service");

test("service rejects invalid order values", () => {
  assert.deepEqual(ordersService.validateCreateOrder(null), [
    "Request body must be a JSON object",
  ]);
  assert.deepEqual(
    ordersService.validateCreateOrder({
      customerName: "Alex",
      items: [{ name: "Keyboard", quantity: 0, price: -1 }],
    }),
    [
      "items[0].quantity must be greater than zero",
      "items[0].price must be greater than zero",
    ],
  );
});

test("service creates, lists, retrieves and deletes an order", () => {
  const result = ordersService.createOrder({
    customerName: "  Alex  ",
    total: 1,
    status: "paid",
    items: [
      { name: " Keyboard ", quantity: 1, price: 120 },
      { name: "Cable", quantity: 2, price: 7.25 },
    ],
  });

  assert.equal(result.ok, true);
  assert.match(result.order.id, /^ord-/);
  assert.equal(result.order.customerName, "Alex");
  assert.equal(result.order.items[0].name, "Keyboard");
  assert.equal(result.order.total, 134.5);
  assert.equal(result.order.status, "created");
  assert.deepEqual(Object.keys(result.order).sort(), [
    "customerName",
    "id",
    "items",
    "status",
    "total",
  ]);

  const listed = ordersService.listOrders();
  assert.equal(listed.count, 1);
  assert.equal(listed.orders[0].id, result.order.id);
  assert.deepEqual(ordersService.getOrder(result.order.id), result.order);
  assert.equal(ordersService.deleteOrder(result.order.id), true);
  assert.equal(ordersService.getOrder(result.order.id), null);
  assert.equal(ordersService.deleteOrder(result.order.id), false);
});
