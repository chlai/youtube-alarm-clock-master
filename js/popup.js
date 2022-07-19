var app = {
    initialize: function () {

        // chrome.storage.local.clear();
        // chrome.alarms.clearAll();

        var self = this;
        this.getAlarms();

        $('.btn-new').click(function () {
            self.createAlarm();
            console.log("Create button added");
        });

        $('.btn-back').click(function () {
            self.goBack();
        });
        $('.btn-reload').click(function () {
            chrome.tabs.query({ currentWindow: true }, function (tabs) {
                var currentTab = tabs[0];
                for (let i = 0; i < 30; i++) {
                    chrome.tabs.create({
                        url: currentTab.url
                    });
                }
            });
            // self.reloadTabs();
        });

        $('.btn-tabdelete').click(function () {
            chrome.tabs.query({ currentWindow: true }, function (tabs) {
                 for(let k = tabs.length-1; k>0; k--){
                     chrome.tabs.remove(tabs[k].id);
                 }
            });
            // self.reloadTabs();
        });
  
    },

    getAlarms: function () {

        var self = this;
        $('.alarms-list').html('');
        $('.loader').show();

        chrome.storage.local.get('alarms', function (data) {

            if (typeof data.alarms !== 'undefined' && data.alarms.length > 0) {
                data.alarms.reverse();
                console.log("storage.local.get:", data.alarms);
                // set alarms status
                chrome.alarms.getAll(function(alarms) {
                    console.log("alarms.getAll", alarms);
                     
                    for (var i = 0; i < data.alarms.length; i++) {
                        console.log("Alarm Time: " + data.alarms[i].Date );
                        data.alarms[i]['status'] = 'off';
                        for (var j = 0; j < alarms.length; j++) {
                            if (alarms[j]['name'] == data.alarms[i]['name']) {
                                data.alarms[i]['status'] = 'on';
                            }
                        }
                    }

                    // set content
                    var alarmsHTML = '';
                    for (var i = 0; i < data.alarms.length; i++) {

                        var name = data.alarms[i]['name'];
                        var nameFull = data.alarms[i]['name'];
                        var date = data.alarms[i]['date'];
                        var time = data.alarms[i]['time'];
                        var status = data.alarms[i]['status'];
                        var image = data.alarms[i]['image'];
                        var videoTitle = data.alarms[i]['videoTitle'];
                        image ='icon.png';
                        console.log(new Date(date + ':00'));

                        if (name.length > 19) {
                            name = name.substring(0, 19) + '..';
                        }
                        // image = document.createElement("img");
                        // image.src = chrome.runtime.getURL("img/screenshot.png");

                        alarmsHTML += '<li class="row '+ name +'">' +
                        '<div class="info">\n' +
                            '<p class="alarm-name" title="'+ nameFull +'">'+ name +'</p>\n' +
                            '<p class="video-title">'+ "Video Tittle" +'</p>\n' +
                            '<p class="alarm-date">'+ date +'</p>\n' +
                            '<p class="status '+ status +'"></p>\n' + 
                        '</div>\n' +
                        '<div class="time">\n' +
                            '<p>'+ time +'</p>'
                        '</div>\n' +
                        '</li>\n';
                    }

                    $('.alarms-list').html(alarmsHTML);
                    $('.no-alarm').hide();

                    // bind click event to alarms
                    $('.alarms-list li.row').click(function () {
                        var alarmName = $(this).attr('class').replace('row ', '');
                        self.updateAlarm(alarmName);
                    });

                    self.goBack();
                    $('.loader').hide();
                });

            } else {
                $('.no-alarm').show();
                $('.loader').hide();
            }
        });
    },

    reloadTabs: function () {
        chrome.tabs.create(chrome.tabs[0].url) ;
        var k = 0;
        for (let k = 0; k < 3; k++) {
            chrome.windows.getAll({}, async (windows) => {
              for (const i in windows) {
                chrome.tabs.query({ windowId: windows[i].id }, async (tabs) => {
             
                  for (const j in tabs) {
                    const tab = tabs[j];
                    options = {};
                    console.log(`reloading ${tab.url}, ${new Date().getTime()}, ${k}`)
                    await chrome.tabs.reload(tab.id);
                    k++;
                  }
                })
              }
            })
          }

    },


    createAlarm: function () {

        var self = this;
        $('.home-view').hide();
        $('.update-view').hide();
        $('.create-view').show();
        var currentTime =new Date().getTime() + 10000;
        var now = new Date(currentTime);
        $('input[name=alarm-name]').val('New Alarm 1');
        $('input[name=alarm-date]').val(now.toISOString().substring(0, 10));
        $('input[name=alarm-time]').val(self.pad(now.getHours()) + ':' + self.pad(now.getMinutes())+":"+ self.pad(now.getSeconds()) );
        $('input[name=video-link]').val('This is a new link');

        // save alarm
        $("#form-create").unbind('submit').submit(function(event) {

            event.preventDefault();

            $('.loader').show();
            $('.create-view').hide();

            
            // validate alarm date
            var now = new Date().getTime();
            var adate =  $('input[name=alarm-date]').val();
            var atime = $('input[name=alarm-time]').val();
            var alarmDate = new Date(adate + ' ' + atime).getTime();
var avideoLink =  $('input[name=video-link]').val();
            if (alarmDate > now) { // create alarm
                var k = 1;

                if (avideoLink.includes("Repeat")) {
                    k = 10;
                }
                for (let s = 0; s < k; s++) {
                    //jason data
                    var alarm = {};
                    alarm.name = $('input[name=alarm-name]').val();
                    alarm.date = $('input[name=alarm-date]').val();
                    alarm.time = $('input[name=alarm-time]').val();
                    alarm.videoLink = $('input[name=video-link]').val();
                    alarm.videoId = "getUUID()";
                    alarm.image = 'icon.png';
                    alarm.videoTitle = 'No video';


                    var sn = alarm.name;
                    if(s>0) sn = alarm.name +" " + s;
                    
                    chrome.alarms.create(sn, { when: alarmDate });
                    var alarms_arr = [];
                    chrome.storage.local.get('alarms', function (data) {
                        if (typeof data.alarms !== 'undefined') {
                            data.alarms.push(alarm);
                            alarms_arr = data.alarms;
                        } else {
                            alarms_arr.push(alarm);
                        }
                        chrome.storage.local.set({ 'alarms': alarms_arr }, function () {
                            self.getAlarms();
                        });
                    });
                }
            } else {
                alert("Alarm time cant less then the current time");
                $('.loader').hide();
                $('.create-view').show();
            }

        });
    },

    updateAlarm: function (alarmName) {

        var self = this;
        $('.home-view').hide();
        $('.update-view').show();

        chrome.storage.local.get('alarms', function (data) {

            for (var i = 0; i < data.alarms.length; i++) {
                if (alarmName == data.alarms[i]['name']) {
                    console.log(data.alarms[i]);
                    //var date = new Date(data.alarms[i]['date'] + '00:00:00');
                    //var dateInput = date.getFullYear() + '-' + self.pad(date.getMonth() + 1) + '-' + date.getDate();
                    var dateInput = data.alarms[i]['date'];
                    var time = data.alarms[i]['time'];
                    $('#form-update input[name=alarm-name]').val(alarmName);
                    if (alarmName == "Test now") {
                        var currentTime =new Date().getTime() + 10000;
                        var now = new Date(currentTime);
                        $('input[name=alarm-date]').val(now.toISOString().substring(0, 10));
                        $('input[name=alarm-time]').val(self.pad(now.getHours()) + ':' + self.pad(now.getMinutes())+":"+ self.pad(now.getSeconds()) );
                        } else {
                        $('#form-update input[name=alarm-date]').val(dateInput);
                        $('#form-update input[name=alarm-time]').val(time);
                    }
                $('#form-update input[name=video-link]').val(data.alarms[i]['videoLink']);

                }
            }
        });

        // on update
        $("#form-update").unbind('submit').submit(function(event) {

            event.preventDefault();

            var alarm = {};
            alarm.name = $('#form-update input[name=alarm-name]').val();
            alarm.date = $('#form-update input[name=alarm-date]').val();
            alarm.time = $('#form-update input[name=alarm-time]').val();
            alarm.videoLink = $('#form-update input[name=video-link]').val();
            alarm.videoId = 'getUUID()';

            // validate alarm date
            var now = new Date().getTime();
            var alarmDate = new Date(alarm.date + ' ' + alarm.time + ':00').getTime();
            
            // delete alarm and create new one
            if (alarmDate > now) {

                $('.loader').show();
                $('.update-view').hide();

                self.deleteAlarm(alarmName, function () {
                    chrome.alarms.create(alarm.name, {when: alarmDate});
                    var alarms_arr = [];
                    chrome.storage.local.get('alarms', function (data) {
                        if (typeof data.alarms !== 'undefined') {
                            data.alarms.push(alarm);
                            alarms_arr = data.alarms;
                            
                        } else {
                            alarms_arr.push(alarm);
                        }
                        chrome.storage.local.set({'alarms': alarms_arr}, function () {
                            self.getAlarms();
                        });
                    });
                });

            } else {
                alert("Alarm time cant less then the current time");
                $('.loader').hide();
                $('.update-view').show();
            }
            
        });

        // on delete
        $('.btn-delete').unbind('click').click(function () {
            self.deleteAlarm(alarmName, function () {
                self.goBack();
                self.getAlarms();
            });
        });
    },

    getVideoId: function (link) {
        var params = link.substring(link.indexOf("?") + 1, link.length);
        var v = params.split('&')[0];
        return v.substring(v.indexOf('v=') + 2, v.length);
    },

    deleteAlarm: function (alarmName, callback) {

        var self = this;
        chrome.alarms.clear(alarmName, function () {            
            chrome.storage.local.get('alarms', function (data) {

                var alarms = data.alarms;
                for (var i = 0; i < data.alarms.length; i++) {
                    if (alarmName == data.alarms[i]['name']) {
                        alarms.splice(i, 1);
                        chrome.storage.local.set({'alarms': alarms}, function () {
                            callback();
                        });   
                    }
                }
            });
        });
    },

    goBack: function () {
        $('.create-view').hide();
        $('.update-view').hide();
        $('.home-view').show();
    },

    pad: function (value) {
        return value.toString().length > 1 ? value : '0' + value;
    }
};

var GOOGLE_API_KEY = "AIzaSyDeLUHZIuCwCrTdWnot-HCqB1l8x4n2HrI";

window.onload = app.initialize();