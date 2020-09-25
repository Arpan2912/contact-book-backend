const AuthService = require("../services/auth.service");
const CommonService = require("../services/common.service");

module.exports = class AuthController {
  static async signup(req, res) {
    try {
      await AuthService.signup(req, res);
      const responseObj = CommonService.prepareSuccessResponse(
        "User added successfully",
        null
      );
      return res.status(200).send(responseObj);
    } catch (e) {
      CommonService.logErrorAndSendResponse(e, res, null);
    }
  }

  static async signin(req, res) {
    try {
      const obj = await AuthService.signin(req, res);
      const responseObj = CommonService.prepareSuccessResponse(
        "Login successfully",
        obj
      );
      return res.status(200).send(responseObj);
    } catch (e) {
      CommonService.logErrorAndSendResponse(e, res, null);
    }
  }
};
