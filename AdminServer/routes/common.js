
const StatusCode = {
    OK : 0,
    System : 1,
    TypeMismatching : 2, 
    UserNotFound : 3,
    InvalidClassType : 4,
    ItemNotFound : 5,
    InvalidRequest : 6, 
    ExistNickName : 7,
    NotStackableItem : 8,
    NotExistItem : 9,
    EquippedItem : 10, 
    NotClassItem : 11,
    CharNotFound : 12,
    GuildNotFound : 13,
    GuildMemberNotFound : 14,
    NotMaintenance : 15
}

function convertToString(status) {
    switch(status)
    {
    case StatusCode.System:
        return "System Error";
    case StatusCode.TypeMismatching:
        return "Input Type Mismatching";
    case StatusCode.UserNotFound:
        return "User Not Found";
    case StatusCode.InvalidClassType:
        return "Invalid Class Type";
    case StatusCode.ItemNotFound:
        return "Item Not Found";
    case StatusCode.InvalidRequest:
        return "Invalid Request";
    case StatusCode.ExistNickname:
        return "Already Exist Nickname";
    case StatusCode.NotStackableItem:
        return "Not Stackable Item";
    case StatusCode.NotExistItem:
        return "Not Exist Item";
    case StatusCode.EquippedItem:
        return "Equipped Item";
    case StatusCode.NotClassItem:
        return "Not Class Item";
    case StatusCode.CharNotFound:
        return "Character Not Found";
    case StatusCode.GuildNotFound:
        return "Guild Not Found";
    }

    return "";
}

function Parse(inputValue) {
    resultRoot = {'result' : true};

    if (!inputValue)
    {
        resultRoot['value'] = [];
    }
    else
    {
        resultRoot['value'] = inputValue;
        
    }

    console.log('[ANS]');
    console.log(resultRoot);
    return resultRoot;
}

function SendResult(res, inputValue) {
    resultRoot = {'result' : true};

    if (!inputValue)
    {
        resultRoot.value = [];
    }
    else
    {
        resultRoot.value = inputValue;
        
    }

    console.log('[ANS]');
    console.log(resultRoot);
    return res.send(resultRoot);
}

function SendStatus(res, status) {
    resultRoot = {
        'statusCode' : status, 
        'msg' : convertToString(status),
        'value' : []};

    if (status === StatusCode.OK)
    {
        resultRoot['result'] = true;
    }
    else
    {
        resultRoot['result'] = false;
    }

    console.log('[ANS]');
    console.log(resultRoot);
    return res.send(resultRoot);
}

module.exports = {
    StatusCode : StatusCode,
    Parse : Parse,
    SendStatus : SendStatus,
    SendResult : SendResult
};