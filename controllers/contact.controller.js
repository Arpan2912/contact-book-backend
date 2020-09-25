const ContactService = require("../services/contact.service");
const CommonService = require("../services/common.service");

module.exports = class ContactController {
  static async addContact(req, res) {
    try {
      await ContactService.addContact(req, res);
      const responseObj = CommonService.prepareSuccessResponse(
        "Person added successfully",
        null
      );
      return res.status(200).send(responseObj);
    } catch (e) {
      CommonService.logErrorAndSendResponse(e, res, null);
    }
  }

  static async getContacts(req, res) {
    try {
      const contacts = await ContactService.getContacts(req, res);
     
      const responseObj = CommonService.prepareSuccessResponse(
        "Get person successfully",
        contacts
      );
      return res.status(200).send(responseObj);
    } catch (e) {
      CommonService.logErrorAndSendResponse(e, res, null);
    }
  }

  static async updateContact(req, res) {
    try {
      await ContactService.updateContact(req, res);
      const responseObj = CommonService.prepareSuccessResponse(
        "Update person successfully",
        null
      );
      return res.status(200).send(responseObj);
    } catch (e) {
      CommonService.logErrorAndSendResponse(e, res, null);
    }
  }

  static async uploadExcel(req, res) {
    try {
      
      const uploadData = await ContactService.uploadExcel(req);

      const response = CommonService.prepareSuccessResponse(
        // agendaMsg.agendaImportSuccess,
        // agenda
      );
      return res.status(200).send(response);
    } catch (e) {
      console.log("e",e);
      CommonService.logErrorAndSendResponse(e, res, null);
    }
  }
}