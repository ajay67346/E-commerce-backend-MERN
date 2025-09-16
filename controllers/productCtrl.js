const Products = require("../models/productModel");

class APIfeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filtering() {
    const rawQuery = { ...this.queryString };
    const excludedFields = ["page", "sort", "limit"];
    excludedFields.forEach((el) => delete rawQuery[el]);

    const queryObj = {};
                                                                                             
    for (const key in rawQuery) {
      if (key.includes("[")) {
        const [field, operator] = key.split(/\[|\]/).filter(Boolean);
        if (!queryObj[field]) queryObj[field] = {};
        queryObj[field]["$" + operator] = isNaN(rawQuery[key])
          ? rawQuery[key]
          : Number(rawQuery[key]);
      } else {
        queryObj[key] = isNaN(rawQuery[key])
          ? rawQuery[key]
          : Number(rawQuery[key]);
      }
    }
                                                   
    console.log("Parsed Query Object:", queryObj);
    this.query = this.query.find(queryObj);
    return this;
  }

  sorting() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(",").join(" ");
      console.log("sort by", sortBy);
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort("-createdAt");
    }
    return this;
  }

  paginating() {
    const page = parseInt(this.queryString.page) || 1;
    const limit = parseInt(this.queryString.limit) || 10;
    const skip = (page - 1) * limit;
    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
}

const productCtrl = {
  getProducts: async (req, res) => {
    try {
      const features = new APIfeatures(Products.find(), req.query)
        .filtering()
        .sorting()
        .paginating();

      const products = await features.query;
      // res.json({ result: products.length });
      res.json({ result: products.length, data: products });
      // res.json(products);
    } catch (err) {
      return res.status(500).json({ msg: err.message });
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
        category,
      } = req.body;

      if (!images || images.length === 0)
        return res.status(400).json({ msg: "No image uploaded" });

      const existingProduct = await Products.findOne({ product_id });
      if (existingProduct)
        return res.status(400).json({ msg: "This Product Already Exists" });

      const newProduct = new Products({
        product_id,
        title: title.toLowerCase().trim(),
        price,
        description,
        content,
        images,
        category,
      });

      await newProduct.save();
      res.json({ msg: "Product created successfully.", product: newProduct });
    } catch (err) {
      res.status(500).json({ msg: err.message });
    }
  },

  deleteProduct: async (req, res) => {
    try {
      const deletedProduct = await Products.findByIdAndDelete(req.params.id);
      if (!deletedProduct)
        return res.status(404).json({ msg: "Product not found" });

      res.json({ msg: "Deleted a product" });
    } catch (err) {
      res.status(500).json({ msg: err.message });
    }
  },

  updateProduct: async (req, res) => {
    try {
      const { title, price, description, content, images, category } = req.body;

      if (!images || images.length === 0)
        return res.status(400).json({ msg: "No image uploaded" });

      const updatedProduct = await Products.findByIdAndUpdate(
        req.params.id,
        {
          title: title.toLowerCase().trim(),
          price,
          description,
          content,
          images,
          category,
        },
        { new: true }
      );

      if (!updatedProduct)
        return res.status(404).json({ msg: "Product not found" });

      res.json({ msg: "Updated a product", product: updatedProduct });
    } catch (err) {
      res.status(500).json({ msg: err.message });
    }
  },
};

module.exports = productCtrl;
