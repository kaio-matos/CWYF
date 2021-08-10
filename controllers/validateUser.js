const Joi = require("@hapi/joi");

module.exports = {
  /**
   *
   * @param {{name: string, email: string, password: string}} data
   * @returns {{error: {message: string}}}
   */
  registerValidate(data) {
    const schema = Joi.object({
      name: Joi.string().required().min(3).max(50),
      email: Joi.string().required().min(3).max(100),
      password: Joi.string().required().min(6).max(100),
    });

    return schema.validate(data);
  },

  /**
   *
   * @param {{name: string, email: string, password: string}} data
   * @returns {{error: {message: string}}}
   */
  loginValidate(data) {
    const schema = Joi.object({
      email: Joi.string().required().min(3).max(100),
      password: Joi.string().required().min(6).max(100),
    });

    return schema.validate(data);
  },
};
