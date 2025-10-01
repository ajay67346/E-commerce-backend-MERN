const Users = require("../models/userModel");

const authAdmin = async (req, res, next) => {
  try {
    const user = await Users.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.role === 0)
      return res.status(403).json({ message: "This action is restricted to admin users only." });
    next();
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

module.exports = authAdmin;
