const crypto = require("crypto");
const csv = require("csvtojson");
var xlsx = require('xlsx');
const excelToJson = require('convert-excel-to-json');
const fs=require("fs");
const multer=require("multer");
const AppLogger = require("../config/app.logger");
const { common } = require("../constants/constant.message");

const commonMsg = 'Something went wrong';
module.exports = class CommonService {

  static fileUploadMiddleware(){
    const storage = multer.diskStorage({
      destination:'uploads',
      filename: function (req, file, cb) {
        cb(null, `${file.originalname}`)
      }
    });
    const upload = multer({ storage });
    const fileUploadMiddleware = upload.single("csv");
    return fileUploadMiddleware;
  }

  static readFileAndReturnCsvArray(req) {
    const csvData = req.file.buffer.toString("utf8");
    return csv().fromString(csvData);
  }

  static async readFileAndReturnExcelArray(req){
    console.log(req.file);
    let workbook = xlsx.readFile(`${__dirname}/../uploads/${req.file.originalname}`);
    let sheet_name_list = workbook.SheetNames;
    let xlData = await xlsx.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);
    fs.unlink(`${__dirname}/../uploads/${req.file.originalname}`,()=>
      console.log("file deleted")
    );
    return xlData;
  }
  
  static prepareSuccessResponse(message, data) {
    const obj = {
      data,
      message,
      success: true
    };
    return obj;
  }

  static prepareErrorResponse(message, data) {
    const obj = {
      data,
      message,
      success: false
    };
    return obj;
  }

  static logErrorAndSendResponse(e, res, data) {
    // const msg = e.msg ? e.msg : "commonMsg.defaultErrorMessage";
    const msg = e.msg ? e.msg : commonMsg;
    const code = e.code ? e.code : 500;
    // eslint-disable-next-line no-console
    console.error(e);
    if (e instanceof Error) {
      AppLogger.error(e);
    }
    const errorObj = CommonService.prepareErrorResponse(msg, data);
    return res.status(code).send(errorObj);
  }

  static generateSha512Hash(password) {
    // password is added to remove unused error
    return crypto
      .createHash("sha512")
      .update(password)
      .digest("hex");
  }

  
};

function getValueToStore(value){
  if(value === ''){
    value=null;
  }
  return value;
} 

module.exports.getValueToStore=getValueToStore;