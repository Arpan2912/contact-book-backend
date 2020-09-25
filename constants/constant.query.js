// put all queries here
module.exports = {
  // qGetUserDetail: `select * from "users" where email=:email`,
  createUser: `insert into  users (uuid,first_name,last_name,email,
    phone,password,user_type,created_at,updated_at)
  values (:uuid,:first_name,:last_name,:email,
    :phone,:password,:user_type,:created_at,:updated_at)`,
  getUserDetail: `select * from users where phone=:phone`,
  
  insertActivityLog: `insert into activity_log 
  (u_uuid,table_name,replacement,result,operation,created_at,updated_at,
    created_by,updated_by)
  values (:u_uuid,:table_name,:replacement,:result,:operation,
    :created_at,:updated_at,:created_by,:updated_by)`,

  insertContact: `insert into contacts 
  (uuid,name,email,mobile1,mobile2,mobile3,mobile4,address,family_members,income,living,additional_detail,samaaj,
    is_active,is_deleted,created_at,updated_at,created_by,updated_by) 
    values (
      :uuid,:name,:email,:mobile1,:mobile2,:mobile3,:mobile4,:address,:family_members,:income,:living,:additional_detail,:samaaj,
      :is_active,:is_deleted,:created_at,:updated_at,
      :created_by,:updated_by
    )`,
    getContactIdFromUuid: `select id from contacts where uuid=:uuid`,

  updateCotact: replacement => {
    let q = `update contacts set updated_at=:updated_at,updated_by=:updated_by`;
    if (replacement.name) {
      q += `,name=:name`;
    }
    // if (replacement.last_name) {
    //   q += `,last_name=:last_name`;
    // }
    if (replacement.phone) {
      q += `,phone=:phone`;
    }
    if (replacement.email) {
      q += `,email=:email`;
    }
    if (replacement.mobile1) {
      q += `,mobile1=:mobile1`;
    }
    if (replacement.mobile2) {
      q += `,mobile2=:mobile2`;
    }
    if (replacement.mobile3) {
      q += `,mobile3=:mobile3`;
    }
    if (replacement.mobile4) {
      q += `,mobile4=:mobile4`;
    }
    if (replacement.address) {
      q += `,address=:address`;
    }
    if (replacement.family_members) {
      q += `,family_members=:family_members`;
    }
    if (replacement.income) {
      q += `,income=:income`;
    }
    if (replacement.living) {
      q += `,living=:living`;
    }
    if (replacement.additional_detail) {
      q += `,additional_detail=:additional_detail`;
    }
    q += ` where id=:contact_id`;
    return q;
  },

  getContacts: replacement => {
    let q = `select uuid as uuid,name,
    mobile1,mobile2,mobile3,mobile4,
    address,samaaj,
    family_members,income,living,additional_detail,email from contacts 
    where 
    (
      case 
        when :is_search 
        then upper(name) like upper(:search) or 
           upper(mobile1) like upper(:search) or
           upper(mobile2) like upper(:search) or
           upper(mobile3) like upper(:search) or
           upper(samaaj) like upper(:search) or
           upper(mobile4) like upper(:search) 
       else true end
    )`;
    if (replacement.download_excel === false) {
      q += `offset :offset limit :limit `;
    }
    return q;
  },

  getContactsCount: `select count(*) from contacts
  where 
  (
    case 
      when :is_search 
      then upper(name) like upper(:search) or 
        upper(mobile1) like upper(:search) or
        upper(mobile2) like upper(:search) or
        upper(mobile3) like upper(:search) or
        upper(samaaj) like upper(:search) or
        upper(mobile4) like upper(:search) 
      else true end
  )
  `
};
