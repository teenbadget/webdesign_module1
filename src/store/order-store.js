// Process-local storage. Data intentionally resets when the process restarts.
const orders = [];

function add(order) {
  orders.push(order);
  return order;
}

function findById(id) {
  return orders.find((order) => order.id === id) || null;
}

function getAll() {
  return orders;
}

function removeById(id) {
  const index = orders.findIndex((order) => order.id === id);
  if (index === -1) return false;

  orders.splice(index, 1);
  return true;
}

module.exports = { add, findById, getAll, removeById };
