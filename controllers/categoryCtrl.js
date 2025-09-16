const category = require("../models/categoryModels");

const categoryCtrl = {
  // GET ALL CATEGORIES
  getCategories: async (req, res) => {
    try {
      const categories = await category.find();
      res.json(categories);
    } catch (err) {
      return res.status(400).json({ msg: err.message });
    }
  },
                                                                  
  //  CREATE NEW CATEGORY
  createCategory: async (req, res) => {
    try {
      const { name } = req.body;

      // Check if category already exists
      const existingCategory = await category.findOne({ name });
      if (existingCategory) {
        return res.status(400).json({ msg: "Category already exists." });
      }

      // Create and save new category
      const newCategory = new category({ name });
      await newCategory.save();

      res.status(201).json({ msg: "Category created successfully." });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  }, //DELETE CATEGORY
  deleteCategory: async (req, res) => {
    try {
      const { id } = req.params;

      const deletedCategory = await category.findByIdAndDelete(id);
      if (!deletedCategory) {
        return res.status(404).json({ msg: "Category not found." });
      }

      res.json({ msg: "Category deleted successfully." });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },

  // UPDATE CATEGORY
  updateCategory: async (req, res) => {
    try {
      const { id } = req.params;
      const { name } = req.body;

      const updatedCategory = await category.findByIdAndUpdate(
        id,
        { name },
        { new: true } // return updated doc
      );

      if (!updatedCategory) {
        return res.status(404).json({ msg: "Category not found." });
      }

      res.json({
        msg: "Category updated successfully.",
        category: updatedCategory,
      });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
};

module.exports = categoryCtrl;
