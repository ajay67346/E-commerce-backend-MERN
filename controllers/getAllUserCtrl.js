const Users = require("../models/userModel");
const APIfeatures = require("../utils/apiFeatures");
const { respondSuccess, respondError } = require("../utils/featuresResponse");

const getAllUserCtrl = {
  getAllUsers: async (req, res) => {
    try {
      const features = new APIfeatures(Users.find(), req.query)
        .filtering()
        .sorting()
        .paginating()
        .fieldLimiting();

      const users = await features.query;
      const total = await Users.countDocuments(features.query._conditions);

      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const totalPages = Math.ceil(total / limit);
      const hasMore = page < totalPages;

      if (page > totalPages && total !== 0) {
        return respondError(res, 404, {
          message: `Page ${page} not found. Only ${totalPages} pages available.`,
          details: null,
          extra: {
            data: { users: [], count: 0 },
            pagination: {
              currentPage: page,
              Size: limit,
              total,
              totalPages,
              hasMore: false,
              filtersApplied: req.query,
            },
          },
        });
      }

      const formattedUsers = users.map((user) => ({
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role === 1 ? "admin" : "user",
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
            filtersApplied: req.query,
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
