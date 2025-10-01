const SubCategory = require("../models/subCategoryModel");
const Category = require("../models/categoryModels");

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

      // Step 1: Create SubCategory
      const newSubCat = new SubCategory({ name, category: categoryId });
      await newSubCat.save();

      //  Step 2: Push subcategory ID to category.subcategories array
      categoryExists.subcategories.push(newSubCat._id);
      await categoryExists.save();

      res.status(201).json({
        message: "SubCategory created and added to parent category.",
        subCategory: newSubCat,
      });
    } catch (err) {
      res.status(500).json({ message: "Server error.", error: err.message });
    }
  },
  getSubCategories: async (req, res) => {
    try {
      const subCategories = await SubCategory.find().populate(
        "category",
        "name"
      );
      res.status(200).json({ subCategories });
    } catch (err) {
      res
        .status(500)
        .json({ message: "Error fetching subcategories.", error: err.message });
    }
  },

  deleteSubCategory: async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await SubCategory.findByIdAndDelete(id);

      if (!deleted) {
        return res.status(404).json({ message: "Subcategory not found." });
      }

      res.status(200).json({ message: "SubCategory deleted.", id });
    } catch (err) {
      res.status(500).json({ message: "Server error.", error: err.message });
    }
  },
};

module.exports = subCategoryCtrl;
