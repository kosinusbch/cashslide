function isRealTimestamp(confirmed, value) {

    var currentTime = Math.round((new Date()).getTime() / 1000);
    
    if(confirmed !== false) {
        confirmed = confirmed + 20;
    } else {
        currentTime = currentTime + 20;
    }

    if(confirmed !== false && confirmed > value) {
        return true;
    } else if (currentTime > value) {
        return true;
    } else {
        return false;
    }
}

function userUnrestricted(server, address) {
    // check if user has been restricted and not unrestricted afterwards by admin
}

function isModerator(server, address) {
    // check if user is moderator and has not been removed as moderator
}