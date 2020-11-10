// query function

function DoQuery(con, queryStr) {
    return new Promise((resolve, reject) => {
        con.query(queryStr, (error, results, fields) => {
            console.log( 'req Query: '+ queryStr);
            if (error) {
                console.log(error); 
                return reject(error); 
            }
            //console.log(results);
            resolve(results);
        });
    });
};

function SelectUserInfo(globalCon, NPSN) {
    var queryStr = "SELECT asn, country_code, np_country, market_platform_type, userdb_server_config_idx, logdb_server_config_idx, UNIX_TIMESTAMP(last_login_time) as lastLoginDate, UNIX_TIMESTAMP(reg_date) as createDate " + 
    "FROM user_server_config WHERE site_user_id = '" + NPSN + "'";

    return new Promise((resolve, reject) => {
        DoQuery(globalCon, queryStr).then(function(results){

            var resultJson = {'asn' : results[0].asn, 
            'npsn' : NPSN, 
            'userDBIndex' : results[0].userdb_server_config_idx,
            'logDBIndex' : results[0].logdb_server_config_idx,
            'marketPlatform' : results[0].market_platform_type,
            'lastLoginDate' : results[0].lastLoginDate,
            'createDate' : results[0].createDate};

            resolve(resultJson);
        }).catch((error) => setImmediate(() => {throw error;}));
    });
}

function SelectGBCharByName(globalCon, Nickname) {
    var queryStr = "SELECT asn, usn, class_type, lang_id, userdb_server_config_idx, logdb_server_config_idx, UNIX_TIMESTAMP(update_date) as updateDate, UNIX_TIMESTAMP(create_date) as createDate "+
    "FROM gb_char WHERE char_name='"+Nickname+"'";

    return new Promise((resolve, reject) => {
        DoQuery(globalCon, queryStr).then(function(results){

            var resultJson = {
            'asn' : results[0].asn, 
            'usn' : results[0].usn, 
            'classType' : results[0].class_type, 
            'langId' : results[0].lang_id, 
            'nickname' : Nickname, 
            'userDBIndex' : results[0].userdb_server_config_idx,
            'logDBIndex' : results[0].logdb_server_config_idx,
            'updateDate' : results[0].updateDate,
            'createDate' : results[0].createDate};

            resolve(resultJson);
        }).catch((error) => setImmediate(() => {throw error;}));
    });
}

function SelectUserBlockInfo(globalCon, asn) {
    var queryStr = "SELECT block_grade, block_type, unix_timestamp(create_date) as createDate, unix_timestamp(end_date) as endDate, is_active " + 
    "FROM iu_user_block WHERE asn=" + asn + " AND block_grade > 0 AND create_date <= now() ORDER BY is_active DESC, end_date DESC";

    return new Promise((resolve, reject) => {
        DoQuery(globalCon, queryStr).then(function(results){
            
            var blockInfos = [];
            for (var loop = 0;  loop < results.length; ++loop) {
                blockInfos.push({
                    'blockGrade' : results[loop].block_grade, 
                    'blockType' : results[loop].block_type,
                    'createDate' : results[loop].createDate,
                    'endDate' : results[loop].endDate,
                    'isActive' : results[loop].is_active});
            }

            resolve(blockInfos);
        }).catch((error) => setImmediate(() => {throw error;}));
    });
}

function SelectAllChars(globalCon, asn) {
    var queryStr = "SELECT usn, char_name, class_type FROM gb_char WHERE asn="+asn;

    return new Promise((resolve, reject) => {
        DoQuery(globalCon, queryStr).then(function(results){
            
            var charInfos = [];
            for (var loop = 0;  loop < results.length; ++loop) {
                charInfos.push({
                    'usn' : results[loop].usn, 
                    'char_name' : results[loop].char_name,
                    'class_type' : results[loop].class_type});
            }

            resolve(charInfos);
        }).catch((error) => setImmediate(() => {throw error;}));
    });
}

function SelectServerConfig(globalCon, dbType) {
    var queryStr = "SELECT server_config_idx, ip, port, sip, sport, db_name, shard_no "+
    "FROM server_config WHERE use_yn='Y' AND db_type='" + dbType + "'";

    return new Promise((resolve, reject) => {
        DoQuery(globalCon, queryStr).then(function(results){
            
            var userDBConfig = [];
            for (var loop = 0;  loop < results.length; ++loop) {
                userDBConfig.push({
                    dbIndex : results[loop].server_config_idx, 
                    ip : results[loop].ip,
                    port : results[loop].port,
                    sip : results[loop].sip,
                    sport : results[loop].sport,
                    dbName : results[loop].db_name,
                    shardNo : results[loop].shard_no
                });
            }

            resolve(userDBConfig);
        }).catch((error) => setImmediate(() => {throw error;}));
    });
}

function SelectCharInfo(userCon, usn) {
    var queryStr = "SELECT asn, char_name, lang_id, pve_lv, pve_exp, hero_lv, class_type, gsn, gsn_db_index, "+
    "gsn_join_request, emblem_no, UNIX_TIMESTAMP(update_date) as updateDate "+
    "FROM gb_char_info WHERE usn="+usn;

    return new Promise((resolve, reject) => {
        DoQuery(userCon, queryStr).then(function(results){
            var charInfo = {
                'asn' : results[0].asn, 
                'usn' : usn, 
                'charName' : results[0].char_name,
                'langId' : results[0].lang_id,
                'classType' : results[0].class_type,
                'level' : results[0].pve_lv,
                'exp' : results[0].pve_exp,
                'heroLevel' : results[0].hero_lv,
                'gsn' : results[0].gsn,
                'gsnDBIndex' : results[0].gsn_db_index,
                'gsnJoinRequest' : results[0].gsn_join_request,
                'gsnJoinRequest' : results[0].gsn_join_request,
                'emblemNo' : results[0].emblem_no,
                'updateDate' : results[0].updateDate
            };

            resolve(charInfo);
        }).catch((error) => setImmediate(() => {throw error;}));
    });
}

function SelectSmithyInfo(userCon, usn) {
    var queryStr = "SELECT smithy_level, force_finish_count, smithing_start_level, " +
    "UNIX_TIMESTAMP(smithing_start_time) as smithingStartTime, UNIX_TIMESTAMP(refresh_time) as refreshTime " +
    "FROM iu_smithy WHERE usn="+usn;

    return new Promise((resolve, reject) => {
        DoQuery(userCon, queryStr).then(function(results){
            var smithyInfo = [];
            smithyInfo.push({
                'smithyLevel' : results[0].smithy_level, 
                'forceFinishCount' : results[0].force_finish_count, 
                'smithingStartLevel' : results[0].smithing_start_level,
                'smithingStartTime' : results[0].smithingStartTime,
                'refreshTime' : results[0].refreshTime
            });

            resolve(smithyInfo);
        }).catch((error) => setImmediate(() => {throw error;}));
    });
}


module.exports = {
    SelectServerConfig : SelectServerConfig,
    SelectUserInfo : SelectUserInfo,
    SelectGBCharByName : SelectGBCharByName,
    SelectUserBlockInfo : SelectUserBlockInfo,
    SelectAllChars : SelectAllChars,
    SelectCharInfo : SelectCharInfo,
    SelectSmithyInfo : SelectSmithyInfo
};