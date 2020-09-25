const expressJwt = require("express-jwt");
const fs = require("fs");

// Routes
const indexRoutes = require("../routes/index");
const authRoutes = require("../routes/auth.route");
const contactRoutes = require("../routes/contact.route");

const DbService = require("../services/db.service");
// public key for decrypt token path
const publicKeyPath = `${__dirname}/../.auth/auth.private.key.pub`;
const publicKey = fs.readFileSync(publicKeyPath);

module.exports = class AppRoutes {
  static init(app) {
    const allowAccess = expressJwt({
      secret: publicKey
    }).unless({
      path: [
        "/auth/signin",
        "/auth/signup"
        // '/auth/verify-user/*'
      ]
    });

    app.all(["/*"], allowAccess);

    app.use(async (req, res, next) => {
      if (req.user) {
        const { phone } = req.user;
        try {
          const rp = {
            phone
          };
          let userDetail = await DbService.getUserDetail(rp);
          if (userDetail.length === 0) {
            throw { code: 401, msg: "User is exist" };
          }
          const user = userDetail[0];
          userDetail = user;
          if (
            userDetail.is_deleted === true ||
            userDetail.is_active === false
          ) {
            throw { code: 401, msg: "User is inactive" };
          }
          req.userDetail = userDetail;
          next();
        } catch (e) {
          const resObj = {
            success: true,
            logout: true,
            data: null,
            msg: e.msg ? e.msg : "Something went wrong"
          };
          return res.status(401).send(resObj);
        }
      } else {
        next();
      }
    });

    app.use("/", indexRoutes);
    app.use("/auth", authRoutes);
    app.use("/contact", contactRoutes);

    app.use(function(err, req, res) {
      if (err.name === "UnauthorizedError") {
        res.status(401).send("invalid token...");
      }
    });
    return app;
  }
};
