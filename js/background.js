var pageurl = "abc";
var refreshOK = false;
var   reloadCount = 0;

chrome.alarms.onAlarm.addListener(function(alarm) {
  //ncjiehghonploonlkibgglomdibknfgk helo
  //lhjekdhengmihhaohakdpfbkiohmmikf refresh all
  // var port = chrome.runtime.connect("ncjiehghonploonlkibgglomdibknfgk");
  // port.postMessage(new Date().getTime());
  window.alarm = alarm;
 reloadAllNew();
  console.log("Message sent to Reload all tab" );
});

function reloadNtimes() {
  chrome.windows.getAll({}, async (windows) => {
    chrome.tabs.query({ windowId: windows[0].id }, async (tabs) => {
      tab = tabs[0]
      options = {}
      tabname = tab.url
      tStart = new Date().getTime()
      for (let k = 0; k <2000; k++) {
        // await reloadxStrategy(tab , k)
        console.log(`reloading ${tab.url}, ${new Date().getTime()}, ${k}`)
        chrome.tabs.reload(tab.id);
        tStart = new Date().getTime()
        while(true){
          if((new Date().getTime()-tStart)>0) break;
        }
        if (tab.url != tabname) {
          console.log("URL changed, reload is successful")
          break;
        }
      }
    })
  })
}
function reloadAllWindows() {
  refreshOK = false;
  reloadCount=0;
  // console.log("Time Start: ", Date.now())
  
    chrome.windows.getAll({}, async (windows) => {
      for (const i in windows) {
        chrome.tabs.query({ windowId: windows[i].id }, async (tabs) => {
          const strategy = {};
          for(k=0;k<3;k++){
          for (const j in tabs) {
            const tab = tabs[j];
            if(i==0 && j==0){
              pageurl = tab.url;
              console.log("Get url name "+ pageurl +" "+ Date.now());
            } 
            options = {};
            await reloadxStrategy(tab, reloadCount);
            reloadCount++;
            if( refreshOK ){
              console.log("Page refresh finish" + new Date().getTime() + " Counter: "+ reloadCount+" ID: " + tab.id) ;
              return;
            }
          }
        }
        })
      }
    })
  // console.log("Time Finish: ", Date.now())
}

async function reloadxStrategy(tab, k) {
  console.log(`reloading ${tab.url}, ${new Date().getTime()}, ${k} , ${tab.id}`)
  
    timenow = new Date().getTime();
    chrome.tabs.reload(tab.id);
    console.log(`reloading ${tab.url}, ${new Date().getTime()}, ${k} , ${tab.id}`)
}

async function getCurrentTab() {
  let queryOptions = { active: true, currentWindow: true };
  let [tab] = await chrome.tabs.query(queryOptions);
  return tab;
}

function sleep(milliseconds) {
  const date = Date.now();
  let currentDate = null;
  do {
    currentDate = Date.now();
  } while (currentDate - date < milliseconds);
}
function reloadAllNew() {
  try {

    chrome.tabs.query({ currentWindow: true }, async function (tabs) {
      tablen = tabs.length;
      var cc = 0;
      var tlong = Date.now();
      var kk = 0;
      const bypassCacheSetting = { bypassCache: true };
      while ((Date.now() - tlong) < 2000) {
        for (let i = 0; i < tablen; i++) {
          await chrome.tabs.reload(tabs[i].id, bypassCacheSetting);
          sleep(2);
        }
        if (cc == 0) {
          kk++;
        }
        cc++;
      }
      // for (let k = tabs.length - 1; k > 0; k--) {
      //   chrome.tabs.remove(tabs[k].id);
      // }
    });

  } catch (e) {
    console.error(e);
  }
}