const SubCategory = require("../models/subCategoryModel");
const Category = require("../models/categoryModels");
const APIfeatures = require("../utils/apiFeatures");
const { respondSuccess, respondError } = require("../utils/featuresResponse");

const subCategoryCtrl = {
  createSubCategory: async (req, res) => {
    try {
      const { name, categoryId } = req.body;

      if (!name || !categoryId) {
        return res
          .status(400)
          .json({ message: "Name and categoryId are required." });
      }

      const categoryExists = await Category.findById(categoryId);
      if (!categoryExists) {
        return res.status(404).json({ message: "Parent category not found." });
      }

      const existing = await SubCategory.findOne({ name });
      if (existing) {
        return res.status(409).json({ message: "Subcategory already exists." });
      }

      const newSubCat = new SubCategory({ name, category: categoryId });
      await newSubCat.save();

      categoryExists.subcategories.push(newSubCat._id);
      await categoryExists.save();

      res.status(201).json({
        message:
          "SubCategory created successfully and added to parent category.",
        subCategory: newSubCat,
      });
    } catch (err) {
      res.status(500).json({ message: "Server error.", error: err.message });
    }
  },

  getSubCategories: async (req, res) => {
    try {
      const features = new APIfeatures(SubCategory.find(), req.query)
        .filtering()
        .sorting()
        .paginating()
        .fieldLimiting();

      // Apply populate AFTER query manipulation
      const subCategories = await features.query.populate("category", "name");

      // Count total after filtering
      const totalSubCategories = await SubCategory.countDocuments(
        features.query._conditions
      );

      // Pagination info
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.size) || 10;
      const total = Math.ceil(totalSubCategories / limit);
      const hasMore = page < total;

      // Handle invalid page
      if (page > total && totalSubCategories !== 0) {
        return respondError(res, 404, {
          message: `Page ${page} not found. Only ${total} pages available.`,
          details: null,
          extra: {
            data: { subCategories: [], count: 0 },
            pagination: {
              currentPage: page,
              Size: limit,
              totalSubCategories,
              total_Page:total,
              hasMore: false,
              
            },
          },
        });
      }

      // Success response
      return respondSuccess(
        res,
        200,
        "Subcategories fetched successfully",
        subCategories,
        {
          pagination: {
            currentPage: page,
            Size: limit,
            totalSubCategories,
            total_page:total,
            hasMore,
            
          },
        }
      );
    } catch (err) {
      console.error("Get subcategories error:", err);
      return respondError(res, 500, {
        message: "Failed to fetch subcategories",
        details: err.message,
      });
    }
  },
  deleteSubCategory: async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await SubCategory.findByIdAndDelete(id);

      if (!deleted) {
        return res.status(404).json({ message: "Subcategory not found." });
      }

      // Also remove from parent category's subcategories array
      await Category.findByIdAndUpdate(deleted.category, {
        $pull: { subcategories: deleted._id },
      });

      res
        .status(200)
        .json({ message: "SubCategory deleted Successfully.", id });
    } catch (err) {
      res.status(500).json({ message: "Server error.", error: err.message });
    }
  },

  // New: Update SubCategory
  updateSubCategory: async (req, res) => {
    try {
      const { id } = req.params;
      const { name, categoryId } = req.body;

      const subCategory = await SubCategory.findById(id);
      if (!subCategory) {
        return res.status(404).json({ message: "SubCategory not found." });
      }

      // Update name if provided
      if (name && name.trim() !== "") {
        subCategory.name = name.trim();
      }

      // If category is being changed, update references in both categories
      if (categoryId && categoryId !== subCategory.category.toString()) {
        const newCategory = await Category.findById(categoryId);
        if (!newCategory) {
          return res.status(404).json({ message: "New category not found." });
        }

        // Remove subCategory from old category's subcategories array
        await Category.findByIdAndUpdate(subCategory.category, {
          $pull: { subcategories: subCategory._id },
        });

        // Add subCategory to new category's subcategories array
        newCategory.subcategories.push(subCategory._id);
        await newCategory.save();

        // Update category reference in subCategory
        subCategory.category = categoryId;
      }

      await subCategory.save();

      res.status(200).json({
        message: "SubCategory updated successfully.",
        subCategory,
      });
    } catch (err) {
      res.status(500).json({ message: "Server error.", error: err.message });
    }
  },
};

module.exports = subCategoryCtrl;
