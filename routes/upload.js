const router = require("express").Router();
const uploadCtrl = require("../controllers/uploadCtrl");

// POST /api/upload
router.post("/upload", uploadCtrl.uploadImage);

// DELETE /api/destroy
router.post("/destroy", uploadCtrl.deleteImage);

module.exports = router;
