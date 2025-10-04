class APIfeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filtering() {
    const rawQuery = { ...this.queryString };
    const excludedFields = ["page", "sort", "size", "fields"];
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

    this.query = this.query.find(queryObj);
    return this;
  }

  sorting() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(",").join(" ");
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort("-createdAt");
    }
    return this;
  }

  paginating() {
    const page = parseInt(this.queryString.page) || 1;
    const limit = parseInt(this.queryString.size) || 10;
    const skip = (page - 1) * limit;
    this.query = this.query.skip(skip).limit(limit);
    return this;
  }

  fieldLimiting() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(",").join(" ");
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select("-__v -password");
    }
    return this;
  }
}

module.exports = APIfeatures;
