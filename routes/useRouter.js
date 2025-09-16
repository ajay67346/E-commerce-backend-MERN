const userCtrl = require("../controllers/userCtrl");
const router = require("express").Router();
const auth = require("../middleware/auth");

router.post("/register", userCtrl.register);
router.post("/login", userCtrl.login);
router.post("/logout", userCtrl.logout);
router.post("/refresh_token", userCtrl.refreshtoken);
router.get("/infor", auth, userCtrl.getUser);

module.exports = router;
