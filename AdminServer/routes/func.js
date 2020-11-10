var com = require('./common');
var reqDBMgr = require('./../DBManager');
var doQuery = require('./../DoQuery')

function Hello(req, res) {
    console.log(`[CALL] ${req.path}`);

    resultVal = {'hello' : 'world'};
    com.SendResult(res, resultVal);
}

async function GetAccountInfo(req, res) {
    console.log(`[CALL] ${req.path}`);
  
    if (!req.body['npsn'])
    {
      com.SendStatus(res, com.StatusCode.TypeMismatching);
      return;
    }
    var NPSN = req.body['npsn'];
  
    // Query
    /*
    // [Case Promise]
    reqDBMgr.DBManager.GlobalConnection().then(globalCon=>{
      reqDBMgr.DoQuery_SelectUserInfo(globalCon, NPSN)
      .then(resultUser => {
        reqDBMgr.DoQuery_SelectUserBlockInfo(globalCon, resultUser["asn"])
        .then(resultBlock => {resultUser.blockInfo = resultBlock;})
        .then(() => {
          reqDBMgr.DoQuery_SelectAllChars(globalCon, resultUser['asn'])
          .then(resultChars =>{resultUser.charInfo = resultChars;})
          .then(() => {com.SendResult(res, resultUser)});
        });
      });
      globalCon.release();
    });
    */
  
    // [Case Async/Await]
    globalCon = await reqDBMgr.DBManager.GlobalConnection();
    resultUser = await doQuery.SelectUserInfo(globalCon, NPSN);
    resultBlock = await doQuery.SelectUserBlockInfo(globalCon, resultUser["asn"]);
    resultChars = await doQuery.SelectAllChars(globalCon, resultUser['asn']);
  
    resultUser.blockInfo = resultBlock;
    resultUser.charInfo = resultChars;
  
    globalCon.release();
  
    com.SendResult(res, resultUser);
}

async function GetCharInfo(req, res) {
    console.log(`[CALL] ${req.path}`);
  
    if (!req.body['nickname'])
    {
      com.SendStatus(res, com.StatusCode.TypeMismatching);
      return;
    }
    var nickname = req.body['nickname'];

    // userInfo
    {
        globalCon = await reqDBMgr.DBManager.GlobalConnection();
        var shardInfo = await doQuery.SelectGBCharByName(globalCon, nickname);
        await globalCon.release();
    }
    
    {
        userCon = await reqDBMgr.DBManager.GetConnection(shardInfo.userDBIndex);
        var resultCharInfo = await doQuery.SelectCharInfo(userCon, shardInfo.usn);
        var smithyInfo = await doQuery.SelectSmithyInfo(userCon, shardInfo.usn);
        
        await userCon.release();
    }

    resultCharInfo.smithyInfo = smithyInfo;
    com.SendResult(res, resultCharInfo);
}

module.exports = {
    GetAccountInfo : GetAccountInfo,
    Hello : Hello,
    GetCharInfo : GetCharInfo
};