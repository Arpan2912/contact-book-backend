const express = require("express");
const { contact: contactRoute } = require("../constants/constant.route");
const ContactController = require("../controllers/contact.controller");
const CommonServies  = require("../services/common.service");
const fileUploadMiddleware=CommonServies.fileUploadMiddleware();
const router = express.Router();

router.route(contactRoute.addContact).post(ContactController.addContact);
router.route(contactRoute.updateContact).post(ContactController.updateContact);
router.route(contactRoute.getContacts).post(ContactController.getContacts);

router
  .route(contactRoute.uploadExcel)
  .post(fileUploadMiddleware, ContactController.uploadExcel);


module.exports = router;
