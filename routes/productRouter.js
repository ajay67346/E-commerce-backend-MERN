const router = require("express").Router();
const productCtrl = require("../controllers/productCtrl");
const authAdmin = require("../middleware/authAdmin");
const auth = require("../middleware/auth");

router
  .route("/products")
  .get(productCtrl.getProducts)
  .post(auth, authAdmin, productCtrl.createProducts);

router
  .route("/products/:id")
  .delete(auth, authAdmin, productCtrl.deleteProduct)
  .put(auth, authAdmin, productCtrl.updateProduct);

module.exports = router;
