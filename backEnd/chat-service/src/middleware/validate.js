import { normalizeData } from "../utils/normalizeData.js";
const validate = (schema, property = "body") => (req, res, next) => {
  let data = { ...req[property] };

  if (property === "body") {
    data = normalizeData(data);
  }

  const { error, value } = schema.validate(data, {
    abortEarly: false,
    allowUnknown: true
  });

  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message
    });
  }

  req[property] = value;
  next();
};

export default validate;