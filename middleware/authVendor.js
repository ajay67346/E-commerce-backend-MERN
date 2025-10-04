const Users = require("../models/userModel");

const authVendor = async (req, res, next) => {
  try {
    const user = await Users.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.role !== "vendor")
      return res
        .status(403)
        .json({ message: "This action is restricted to vendor users only." });

    next();
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

module.exports = authVendor;
