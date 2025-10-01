const category = require("../models/categoryModels");
const APIfeatures = require("../utils/apiFeatures");
const { respondSuccess, respondError } = require("../utils/featuresResponse");

const categoryCtrl = {
  // GET ALL CATEGORIES WITH FILTERING, SORTING, PAGINATION, FIELD LIMITING

  getCategories: async (req, res) => {
    try {
      const features = new APIfeatures(
        category.find().populate("subcategories"),
        req.query
      )
        .filtering()
        .sorting()
        .paginating()
        .fieldLimiting();

      const categories = await features.query;
      const totalCategories = await category.countDocuments(
        features.query._conditions
      );

      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const total = Math.ceil(totalCategories / limit);
      const hasMore = page < total;

      if (page > total && totalCategories !== 0) {
        return respondError(res, 404, {
          message: `Page ${page} not found. Only ${total} pages available.`,
          details: null,
          extra: {
            data: { categories: [], count: 0 },
            pagination: {
              currentPage: page,
              Size: limit,
              totalCategories,
              total,
              hasMore: false,
              filtersApplied: req.query,
            },
          },
        });
      }

      return respondSuccess(
        res,
        200,
        "Categories fetched successfully",
        categories,
        {
          pagination: {
            currentPage: page,
            Size: limit,
            totalCategories,
            total,
            hasMore,
            filtersApplied: req.query,
          },
        }
      );
    } catch (err) {
      console.error("Get categories error:", err);
      return respondError(res, 500, {
        message: "Failed to fetch categories",
        details: err.message,
      });
    }
  },
  // GET SINGLE CATEGORY BY ID
  getSingleCategory: async (req, res) => {
    try {
      const { id } = req.params;

      const singleCategory = await category.findById(id);

      if (!singleCategory) {
        return res.status(404).json({
          status: "fail",
          code: 404,
          errorType: "NotFoundError",
          message: "Category not found.",
          categoryId: id,
        });
      }

      return res.status(200).json({
        status: "success",
        code: 200,
        message: "Category fetched successfully.",
        data: {
          id: singleCategory._id,
          name: singleCategory.name,
          createdAt: singleCategory.createdAt,
          updatedAt: singleCategory.updatedAt,
        },
      });
    } catch (err) {
      console.error("getSingleCategory error:", err);
      return res.status(500).json({
        status: "error",
        code: 500,
        errorType: "ServerError",
        message: "Server error while fetching category.",
        error: err.message,
      });
    }
  },

  //  CREATE NEW CATEGORY
  createCategory: async (req, res) => {
    try {
      const name = req.body?.name?.trim();

      // Validate input
      if (!name) {
        return res.status(400).json({
          status: "fail",
          code: 400,
          errorType: "ValidationError",
          message: "Category name is required and cannot be empty.",
        });
      }

      // Check if category already exists
      const existingCategory = await category.findOne({ name });
      if (existingCategory) {
        return res.status(409).json({
          status: "fail",
          code: 409,
          errorType: "ConflictError",
          message: "Category already exists.",
        });
      }

      // Create and save new category
      const newCategory = new category({ name });
      await newCategory.save();

      // Prepare sanitized data to return
      const responseData = {
        id: newCategory._id,
        name: newCategory.name,
      };

      return res.status(201).json({
        status: "success",
        code: 201,
        message: "Category created successfully.",
        data: responseData,
      });
    } catch (err) {
      console.error("createCategory error:", err);
      return res.status(500).json({
        status: "error",
        code: 500,
        errorType: "ServerError",
        message: "Server error while creating category.",
        error: err.message,
      });
    }
  }, //DELETE CATEGORY
  deleteCategory: async (req, res) => {
    try {
      const { id } = req.params;

      const deletedCategory = await category.findByIdAndDelete(id);

      if (!deletedCategory) {
        return res.status(404).json({
          status: "fail",
          code: 404,
          errorType: "NotFoundError",
          message: "Category not found.",
          
        });
      }

      return res.status(200).json({
        status: "success",
        code: 200,
        message: "Category deleted successfully.",
        data: {
          id: deletedCategory._id,
          name: deletedCategory.name,
        },
      });
    } catch (err) {
      console.error("deleteCategory error:", err);
      return res.status(500).json({
        status: "error",
        code: 500,
        errorType: "ServerError",
        message: "Server error while deleting category.",
        error: err.message,
      });
    }
  },
  // UPDATE CATEGORY
  updateCategory: async (req, res) => {
    try {
      const { id } = req.params;
      const { name } = req.body;

      // Validate input
      if (!name || !name.trim()) {
        return res.status(400).json({
          status: "fail",
          code: 400,
          errorType: "ValidationError",
          message: "Category name is required and cannot be empty.",
        });
      }

      // Update the category and return updated document
      const updatedCategory = await category.findByIdAndUpdate(
        id,
        { name: name.trim() },
        { new: true }
      );

      if (!updatedCategory) {
        return res.status(404).json({
          status: "fail",
          code: 404,
          errorType: "NotFoundError",
          message: "Category not found.",
          categoryId: id,
        });
      }

      // Prepare sanitized data for response
      const responseData = {
        id: updatedCategory._id,
        name: updatedCategory.name,
      };

      return res.status(200).json({
        status: "success",
        code: 200,
        message: "Category updated successfully.",
        data: responseData,
      });
    } catch (err) {
      console.error("updateCategory error:", err);
      return res.status(500).json({
        status: "error",
        code: 500,
        errorType: "ServerError",
        message: "Server error while updating category.",
        error: err.message,
      });
    }
  },
};

module.exports = categoryCtrl;
