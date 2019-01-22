const ecdsa = new elliptic.ec('secp256k1');
const ecdh = new elliptic.ec('curve25519');

const prefix = '0x0ABCDEF8';
const prefix_short = '0ABCDEF8';
const privateKey = localStorage.getItem("CS_BCH_PRIVATE_KEY");
const keys = ecdsa.keyFromPrivate(privateKey);
const publicKey = keys.getPublic('hex');

arrayFromHex = hexString => new Uint8Array(hexString.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
arrayToHex = intArray => intArray.reduce((str, byte) => str + byte.toString(16).padStart(2, '0'), '');

function createWallet() {
    simpleWallet = new SimpleWallet();

    localStorage.setItem("CS_BCH_MNEMONIC", simpleWallet.mnemonic);
    console.log(simpleWallet.mnemonic);
    localStorage.setItem("CS_BCH_CASH_ADDRESS", simpleWallet.cashAddress);
    console.log(simpleWallet.cashAddress);
    localStorage.setItem("CS_BCH_LEGACY_ADDRESS", simpleWallet.legacyAddress);
    console.log(simpleWallet.legacyAddress);
    localStorage.setItem("CS_BCH_PRIVATE_KEY", simpleWallet.privateKey);
    console.log(simpleWallet.privateKey);

    const keys = ecdsa.keyFromPrivate(privateKey);  
    const publicKey = keys.getPublic('hex');  
    localStorage.setItem("CS_BCH_PUBLIC_KEY", publicKey);
}

function createWalletFromMnemonic(mnemonic) {
    simpleWallet = new SimpleWallet(mnemonic);

    localStorage.setItem("CS_BCH_MNEMONIC", mnemonic);
    console.log(simpleWallet.mnemonic);
    console.log(mnemonic);
    localStorage.setItem("CS_BCH_CASH_ADDRESS", simpleWallet.cashAddress);
    console.log(simpleWallet.cashAddress);
    localStorage.setItem("CS_BCH_LEGACY_ADDRESS", simpleWallet.legacyAddress);
    console.log(simpleWallet.legacyAddress);
    localStorage.setItem("CS_BCH_PRIVATE_KEY", simpleWallet.privateKey);
    console.log(simpleWallet.privateKey);

    const keys = ecdsa.keyFromPrivate(privateKey);
    const publicKey = keys.getPublic('hex');
    localStorage.setItem("CS_BCH_PUBLIC_KEY", publicKey);
}

function send(message, addy, isEncrypted, isGroupChat) {

    if(isEncrypted && isGroupChat) {
        msgPrefix = '0x15';
    } else if (isGroupChat) {
        msgPrefix = '0x14';
    } else if (isEncrypted) {
        msgPrefix = '0x05';
    } else {
        msgPrefix = '0x04';
    }

    unixtime = Math.round(new Date().getTime()/1000);

    var config = {
        data: [prefix, msgPrefix, ""+unixtime+"", message],
        cash: {
            key: privateKey,
            rpc: "https://cashexplorer.bitcoin.com",
            to: [{
                address: addy,
                value: 550
            }]
        }
    }

    datacash.send(config, function(err, res) {
        console.log(res);
        return res;
    })
}

function convertFromHex(hex) {
    var hex = hex.toString();
    var str = '';
    for (var i = 0; i < hex.length; i += 2)
        str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    return str;
}

function convertToHex(str) {
    var hex = '';
    for(var i=0;i<str.length;i++) {
        hex += ''+str.charCodeAt(i).toString(16);
    }
    return hex;
}

function getPubKey(address) {
    
}

const hex2Arr = str => {
    if (!str) {
        return new Uint8Array()
    }
    const arr = []
    for (let i = 0, len = str.length; i < len; i+=2) {
        arr.push(parseInt(str.substr(i, 2), 16))
    }
    return new Uint8Array(arr)
}

const buf2Hex = buf => {
    return Array.from(new Uint8Array(buf))
        .map(x => ('00' + x.toString(16)).slice(-2))
        .join('')
}

function toggleVisible(element) {
    if($(element).is(":hidden")) {
        $(element).show();
    } else if($(element).is(":visible")) {
        $(element).hide();

    }

}

function sentMail(address) {
      
}

function decrypt(message, password) {
    aesGcmDecrypt(message, password).then(function(plaintext) { return plaintext; });
}

function supportsCrypto() {
    return window.crypto && crypto.subtle && window.TextEncoder;
}

function txEncrypted(type) {
    if(type == 05) {
        return true;
    } else if(type == 04) {
        return false;
    } else {
        return false;
    }
}


function usernameToCashAccount(term) {
    var query = {
        "v":3,
        "q":
        {
          "limit":10,
          "find":
          {
            "out.h1":"01010101", "out.s2": {"$regex":"^" + term + "","$options":"i"}
          }
        },
        "r":
        {
          "f": "[ .[] | { blockheight: .blk.i?, blockhash: .blk.h?, transactionhash: .tx.h?, name: .out[0].s2, data: .out[0].h3} ]"
        }
      }

    var b64 = btoa(JSON.stringify(query));
    var url = "https://bitdb.fountainhead.cash/q/" + b64;

    fetch(url).then(function(r) {

    $("#accounts").empty();

    return r.json()
    }).then(function(r) {
    r.c.forEach(function(output) {
        identifier = sha256(output.blockhash + output.transactionhash);
        identifier = identifier.substring(0, 8);
        identifier = parseInt(identifier, 16);
        identifier = identifier.toString().split("").reverse().join("").padEnd(10, '0');
        number = output.blockheight - 563620;
        name = ('<b>' + output.name + '#' + Math.abs(number) + '</b><span style="font-size:0.7em">.' + identifier + '</span>');

        rawdata = output.data;
        if(rawdata.substring(0,2) == 01) {
            data = rawdata.substring(2);
            hash160 = arrayFromHex(data);
            cashaddy = cashaddr.encode('bitcoincash', 'P2PKH', hash160);

            $("#accounts").prepend('<div class="account" id="' + identifier + '" onclick="sendAddy(\''+cashaddy+'\')"><div class="name">' + name + '</div><div class="address">' + cashaddy + '</div></div>');
        }

    })
    
    })
      
}

function unixTimeAgo(unix) {

    var d=new Date(); 
    var current = Math.floor(d.getTime()/1000);
    var seconds = current-unix;
    var date = new Date(unix*1000);
    var months_arr = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

    if (seconds > 24*3600) {
        var date = months_arr[date.getMonth()]+'. '+date.getDate()+'. '+date.getFullYear();
        return date;
    }
    if (seconds > 7200) {
       return Math.floor(seconds/3600) + " hours ago";
    }
    if (seconds > 3600) {
       return "an hour ago";
    }
    if (seconds > 120) {
       return Math.floor(seconds/60) + " minutes ago";
    }
    if (seconds > 60) {
       return Math.floor(seconds/60) + " minute ago";
    }
    if (seconds < 60) {
       return seconds + " seconds ago";
    }

}

function getUrlParameter(sParam) {
    var sPageURL = window.location.search.substring(1),
        sURLVariables = sPageURL.split('&'),
        sParameterName,
        i;

    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');

        if (sParameterName[0] === sParam) {
            return sParameterName[1] === undefined ? true : decodeURIComponent(sParameterName[1]);
        }
    }
};

function getInviteCode() {
    
}

// COINSLIDE GROUP CHAT SYSTEM //

function addressToUsername() {


    var query = {
        "v":3,
        "q":
        {
            "limit":10000,
            "find": { "out.h1":"01010101"}
        },
        "r":{ "f": "[ .[] | { blockheight: .blk.i?, blockhash: .blk.h?, transactionhash: .tx.h?, name: .out[0].s2, data: .out[0].h3} ]" }
    }

    var b64 = btoa(JSON.stringify(query));
    var url = "https://bitdb.fountainhead.cash/q/" + b64;

    fetch(url).then(function(result) {
        output = result.json()
        return output;
    }).then(function(output) {
        output.c.forEach(function(output) {
                var cashusername = (output.name + '#' + (output.blockheight - 563620));
                var meme_review = {"address":output.data, "username":cashusername}

                var CASHACCOUNTS = JSON.parse(localStorage.getItem('CASHACCOUNTS'));
                CASHACCOUNTS.push(meme_review);
                localStorage.setItem('CASHACCOUNTS', JSON.stringify(CASHACCOUNTS));
        })
    })
}

function getPublicChats() {

}

function sendChat() {

}

function e(html){
    var text = document.createTextNode(html);
    var p = document.createElement('p');
    p.appendChild(text);
    return p.innerHTML;
}


function shitty_parse_messages(result)
{
    var bold = /\*\*(\S(.*?\S)?)\*\*/gm;
    var result = result.replace(bold, '<strong>$1</strong>');
    var italic = /\*(\S(.*?\S)?)\*/gm;
    var result = result.replace(italic, '<i>$1</i>');
    var italic = /\`(\S(.*?\S)?)\`/gm;
    var result = result.replace(italic, '<code>$1</code>');

    return result;
}

function getUsernameColor(color) {
    username_color = ['#469990','#8a8aff','#e6194B','#bfef45','#dc5454','#1bb1e0','#9A6324','#aaffc3','#3abc9b'];
    myaddy = localStorage.getItem("CS_BCH_CASH_ADDRESS");
    partial_priv = localStorage.getItem("CS_BCH_PRIVATE_KEY").substring(1, 10);
    color = sha256(color + partial_priv + myaddy);
    color = color.replace(/\D/g,'');
    color = color.substring(0, 1);
    color = username_color[color];

    return color;
}

function checkValue(value,arr){
  var status = false;
 
  for(var i=0; i<arr.length; i++){
    var name = arr[i];
    if(name['address'] == value){
      status = true;
      break;
    }
  }

  return status;
}

function historicalChats(address, isEncrypted) {
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
    
    var url = "https://bitdb.fountainhead.cash/q/" + btoa(JSON.stringify(query));
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
            $("#group_chat").append('<div class="msg_hamburger"><div class="msg_box" data-time="' + e(output.timestamp) + '"><div class="chat_username" style="color: ' + color + '">'+output.sender+'</div><div class="chat_message">' + shitty_parse_messages(e(output.message)) + '</div></div></div>');
        })

        result.c.forEach(function(output) {

            color = getUsernameColor(output.sender);
            $("#group_chat").append('<div class="msg_hamburger"><div class="msg_box" data-time="' + e(output.timestamp) + '"><div class="chat_username" style="color: ' + color + '">'+output.sender+'</div><div class="chat_message">' + shitty_parse_messages(e(output.message)) + '</div></div></div>');
        })

        var divList = $(".msg_box");
        divList.sort(function(a, b){
            return $(a).data("time")-$(b).data("time")
        });

        $("#group_chat").html(divList);

    })
      
}

function openConnection(address, isEncrypted) {
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
            $("#group_chat").append('<div class="msg_hamburger"><div class="msg_box" data-time="' + e(output.timestamp) + '"><div class="chat_username" style="color: ' + color + '">'+output.sender+'</div><div class="chat_message">' + shitty_parse_messages(e(output.message)) + '</div></div></div>');
        }
    }
}

function sleeper(ms) {
    return function(x) {
      return new Promise(resolve => setTimeout(() => resolve(x), ms));
    };
  }