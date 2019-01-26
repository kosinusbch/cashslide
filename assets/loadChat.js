function initializeUsernames() {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve('resolved');
        }, 2000);
    });
}

function myCircle(address) {
    var query = {
        "v": 3,
        "q": {
          "find": {"out.e.a":address},
          "limit": 1000
        },"r": {
          "f": "[.[] | .in[] | .e  | select(.a and .a != \""+address+"\") | . | {addr: .a}] | unique | sort"
        }
    }

    var url = "https://bitdb.bch.sx/q/" + btoa(JSON.stringify(query));

    

    fetch(url).then(function(result) {
        result = result.json()
        return result;
    }).then(function(result) {
        result.u.forEach(function(output) {

        })
        result.c.forEach(function(output) {
            var restore = JSON.parse(localStorage.getItem('MY_CIRCLE'));

            if (checkValue(output.addr,restore)) {
                //do nothing
            } else {
                var meme_review = {"server":address, "address":output.addr}

                restore.push(meme_review);
                localStorage.setItem('MY_CIRCLE', JSON.stringify(restore));        
                
                getUsername(output.addr);
                
            }
        })
    })
}

function getUsername(address) {

    var cashaccounts = JSON.parse(localStorage.getItem('CASHACCOUNTS'));

    if (checkValue(address, cashaccounts) == false) {
        const { prefix, type, hash } = cashaddr.decode('bitcoincash:' + address);


        meme_types = {"P2PKH":"01","P2SH":"02","P2PC":"04","P2SK":"03"};
        
        var txdata = meme_types[type] + arrayToHex(hash);
        //console.log(output.address + ' = ' + txdata)

        var query = {
            "v": 3,
            "q": {
              "find": {"out.h3":txdata},
              "limit": 1
            },"r":{"f":"[ .[] | ( .out[] | select(.b0.op==106) ) as $outWithData | { blockheight: .blk.i?, blockhash: .blk.h?, transactionhash: .tx.h?, name: $outWithData.s2, data: $outWithData.h3 } ]"}
        }

        var b64 = btoa(JSON.stringify(query));
        var url = "https://bitdb.bch.sx/q/" + b64;
    
        fetch(url).then(function(result) {
            output = result.json()
            return output;
        }).then(function(output) {
            output.c.forEach(function(output) {
                var cashusername = (output.name + '#' + (output.blockheight - 563620));
                var meme_review = {"address":address, "username":cashusername}

                var CASHACCOUNTS = JSON.parse(localStorage.getItem('CASHACCOUNTS'));
                CASHACCOUNTS.push(meme_review);
                localStorage.setItem('CASHACCOUNTS', JSON.stringify(CASHACCOUNTS));
            })
        })
    }

}


function getMessages(address, isEncrypted) {
    if(isEncrypted) {
        msgPrefix = '15';
    } else {
        msgPrefix = '14';
    }
    
    var query = {
        "v":3,
        "q":
        {
          "limit":1000,
          "find":
          {
            "out.h1":prefix_short, "out.e.a":address, "out.h2":msgPrefix
          }
        },
        "orderby": { "out.s3" : -1 },
        "r":{"f": "[ .[] | { txid: .tx.h?, confirmed: .blk.t?, txtype: .out[0].h2, timestamp: .out[0].s3, message: .out[0].s4, sender: .in[0].e.a, receiver1: .out[1].e.a?, receiver2: .out[2].e.a?, receiver3: .out[3].e.a?, receiver4: .out[4].e.a?} ]"}
      }
    
    var url = "https://bitdb.bch.sx/q/" + btoa(JSON.stringify(query));
    fetch(url).then(function(result) {
        result = result.json()
        return result;
    }).then(function(result) {

        console.log(result);

        $("#group_chat").empty();
        $("#sentMail").empty();
        $('#message').empty();

        //result.sort(dynamicSort("timestamp"));

        result.u.forEach(function(output) {
            color = getUsernameColor(output.sender);

            var cashaccounts = JSON.parse(localStorage.getItem('CASHACCOUNTS'));
            var name = output.sender;

            if (checkValue(output.sender, cashaccounts)) {
                var item = cashaccounts.find(item => item.address === output.sender);
                name = item.username;
            }

            $("#group_chat").append('<div class="msg_hamburger"><div class="msg_box" data-time="' + e(output.timestamp) + '"><div class="chat_username" style="color: ' + color + '">'+name+'</div><div class="chat_message">' + shitty_parse_messages(e(output.message)) + '</div></div></div>');
        })

        result.c.forEach(function(output) {
            color = getUsernameColor(output.sender);

            var cashaccounts = JSON.parse(localStorage.getItem('CASHACCOUNTS'));
            var name = output.sender;

            if (checkValue(output.sender, cashaccounts)) {
                var item = cashaccounts.find(item => item.address === output.sender);
                name = item.username;
            }

            $("#group_chat").append('<div class="msg_hamburger"><div class="msg_box" data-time="' + e(output.timestamp) + '"><div class="chat_username" style="color: ' + color + '">'+name+'</div><div class="chat_message">' + shitty_parse_messages(e(output.message)) + '</div></div></div>');
        })

        var divList = $(".msg_box");
        divList.sort(function(a, b){
            return $(a).data("time")-$(b).data("time")
        });

        $("#group_chat").html(divList);

    })
      
}

function openChatSocket(address, isEncrypted) {
    if(isEncrypted) {
        msgPrefix = '15';
    } else {
        msgPrefix = '14';
    }

    var query = {
        "v": 3,
        "q": {
            "find": {"out.h1":prefix_short, "out.e.a":address, "out.h2":msgPrefix}
        },
        "r": {
            "f": "[ .[] | { txid: .tx.h?, confirmed: .blk.t?, txtype: .out[0].h2, timestamp: .out[0].s3, message: .out[0].s4, sender: .in[0].e.a, receiver1: .out[1].e.a?, receiver2: .out[2].e.a?} ]"
        }
    }

    var bitsocket = new EventSource('https://bitsocket.org/s/'+btoa(JSON.stringify(query)))

    bitsocket.onmessage = function(event) {
        var output = JSON.parse(event.data);
        var output = output.data[0];
        if(output.message !== undefined && output.message !== null) {
            color = getUsernameColor(output.sender);

            var cashaccounts = JSON.parse(localStorage.getItem('CASHACCOUNTS'));
            var name = output.sender;

            if (checkValue(output.sender, cashaccounts)) {
                var item = cashaccounts.find(item => item.address === output.sender);
                name = item.username;
            }

            $("#group_chat").append('<div class="msg_hamburger"><div class="msg_box" data-time="' + e(output.timestamp) + '"><div class="chat_username" style="color: ' + color + '">'+name+'</div><div class="chat_message">' + shitty_parse_messages(e(output.message)) + '</div></div></div>');
        }
    }
}

function asyncFunction (output, cb, address) {
    var restore = JSON.parse(localStorage.getItem('MY_CIRCLE'));

    if (checkValue(output.addr,restore)) {
        //do nothing
    } else {
        var meme_review = {"server":address, "address":output.addr}

        restore.push(meme_review);
        localStorage.setItem('MY_CIRCLE', JSON.stringify(restore));        
        
        getUsername(output.addr);
        
    }

    console.log(output);
    cb();
}

function initializeGropeCat(address, password = null) {
    var address = address;

    sessionStorage.setItem('CS_CONNECTED_SERVER', address);

    var restore = JSON.parse(localStorage.getItem('MY_CIRCLE'));

    let requests = restore.reduce((promiseChain, item) => {

        return promiseChain.then(() => new Promise((resolve) => {
            asyncFunction(item, resolve, address);
        }));
    }, Promise.resolve());

    requests.then(() => {

        $("#group_chat").empty();
        $("#group_chat").append('<h3 style="text-align:center;margin-top: 30vh;color: #fff;">Joining ' + e(address) + ' <i class="zmdi zmdi-spinner"></i></h3>');

        setTimeout(function(){
            console.log('1fetching messages..');
            getMessages(address, false);
    
            console.log('1launching bitsocket..');
            openChatSocket(address, false);
 
            $("#memenavmenu").empty();
            $("#memenavmenu").append('<a onclick="shareModalOpen(\''+address+'\')" style="display: inline-block;cursor: pointer;">Invite</a>');
            $("#memenavmenu").append('<a href="/" style="display: inline-block;cursor: pointer;">Disconnect</a>');
        
            if(hasAccount() == false) {
                $("#addmessageforms").append('<div style="color:#fff;text-align:center;font-size:1em;height:100%;max-width: 425px;padding-top: 8px;box-sizing: border-box;margin: auto;"><a style="display:block;color: #000;background: #69ea6d;padding: 8px 5px 8px 5px;border-radius: 30px;cursor: pointer;" onclick="accountModal()">Click Here to Create a Wallet And Start Chatting</a></div>');
            } else {
                $("#addmessageforms").append('<input style="display:inline-block;" id="message" type="text" placeholder="Write a message..." autocomplete="off"><i class="zmdi zmdi-mail-send button_send" onclick="send_transaction()"></i>');
            }

        }, 50);
    })
}

function initializeGroupChat(address, password = null) {
    
    sessionStorage.setItem('CS_CONNECTED_SERVER', address);

    if(password == null || password == undefined) {
        isEncrypted = false;
    } else {
        isEncrypted = true;
    }

    $("#group_chat").empty();
    $("#group_chat").append('<h3 style="text-align:center;margin-top: 30vh;color: #fff;">Joining ' + e(address) + ' <i class="zmdi zmdi-spinner"></i></h3>');
    //await serverInfo(address);

    console.log('fetching members..');
    myCircle(address);

    setTimeout(function(){
        console.log('fetching messages..');
        getMessages(address, isEncrypted);

        console.log('launching bitsocket..');
        openChatSocket(address, isEncrypted);
    }, 500);

    $("#memenavmenu").empty();
    $("#memenavmenu").append('<a onclick="shareModalOpen(\''+address+'\')" style="display: inline-block;cursor: pointer;">Invite</a>');
    $("#memenavmenu").append('<a href="/" style="display: inline-block;cursor: pointer;">Disconnect</a>');

    if(hasAccount() == false) {
        $("#addmessageforms").append('<div style="color:#fff;text-align:center;font-size:1em;height:100%;max-width: 425px;padding-top: 8px;box-sizing: border-box;margin: auto;"><a style="display:block;color: #000;background: #69ea6d;padding: 8px 5px 8px 5px;border-radius: 30px;cursor: pointer;" onclick="accountModal()">Click Here to Create a Wallet And Start Chatting</a></div>');
    } else {
        $("#addmessageforms").append('<input style="display:inline-block;" id="message" type="text" placeholder="Write a message..." autocomplete="off"><i class="zmdi zmdi-mail-send button_send" onclick="send_transaction()"></i>');
    }

}