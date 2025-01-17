if(localStorage.getItem('JOINED_CHATS') === undefined || localStorage.getItem('JOINED_CHATS') === null) {
    var JOINED_CHATS = [];
    localStorage.setItem('JOINED_CHATS', JSON.stringify(JOINED_CHATS));
}

if(localStorage.getItem('OWNED_CHATS') === undefined || localStorage.getItem('OWNED_CHATS') === null) {
    var OWNED_CHATS = [];
    localStorage.setItem('OWNED_CHATS', JSON.stringify(OWNED_CHATS));
}

if(localStorage.getItem('CASHACCOUNTS') === undefined || localStorage.getItem('CASHACCOUNTS') === null) {
    var CASHACCOUNTS = [];
    localStorage.setItem('CASHACCOUNTS', JSON.stringify(CASHACCOUNTS));
}

if(localStorage.getItem('MY_CIRCLE') === undefined || localStorage.getItem('MY_CIRCLE') === null) {
    var MY_CIRCLE = [];
    localStorage.setItem('MY_CIRCLE', JSON.stringify(MY_CIRCLE));
}

function decodeInviteCode() {
    var invite = $('#invite_code').val();
    aesGcmDecrypt(invite, 'mx%?_nZQc?vPj=y_uUVhWRf=7').then(function(invite) {
        invite = JSON.parse(invite);
        console.log(invite);
        if(invite['password'] !== null && invite['password'] !== undefined && invite['password'] !== "null") {
            joinSpecificServer(invite['server'], invite['password']);
        } else {
            joinSpecificServer(invite['server']);
        }
    });
}

async function previousChats(array) {
    array.forEach(function(output) {
        if(output.password !== undefined && output.password !== null) {
            $("#server_list").append('<a class="history_channel" onclick="meme_clap_connect(\''+output.address+'\', \''+output.password+'\')">'+output.address+'</a>');
        } else {
            $("#server_list").append('<a class="history_channel" onclick="meme_clap_connect(\''+output.address+'\')">'+output.address+'</a>');
        }
    })
}

function send_transaction() {
    var message = $('#message').val();
    var address = sessionStorage.getItem('CS_CONNECTED_SERVER');
    address = address.replace('bitcoincash:','');

    send(message, address, false, true);
    console.log('sending unencrypted');
    $('#message').val('');
}

function initializeChat() {
    var address = $('#connect_address').val();
    var password = $('#connect_password').val();
    address = address.replace('bitcoincash:','');

    $("#group_chat").empty();
    $("#group_chat").append('<h3 style="text-align:center;margin-top: 30vh;color: #fff;">Joining ' + e(address) + ' <i class="zmdi zmdi-spinner"></i></h3>');
    joinChat(address);
    
}

function joinSpecificServer(address, password = null) {
    address = address.replace('bitcoincash:','');

    $("#group_chat").empty();
    $("#group_chat").append('<h3 style="text-align:center;margin-top: 30vh;color: #fff;">Joining ' + e(address) + ' <i class="zmdi zmdi-spinner"></i></h3>');
    joinChat(address, password);
}

function joinChat(address, password) {
    sessionStorage.setItem('CS_CONNECTED_SERVER', address);


    var hist = JSON.parse(localStorage.getItem('JOINED_CHATS'));
    if (checkValue(address,hist)) {
        //todo overwrite existing
    } else {
        var meme_review = {"address":address, "password":password}

        var restoreJOINED_CHATS = JSON.parse(localStorage.getItem('JOINED_CHATS'));
        restoreJOINED_CHATS.push(meme_review);
        localStorage.setItem('JOINED_CHATS', JSON.stringify(restoreJOINED_CHATS));
    }


    historicalChats(address);
    openConnection(address);

    $("#memenavmenu").empty();
    $("#memenavmenu").append('<a onclick="shareModalOpen(\''+address+'\', \''+password+'\')" style="display: inline-block;cursor: pointer;">Invite</a>');
    $("#memenavmenu").append('<a href="/" style="display: inline-block;cursor: pointer;">Disconnect</a>');

    if(hasAccount() == false) {
        $("#addmessageforms").append('<div style="color:#fff;text-align:center;font-size:1em;height:100%;max-width: 425px;padding-top: 8px;box-sizing: border-box;margin: auto;"><a style="display:block;color: #000;background: #69ea6d;padding: 8px 5px 8px 5px;border-radius: 30px;cursor: pointer;" onclick="manageAccountModal()">Click Here to Create a Wallet And Start Chatting</a></div>');
    } else {
        $("#addmessageforms").append('<<textarea maxlength="198" style="display:inline-block;" id="message" placeholder="Write a message..." autocomplete="off"></textarea><i class="zmdi zmdi-mail-send button_send" onclick="send_transaction()"></i>');
    }
}

async function getUsername(address) {
    var hist = JSON.parse(localStorage.getItem('JOINED_CHATS'));
    if (checkValue(address,hist)) {
        resolve('failed');
        //todo overwrite existing
    } else {
        var meme_review = {"address":address, "password":password}

        var restoreJOINED_CHATS = JSON.parse(localStorage.getItem('JOINED_CHATS'));
        restoreJOINED_CHATS.push(meme_review);
        localStorage.setItem('JOINED_CHATS', JSON.stringify(restoreJOINED_CHATS));
        resolve('success');
    }
}

function shareModalOpen(address, password = null) {
    var shareModal = new tingle.modal({
        onClose: function() {
            shareModal.destroy()
        },
        beforeClose: function() {
            return true;
        }
    });

    shareModal.open();

    if(password == null || password == undefined) {
        aesGcmEncrypt('{"server":"' + address + '"}', 'mx%?_nZQc?vPj=y_uUVhWRf=7').then(function(ciphertext) {
            shareModal.setContent('<p>Copy the below string and send it to whoever you wish to invite.</p><p><b><i>Never share the invite code to a encrypted server publicly. This will compromise all messages and members in the chat.</i></b></p><input type="text" value="' + ciphertext + '">');
        })
    } else {
        aesGcmEncrypt('{"server":"' + address + '","password":"' + password + '"}', 'mx%?_nZQc?vPj=y_uUVhWRf=7').then(function(ciphertext) {
            shareModal.setContent('<p>Copy the below string and send it to whoever you wish to invite.</p><p><b><i>Never share the invite code to a encrypted server publicly. This will compromise all messages and members in the chat.</i></b></p><input type="text" value="' + ciphertext + '">');
        })
    }
}

function hasAccount() {
    if(localStorage.getItem('CS_BCH_PRIVATE_KEY') == null || localStorage.getItem('CS_BCH_PRIVATE_KEY') == undefined || localStorage.getItem('CS_BCH_CASH_ADDRESS') == null || localStorage.getItem('CS_BCH_CASH_ADDRESS') == undefined) {
        return false;
    } else {
        return true;
    }
}

function accountModal() {
    var accountModal = new tingle.modal({
        onClose: function() {
            accountModal.destroy();
            location.reload();
        },
        beforeClose: function() {
            return true;
        }
    });
    
    accountModal.open();
    
    if(hasAccount() == true) {
        address = localStorage.getItem('CS_BCH_CASH_ADDRESS');
        privatekey = localStorage.getItem('CS_BCH_PRIVATE_KEY');
        mnemonic = localStorage.getItem('CS_BCH_MNEMONIC');

        accountModal.setContent('<div style="text-align:center;overflow-wrap: break-word;"><img src="https://chart.googleapis.com/chart?cht=qr&chl=' + address + '&chs=210x210&chld=L|0"><br/><br/>' + address + '<br/><br/><b>Remember to save your mnemonic and private key, or risk losing your funds</b><br/><br/><span style="color: #ff1414;">' + privatekey + '<br/>' + mnemonic + '</span></div>');
    } else {
        accountModal.setContent('<div id="account_memes_4_lyfe"><p>You have not yet created an account. Please click on one of the options below to start chatting.</p><p><a onclick="createWallet()" style="color: #fff;padding: 10px 10px 10px 10px;background: #005ff1;border-radius: 3px;cursor: pointer;margin-right: 10px;">Create Account</a><a onclick="createWallet()" style="color: #fff;padding: 10px 10px 10px 10px;background: #005ff1;border-radius: 3px;cursor: pointer;margin-right: 10px;">Import Mnemonic</a></p></div>');
    }
}

function inviteModal() {
    var inviteModal = new tingle.modal({
        onClose: function() {
            inviteModal.destroy()
        },
        beforeClose: function() {
            return true;
        }
    });

    inviteModal.open();

    inviteModal.setContent('<p>Enter your invite code below, and we\'ll try to get you into the server</p><input type="text" id="invite_code" value=""><input type="submit" onclick="decodeInviteCode();inviteModal.close();" value="Join Server">');
}

function manageAccountModal() {

    var manageAccountModal = new tingle.modal({
        onClose: function() {
            manageAccountModal.destroy()
        },
        beforeClose: function() {
            return true;
        }
    });

    manageAccountModal.open();

    if(hasAccount() == true) {
        address = localStorage.getItem('CS_BCH_CASH_ADDRESS');
        privatekey = localStorage.getItem('CS_BCH_PRIVATE_KEY');
        mnemonic = localStorage.getItem('CS_BCH_MNEMONIC');

        manageAccountModal.setContent('<div style="text-align:center;overflow-wrap: break-word;"><img src="https://chart.googleapis.com/chart?cht=qr&chl=' + address + '&chs=210x210&chld=L|0"><br/><br/>' + address + '<br/><br/><b>Remember to save your mnemonic and private key, or risk losing your funds</b><br/><br/><span style="color: #ff1414;">' + privatekey + '<br/>' + mnemonic + '</span></div>');
    } else {
        manageAccountModal.setContent('<div id="account_memes_4_lyfe"><p>You have not yet created an account. Please click on one of the options below to start chatting.</p><p><a onclick="createWallet()" style="color: #fff;padding: 10px 10px 10px 10px;background: #005ff1;border-radius: 3px;cursor: pointer;margin-right: 10px;">Create Account</a><a onclick="createWallet()" style="color: #fff;padding: 10px 10px 10px 10px;background: #005ff1;border-radius: 3px;cursor: pointer;margin-right: 10px;">Import Mnemonic</a></p></div>');
    }
}