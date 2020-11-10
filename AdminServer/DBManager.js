var mysql = require('mysql');
var doQuery = require('./DoQuery')

var globalDBConfig = {
    host : '127.0.0.1',
    port : '3306',
    user : 'mks',
    password : '1234',
    database : 'doz3',
    connectionLimit : 5
 };

class DBManager {
    constructor() {
        this.pool = [];
        this.pool[0] = mysql.createPool(globalDBConfig);

        // connection의 release함수 호출 후 이벤트를 설정
        this.pool[0].on('release', connection =>{
            console.log('[Connection] released[' + connection.threadId +']');
        });
        // connection 대기상태 표시
        this.pool[0].on('enqueue', () => {
            console.log('[Connection] Waiting for available connection slot.');
        });

        // create userDB connecion pool
        this.pool[0].getConnection((err, con) => {
            if (err) {
                con.release();
                throw err;
            }

            doQuery.SelectServerConfig(con, 'U')
            .then((dbConfigs) => {
                for (var loop = 0;  loop < dbConfigs.length; ++loop) {
                    var userDBConfig = {
                        host : dbConfigs[loop].ip,
                        port : dbConfigs[loop].port,
                        user : 'doz2',
                        password : 'test1324',
                        database : dbConfigs[loop].dbName
                    }

                    var userConnectionPool = mysql.createPool(userDBConfig);
                    userConnectionPool.on('release', connection =>{
                        console.log('[Connection] released[' + connection.threadId +']');
                    });
                    userConnectionPool.on('enqueue', () => {
                        console.log('[Connection] Waiting for available connection slot.');
                    });

                    this.pool[dbConfigs[loop].dbIndex] = userConnectionPool;
                }
            });

            con.release();
        });

        console.log('[DBManager] Init.');
    }

    GetConnection(dbIndex) {
        return new Promise((resolve, reject) => {
            this.pool[dbIndex].getConnection((err, con) =>{
                if (err) {
                    con.release();
                    return reject(err);
                }
                resolve(con);
            });
        });
    }

    async GlobalConnection() {
        return await this.GetConnection(0);
    }
}
dbMgr = new DBManager;



module.exports = {
    DBManager : dbMgr,
};