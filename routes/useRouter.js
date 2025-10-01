const userCtrl = require("../controllers/userCtrl");
const GetAllUserCtrl = require("../controllers/getAllUserCtrl");
const router = require("express").Router();
const auth = require("../middleware/auth");
const authAdmin = require("../middleware/authAdmin");

router.post("/register", userCtrl.register);
router.post("/login", userCtrl.login);
router.post("/logout", userCtrl.logout);
router.post("/refresh_token", userCtrl.refreshtoken);
router.get("/profile", auth, userCtrl.getUser); // Logged-in user’s own profile
router.get("/profile/:id", auth, authAdmin, userCtrl.getUserById); // Admin only
router.get("/members", auth, GetAllUserCtrl.getAllUsers);

module.exports = router;
                                             















