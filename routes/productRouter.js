const router = require("express").Router();
const productCtrl = require("../controllers/productCtrl");
const authAdmin = require("../middleware/authAdmin");
const auth = require("../middleware/auth");
const authVendor = require("../middleware/authVendor");

router.get("/products", productCtrl.getProducts);
router.get("/products/:id", productCtrl.getProductById);

router.post("/productsByAdmin", auth, authAdmin, productCtrl.createProducts);
router.delete("/productsByAdmin/:id",auth, authAdmin, productCtrl.deleteProduct)
router.put("/productsByAdmin/:id",auth, authAdmin, productCtrl.updateProduct)


router.post("/productsByVendor", auth, authVendor, productCtrl.createProducts);
router.delete("/productsByVendor/:id",auth, authVendor, productCtrl.deleteProduct)
router.put("/productsByVendor/:id",auth, authVendor, productCtrl.updateProduct)

module.exports = router;
