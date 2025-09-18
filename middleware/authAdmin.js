const Users = require("../models/userModel");

const authAdmin = async (req, res, next) => {
  try {
    const user = await Users.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: "User not found" });
    if (user.role === 0)
      return res.status(403).json({ msg: "Admin resources access denied" });
    next();
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
};

module.exports = authAdmin;
