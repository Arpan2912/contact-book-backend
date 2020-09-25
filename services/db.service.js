const Sequelize = require("sequelize");
const uuidv4 = require("uuidv4");
const db = require("../db");

const {
  getContactIdFromUuid,
  insertContact,
  updateCotact,
  getContacts,
  getContactsCount,
  createUser,
  getUserDetail,
  insertActivityLog,
} = require("../constants/constant.query");

module.exports = class DbService {
  static executeSqlQuery(query, replacements, operation, tableName) {
    return new Promise((resolve, reject) => {
      let queryType;
      if (operation === "insert") {
        queryType = Sequelize.QueryTypes.INSERT;
      } else if (operation === "update") {
        queryType = Sequelize.QueryTypes.UPDATE;
      } else if (operation === "select") {
        queryType = Sequelize.QueryTypes.SELECT;
      } else if (operation === "delete") {
        queryType = Sequelize.QueryTypes.DELETE;
      } else {
        queryType = Sequelize.QueryTypes.SELECT;
      }
      db.sequelize
        .query(query, { replacements, type: queryType })
        .then(data => {
          if (
            ["insert", "update", "delete"].includes(operation) &&
            tableName !== "activity_log"
          ) {
            const replacemenObj = {
              u_uuid: uuidv4(),
              replacement: JSON.stringify(replacements),
              table_name: tableName,
              result: JSON.stringify(data),
              operation,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              created_by: replacements.updated_by
                ? replacements.updated_by
                : null,
              updated_by: replacements.updated_by
                ? replacements.updated_by
                : null
            };
            // try {
            //   DbService.executeSqlQuery(
            //     insertActivityLog,
            //     replacemenObj,
            //     "insert",
            //     "activity_log"
            //   );
            // } catch (e) {
            //   console.error("e", e);
            // }
          }
          return resolve(data);
        })
        .catch(err => {
          console.error("err", err);
          return reject(err);
        });
    });
  }

  static insertRecordToDb(replacemenObj, table) {
    let q = null;
    if (table === "contact") {
      q = insertContact;
    } else if (table === "user") {
      q = createUser;
    }  else {
      return Promise.reject({ msg: "" });
    }
    if (q === null) {
      return Promise.reject({ msg: "" });
    }
    return DbService.executeSqlQuery(q, replacemenObj, "insert", table);
  }

  static getUserDetail(replacemenObj) {
    return DbService.executeSqlQuery(getUserDetail, replacemenObj, "select");
  }

  static updateContact(replacemenObj) {
    return DbService.executeSqlQuery(
      updateCotact(replacemenObj),
      replacemenObj,
      "update",
      "contacts"
    );
  }

  static getContacts(replacemenObj = {}) {
    return DbService.executeSqlQuery(
      getContacts(replacemenObj),
      replacemenObj,
      "select"
    );
  }

  static getContactsCount(replacemenObj = {}) {
    return DbService.executeSqlQuery(getContactsCount, replacemenObj, "select");
  }

  static getIdFromUuid(replacemenObj, table) {
    let q = null;
    if (table === "contact") {
      q = getContactIdFromUuid;
    }  else {
      return Promise.reject({ msg: "" });
    }
    if (q === null) {
      return Promise.reject({ msg: "" });
    }
    return DbService.executeSqlQuery(q, replacemenObj, "select");
  }
};
