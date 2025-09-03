const express = require("express");
const router = express.Router();
const stripeController = require("../controllers/stripe.controller");

router.post("/product", stripeController.createProduct);
router.post("/price", stripeController.createPrice);
router.patch("/price", stripeController.updatePrice);




module.exports = router;
