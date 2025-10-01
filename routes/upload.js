const router = require("express").Router();
const uploadCtrl = require("../controllers/uploadCtrl");
const auth = require("../middleware/auth");
const authAdmin = require("../middleware/authAdmin");

// POST /api/upload
router.post("/upload", auth, authAdmin, uploadCtrl.uploadImage);

// DELETE /api/destroy
router.post("/destroy", auth, authAdmin, uploadCtrl.deleteImage);

module.exports = router;
