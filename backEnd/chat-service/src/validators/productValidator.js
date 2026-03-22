import Joi from "joi";

export const productSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().required().min(20),
  price: Joi.number().required().min(10),
  category: Joi.string().required(),
  subCategory: Joi.string().required(),

  sizes: Joi.alternatives().try(
    Joi.array().items(Joi.string()),
    Joi.string() // vì bạn đang gửi JSON string
  ),

  bestseller: Joi.boolean().optional(),

  quantity: Joi.number().min(0).optional(),

  promotionIds: Joi.array().items(Joi.string()).optional()
});

export const updateProductSchema = Joi.object({
  name: Joi.string().optional(),
  description: Joi.string().optional(),
  price: Joi.number().optional(),
  category: Joi.string().optional(),
  subCategory: Joi.string().optional(),

  sizes: Joi.alternatives().try(
    Joi.array().items(Joi.string()),
    Joi.string()
  ).optional(),

  bestseller: Joi.boolean().optional(),
  quantity: Joi.number().min(0).optional(),
  promotionIds: Joi.array().items(Joi.string()).optional()
}).min(1);