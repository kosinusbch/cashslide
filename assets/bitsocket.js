var bitsocket = {
    source: null,
    events: {},
    open: function(query) {
      console.log("Opening ", query)
      var b64 = btoa(JSON.stringify(query))
      var url = "https://bitsocket.org"
      if (bitsocket.source) bitsocket.source.close();
      bitsocket.source = new EventSource(url+'/s/'+b64)
      bitsocket.source.addEventListener('message', function(e) {
        var m = JSON.parse(e.data)
        if (bitsocket.events.message) {
          if (m.type != "open") {
            bitsocket.events.message(m)
          }
        }
      }, false)
      bitsocket.source.addEventListener('open', function(e) {
        if (bitsocket.events.open) {
          bitsocket.events.open(e)
        }
      }, false)
      bitsocket.source.addEventListener('error', function(e) {
        console.log("state = ", e.target.readyState)
        if (e.target.readyState == EventSource.CLOSED) {
          console.log("CLOSED")
          if (bitsocket.events.close) {
            bitsocket.events.close(e)
          }
        } else if (e.target.readyState == EventSource.CONNECTING) {
          console.log("Connecting...", e);
          if (bitsocket.events.close) {
            bitsocket.events.close(e)
          }
        }
      }, false)
    },
    close: function() {
      bitsocket.source.close()
      if (bitsocket.events.close) {
        bitsocket.events.close()
      }
    },
    on: function(type, cb) {
      bitsocket.events[type] = cb;
    }
  }