var mysql = require('mysql');
var doQuery = require('./DoQuery')

const globalDBConfig = require('../config.json').globalDB;

class DBManager {
    constructor() {
        this.pool = [];
        this.pool[0] = mysql.createPool({
            host: globalDBConfig.host,
            port: globalDBConfig.port,
            user: globalDBConfig.user,
            password: globalDBConfig.password,
            database: globalDBConfig.database,
            charset: globalDBConfig.charset,
            supportBigNumbers: true,
            bigNumberStrings: true,
            connectionLimit: globalDBConfig.connectionLimit
        });

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

function BeginTransaction(connection) {
    return new Promise((resolved, rejected) => {
        connection.beginTransaction((err) => {
            if (err) {
                rejected(err);
                return;
            }

            resolved();
        });
    });
}

function Rollback(connection) {
    connection.rollback(() => { });
}

function Commit(connection) {
    return new Promise((resolved, rejected) => {
        connection.commit((err) => {
            if (err) {
                Rollback(connection);
                rejected(err);
                return;
            }
            
            resolved();
        });

    });
}
module.exports = {
    DBManager : dbMgr,
    BeginTransaction : BeginTransaction,
    Rollback : Rollback,
    Commit : Commit
};