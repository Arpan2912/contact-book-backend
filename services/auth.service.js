const jwt = require("jsonwebtoken");
const fs = require("fs");
const uuidv4 = require("uuidv4");
const DbService = require("./db.service");
const CommonService = require("./common.service");

const privateKeyPath = `${__dirname}/../.auth/auth.private.key`;

const privateKey = fs.readFileSync(privateKeyPath);

module.exports = class AuthService {
  static async signup(req, res) {
    const { firstName, lastName, phone, email, password, userType } = req.body;
    let user = null;

    const replacement = {
      phone
    };
    const userDetails = await DbService.getUserDetail(replacement);

    if (userDetails.length > 0) {
      user = userDetails[0];
      if (user.is_deleted === true) {
        throw { code: 409, msg: "User is deleted by admin" };
      } else {
        throw { code: 409, msg: "User already exist" };
      }
    } else {
      const passwordHash = CommonService.generateSha512Hash(password);
      const createUserReplacement = {
        uuid: uuidv4(),
        email,
        first_name: firstName,
        last_name: lastName,
        phone,
        password: passwordHash,
        user_type: userType,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      await DbService.insertRecordToDb(createUserReplacement, "user");
    }
    return Promise.resolve(user);
  }

  static async signin(req, res) {
    let user = null;
    const { phone, password } = req.body;

    const replacement = {
      phone
    };
    const userDetail = await DbService.getUserDetail(replacement);

    if (userDetail.length === 0) {
      throw { code: 409, msg: "User not exist" };
    }
    user = userDetail[0];

    if (user.is_deleted === true) {
      throw { code: 409, msg: "User is deleted" };
    }

    if (user.is_active === false) {
      throw { code: 409, msg: "User is inactive" };
    }

    const passwordHash = await CommonService.generateSha512Hash(password);
    if (passwordHash === user.password) {
      const jwtObj = {
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        phone: user.phone,
        userId: user.u_uuid,
        userType: user.user_type
      };
      const token = await AuthService.generateJWTToken(jwtObj);

      const resObj = {
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        phone: user.phone,
        userId: user.u_uuid,
        userType: user.user_type,
        token
      };

      return Promise.resolve(resObj);
    }
    throw { code: 500, msg: "Phone or password may be incorrect" };
  }

  static async generateJWTToken(obj) {
    const signOptions = {
      algorithm: "RS256"
    };
    return jwt.sign(obj, privateKey, signOptions);
  }
};
