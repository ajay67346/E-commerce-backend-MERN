const userCtrl = require("../controllers/userCtrl");
const GetAllUserCtrl = require("../controllers/getAllUserCtrl");
const router = require("express").Router();
const auth = require("../middleware/auth");
const authAdmin = require("../middleware/authAdmin");
const authVendor = require("../middleware/authVendor");

router.post("/register", userCtrl.register);
router.post("/login", userCtrl.login);
router.post("/logout", userCtrl.logout);
router.post("/refresh_token", userCtrl.refreshtoken);

router.get("/profileByAdmin/:id", auth, authAdmin, userCtrl.getUserByAdmin);
router.get("/profileByVendor/:id", auth, authVendor, userCtrl.getUserByVendor);

router.get("/membersByAdmin", auth, authAdmin, GetAllUserCtrl.getAllUsers);
router.get("/membersByVendor", auth, authVendor, GetAllUserCtrl.getAllUsers);

module.exports = router;
