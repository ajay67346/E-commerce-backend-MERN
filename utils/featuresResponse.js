// utils/response.js

const respondSuccess = (res, statusCode, message, data = {}, extra = {}) => {
  return res.status(statusCode).json({
    status: "success",
    code: statusCode,
    message,
    data,
    ...extra,
  });
};

const respondError = (res, statusCode, errorObj = {}) => {
  return res.status(statusCode).json({
    status: "error",
    code: statusCode,
    message: errorObj.message || "An error occurred.",
    error: errorObj.details || undefined,
    ...errorObj.extra,
  });
};

module.exports = {
  respondSuccess,
  respondError,
};
