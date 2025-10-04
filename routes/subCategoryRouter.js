const router = require("express").Router();
const subCategoryCtrl = require("../controllers/subCategoryCtrl");
const auth = require("../middleware/auth");
const authAdmin = require("../middleware/authAdmin");

router
  .route("/subcategory")
  .post(auth, authAdmin, subCategoryCtrl.createSubCategory)
  .get(subCategoryCtrl.getSubCategories);

router
  .route("/subcategory/:id")
  .delete(auth, authAdmin, subCategoryCtrl.deleteSubCategory)
  .put(auth, authAdmin, subCategoryCtrl.updateSubCategory);

module.exports = router;
