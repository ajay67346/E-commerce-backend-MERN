const router = require("express").Router();
const productCtrl = require("../controllers/productCtrl");
const authAdmin = require("../middleware/authAdmin");
const auth = require("../middleware/auth");
const authVendor = require("../middleware/authVendor");

router.get("/products", productCtrl.getProducts);
router.get("/products/:id", productCtrl.getProductById);
router.post("/products", auth, productCtrl.createProducts);
router.put("/products/:id", auth, productCtrl.updateProduct);
router.delete("/products/:id", auth, productCtrl.deleteProduct);

module.exports = router;
