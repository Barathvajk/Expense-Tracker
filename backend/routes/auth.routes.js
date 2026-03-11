const express = require("express");
const router  = express.Router();

const { register, login, getProfile, updateBudget } = require("../controllers/auth.controller");
const { protect }     = require("../middleware/auth.middleware");
const validate        = require("../middleware/validate");
const { registerSchema, loginSchema, budgetSchema } = require("../validators/auth.validator");

router.post("/register", validate(registerSchema), register);
router.post("/login",    validate(loginSchema),    login);
router.get( "/profile",  protect,                  getProfile);
router.put( "/budget",   protect, validate(budgetSchema), updateBudget);

module.exports = router;
