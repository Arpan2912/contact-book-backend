const uuidv4 = require("uuidv4");
const fs = require("fs");
const json2xls = require("json2xls");

const DbService = require("../services/db.service");
const  { getValueToStore }=require("../services/common.service");
const  CommonService =require("../services/common.service");

module.exports = class ContactService {
  static async addContact(req, res) {
    const {
      name,
      email=null,
      mobile1=null,
      mobile2=null,
      mobile3=null,
      mobile4=null,
      address=null,
      familyMembers=null,
      income=null,
      living=null,
      additionalDetail=null,
      samaaj=null
    } = req.body;
    const { id } = req.userDetail;

    const obj = {
      uuid: uuidv4(),
      name: name,
      email:getValueToStore(email),
      mobile1:getValueToStore(mobile1),
      mobile2:getValueToStore(mobile2),
      mobile3:getValueToStore(mobile3),
      mobile4:getValueToStore(mobile4),
      address:getValueToStore(address),
      family_members:getValueToStore(familyMembers),
      income:getValueToStore(income),
      living:getValueToStore(living),
      additional_detail:getValueToStore(additionalDetail),
      samaaj:getValueToStore(samaaj),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: id,
      updated_by: id,
      is_active: true,
      is_deleted: false
    };

    console.log(obj);
    try {
      await DbService.insertRecordToDb(obj, "contact");
      return Promise.resolve();
    } catch (e) {
      return Promise.reject(e);
    }
  }

  static async updateContact(req, res) {
    try {
      const {
        name,
        email=null,
        mobile1=null,
        mobile2=null,
        mobile3=null,
        mobile4=null,
        address=null,
        familyMembers=null,
        income=null,
        living=null,
        additionalDetail=null,
        contactId: contactUuid = null
      } = req.body;
      const { id } = req.userDetail;

      if (!contactUuid) {
        throw { code: 409, msg: "please select contact" };
      }

      const contactObj = { uuid: contactUuid };
      const contactDetail = await DbService.getIdFromUuid(contactObj, "contact");
      const contactId = contactDetail[0].id;

      const updateObj = {
        updated_at: new Date().toISOString(),
        updated_by: id,
        contact_id: contactId
      };

      if (name) {
        updateObj.name = name;
      }
      if (email) {
        updateObj.email = email;
      }
      if (address) {
        updateObj.address = address;
      }
      if (mobile1) {
        updateObj.mobile1 = mobile1;
      }
      if (mobile2) {
        updateObj.mobile2 = mobile2;
      }
      if (mobile3) {
        updateObj.mobile3 = mobile3;
      }
      if (mobile4) {
        updateObj.mobile4 = mobile4;
      }
      if (familyMembers) {
        updateObj.family_members = familyMembers;
      }
      if (income) {
        updateObj.income = income;
      }
      if (living) {
        updateObj.living = living;
      }
      if (additionalDetail) {
        updateObj.additional_detail = additionalDetail;
      }
      
      await DbService.updateContact(updateObj);
      return Promise.resolve();
    } catch (e) {
      console.error("e", e);
      return Promise.reject(e);
    }
  }

  static async getContacts(req, res) {
    try {
      let { page = "1", limit = "10", search, from = null,downloadExcel="false" } = req.query;
      let {downloadExcelFields=[]}=req.body;
      page = parseInt(page);
      if (page === "NaN") {
        page = 1;
      }
      limit = parseInt(limit);
      if (limit === "NaN") {
        limit = 1;
      }
      const offset = (page - 1) * limit;
      const replacementObj = {
        offset,
        limit,
        from,
        search:
          search === "" || search === undefined || search === null
            ? null
            : `%${search}%`,
        is_search: !(search === "" || search === undefined || search === null),
        download_excel:downloadExcel==='true'?true:false
      };
      const contacts = await DbService.getContacts(replacementObj);
      const countObj = await DbService.getContactsCount(replacementObj);
      let responseObj = {
        contacts,
        count: countObj[0].count
      };
      if(downloadExcel === 'true'){
        let excelArray = await ContactService.prepareArrayToGenerateExcel(contacts,downloadExcelFields);
        const uploadPath = `${__dirname}/../public/`;
        const fileName = `${uuidv4().toString()}.xlsx`;
        const xls = json2xls(excelArray);
        fs.writeFileSync(`${uploadPath}${fileName}`, xls, "binary");
        responseObj = {
          file: `http://localhost:3001/${fileName}`
        };
      }
      return Promise.resolve(responseObj);
    } catch (e) {
      return Promise.reject(e);
    }
  }

  static async prepareArrayToGenerateExcel(data,fieldsToAdd){
    let excelArr=[];
    let arrLength = data.length;
    return new Promise((resolve,reject)=>{
      if(arrLength===0){
        return resolve();
      }
      for(let i=0;i<data.length;i++){
        let obj={};
        let currentData=data[i];
        if(fieldsToAdd && Array.isArray(fieldsToAdd) && (fieldsToAdd.includes('all')||fieldsToAdd.length===0)){
          obj['Name']=currentData.name;
          obj['Mobile']='';
          if(currentData.mobile1){
            if(obj['Mobile']){
              obj['Mobile']=obj['Mobile']+','+currentData.mobile1;
            } else {
              obj['Mobile']=obj['Mobile']+currentData.mobile1;
            }
          }
          if(currentData.mobile2){
            if(obj['Mobile']){
              obj['Mobile']=obj['Mobile']+','+currentData.mobile2;
            } else {
              obj['Mobile']=obj['Mobile']+currentData.mobile2;
            }
          }
          if(currentData.mobile3){
            if(obj['Mobile']){
              obj['Mobile']=obj['Mobile']+','+currentData.mobile3;
            } else {
              obj['Mobile']=obj['Mobile']+currentData.mobile3;
            }
          }
          if(currentData.mobile4){
            if(obj['Mobile']){
              obj['Mobile']=obj['Mobile']+','+currentData.mobile4;
            } else {
              obj['Mobile']=obj['Mobile']+currentData.mobile4;
            }
          }
          obj['Address']=currentData.address;
          obj['Samaaj']=currentData.samaaj;
          obj['Members']=currentData.family_members;
          obj['Living']=currentData.living;
          obj['Income']=currentData.income;
          obj['Detail']=currentData.additional_detail;
          
        } else {
          if(fieldsToAdd.includes('name')){
            obj['Name']=currentData.name;
          }
          if(fieldsToAdd.includes('mobile')){
            obj['Mobile']='';
            if(currentData.mobile1){
              if(obj['Mobile']){
                obj['Mobile']=obj['Mobile']+','+currentData.mobile1;
              } else {
                obj['Mobile']=obj['Mobile']+currentData.mobile1;
              }
            }
            if(currentData.mobile2){
              if(obj['Mobile']){
                obj['Mobile']=obj['Mobile']+','+currentData.mobile2;
              } else {
                obj['Mobile']=obj['Mobile']+currentData.mobile2;
              }
            }
            if(currentData.mobile3){
              if(obj['Mobile']){
                obj['Mobile']=obj['Mobile']+','+currentData.mobile3;
              } else {
                obj['Mobile']=obj['Mobile']+currentData.mobile3;
              }
            }
            if(currentData.mobile4){
              if(obj['Mobile']){
                obj['Mobile']=obj['Mobile']+','+currentData.mobile4;
              } else {
                obj['Mobile']=obj['Mobile']+currentData.mobile4;
              }
            }
          }
          if(fieldsToAdd.includes('members')){
            obj['Members']=currentData.family_members;
          }
          if(fieldsToAdd.includes('address')){
            obj['Address']=currentData.address;
          }
          if(fieldsToAdd.includes('samaaj')){
            obj['Samaaj']=currentData.samaaj;
          }
          if(fieldsToAdd.includes('living')){
            obj['Living']=currentData.living;
          }
          if(fieldsToAdd.includes('income')){
            obj['Income']=currentData.income;
          }
          if(fieldsToAdd.includes('detail')){
            obj['Detail']=currentData.additional_detail;
          }
        }
        excelArr.push(obj);
        if(i===arrLength-1){
          return resolve();
        }
      }
    })
    .then(()=>{
      return Promise.resolve(excelArr);
    })
    .catch(e=>{
      return Promise.reject(e);
    })
  }

  static async  uploadExcel(req) {
    const { id: userId } = req.userDetail;
    const json = await CommonService.readFileAndReturnExcelArray(req);
    console.log("json",json);
    for(let i=0;i<json.length;i++){
      let currentData=json[i];
      let name=null;
      let lastName=null;
      let mobile1=null;
      let mobile2=null;
      let mobile3=null;
      let mobile4=null;
      let address=null;
      let samaaj=null;
      let family_members=null;
      let living=null;
      let income=null;
      let additional_detail=null;
      

      if(!currentData['Name']){
        console.log("Not find name");
        continue;
      }

      if(currentData['Name']){
        name=currentData['Name'];
        // let splitName=currentData['Name'].split(" ");
        // if(splitName.length===1){
        //   firstName=splitName[0];
        // } else if(splitName.length === 2){
        //   firstName=splitName[0];
        //   lastName=splitName[1];
        // } else {
        //   firstName=splitName[0];
        //   for(let j=1;j<splitName.length;j++){
        //     if(lastName){
        //      lastName =lastName+" "+splitName[j];
        //     } else {
        //       lastName =splitName[j];
        //     }
        //   }
        // }
      }

      if(currentData['Mobile']){
        let mobileSplit=currentData['Mobile'].toString().split(',');
        if(mobileSplit[0]){
          mobile1=mobileSplit[0].trim() !== ''? mobileSplit[0].trim(): null;
        }
        if(mobileSplit[1]){
          mobile2=mobileSplit[1].trim() !== ''? mobileSplit[0].trim(): null;
        }
        if(mobileSplit[2]){
          mobile3=mobileSplit[2].trim() !== ''? mobileSplit[0].trim(): null;
        }
        if(mobileSplit[3]){
          mobile4=mobileSplit[3].trim() !== ''? mobileSplit[0].trim(): null;
        }
      }

      if(currentData['Address']){
        address=currentData['Address']
      }
      if(currentData['Members']){
        family_members=currentData['Members']
      }
      if(currentData['Samaaj']){
        samaaj=currentData['Samaaj']
      }
      if(currentData['Living']){
        living=currentData['Living']
      }
      if(currentData['Income']){
        income=currentData['Income']
      }
      if(currentData['Detail']){
        additional_detail=currentData['Detail']
      }

      let replacementObj={
        uuid:uuidv4(),
        name,
        email:null,
        mobile1,
        mobile2,
        mobile3,
        mobile4,
        address,
        samaaj,
        family_members,
        living,
        income,
        additional_detail,
        is_active:true,
        is_deleted:false,
        created_by:userId,
        updated_by:userId,
        created_at:new Date().toISOString(),
        updated_at:new Date().toISOString()
      }
      await DbService.insertRecordToDb(replacementObj,'contact')
    }
    return;
  }
};
