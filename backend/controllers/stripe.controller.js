// controllers/stripe.controller.js
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const methods = {
  /**
   * Create a Stripe Product
   */
  createProduct: async (req, res) => {
    try {
      const { name, description } = req.body;

      if (!name) {
        return res.status(400).json({ error: "Product name is required" });
      }

      const product = await stripe.products.create({
        name,
        description,
      });

      res.json({
        success: true,
        product,
      });
    } catch (error) {
      console.error("Error creating product:", error.message);
      res.status(500).json({ error: error.message });
    }
  },

  createPrice: async (req, res) => {
    try {
      const { productId, unitAmount, currency, interval,name } = req.body;

      if (!productId || !unitAmount || !currency || !interval) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const price = await stripe.prices.create({
        currency,
        unit_amount: unitAmount,
        recurring: {
          interval: interval,
        },
        product:productId,
        // product_data: {
        //   id: productId,
        //   name:name
        // },
      });

      res.json({
        success: true,
        price,
      });
    } catch (error) {
                console.log("ERRORRRR",error)

      console.error("Error creating price:", error.message);
      res.status(500).json({ error: error.message });
    }
  },

  updatePrice: async (req, res) => {
    try {
      const { priceId, metadata } = req.body;

      if (!priceId || !metadata) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const updatedPrice = await stripe.prices.update(priceId, {
        metadata,
      });

      res.json({
        success: true,
        updatedPrice,
      });
    } catch (error) {
        console.log("ERROR",error)
      console.error("Error updating price:", error.message);
      res.status(500).json({ error: error.message });
    }
  },
};


module.exports = methods;
