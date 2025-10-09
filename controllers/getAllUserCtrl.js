const Users = require("../models/userModel");
const APIfeatures = require("../utils/apiFeatures");
const { respondSuccess, respondError } = require("../utils/featuresResponse");

const getAllUserCtrl = {
  getAllUsers: async (req, res) => {
    try {
      const currentUser = await Users.findById(req.user.id);

      if (!currentUser) {
        return respondError(res, 401, {
          message: "Unauthorized. User not found.",
        });
      }

      let query;

      // filtering according to role
      if (currentUser.role === "user") {
        return respondError(res, 403, {
          message: "Access denied. Users are not allowed to view user list.",
        });
      } else if (currentUser.role === "vendor") {
        // Vendor only can see role 'user'
        query = Users.find({ role: "user" });
      } else if (currentUser.role === "admin") {
        // Admin can see all
        query = Users.find();
      } else {
        return respondError(res, 403, {
          message: "Access denied. Invalid role.",
        });
      }

      //Apply Filters, sort, pagination
      const features = new APIfeatures(query, req.query)
        .filtering()
        .sorting()
        .paginating()
        .fieldLimiting();

      const users = await features.query;
      const total = await Users.countDocuments(features.query._conditions);

      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.size) || 10;
      const totalPages = Math.ceil(total / limit);
      const hasMore = page < totalPages;

      if (page > totalPages && total !== 0) {
        return respondError(res, 404, {
          message: `Page ${page} not found. Only ${totalPages} pages available.`,
          extra: {
            data: { users: [], count: 0 },
            pagination: {
              currentPage: page,
              Size: limit,
              total,
              totalPages,
              hasMore: false,
              
            },
          },
        });
      }

      // Format users before sending
      const formattedUsers = users.map((user) => ({
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      }));

      return respondSuccess(
        res,
        200,
        "Users fetched successfully",
        formattedUsers,
        {
          pagination: {
            currentPage: page,
            Size: limit,
            total,
            totalPages,
            hasMore,
            
          },
        }
      );
    } catch (err) {
      console.error("Get all users error:", err);
      return respondError(res, 500, {
        message: "Failed to fetch users. Please try again later.",
        details: err.message,
      });
    }
  },
};

module.exports = getAllUserCtrl;
