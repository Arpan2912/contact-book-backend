const express = require("express");
const { auth: AuthRoutes } = require("../constants/constant.route");
const AuthController = require("../controllers/auth.controller");

const router = express.Router();

router.route(AuthRoutes.signin).post(AuthController.signin);
router.route(AuthRoutes.signup).post(AuthController.signup);

module.exports = router;
