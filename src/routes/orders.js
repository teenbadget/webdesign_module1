const express = require("express");
const ordersService = require("../services/orders-service");

const router = express.Router();

function validationProblem(message, details) {
  return {
    error: {
      code: "VALIDATION_ERROR",
      message,
      details,
    },
  };
}

function notFoundProblem() {
  return {
    error: {
      code: "ORDER_NOT_FOUND",
      message: "Order not found",
    },
  };
}

router.post("/", (req, res) => {
  const result = ordersService.createOrder(req.body);

  if (!result.ok) {
    return res
      .status(400)
      .json(validationProblem("Invalid order", result.validationErrors));
  }

  return res
    .status(201)
    .location(`/orders/${result.order.id}`)
    .json(result.order);
});

router.get("/", (req, res) => {
  res.status(200).json(ordersService.listOrders());
});

router.get("/:id", (req, res) => {
  const order = ordersService.getOrder(req.params.id);
  if (!order) return res.status(404).json(notFoundProblem());

  return res.status(200).json(order);
});

router.delete("/:id", (req, res) => {
  const deleted = ordersService.deleteOrder(req.params.id);
  if (!deleted) return res.status(404).json(notFoundProblem());

  return res.status(204).send();
});

module.exports = router;
