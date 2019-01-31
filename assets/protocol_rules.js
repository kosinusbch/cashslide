function isRealTimestamp(confirmed, value) {

    // In order to stop people from forcibly pinning posts, posts with a fake timestamps
    // needs to be weeded out. If confirmed < value (timestamp), use confirmed time.
    // confirmed = block confirmation, currentTime = current unix time, value = given time

    var currentTime = Math.round((new Date()).getTime() / 1000);
    
    if(confirmed !== false) {
        confirmed = confirmed + 20;
    } else {
        currentTime = currentTime + 20;
    }

    if(confirmed == true && confirmed > value) {
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

function hasJoined() {
    // check if user has joined before displaying messages
}

function validMessage() {
    // check if message meets requirements
}