const db = require('../config/db');


const Partnership = {
    getAll: callback => db.query('SELECT * FROM partnership', callback),
 
    create: (data, callback) => {
        db.query(`INSERT INTO partnership (program, start_date, closing_date, duration,created_at) 
                     VALUES (?, ?, ?, ?, NOW())`,[
                        data.program, data.start_date, data.end_date, data.duration ], callback);
    },

    update: (data, callback) => {
        db.query('UPDATE partnership SET program=?, start_date=?,closing_date=?duration=? WHERE id=?', 
            [data.program, data.start_date, data.end_date,data.duration,data.id], callback);
    },

    delete: (id, callback) => {
        db.query('DELETE FROM partnership WHERE id=?', [id], callback);
    },
    findById: (id, callback) => {
        console.log("Finding ID:", id);
    
        db.query('SELECT * FROM partnership WHERE id = ?', [id], (err, results) => {
            if (err) {
                console.error("Database Error:", err.message);
                return callback(err, null);
            }
            callback(null, results.length ? results[0] : null);
        });
    },
    updatePartners: (data,callback)=>{
        db.query('UPDATE partnership SET additional_partners=? WHERE id=?', 
            [JSON.stringify(data.newData),data.id], callback);
    }
    
};

module.exports = Partnership;
