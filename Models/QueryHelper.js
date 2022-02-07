
const db = require('../config/connection');
const cTable = require('console.table');

class QueryHelper {

  DisplayData(sql, noDisplay) {
    return new Promise (resolve => {
      db.query(sql, (err, rows) => {
        if (!noDisplay) {console.table(rows);}
        resolve(rows);
      });
    });
  };

  CreateData(sql, params) {
    db.query(sql, params, (err, result) => {
      if (err) {
        console.log(err);
        return;
      }
    });
  };

  UpdateData(sql, params) {
    db.query(sql, params, (err, result) => {
      if (err) {
        console.log(err);
        return;
      }
    });
  };
}



module.exports = QueryHelper;