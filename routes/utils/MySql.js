var mysql = require('mysql2');
require("dotenv").config();



const config={

  host: process.env.VUE_APP_host,
  user: process.env.VUE_APP_user,
  password: process.env.VUE_APP_password,
  database: process.env.VUE_APP_database,
  port: parseInt(process.env.VUE_APP_port, 10),
}
const pool = new mysql.createPool(config);

const connection =  () => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) reject(err);
    console.log("MySQL pool connected: threadId " + connection.threadId);
    const query = (sql, binding) => {
      return new Promise((resolve, reject) => {
        console.log('trying')
         connection.query(sql, binding, (err, result) => {
           if (err) reject(err);
           resolve(result);
           });
         });
       };
       const release = () => {
         return new Promise((resolve, reject) => {
           if (err) reject(err);
           console.log("MySQL pool released: threadId " + connection.threadId);
           resolve(connection.release());
         });
       };
       resolve({ query, release });
     });
   });
 };
const query = (sql, binding) => {
  return new Promise((resolve, reject) => {
    pool.query(sql, binding, (err, result, fields) => {
      if (err) reject(err);
      resolve(result);
    });
  });
};
module.exports = { pool, connection, query };