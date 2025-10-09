const userCtrl = require("../controllers/userCtrl");
const GetAllUserCtrl = require("../controllers/getAllUserCtrl");
const router = require("express").Router();
const auth = require("../middleware/auth");

router.post("/register", userCtrl.register);
router.post("/login", userCtrl.login);
router.post("/logout", userCtrl.logout);
router.post("/refresh_token", userCtrl.refreshtoken);

router.get("/profile/:id", auth, userCtrl.getUserProfile);

router.get("/members", auth, GetAllUserCtrl.getAllUsers);

module.exports = router;
