const Products = require("../models/productModel");
const SubCategory = require("../models/subCategoryModel");
const APIfeatures = require("../utils/apiFeatures");
const { respondSuccess, respondError } = require("../utils/featuresResponse");

const productCtrl = {
  getProducts: async (req, res) => {
    try {
      const features = new APIfeatures(
        Products.find().populate({
          path: "subCategory",
          select: "name category",
          populate: { path: "category", select: "name" },
        }),
        req.query
      )
        .filtering()
        .sorting()
        .paginating()
        .fieldLimiting();

      const products = await features.query;
      const total = await Products.countDocuments(features.query._conditions);

      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.size) || 10;
      const totalPages = Math.ceil(total / limit);
      const hasMore = page < totalPages;

      if (page > totalPages && total !== 0) {
        return respondError(res, 404, {
          message: `Page ${page} not found. Only ${totalPages} pages available.`,
          details: null,
          extra: {
            data: { products: [], count: 0 },
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

      const formattedProducts = products.map((product) => ({
        id: product._id,
        title: product.title,
        price: product.price,
        description: product.description,
        content: product.content,
        images: product.images,
        subCategory: product.subCategory?.name || null,
        category: product.subCategory?.category?.name || null,
        createdAt: product.createdAt,
      }));

      return respondSuccess(
        res,
        200,
        "Products fetched successfully",
        formattedProducts,
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
      return respondError(res, 500, {
        message: "Failed to fetch products",
        details: err.message,
      });
    }
  },

  getProductById: async (req, res) => {
    try {
      const { id } = req.params;

      const product = await Products.findById(id).populate({
        path: "subCategory",
        select: "name category",
        populate: { path: "category", select: "name" },
      });

      if (!product) {
        return res.status(404).json({
          status: "fail",
          code: 404,
          message: "Product not found.",
          productId: id,
        });
      }

      const formattedProduct = {
        id: product._id,
        product_id: product.product_id,
        title: product.title,
        price: product.price,
        description: product.description,
        content: product.content,
        images: product.images,
        subCategory: product.subCategory?.name || null,
        category: product.subCategory?.category?.name || null,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
      };

      return res.status(200).json({
        status: "success",
        code: 200,
        message: "Product fetched successfully.",
        data: formattedProduct,
      });
    } catch (err) {
      return res.status(500).json({
        status: "error",
        code: 500,
        message: "Failed to fetch product.",
        error: err.message,
      });
    }
  },

  createProducts: async (req, res) => {
    try {
      const {
        product_id,
        title,
        price,
        description,
        content,
        images,
        subCategory,
      } = req.body;

      if (!product_id || product_id.trim() === "") {
        return res.status(400).json({ message: "Product ID is required." });
      }
      if (!title || title.trim() === "") {
        return res.status(400).json({ message: "Title is required." });
      }
      if (price === undefined || price === null) {
        return res.status(400).json({ message: "Price is required." });
      }
      if (!description || description.trim() === "") {
        return res.status(400).json({ message: "Description is required." });
      }
      if (!content || content.trim() === "") {
        return res.status(400).json({ message: "Content is required." });
      }
      if (!images || !Array.isArray(images) || images.length === 0) {
        return res
          .status(400)
          .json({ message: "At least one image is required." });
      }
      if (!subCategory || subCategory.trim() === "") {
        return res.status(400).json({ message: "SubCategory is required." });
      }

      const subCat = await SubCategory.findById(subCategory);
      if (!subCat) {
        return res
          .status(404)
          .json({ message: "SubCategory not found in database." });
      }

      const existingProduct = await Products.findOne({ product_id });
      if (existingProduct) {
        return res
          .status(400)
          .json({ message: "This product already exists." });
      }

      const newProduct = new Products({
        product_id,
        title: title.toLowerCase().trim(),
        price,
        description,
        content,
        images,
        subCategory,
      });

      await newProduct.save();

      return res.status(201).json({
        message: "Product created successfully.",
        product: newProduct,
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      return res.status(500).json({ message: "Server error: " + err.message });
    }
  },

  updateProduct: async (req, res) => {
    try {
      const { title, price, description, content, images, subCategory } =
        req.body;

      if (!images || !Array.isArray(images) || images.length === 0) {
        return res.status(400).json({
          success: false,
          message: "At least one image must be provided.",
        });
      }

      if (subCategory) {
        const subCat = await SubCategory.findById(subCategory);
        if (!subCat) {
          return res.status(404).json({
            message: "SubCategory not found.",
          });
        }
      }

      const updatedProduct = await Products.findByIdAndUpdate(
        req.params.id,
        {
          title: title?.toLowerCase().trim(),
          price,
          description,
          content,
          images,
          ...(subCategory && { subCategory }),
        },
        { new: true }
      ).populate({
        path: "subCategory",
        populate: { path: "category", select: "name" },
      });

      if (!updatedProduct) {
        return res.status(404).json({
          success: false,
          message: "Product not found. Update failed.",
          productId: req.params.id,
          timestamp: new Date().toISOString(),
        });
      }

      res.status(200).json({
        success: true,
        message: "Product updated successfully.",
        productId: updatedProduct._id,
        product: updatedProduct,
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: "Server error while updating product.",
        error: err.message,
        timestamp: new Date().toISOString(),
      });
    }
  },

  deleteProduct: async (req, res) => {
    try {
      const deletedProduct = await Products.findByIdAndDelete(req.params.id);

      if (!deletedProduct) {
        return res.status(404).json({
          success: false,
          message: "Product not found. Nothing was deleted.",
          productId: req.params.id,
          timestamp: new Date().toISOString(),
        });
      }

      res.status(200).json({
        success: true,
        message: "Product deleted successfully.",
        productId: deletedProduct._id,
        deletedProduct: {
          title: deletedProduct.title,
          price: deletedProduct.price,
          subCategory: deletedProduct.subCategory,
          images: deletedProduct.images,
        },
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: "Server error while deleting product.",
        error: err.message,
        timestamp: new Date().toISOString(),
      });
    }
  },
};

module.exports = productCtrl;
