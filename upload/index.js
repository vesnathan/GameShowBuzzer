var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var crypto = require('crypto');
const util = require('util');
const expressip = require('express-ip');
app.use(expressip().getIpInfoMiddleware);
//var mysqlPass = "gbkIb6_k@lXPtQl2-mn4"; // RASPI VERSION
var mysqlPass = 'uZX0khRkZWC.'; // ONLINE VERSION
var controlScreenIP;

app.get('/', function(req, res){  res.sendFile(__dirname + '/button.html');});
app.get('/demo.html', function(req, res){  res.sendFile(__dirname + '/demo.html');});
app.get('/monitor.html', function(req, res){  res.sendFile(__dirname + '/monitor.html');});
app.get('/scoreboard.html', function(req, res){  res.sendFile(__dirname + '/scoreboard.html');});
app.get('/playerscreen.html', function(req, res){  res.sendFile(__dirname + '/playerscreen.html');});
app.get('/index.html', function(req, res){  res.sendFile(__dirname + '/index.html');});
app.get('/control.html', function(req, res){  res.sendFile(__dirname + '/control.html'); controlScreenIP = req.ip;  });
app.get('/jscolor.js', function(req, res){  res.sendFile(__dirname + '/jscolor.js');});
app.get('/button.html', function(req, res){  res.sendFile(__dirname + '/button.html');});
app.get('/answer.mp3', function(req, res){  res.sendFile(__dirname + '/answer.mp3');});
app.get('/sounds.js', function(req, res){  res.sendFile(__dirname + '/sounds.js');});
app.get('/controlPanelScript.js', function(req, res){  res.sendFile(__dirname + '/controlPanelScript.js');});
app.get('/style.css', function(req, res){  res.sendFile(__dirname + '/style.css');});
app.get('/jquery-form-elements.js', function(req, res){  res.sendFile(__dirname + '/jquery-form-elements.js');});
app.get('/jquery-1.11.1.js', function(req, res){  res.sendFile(__dirname + '/jquery-1.11.1.js');});
app.get('/jquery-1.12.4.js', function(req, res){  res.sendFile(__dirname + '/jquery-1.12.4.js');});
app.get('/jquery-3.3.1.js', function(req, res){  res.sendFile(__dirname + '/jquery-3.3.1.js');});
app.get('/jquery-ui.css', function(req, res){  res.sendFile(__dirname + '/jquery-ui.css');});
app.get('/jquery-ui.js', function(req, res){  res.sendFile(__dirname + '/jquery-ui.js');});
app.get('/jquery.fittext.js', function(req, res){  res.sendFile(__dirname + '/jquery.fittext.js');});
app.get('/images/ui-icons_777777_256x240.png', function(req, res){  res.sendFile(__dirname + '/images/ui-icons_777777_256x240.png');});
app.get('/images/ui-icons_555555_256x240.png', function(req, res){  res.sendFile(__dirname + '/images/ui-icons_555555_256x240.png');});
app.get('/images/ui-icons_ffffff_256x240.png', function(req, res){  res.sendFile(__dirname + '/images/ui-icons_ffffff_256x240.png');});

app.get('/powerPoint.html', function(req, res){ res.redirect('/powerPointScoreBoard.html?ip='+req.ip.replace('::ffff:','')); });
app.get('/powerPointScoreBoard.html', function(req, res){  res.sendFile(__dirname + '/powerPointScoreBoard.html');});

app.get('/powerPointButtons.html', function(req, res){ res.redirect('/powerPointButtonCodes.html?ip='+req.ip.replace('::ffff:','')); });
app.get('/powerPointButtonCodes.html', function(req, res){  res.sendFile(__dirname + '/powerPointButtonCodes.html');});

var counter = 0;

var mysql = require('mysql');

const con = mysql.createConnection({
    host: '127.0.0.1', // Use IPv4 localhost
    user: 'root', // Replace with your MySQL username
    password: mysqlPass, // Replace with your MySQL password
    database: 'gsb', // Replace with your database name
  });
  
  con.connect((err) => {
    if (err) throw err;
    console.log('Connected to MySQL');
  });



// con.connect(function(err) {
//   if (err) throw err;
//   // counter++;  // console.log(counter+": MySQL Connected!");
// });
// setInterval(function () {
//     con.query('SELECT 1');
// }, 5000);


var socketClients = {};



var sessionsActive = [];
var numPlayers = 0;

var scoreboardIDsSocketIDs = [];
var playerScreenIDsSocketIDs = [];
var playerPushButtonIDsSocketIDs = [];
var demoShowName = "Demo Show1";
var activeSessions = [];
                

function isInArray(arr, obj) {
    for(var i=0; i<arr.length; i++) {
        if (arr[i] == obj) return true;
    }
    return false;
}

var controlPanelIDsUsed = [];
function requestNewControlScreenID() {
    var newID = Math.floor(Math.random()*90000) + 10000;
    newID.toString();
    while (isInArray(controlPanelIDsUsed, newID)) {
        newID = Math.floor(Math.random()*90000) + 10000;
        newID.toString();
    }
    controlPanelIDsUsed.push(newID);
    return newID;
}

var scoreboardIDsUsed = [];
function requestNewScoreboardID() {
    var newID = Math.floor(Math.random()*90000) + 10000;
    newID.toString();
    while (isInArray(scoreboardIDsUsed, newID)) {
        newID = Math.floor(Math.random()*90000) + 10000;
        newID.toString();
    }
    scoreboardIDsUsed.push(newID);
    return newID;
}

var playerScreenIDsUsed = [];
function requestNewPlayerScreenID() {
    var newID = Math.floor(Math.random()*90000) + 10000;
    newID.toString();
    while (isInArray(playerScreenIDsUsed, newID)) {
        newID = Math.floor(Math.random()*90000) + 10000;
        newID.toString();
    }
    playerScreenIDsUsed.push(newID);
    return newID;
}

var playerButtonIDsUsed = [];
function requestNewPlayerButtonID() {
    var newID = Math.floor(Math.random()*90000) + 10000;
    newID.toString();
    while (isInArray(playerButtonIDsUsed, newID)) {
        newID = Math.floor(Math.random()*90000) + 10000;
        newID.toString();
    }
    playerButtonIDsUsed.push(newID);
    return newID;
}

var playerPushButtonIDsUsed = [];
function requestNewPlayerPushButtonID() {
    var newID = Math.floor(Math.random()*90000) + 10000;
    newID.toString();
    while (isInArray(playerPushButtonIDsUsed, newID)) {
        newID = Math.floor(Math.random()*90000) + 10000;
        newID.toString();
    }
    playerPushButtonIDsUsed.push(newID);
    return newID;
}

function saveShow(showArray,passHash,controllerID) {
    if (showArray.showName != '') {
        // copy the array to a new array so we can change it without affecting the in use one
        //showArray2 = showArray;
        //var showArray2 = showArray.slice(0);
        var showArray2 = JSON.parse(JSON.stringify(showArray));
        // delete the socket.id's for scorescreens, controller screen and delete buttons
        // these will need to be re-populated when the show is opened
        showArray2.controllerScreenSocketID = '';
        showArray2.scoreboardSocketID = '';
        for (i=0; i < showArray2.players.length; i++) {
            showArray2.players[i].scoreScreenSocketID = '';
            showArray2.players[i].status = 'enabled';
            /*
            for (z = 0; z < showArray2.players[i].buttons.length; z++){
                showArray2.players[i].buttons = [];
            }
            */
        }  
        con.query("SELECT * FROM savedshows WHERE showName = '"+showArray2.showName+"'", function (err, result, fields) {
                var now = new Date();
            var dateReadable = now.getDate()+"/"+(now.getMonth()+1)+"/"+now.getFullYear()+" "+(now.getHours()<10?'0':'') + now.getHours()+":"+(now.getMinutes()<10?'0':'') + now.getMinutes()+":"+(now.getSeconds()<10?'0':'') + now.getSeconds();
            if (result.length > 0) {
                  var found = false;
                now.setHours(now.getHours()+11);
                
                result.forEach( (row) => {
                    if (showArray2.showName == row.showName) {
                        
                        activeSessions = JSON.parse(row.activeSessions);
                        
                        for (i=0; i < activeSessions.length; i++) {
                            if (activeSessions[i] == controllerID) {
                                found = true;
                            }
                        }
                        if (!found) {
                            activeSessions.push(controllerID);
                        }
                    }
                });
                
                       
                
                con.query("UPDATE savedshows SET showData = '"+JSON.stringify(showArray2)+"', activeSessions = '"+JSON.stringify(activeSessions)+"', lastAccessed = '"+dateReadable+"' WHERE showName = '"+showArray2.showName+"'", function (err, result, fields) {    });       
            }
            else {
                activeSessions.push(controllerID);
                con.query("INSERT INTO savedshows (showName, showData, showPassword, activeSessions, lastAccessed) VALUES ('"+showArray2.showName+"', '"+JSON.stringify(showArray2)+"','"+passHash+"','"+JSON.stringify(activeSessions)+"','"+dateReadable+"')", function (err, result, fields) {    });
            }
        });
    }
        // counter++;  // console.log(counter + ': Show Saved');
    
}

var monitorSCreenDocket;

io.on('reconnect', function(socket){
     // console.log('reconnect: '+socket.id);
});
io.on('connection', function(socket){
    
    
    
    function emitLogScreen(logMessage){
        io.emit('monitorScreenLog',logMessage);
    }
    
    socket.on('scorescreen-reconnected', function(msg){ // controllerID|playerScreenID|playerID);
         // console.log('scorescreen-reconnected: '+msg);
        var msgSplit = msg.split("|");
        var controlPanelID = msgSplit[0];
        var playerScreenID = msgSplit[1];
        var playerID = msgSplit[2];
        
        if (controlPanelID == 'NULL') { // player hasn't yet put in a code
            for (i=0; i < playerScreenIDsSocketIDs.length; i++) {
                if (playerScreenIDsSocketIDs[i].playerScreenID == playerScreenID) {
                    playerScreenIDsSocketIDs[i].socketID = socket.id;
                    counter++; emitLogScreen(counter+': Score Screen Reconnected.');
                }
            }
        }
        else {
            // check if a session is active
            if ( typeof sessionsActive[controlPanelID] !== 'undefined' && sessionsActive[controlPanelID] ){
                for (i=0; i < sessionsActive[controlPanelID].players.length; i++) {
                    if (sessionsActive[controlPanelID].players[i].playerID == playerID) {
                        sessionsActive[controlPanelID].players[i].scoreScreenSocketID = socket.id;
                    counter++; emitLogScreen(counter+': Score screen Reconnected.');
                    }
                }
            }
        }
        
    });
    socket.on('controller-reconnected', function(msg){ // controlPanelID/NULL
         // console.log('controller-reconnected: '+msg);
        var controlPanelID = "_"+msg;
        
        // check if a session is active
        if ( typeof sessionsActive[controlPanelID] !== 'undefined' && sessionsActive[controlPanelID] ){
              sessionsActive[controlPanelID].controllerScreenSocketID = socket.id;
              counter++; emitLogScreen(counter+': Control Panel Reconnected.');
        }
    });
    socket.on('scoreboard-reconnected', function(msg){ // _controlPanelID/NULL |  scoreboardID 
        // // console.log('scoreboard-reconnected: '+msg);
        var msgSplit = msg.split("|");
        var controlPanelID = msgSplit[0];
        var scoreboardID = msgSplit[1];
        
        if (controlPanelID == 'NULL') { // player hasn't yet put in a code
            for (i=0; i < scoreboardIDsSocketIDs.length; i++) {
                if (scoreboardIDsSocketIDs[i].scoreboardID == scoreboardID) {
                    scoreboardIDsSocketIDs[i].socketID = socket.id;
                    counter++; emitLogScreen(counter+': Scoreboard Reconnected.');
                }
            }
        }
        else {
            // check if a session is active
            if ( typeof sessionsActive[controlPanelID] !== 'undefined' && sessionsActive[controlPanelID] ){
                  sessionsActive[controlPanelID].scoreboardSocketID = socket.id;
                    counter++; emitLogScreen(counter+': Scoreboard Reconnected.');
            }
        }
    });
    
    socket.on('button-reconnected', function(msg){ // controllerID (NULL or ID) | pushButtonID
         // console.log('server: button-reconnected: '+msg);
        var msgSplit = msg.split("|");
        var controlPanelID = msgSplit[0];
        var pushButtonID = msgSplit[1];
        if (controlPanelID == 'NULL') { // player hasn't yet put in a code
             // console.log('button-reconnected: if = NULL');
            for (i=0; i < playerPushButtonIDsSocketIDs.length; i++) {

                if (playerPushButtonIDsSocketIDs[i].playerPushButtonID == pushButtonID) {
                     // console.log('button-reconnected: button socket ID replaced');
                    playerPushButtonIDsSocketIDs[i].socketID = socket.id;
                    counter++; emitLogScreen(counter+': Push Button Reconnected.');
                }
            }
        }
        else {
             // console.log('1');
            // check if a session is active
            if ( typeof sessionsActive[controlPanelID] !== 'undefined' && sessionsActive[controlPanelID] ){
             // console.log('2');
                // loop through teams in each session
                for (z = 0; z < sessionsActive[controlPanelID].players.length; z++) {
             // console.log('3');
                     // console.log(sessionsActive[controlPanelID].players[z].buttons.length);
                    for (t=0; t < sessionsActive[controlPanelID].players[z].buttons.length; t++) {
             // console.log('4');
                        if (sessionsActive[controlPanelID].players[z].buttons[t].pushButtonID == pushButtonID) { 
             // console.log('5');        
                             // console.log('button-reconnected: button socket ID replaced');
                            sessionsActive[controlPanelID].players[z].buttons[t].socketID = socket.id;
                             // console.log('renewed button socket.id: '+sessionsActive[controlPanelID].players[z].buttons[t].socketID);
                            counter++; emitLogScreen(counter+': Push Button Reconnected.');
                        }
                    }
                }      
            }  
        }
        
    });
    
    socket.on('new connection', function(msg){
        // counter++;  // console.log(counter + ': CONNECTED - ' + msg);
        if (msg.includes("powerPointScoreboard")){
            socketClients["powerPointScoreboard"] = socket.id;
        }
        else {
            if (msg.includes("powerPointButtonCodes")){
                 // console.log('here');
                 socketClients["powerPointButtonCodes"] = socket.id;
            }
            else {
                socketClients[msg] = socket.id; // P01 Score Screen , Control Screen , Scores Screen 
            }
            
        }
        setInterval(function() {
            io.to(socket.id).emit("bing", '');
        },30000);
        if (msg == "Control Screen") {
            var address = socket.request.connection.remoteAddress;
            var ip =  address.replace('::ffff:','');
            counter++;
            
            
            var newControllerID = requestNewControlScreenID();
            io.to(socketClients[msg]).emit(msg, newControllerID);
            var sessionID = "_" + newControllerID.toString();

            counter++;
            emitLogScreen(counter + ': Designated the Control Screen the ID ' + newControllerID);
            
            var obj = {
                'showName':                     '',
                'controllerScreenSocketID' :    ''+socketClients[msg]+'',
                'controllerScreenIP':           ip,
                'scoreboardSocketID':           '',
                'scoreboardAutoReorder':        'enabled',
                'correctScore':                 1,
                'incorrectScore':               1,
                'scoreboardIncorrectColor':     'FF0000',
                'scoreboardCorrectColor':       '00FF00',
                'scoreboardFontColor':          'f7f7f7',
                'scoreboardBGColor':            '400000',
                'scoreboardBGImage':            'DEFAULT',
                'scoreboardTopMargin':          '10',
                'scoreboardBorder':             'on',
                'SBTeamBGPlyScrBG':             'disabled',
                'hideTeamBgs':                  'off',
                'showStarted':                  'false',
                'players':                      []
            }
            sessionsActive[sessionID] =  obj; //{'sessionID' : sessionID, 'scoreboardID':''}
            
                        
            con.query("SELECT * FROM savedshows", function (err, result, fields) {
                if (err) throw err;  
                result.forEach( (row) => {
                    io.emit('saved-shows', row.showId + "Ox|xo" +row.showName);
                });
            }); 
                     
        };
        if (msg == "Scoreboard") {
            var newScoreboardID = requestNewScoreboardID();
            io.to(socketClients["Scoreboard"]).emit("Scoreboard", newScoreboardID);
            scoreboardIDsSocketIDs.push({'scoreboardID': newScoreboardID,'socketID': socketClients["Scoreboard"]});
            
            counter++;
            emitLogScreen(counter + ': Designated the Scoreboard the ID ' + newScoreboardID);

        }
        if (msg.includes("powerPointButtonCodes")) { // powerPointButtonCodes|ip
            var stringSent = msg.split("|");
            var powerPointButtonCodesIP = stringSent[1];
            
            var localControllerID;
            var dataToSend = '';
            // look through sessionsArray to find the control screen with this IP
            if ( typeof sessionsActive !== 'undefined' && sessionsActive) {
                for (var key in sessionsActive) {
                     // console.log(sessionsActive[key].controllerScreenIP +"|"+ powerPointButtonCodesIP);
                    if (sessionsActive[key].controllerScreenIP == powerPointButtonCodesIP) {
                        localControllerID = key;
                        
                         // loop through controller screen array to find team names and button codes and add them to dataToSend
                        for (i=0; i < sessionsActive[key].players.length; i++) {
                            if (i == 0) {
                                dataToSend = sessionsActive[key].players[i].playerName+"|"+sessionsActive[key].players[i].buttonID;
                            }
                            else {
                                 dataToSend = dataToSend + "|"+sessionsActive[key].players[i].playerName+"|"+ sessionsActive[key].players[i].buttonID; 
                            }  
                        }      
                    }   
                }
                io.to(socketClients["powerPointButtonCodes"]).emit("powerPointButtonCodes", dataToSend);
            }
            
            
            
            
            
            
        }
        if (msg.includes("powerPointScoreboard")) { // powerPointScoreboard|ip
            
            var stringSent = msg.split("|");
            var scoreboardIP = stringSent[1];
            var localControllerID;
            // look through sessionsArray to find the control screen with this IP
            if ( typeof sessionsActive !== 'undefined' && sessionsActive) {
                for (var key in sessionsActive) {
                    if (sessionsActive[key].controllerScreenIP == scoreboardIP) {
                        sessionsActive[key].scoreboardSocketID = socketClients["powerPointScoreboard"]; 
                        localControllerID = key;
                    }   
                }
            }
            var newScoreboardID = requestNewScoreboardID();
            
            io.to(socketClients["powerPointScoreboard"]).emit("powerPointScoreboard", localControllerID+'|'+newScoreboardID);
            scoreboardIDsSocketIDs.push({'scoreboardID': newScoreboardID,'socketID': socketClients["powerPointScoreboard"]});
            
            //counter++;
            //emitLogScreen(counter + ': Designated the PowerPoint Scoreboard the ID ' + newScoreboardID);

        }
        if (msg == "Player Push Button") {
            var newPlayerPushButtonID = requestNewPlayerPushButtonID();
            io.to(socketClients["Player Push Button"]).emit("Player Push Button", newPlayerPushButtonID);
            playerPushButtonIDsSocketIDs.push({'playerPushButtonID': newPlayerPushButtonID,'socketID': socketClients["Player Push Button"]});
            
            counter++;
            emitLogScreen(counter + ': Designated the Push Button the ID ' + newPlayerPushButtonID);

        }
        if (msg == "Player Screen") {
            // counter++;  // console.log('Player Screen');
            var newPlayerScreenID = requestNewPlayerScreenID();
            io.to(socketClients["Player Screen"]).emit("Player Screen", newPlayerScreenID);
            playerScreenIDsSocketIDs.push({'playerScreenID': newPlayerScreenID,'socketID': socketClients["Player Screen"]});
            counter++;
            emitLogScreen(counter + ': Designated the Player Score Screen the ID ' + newPlayerScreenID);
        } 
        if (msg == "Monitor Screen") {
            emitLogScreen(counter + ': Monitor Screen Connected');
            io.to(socketClients["Monitor Screen"]).emit("Monitor Screen", 'CONNECTED');
        }
    });
    socket.on('score-screen-show-score-button-pressed', function(msg){ //controlPanelID|on/off|playerID
        var stringSent = msg.split("|");
        var controllerID =  "_"+stringSent[0];
        var status =  stringSent[1];
        var playerID = stringSent[2];
        for (i = 0; i < sessionsActive[controllerID].players.length; i++) {
            if (sessionsActive[controllerID].players[i].playerID == playerID) {
                io.to(sessionsActive[controllerID].players[i].scoreScreenSocketID).emit('score-screen-show-score-button-pressed',msg);
                sessionsActive[controllerID].players[i].scoreScreenShowScore = status;
                if (sessionsActive[controllerID].showName != demoShowName) {
                    saveShow(sessionsActive[controllerID],"",controllerID);
                }
            }
        }
    });
    socket.on('score-screen-show-name-button-pressed', function(msg){ //controlPanelID|on/off|playerID
        var stringSent = msg.split("|");
        var controllerID =  "_"+stringSent[0];
        var status =  stringSent[1];
        var playerID = stringSent[2];
        for (i = 0; i < sessionsActive[controllerID].players.length; i++) {
            if (sessionsActive[controllerID].players[i].playerID == playerID) {
                io.to(sessionsActive[controllerID].players[i].scoreScreenSocketID).emit('score-screen-show-name-button-pressed',msg);
                sessionsActive[controllerID].players[i].scoreScreenShowName = status;
                if (sessionsActive[controllerID].showName != demoShowName) {
                    saveShow(sessionsActive[controllerID],"",controllerID);
                }
            }
        }
    });
    socket.on('score-screen-border-button-pressed', function(msg){ //controlPanelID|on/off|playerID
        var stringSent = msg.split("|");
        var controllerID =  "_"+stringSent[0];
        var status =  stringSent[1];
        var playerID = stringSent[2];
        for (i = 0; i < sessionsActive[controllerID].players.length; i++) {
            if (sessionsActive[controllerID].players[i].playerID == playerID) {
                io.to(sessionsActive[controllerID].players[i].scoreScreenSocketID).emit('score-screen-border-button-pressed',msg);
                sessionsActive[controllerID].players[i].scoreScreenBorder = status;
                if (sessionsActive[controllerID].showName != demoShowName) {
                    saveShow(sessionsActive[controllerID],"",controllerID);
                }
            }
        }
    });
    
    socket.on('score-screen-name-bg-button-pressed', function(msg){ //controlPanelID|on/off/??|playerID
        var stringSent = msg.split("|");
        var controllerID =  "_"+stringSent[0];
        var status =  stringSent[1];
        var playerID = stringSent[2];
        for (i = 0; i < sessionsActive[controllerID].players.length; i++) {
            if (sessionsActive[controllerID].players[i].playerID == playerID) {
                io.to(sessionsActive[controllerID].players[i].scoreScreenSocketID).emit('score-screen-name-bg-button-pressed',msg);
                sessionsActive[controllerID].players[i].scoreScreenNameBG = status;
                if (sessionsActive[controllerID].showName != demoShowName) {
                    saveShow(sessionsActive[controllerID],"",controllerID);
                }
            }
        }
    });
    socket.on('player-screen-name-top-margin-changed', function(msg){ //controlPanelID|VALUE|playerID
        var stringSent = msg.split("|");
        var controllerID =  "_"+stringSent[0];
        var newValue =  stringSent[1];
        var playerID = stringSent[2];
         for (i = 0; i < sessionsActive[controllerID].players.length; i++) {
            if (sessionsActive[controllerID].players[i].playerID == playerID) {
                io.to(sessionsActive[controllerID].players[i].scoreScreenSocketID).emit('player-screen-name-top-margin-changed',msg);
                sessionsActive[controllerID].players[i].scoreScreenNameTopMargin = newValue;
                if (sessionsActive[controllerID].showName != demoShowName) {
                    saveShow(sessionsActive[controllerID],"",controllerID);
                }
            }
         }
        
        
    });
    socket.on('player-screen-score-top-margin-changed', function(msg){ //controlPanelID|VALUE|playerID
        var stringSent = msg.split("|");
        var controllerID =  "_"+stringSent[0];
        var newValue =  stringSent[1];
        var playerID = stringSent[2];
         for (i = 0; i < sessionsActive[controllerID].players.length; i++) {
            if (sessionsActive[controllerID].players[i].playerID == playerID) {
                io.to(sessionsActive[controllerID].players[i].scoreScreenSocketID).emit('player-screen-score-top-margin-changed',msg);
                sessionsActive[controllerID].players[i].scoreScreenScoreTopMargin = newValue;
                if (sessionsActive[controllerID].showName != demoShowName) {
                    saveShow(sessionsActive[controllerID],"",controllerID);
                }
            }
         }
        
    });
    socket.on('player-screen-name-score-bg-opacity-changed', function(msg){ //controlPanelID|VALUE|playerID
        var stringSent = msg.split("|");
        var controllerID =  "_"+stringSent[0];
        var newValue =  stringSent[1];
        var playerID = stringSent[2];
        for (i = 0; i < sessionsActive[controllerID].players.length; i++) {
            if (sessionsActive[controllerID].players[i].playerID == playerID) {
                io.to(sessionsActive[controllerID].players[i].scoreScreenSocketID).emit('player-screen-name-score-bg-opacity-changed',msg);
                sessionsActive[controllerID].players[i].playerScreenNameScoreBgOpacity = newValue;
                if (sessionsActive[controllerID].showName != demoShowName) {
                    saveShow(sessionsActive[controllerID],"",controllerID);
                }
            }
        }
        
    });
    socket.on('score-screen-score-bg-button-pressed', function(msg){ //controlPanelID|on/off/??|playerID
        var stringSent = msg.split("|");
        var controllerID =  "_"+stringSent[0];
        var status =  stringSent[1];
        var playerID = stringSent[2];
        for (i = 0; i < sessionsActive[controllerID].players.length; i++) {
            if (sessionsActive[controllerID].players[i].playerID == playerID) {
                io.to(sessionsActive[controllerID].players[i].scoreScreenSocketID).emit('score-screen-score-bg-button-pressed',msg);
                sessionsActive[controllerID].players[i].scoreScreenScoreBG = status;
                if (sessionsActive[controllerID].showName != demoShowName) {
                    saveShow(sessionsActive[controllerID],"",controllerID);
                }
            }
        }
    });
    
    
    socket.on('powerPointScoreboardWhichButtonWasPressed', function(msg){ //whichButtonWasPressed|ip
         // console.log(msg);
        var stringSent = msg.split("|");
        var whichButtonWasPressed = stringSent[0];
        var ip = stringSent[1];
        
        // send the message to the control screen with this ip
        if ( typeof sessionsActive !== 'undefined' && sessionsActive) {
            for (var key in sessionsActive) {
                if (sessionsActive[key].controllerScreenIP == ip) {
                    io.to(sessionsActive[key].controllerScreenSocketID).emit('powerPointScoreboardWhichButtonWasPressed',whichButtonWasPressed); 
                }
            }
            
        }
        
    });
    socket.on('bong', function(msg){
        //counter++; emitLogScreen(counter + ': '+msg);
        
    });
    socket.on('scorescreen-bg-image-updated', function(msg){ // playerID|base64 encoded sound|controlPanelID|fileName
        var stringSent = msg.split("|");
        var playerID = stringSent[0];
        var controllerID = "_"+stringSent[2];
        var imageBase64 = stringSent[1];
        var imageFileName = stringSent[3];
        for (i = 0; i < sessionsActive[controllerID].players.length; i++) {
            if (sessionsActive[controllerID].players[i].playerID == playerID) {
                sessionsActive[controllerID].players[i].teamScoreScreenBGImage = "CUSTOM";
                sessionsActive[controllerID].players[i].scoreScreenBGColor = "000000";
                con.query("SELECT * FROM imagedata WHERE imageID = '"+playerID+"'", function (err, result, fields) {
                    if (result.length > 0) {
                        con.query("UPDATE imagedata SET imageDataBase64 = '"+imageBase64+"', fileName = '"+imageFileName+"' WHERE imageID = '"+playerID+"'", function (err, result, fields) {    });       
                    }
                    else {
                        con.query("INSERT INTO imagedata (imageDataBase64, imageID, fileName) VALUES ('"+imageBase64+"', '"+playerID+"','"+imageFileName+"')", function (err, result, fields) {    });
                    }
                });
                io.to(sessionsActive[controllerID].scoreboardSocketID).emit('scorescreen-bg-image-updated',playerID+"|"+imageBase64);
                sessionsActive[controllerID].players[i].teamScoreScreenBGImage = imageFileName;
                io.to(sessionsActive[controllerID].players[i].scoreScreenSocketID).emit('scorescreen-bg-image-updated',imageBase64);
                for (z=0; z < sessionsActive[controllerID].players[i].buttons.length; z++) {
                    io.to(sessionsActive[controllerID].players[i].buttons[z].socketID).emit('scorescreen-bg-image-updated',imageBase64);
                }
                if (sessionsActive[controllerID].showName != demoShowName) {
                    saveShow(sessionsActive[controllerID],"",controllerID);
                }
            }
        }
    });
    
    socket.on('scoreboard-bg-image-updated', function(msg){ // base64 encoded image|controlPanelID|fileName
        var stringSent = msg.split("|");
        var imageBase64 = stringSent[0];
        var controllerID = "_"+stringSent[1];
        var imageFileName = stringSent[2];
        var imageHash = crypto.createHash('md5').update(imageBase64).digest('hex');
        
        console.log('scoreboard-bg-image-updated: imageHash|'+controllerID+'|'+imageFileName);
        
        sessionsActive[controllerID].scoreboardBGImage = imageHash;
        con.query("SELECT * FROM imagedata WHERE imageID = '"+imageHash+"'", function (err, result, fields) {
            if (result.length > 0) {
                con.query("UPDATE imagedata SET imageDataBase64 = '"+imageBase64+"', fileName = '"+imageFileName+"' WHERE imageID = '"+imageHash+"'", function (err, result, fields) {    });       
            }
            else {
                con.query("INSERT INTO imagedata (imageDataBase64, imageID, fileName) VALUES ('"+imageBase64+"', '"+imageHash+"','"+imageFileName+"')", function (err, result, fields) {    });
            }
        });
        
        io.to(sessionsActive[controllerID].scoreboardSocketID).emit('scoreboard-bg-image-updated', imageBase64);        
        if (sessionsActive[controllerID].showName != demoShowName) {
            saveShow(sessionsActive[controllerID],"",controllerID);
        }
        
        
    });
    
    
    socket.on('player-sound-updated', function(msg){ // playerID|base64 encoded sound|controlPanelID|fileName
        var stringSent = msg.split("|");
        var playerID = stringSent[0];
        var controllerID = "_"+stringSent[2];
        var soundBase64 = stringSent[1];
        var soundFileName = stringSent[3];
        for (i = 0; i < sessionsActive[controllerID].players.length; i++) {
            if (sessionsActive[controllerID].players[i].playerID == playerID) {
                sessionsActive[controllerID].players[i].buzzerSound = "CUSTOM";
                con.query("SELECT * FROM sounddata WHERE playerId = '"+playerID+"'", function (err, result, fields) {
                    if (result.length > 0) {
                        con.query("UPDATE sounddata SET soundDataBase64 = '"+soundBase64+"', fileName = '"+soundFileName+"' WHERE playerID = '"+playerID+"'", function (err, result, fields) {    });       
                    }
                    else {
                        con.query("INSERT INTO sounddata (soundDataBase64, playerID, fileName) VALUES ('"+soundBase64+"', '"+playerID+"','"+soundFileName+"')", function (err, result, fields) {    });
                    }
                });
                
                sessionsActive[controllerID].players[i].buzzerFileName = soundFileName;
                if (sessionsActive[controllerID].showName != demoShowName) {
                    saveShow(sessionsActive[controllerID],"",controllerID);
                }
            }
        }
        
    });
    
    socket.on('request-scoreboard-bg-image', function(msg){ // controllerID|imageID
        console.log('server: request-scoreboard-bg-image: ' + msg);
        var stringSent = msg.split("|");
        var controllerID = stringSent[0];
        var imageID = stringSent[1];
        console.log('imageID: '+imageID);
        var base64Image;
        con.query("SELECT * FROM imagedata WHERE imageID = '"+imageID+"'", function (err, result, fields) {
            if (result.length > 0) {   
                result.forEach( (row) => {   
                    base64Image = row.imageDataBase64;
                });
                io.to(sessionsActive[controllerID].scoreboardSocketID).emit('scoreboardImageReceived',base64Image);
            }
        });
    });
    
    socket.on('request-player-scorescreen-bg-image', function(msg){ // playerID
        var playerID = msg;
        var base64Image;
        con.query("SELECT * FROM imagedata WHERE imageID = '"+playerID+"'", function (err, result, fields) {
            if (result.length > 0) {   
                result.forEach( (row) => {   
                    base64Image = row.imageDataBase64;
                });
                for (var key in sessionsActive) {
                    for (i=0; i < sessionsActive[key].players.length; i++) {
                        if (sessionsActive[key].players[i].playerID == playerID) {
                            io.to(sessionsActive[key].players[i].scoreScreenSocketID).emit('player-image-received',base64Image); // 
                        }
                    }
                }
                
            }
        });
    });
    socket.on('request-scoreboard-playerscreen-image', function(msg) { //playerID
        var playerID = msg;
        var base64Image;
        con.query("SELECT * FROM imagedata WHERE imageID = '"+playerID+"'", function (err, result, fields) {
            if (result.length > 0) {   
                result.forEach( (row) => {   
                    base64Image = row.imageDataBase64;
                });
                for (var key in sessionsActive) {
                    for (i=0; i < sessionsActive[key].players.length; i++) {
                        if (sessionsActive[key].players[i].playerID == playerID) {
                            io.to(sessionsActive[key].scoreboardSocketID).emit('player-image-received',playerID+"|"+base64Image);
                        }  
                    }
                }
            }
        });
    });
    
    socket.on('request-player-button-bg-image', function(msg){ // playerID
        var playerID = msg;
        var base64Image;
        con.query("SELECT * FROM imagedata WHERE imageID = '"+playerID+"'", function (err, result, fields) {
            if (result.length > 0) {   
                result.forEach( (row) => {   
                    base64Image = row.imageDataBase64;
                });
                for (var key in sessionsActive) {
                    for (i=0; i < sessionsActive[key].players.length; i++) {
                        if (sessionsActive[key].players[i].playerID == playerID) {
                            for (z=0; z < sessionsActive[key].players[i].buttons.length; z++) {
                                io.to(sessionsActive[key].players[i].buttons[z].socketID).emit('player-image-received',base64Image); //
                            }
                            io.to(sessionsActive[key].players[i].scoreScreenSocketID).emit('player-image-received',base64Image); // 
                        }
                    }
                }
                
            }
        });
    });
    
    socket.on('request-player-sound', function(msg){ // playerID|controllerID
         // console.log('request-player-sound: '+msg);
        var stringSent = msg.split("|");
        var playerID = stringSent[0];
        var controllerID = "_"+stringSent[1];
        var base64Sound;
        var fileName;
        con.query("SELECT * FROM sounddata WHERE playerID = '"+playerID+"'", function (err, result, fields) {
            if (result.length > 0) {   
                result.forEach( (row) => {   
                    base64Sound = row.soundDataBase64;
                    fileName = row.fileName;
                });
                io.to(sessionsActive[controllerID].controllerScreenSocketID).emit('player-sound-received',playerID+"|"+base64Sound+"|"+fileName); // playerID|base64Sound
            }
        });
    });
    socket.on('sessionArrayRequested', function(msg){
        counter++;  console.log(counter+'sessionArray: \n'+util.inspect(sessionsActive, {showHidden: false, depth: null}));
    });
    socket.on('logSessionKeysInUse', function(msg){
        if ( typeof sessionsActive !== 'undefined' && sessionsActive) {
            for (var key in sessionsActive) {
                 console.log(key);
            }
            
        }
    });
    socket.on('buttonsPressedArrayRequested', function(msg){
        
        // loop through each controller screen active ane request it's button pressed array
        if ( typeof sessionsActive !== 'undefined' && sessionsActive) {
            for (var key in sessionsActive) {
                io.to(sessionsActive[key].controllerScreenSocketID).emit('buttonsPressedArrayRequested',''); 
            }
        }
    });
    socket.on('buttonsPressedArrayReturned', function(msg){
         counter++;  console.log(counter+' buttonsPressedArray: \n'+util.inspect(buttonsPressedArray, {showHidden: false, depth: null}));
    });
    socket.on('controlPanelIDsUsed', function(msg){
         counter++;  console.log(counter+' controlPanelIDsUsed: \n'+util.inspect(controlPanelIDsUsed, {showHidden: false, depth: null}));
    });
    socket.on('scoreboardIDsUsed', function(msg){
         counter++;  console.log(counter+' scoreboardIDsUsed: \n'+util.inspect(scoreboardIDsUsed, {showHidden: false, depth: null}));
    });
    socket.on('playerScreenIDsUsed', function(msg){
         counter++;  console.log(counter+' playerScreenIDsUsed: \n'+util.inspect(playerScreenIDsUsed, {showHidden: false, depth: null}));
    });
    socket.on('playerButtonIDsUsed', function(msg){
         counter++;  console.log(counter+' playerButtonIDsUsed: \n'+util.inspect(playerButtonIDsUsed, {showHidden: false, depth: null}));
    });
    socket.on('playerPushButtonIDsUsed', function(msg){
         counter++;  console.log(counter+' playerPushButtonIDsUsed: \n'+util.inspect(playerPushButtonIDsUsed, {showHidden: false, depth: null}));
    });
    socket.on('playerScreenIDsSocketIDs', function(msg){
         counter++;  console.log(counter+' playerScreenIDsSocketIDs: \n'+util.inspect(playerScreenIDsSocketIDs, {showHidden: false, depth: null}));
    });
    socket.on('playerPushButtonIDsSocketIDs', function(msg){
         counter++;  console.log(counter+' playerPushButtonIDsSocketIDs: \n'+util.inspect(playerPushButtonIDsSocketIDs, {showHidden: false, depth: null}));
    });
    socket.on('scoreboardIDsSocketIDs', function(msg){
         counter++;  console.log(counter+' scoreboardIDsSocketIDs: \n'+util.inspect(scoreboardIDsSocketIDs, {showHidden: false, depth: null}));
    });
    socket.on('new-show-ok-button', function(msg){ //  controlPanelID|newShowName|password
        var stringSent = msg.split("|");
        var controllerID = "_"+stringSent[0];
        var newShowName = stringSent[1];
        var password = stringSent[2];
        var passHash = crypto.createHash('md5').update(password).digest('hex');
                   
        con.query("SELECT * FROM savedshows WHERE showName = '"+newShowName+"'", function (err, result, fields) {
            if (result.length > 0) {
                
                io.to(sessionsActive[controllerID].controllerScreenSocketID).emit('new-show-name-ok','false');       
            }
            else {
                sessionsActive[controllerID].showName = newShowName;
                if (sessionsActive[controllerID].showName != demoShowName) {
                    saveShow(sessionsActive[controllerID],passHash,controllerID);
                }
                
                io.to(sessionsActive[controllerID].controllerScreenSocketID).emit('new-show-name-ok','true',newShowName); 
            }
        });

        
    });
    socket.on('load-show', function(msg){ //showName|controlPanelID|password
        var address = socket.request.connection.remoteAddress;
        var ip =  address.replace('::ffff:','');
        var stringSent = msg.split("|");
        var controllerID = "_"+stringSent[1];
        var password = stringSent[2];
        var passHash = crypto.createHash('md5').update(password).digest('hex');
        var loadShowName = stringSent[0];
        con.query("SELECT * FROM savedshows WHERE showName = '"+loadShowName+"'", function (err, result, fields) {
            if (result.length > 0) {
                if (result[0].showPassword == passHash || stringSent[2] == 'adminPassword'){
                     // console.log(result[0].showData);
                    var oldControllerSocketID = sessionsActive[controllerID].controllerScreenSocketID;
                    sessionsActive[controllerID] = JSON.parse(result[0].showData);
                    sessionsActive[controllerID].showStarted = 'false';
                    sessionsActive[controllerID].controllerScreenIP = ip;
                    sessionsActive[controllerID].controllerScreenSocketID = oldControllerSocketID;
                    for (i=0; i < sessionsActive[controllerID].players.length; i++) {
                        sessionsActive[controllerID].players[i].buttons = [];
                    }
                    io.to(sessionsActive[controllerID].controllerScreenSocketID).emit('loaded-show-ok',JSON.stringify(sessionsActive[controllerID]));    
                }
                else {
                    io.to(sessionsActive[controllerID].controllerScreenSocketID).emit('loaded-show-fail','pass-fail');
                }
            }
        }); 
                //if (sessionsActive[controllerID].showName != demoShowName) {
                  //  saveShow(sessionsActive[controllerID],"",controllerID);
                //}
        
        
    });
    socket.on('showLoadedRequestPushButtonID', function(msg){ // controllerID|playerID
        var msgSplit = msg.split("|");
        var controllerID = "_"+msgSplit[0];
        var playerID = msgSplit[1];
         // send back players button screen ID
        var newButtonID = requestNewPlayerButtonID();
        io.to(sessionsActive[controllerID].controllerScreenSocketID).emit('player-button-screen-code-return', playerID+"|"+newButtonID);
        
        // loop through players to match player ID to match the button ID to them
        for (i=0; i < sessionsActive[controllerID].players.length; i++) {
            if (sessionsActive[controllerID].players[i].playerID == playerID) {
                sessionsActive[controllerID].players[i].buttonID = newButtonID;
            }
        }
        
    });
    socket.on('player-created', function(msg){
         // console.log('player-created');
        var playerDetails = msg.split("|"); 
        var sessionID = "_" + playerDetails[0].toString();                            // [0] (session ID) 35696 [1] player-name-input-57766 [2] player-button-57766 [3] Player 1 [4] (score) 0 [5] enabled/disabled [6] 1 (player number)
        var playerDetailsSplit = playerDetails[2].split("-");           // [0] player [1] button [2] 57766
        var playerID = playerDetailsSplit[2];
        var playerName = playerDetails[3];
        var playerScore = playerDetails[4];
        var playerEnabled = playerDetails[5];
        var playerNumber = playerDetails[6];

        // send back players button screen ID
        var newButtonID = requestNewPlayerButtonID();
        io.to(sessionsActive[sessionID].controllerScreenSocketID).emit('player-button-screen-code-return', playerID+"|"+newButtonID);
        
        // send player details to scoreboard screen
        io.to(sessionsActive[sessionID].scoreboardSocketID).emit('player-added',msg);
        
        // add player to session array
        sessionsActive[sessionID]['players'].push({
            'playerID':                         playerID,
            'playerName':                       playerName,
            'buttonID':                         newButtonID,
            'scoreScreenSocketID':              '',
            'playerScore':                      playerScore,
            'scoreScreenBGColor':               '400000',
            'scoreScreenFontColor':             'f7f7f7',
            'scoreCorrectColor':                '00FF00',
            'scoreIncorrectColor':              'FF0000',
            'status':                           playerEnabled,
            'buttonStatus':                     'enabled',
            'buzzerFileName':                   'DEFAULT',
            'scoreboardPosition':               playerNumber,
            'teamScoreScreenBGImage':           'DEFAULT',
            'scoreScreenBorder':                'on',
            'scoreScreenShowName':              'on',
            'scoreScreenShowScore':             'on',
            'scoreScreenNameBG':                'on',
            'scoreScreenScoreBG':               'on',
            'scoreScreenNameTopMargin':         20,
            'scoreScreenScoreTopMargin':        20,
            'playerScreenNameScoreBgOpacity':   '1',
            'buttons':                          []
        });
        numPlayers++;
                if (sessionsActive[sessionID].showName != demoShowName) {
                    saveShow(sessionsActive[sessionID],"",sessionID);
                }

    });
    socket.on('playerscreen-code-entered', function(msg){
         // console.log('playerscreen-code-entered');
        //counter++;  // console.log(counter + ': playerscreen-code-entered' + msg);
        var stringSent = msg.split("|");
        var controllerID = "_"+stringSent[0];
        var playerScreenID = stringSent[1];
        var playerID = stringSent[2];
        var playerName;
        var buttonID;
        var playerScore;
        var scoreScreenBGColor;
        var scoreScreenFontColor;
        var scoreCorrectColor;
        var scoreIncorrectColor;
        var status;
        var scoreScreenNameTopMargin;
        var scoreScreenScoreTopMargin;
        var scoreScreenShowScoreButton;
        var scoreScreenShowNameButton;
        var scoreScreenScoreBgButton;
        var scoreScreenNameBgButton;
        var scoreScreenBorderButton;
        var scoreScreenBgImage;
        var playerScreenNameScoreBgOpacity;
        
        for (i=0; i < playerScreenIDsSocketIDs.length; i++) {
            if (playerScreenIDsSocketIDs[i].playerScreenID == playerScreenID){
                
                // loop through session players to find playerID
                for (p = 0; p < sessionsActive[controllerID].players.length; p++){
                    if (sessionsActive[controllerID].players[p].playerID == playerID) {
                        sessionsActive[controllerID].players[p].scoreScreenSocketID = playerScreenIDsSocketIDs[i].socketID;
                        playerName = sessionsActive[controllerID].players[p].playerName;
                        buttonID = sessionsActive[controllerID].players[p].buttonID;
                        playerScore = sessionsActive[controllerID].players[p].playerScore;
                        scoreScreenBGColor = sessionsActive[controllerID].players[p].scoreScreenBGColor;
                        scoreScreenFontColor = sessionsActive[controllerID].players[p].scoreScreenFontColor;
                        scoreCorrectColor = sessionsActive[controllerID].players[p].scoreCorrectColor;
                        scoreIncorrectColor = sessionsActive[controllerID].players[p].scoreIncorrectColor;
                        status = sessionsActive[controllerID].players[p].status;
                        scoreScreenNameTopMargin= sessionsActive[controllerID].players[p].scoreScreenNameTopMargin;
                        scoreScreenScoreTopMargin= sessionsActive[controllerID].players[p].scoreScreenScoreTopMargin;
                        scoreScreenShowScoreButton= sessionsActive[controllerID].players[p].scoreScreenShowScore;
                        scoreScreenShowNameButton= sessionsActive[controllerID].players[p].scoreScreenShowName;
                        scoreScreenScoreBgButton= sessionsActive[controllerID].players[p].scoreScreenScoreBG;
                        scoreScreenNameBgButton= sessionsActive[controllerID].players[p].scoreScreenNameBG;
                        scoreScreenBorderButton= sessionsActive[controllerID].players[p].scoreScreenBorder;
                        scoreScreenBgImage = sessionsActive[controllerID].players[p].teamScoreScreenBGImage;
                        playerScreenNameScoreBgOpacity = sessionsActive[controllerID].players[p].playerScreenNameScoreBgOpacity;
                         // console.log(sessionsActive[controllerID].players[p]);
                    }
                }
                io.to(playerScreenIDsSocketIDs[i].socketID).emit('playerscreen-code-input', playerScreenID+"|"+playerID+"|"+playerName+"|"+buttonID+"|"+playerScore+"|"+scoreScreenBGColor+"|"+scoreScreenFontColor+"|"+scoreCorrectColor+"|"+scoreIncorrectColor+"|"+scoreScreenNameTopMargin+"|"+scoreScreenScoreTopMargin+"|"+scoreScreenShowScoreButton+"|"+scoreScreenShowNameButton+"|"+scoreScreenScoreBgButton+"|"+scoreScreenNameBgButton+"|"+scoreScreenBorderButton+"|"+scoreScreenBgImage+"|"+playerScreenNameScoreBgOpacity+"|"+controllerID);
            //                                                                              playerScreenID  | playerID   |  playerName  |  buttonID  |  playerScore  |  scoreScreenBGColor  |  scoreScreenFontColor  |  scoreCorrectColor  |  scoreIncorrectColor  |  scoreScreenNameTopMargin  |  scoreScreenScoreTopMargin  |  scoreScreenShowScoreButton  |  scoreScreenShowNameButton  |  scoreScreenScoreBgButton  |  scoreScreenNameBgButton  |  scoreScreenBorderButton  |  scoreScreenBgImage  |  playerScreenNameScoreBgOpacity 
            }
        } 
        // delete the player screen code from the array
        for (i=0; i < playerScreenIDsSocketIDs.length; i++) {
            if (playerScreenIDsSocketIDs[i].playerScreenID == playerScreenID) {
                playerScreenIDsSocketIDs.splice(i,1);
            }
        }
        for (i=0; i < playerScreenIDsUsed.length; i++) {
            if (playerScreenIDsUsed[i] == playerScreenID) {
                playerScreenIDsUsed.splice(i,1);
            }
        }
    });
    
    // when tyhe code is enetered on the control panel, check to see if it's correct
    socket.on('scoreboard-code-entered', function(msg){ //  controllerID|scoreboardID 
        
         // console.log('scoreboard-code-entered');
        var stringSent = msg.split("|");
        controllerID = "_"+stringSent[0];
        scoreboardID = stringSent[1];
        
        

        
        // find the socket.id for the code we got
        for (i=0; i < scoreboardIDsSocketIDs.length; i++) {
            if (scoreboardIDsSocketIDs[i].scoreboardID == scoreboardID){
                if ( typeof sessionsActive[controllerID] !== 'undefined' && sessionsActive[controllerID] ){
                    
                    // add the scoreboard socket id to the array entry for the controller screen
                    sessionsActive[controllerID].scoreboardSocketID = scoreboardIDsSocketIDs[i].socketID;
                    
                    // send message to scoreboard that the code was correct, along with some vars for setup
                    var scoreboardAutoReorder = sessionsActive[controllerID].scoreboardAutoReorder;
                    var scoreboardFontColor = sessionsActive[controllerID].scoreboardFontColor;
                    var scoreboardBGColor = sessionsActive[controllerID].scoreboardBGColor;
                    var scoreboardTopMargin = sessionsActive[controllerID].scoreboardTopMargin;
                    scoreboardBorder = sessionsActive[controllerID].scoreboardBorder;
                    SBTeamBGPlyScrBG = sessionsActive[controllerID].SBTeamBGPlyScrBG;
                    var scoreboardBGImage = sessionsActive[controllerID].scoreboardBGImage;
                    var hideTeamBgs = sessionsActive[controllerID].hideTeamBgs;
                    var data = scoreboardID+"|"+controllerID+"|"+scoreboardAutoReorder+"|"+scoreboardFontColor+"|"+scoreboardBGColor+"|"+scoreboardTopMargin+"|"+scoreboardBorder+"|"+SBTeamBGPlyScrBG+"|"+scoreboardBGImage+"|"+hideTeamBgs;
                    
                    io.to(sessionsActive[controllerID].scoreboardSocketID).emit('scoreboard-code-input', data);
                    
                     
                    // send message to controller to enable scoreboard controls
                    io.to(sessionsActive[controllerID].controllerScreenSocketID).emit('scoreboard-added-deleted','added');
                     // console.log('scoreboard-added-deleted: added');
                    
                    // if there are players already added, send them to scoreboard
                    if (sessionsActive[controllerID].players.length > 0) {
                        for (p = 0; p < sessionsActive[controllerID].players.length; p++) {
                            // 37264|player-name-input-77076|player-button-77076|Player 2|0
                            var playerID = sessionsActive[controllerID].players[p].playerID;
                            var playerName = sessionsActive[controllerID].players[p].playerName;
                            var playerScore = sessionsActive[controllerID].players[p].playerScore;
                            var playerStatus = sessionsActive[controllerID].players[p].status;
                            var playerPosition = sessionsActive[controllerID].players[p].scoreboardPosition;
                            var teamScoreScreenBGImage = sessionsActive[controllerID].players[p].teamScoreScreenBGImage;
                            var SBTeamBGPlyScrBG = sessionsActive[controllerID].players[p].SBTeamBGPlyScrBG;
                            
                            var dataToSend = controllerID+"|player-name-input-"+playerID+"|player-button-"+playerID+"|"+playerName+"|"+playerScore+"|"+playerStatus+"|"+playerPosition+"|"+teamScoreScreenBGImage+"|"+SBTeamBGPlyScrBG;
                            
                            // send message to controller that a scoreboard has been connected, and to enable the scoreboartd controlls div
                            io.to(sessionsActive[controllerID].scoreboardSocketID).emit('player-added',dataToSend);
                        }
                    }
                    if (sessionsActive[controllerID].SBTeamBGPlyScrBG == 'enabled') {
                        var dataToSend;
                        for (i=0; i < sessionsActive[controllerID].players.length; i++) {
                            if (i==0) { dataToSend = sessionsActive[controllerID].players[i].playerID; }
                            else {
                                dataToSend = dataToSend + "|"+sessionsActive[controllerID].players[i].playerID;
                            }

                            dataToSend = dataToSend + "-"+sessionsActive[controllerID].players[i].scoreScreenBGColor;
                        }
                        io.to(sessionsActive[controllerID].scoreboardSocketID).emit('SB-TeamBG-PlyScrBG-enabled',dataToSend);    
                    }
                    if (sessionsActive[controllerID].scoreboardAutoReorder == 'enabled' ) {
                        io.to(sessionsActive[controllerID].scoreboardSocketID).emit('reorder-by-score','now|0|false');
                    }
                }   
            }
        } 
        // delete the scoreboard code from the array
        for (i=0; i < scoreboardIDsSocketIDs.length; i++) {
            if (scoreboardIDsSocketIDs[i].scoreboardID == scoreboardID) {
                scoreboardIDsSocketIDs.splice(i,1);
            }
        }
        for (i=0; i < scoreboardIDsUsed.length; i++) {
            if (scoreboardIDsUsed[i] == scoreboardID) {
                scoreboardIDsUsed.splice(i,1);
            }
        }

    });
    
    socket.on('ding', function(data) {
        var received = (new Date()).valueOf();
        if (!data.hasOwnProperty('t')) {
             // console.log( 'socket.io-time-sync: server received message with missing data');
        }
        var difference = received - data.t;
        socket.emit('dong', { d: difference });
    });
    
    socket.on('scoreboard-reordered', function(msg){ // playerID|scoreboardPosition|playerID|scoreboardPosition|playerID|scoreboardPosition
        
        var stringSent = msg.split("|");
        var localControllerID;
        // loop through the string array
        for (i = 0; i < stringSent.length; i++) {
  
            // the even indexes are playerID's
            if (i % 2 == 0) {
                
                // loop through each control panel to find player ID
                if ( typeof sessionsActive !== 'undefined' && sessionsActive ){   
                    for (var key in sessionsActive) {
                        
                        // loop through this controllers teams
                        for (z = 0; z < sessionsActive[key].players.length; z++) {
                            
                       
                            

             // console.log(sessionsActive[key].players[z].playerID+"|"+stringSent[i-1]);
                                if (sessionsActive[key].players[z].playerID == stringSent[i]) {
                                    
                                    sessionsActive[key].players[z].scoreboardPosition = stringSent[i+1];
                                    localControllerID = key;
                                }
                            
                        }
                    }
                }
            }
        }
                if (sessionsActive[controllerID].showName != demoShowName) {
                    saveShow(sessionsActive[localControllerID],"",localControllerID);
                }
        
        
    });
    socket.on('player-name-change', function(msg){ // controlPanelID|playerID|newName
         // console.log('player-name-change');
        var stringSent = msg.split("|");
        controllerID = "_"+stringSent[0];
        playerID = stringSent[1];
        newName = stringSent[2];
        for (i=0; i < sessionsActive[controllerID].players.length; i++) {
            
            // loop through the players to match the ID
            if (sessionsActive[controllerID].players[i].playerID == playerID) {
                
                // Update the name in sessionsActive array
                sessionsActive[controllerID].players[i].playerName = newName;
                
                // Output the new name to the scoreboard screen
                io.to(sessionsActive[controllerID].scoreboardSocketID).emit('player-name-change', playerID+"|"+newName);
                
                // Output the new name to the players score screen
                io.to(sessionsActive[controllerID].players[i].scoreScreenSocketID).emit('player-name-change', newName);
                
                // Output the new name to the teams push button screens
                
                for( p=0; p < sessionsActive[controllerID].players[i].buttons.length; p++) {
                    io.to(sessionsActive[controllerID].players[i].buttons[p].socketID).emit('player-name-change', newName);
                }
                
            }
        }
                if (sessionsActive[controllerID].showName != demoShowName) {
                    saveShow(sessionsActive[controllerID],"",controllerID);
                }
        
    });
    socket.on('control-panel-closed', function(msg){
         // console.log('control-panel-closed: '+msg);
        controllerID = "_"+msg;
        var localShowName = sessionsActive[controllerID].showName;
        if ( typeof sessionsActive[controllerID] !== 'undefined' && sessionsActive[controllerID] ){
            
            con.query("SELECT * FROM savedshows WHERE showName = '"+localShowName+"'", function (err, result, fields) {
                if (result.length > 0) {
                    result.forEach( (row) => {
                        if (localShowName == row.showName) {
                            activeSessions = JSON.parse(row.activeSessions);
                            for (p=0; p < activeSessions.length; p++) {
                                if (activeSessions[p] == controllerID) {
                                    activeSessions.splice(p,1);
                                    con.query("UPDATE savedshows SET activeSessions = '"+JSON.stringify(activeSessions)+"' WHERE showName = '"+localShowName+"'", function (err, result, fields) {    });       

                                }
                            }
                        }
                    });  
               }
            });

        
        
            
            // send refresh to the scoreboard
            io.to(sessionsActive[controllerID].scoreboardSocketID).emit('refresh', '');
            
            // loop through teams and players
            for (i=0; i < sessionsActive[controllerID].players.length; i++) {
                
                // delete the button id from list of used ID's (the ID's that players type into their buttons)
                for (p=0; p < playerButtonIDsUsed.length; p++) {
                    if (playerButtonIDsUsed[p] == sessionsActive[controllerID].players[i].buttonID) {
                        playerButtonIDsUsed.splice(p,1);
                    }
                }
                
                // send refresh to player push button screens and remove id's from playerPushButtonIDsUsed
                for (z=0; z < sessionsActive[controllerID].players[i].buttons.length; z++) {
                    io.to(sessionsActive[controllerID].players[i].buttons[z].socketID).emit('refresh', '');
                }
                
                // send refresh to player score screen
                io.to(sessionsActive[controllerID].players[i].scoreScreenSocketID).emit('refresh', '');
            }
            
            
            
            
            
            
            
            
             // console.log('controlPanelIDsUsed: ' + controlPanelIDsUsed);
            for (i=0; i < controlPanelIDsUsed.length; i++) {
                if (controlPanelIDsUsed[i] == msg) {
                    controlPanelIDsUsed.splice(i,1);
                }
            } 
            //saveShow(sessionsActive[controllerID]);
            
            // delete the controllers element from the SessionsArray
            delete sessionsActive[controllerID];
            /*
            for (i=0; i < sessionsActive.length; i++) {
                if (sessionsActive[i] == controllerID) {
                    sessionsActive.splice(i,1);
                }
            } */
        }
        else {
             // console.log('control-panel-closed: NON EXISTANT - ' + msg);
        }
        
                        
                
        
    });
    socket.on('player-screen-closed', function(msg){
         // console.log('player-screen-closed');
        for (i=0; i < playerScreenIDsSocketIDs.length; i++) {
            if (playerScreenIDsSocketIDs[i].playerScreenID == msg) {
                playerScreenIDsSocketIDs.splice(i,1);
                
            }
        }
        for (i=0; i < playerScreenIDsUsed.length; i++) {
            if (playerScreenIDsUsed[i] == msg) {
                playerScreenIDsUsed.splice(i,1);
            }
        }
    });
    socket.on('scoreboard-screen-closed', function(msg){  // controllerID|scoreboardID
         // console.log('scoreboard-screen-closed');
         // console.log(msg);
        var msgSplit = msg.split("|");
        for (i=0; i < scoreboardIDsSocketIDs.length; i++) {
            if (scoreboardIDsSocketIDs[i].scoreboardID == msgSplit[1]) {
                scoreboardIDsSocketIDs.splice(i,1);
                
            }
        }
        for (i=0; i < scoreboardIDsUsed.length; i++) {
            if (scoreboardIDsUsed[i] == msgSplit[1]) {
                scoreboardIDsUsed.splice(i,1);
            }
        }
        if ( typeof sessionsActive[msgSplit[0]] !== 'undefined' && sessionsActive[msgSplit[0]] ){
            io.to(sessionsActive[msgSplit[0]].controllerScreenSocketID).emit('scoreboard-added-deleted','deleted');
        }
    });
    
    socket.on('answer-correct-value-change', function(msg){
         // console.log('answer-correct-value-change');
         // console.log('answer-correct-value-change' + msg);
        var msgSplit = msg.split("|");
        var controllerID = "_"+msgSplit[0].toString();
        var pointsValue = msgSplit[1];
        sessionsActive[controllerID].correctScore = pointsValue;
        //counter++;  // console.log(counter+": "+util.inspect(sessionsActive, {showHidden: false, depth: null}));
                if (sessionsActive[controllerID].showName != demoShowName) {
                    saveShow(sessionsActive[controllerID],"",controllerID);
                }
    });
    
    socket.on('answer-incorrect-value-change', function(msg){
         // console.log('answer-incorrect-value-change');
         // console.log('answer-incorrect-value-change');
        var msgSplit = msg.split("|");
        var controllerID = "_"+msgSplit[0].toString();
        var pointsValue = msgSplit[1];
        sessionsActive[controllerID].incorrectScore = pointsValue;
        //counter++;  // console.log(counter+": "+util.inspect(sessionsActive, {showHidden: false, depth: null}));
                if (sessionsActive[controllerID].showName != demoShowName) {
                    saveShow(sessionsActive[controllerID],"",controllerID);
                }
    });

    socket.on('player-score-change', function(msg){   // controlPanelID | playerID | true/false (highlight score change) | newScore
         // console.log('player-score-change: '+msg);
        var msgSplit = msg.split("|");
        var controllerID = "_"+msgSplit[0];
        var playerID = msgSplit[1];
        var highlightChange = msgSplit[2];
        var newScore = msgSplit[3];
        
        // loop through players to find player id
        if ( typeof sessionsActive[controllerID] !== 'undefined' && sessionsActive[controllerID] ){
            if (sessionsActive[controllerID].SBTeamBGPlyScrBG == 'enabled') { var dataToSend; }
            
            // search for the players who score needs to change
            for (i=0; i < sessionsActive[controllerID].players.length; i++){
                if (sessionsActive[controllerID].players[i].playerID == playerID) {
                    var correctColor = sessionsActive[controllerID].players[i].scoreCorrectColor;
                    var fontColor = sessionsActive[controllerID].players[i].scoreScreenFontColor;
                    var scoreboardCorrectColor = sessionsActive[controllerID].scoreboardCorrectColor;
                    var scoreboardIncorrectColor = sessionsActive[controllerID].scoreboardIncorrectColor;
                    
                    
                    // update the players new score in the sessionsActive array
                    sessionsActive[controllerID].players[i].playerScore = newScore;
                    
                    // Send new score to scoreboard
                    if (sessionsActive[controllerID].SBTeamBGPlyScrBG == 'enabled') { 
                        var scoreboardBGColor = sessionsActive[controllerID].players[i].scoreScreenBGColor;
                        io.to(sessionsActive[controllerID].scoreboardSocketID).emit('player-score-change', playerID+"|"+newScore+"|"+scoreboardCorrectColor+"|"+scoreboardIncorrectColor+"|"+scoreboardBGColor+"|"+highlightChange);    
                    }
                    else {
                        //var scoreboardBGColor = sessionsActive[controllerID].scoreboardBGColor;
                        io.to(sessionsActive[controllerID].scoreboardSocketID).emit('player-score-change', playerID+"|"+newScore+"|"+scoreboardCorrectColor+"|"+scoreboardIncorrectColor+"|000000|"+highlightChange);
                    }
                    
                    // Send new score to players score screen
                    io.to(sessionsActive[controllerID].players[i].scoreScreenSocketID).emit('player-score-change', newScore+"|"+scoreboardCorrectColor+"|"+scoreboardIncorrectColor+"|"+fontColor+"|"+highlightChange);
                    
                    // send new score to control screen
                    io.to(sessionsActive[controllerID].controllerScreenSocketID).emit('player-score-change', playerID+"|"+newScore);
                    
                    // send new score to players push buttons
                    for (p=0; p < sessionsActive[controllerID].players[i].buttons.length; p++) {
                        io.to(sessionsActive[controllerID].players[i].buttons[p].socketID).emit('player-score-change',newScore);
                    }
                }
            }
                if (sessionsActive[controllerID].showName != demoShowName) {
                    saveShow(sessionsActive[controllerID],"",controllerID);
                }
        }
    });
    

    

                    
    

                
                
                
                
    socket.on('enable-all-players', function(msg){
         // console.log('enable-all-players: '+msg);
        var controllerID = '_'+msg;
        var dataToSend = '';
        var bgColor = "000000";
        
        for (i=0; i < sessionsActive[controllerID].players.length; i++){
            if (sessionsActive[controllerID].SBTeamBGPlyScrBG == 'enabled') { bgColor = sessionsActive[controllerID].players[i].scoreScreenBGColor; }
            if (i == 0) {
                dataToSend = sessionsActive[controllerID].players[i].playerID+"|"+bgColor;
            }
            else {
                dataToSend = dataToSend + "|"+sessionsActive[controllerID].players[i].playerID+"|"+bgColor;
            }
            io.to(sessionsActive[controllerID].players[i].scoreScreenSocketID).emit('player-disabled-enabled-exclude', sessionsActive[controllerID].players[i].playerID+"|enabled");  // playerID|enabled/disabled              
            for (z=0; z < sessionsActive[controllerID].players[i].buttons.length; z++) {
                io.to(sessionsActive[controllerID].players[i].buttons[z].socketID).emit('player-disabled-enabled-exclude', sessionsActive[controllerID].players[i].playerID+"|enabled"); // playerID|enabled/disabled
            }
        }
        io.to(sessionsActive[controllerID].scoreboardSocketID).emit('answer-clear', dataToSend );
    });
                    
    socket.on('reorder-scoreboard', function(msg){ //controllerID
        controllerID = "_"+msg;
        io.to(sessionsActive[controllerID].scoreboardSocketID).emit('reorder-scoreboard','');
    });
    
    socket.on('player-disabled-enabled-exclude', function(msg){ // playerID|disabled|controllerID|true/false (remove from scoreboard)
         // console.log('player-disabled-enabled-exclude: '+msg);
        var msgSplit = msg.split("|");
        var playerID = msgSplit[0];
        var playerStatus = msgSplit[1];
        var controllerID = "_"+msgSplit[2];
        var removeFromScoreboard = "_"+msgSplit[3];
        for (i=0; i < sessionsActive[controllerID].players.length; i++){
            if (sessionsActive[controllerID].players[i].playerID == playerID) {
                io.to(sessionsActive[controllerID].scoreboardSocketID).emit('player-disabled-enabled-exclude', msg);
                io.to(sessionsActive[controllerID].players[i].scoreScreenSocketID).emit('player-disabled-enabled-exclude', msg);
                if (playerStatus == 'reset-disabled') { var playerStatus2 = 'enabled'; }
                sessionsActive[controllerID].players[i].status = playerStatus2;
                
                // disable players buttons
                for (z=0; z < sessionsActive[controllerID].players[i].buttons.length; z++) {
                    io.to(sessionsActive[controllerID].players[i].buttons[z].socketID).emit('player-disabled-enabled-exclude', msg);
                }
            }
            
        }
        //saveShow(sessionsActive[controllerID]);
    });
    
    // sent by control panel when the button reorder-by-score-button or auto-reorder-button is pressed. possible values = now or enabled or disabled
    socket.on('reorder-by-score', function(msg){  // now|controllerID
         // console.log('reorder-by-score');
        var msgSplit = msg.split("|");
        var controllerID = "_"+msgSplit[1].toString();
        var newValue = msgSplit[0];
        switch (newValue) {
            case 'now':    
                break;
            case 'enabled':
                sessionsActive[controllerID].scoreboardAutoReorder = 'enabled';
                break;
            case 'disabled' :
                sessionsActive[controllerID].scoreboardAutoReorder = 'disabled';
                break;
        }
                if (sessionsActive[controllerID].showName != demoShowName) {
                    saveShow(sessionsActive[controllerID],"",controllerID);
                }
        io.to(sessionsActive[controllerID].scoreboardSocketID).emit('reorder-by-score',msg);    // sent by control panel when the button reorder-by-score-button or auto-reorder-button is pressed. possible values = now or enabled or disabled    
    });
    

    
    socket.on('scoreboard-bg-color-change', function(msg){// controlPanelID|FFFFFF
         // console.log('scoreboard-bg-color-change');
         // console.log('scoreboard-bg-color-change: '+msg);
        var msgSplit = msg.split("|");
        var controllerID = msgSplit[0];
        var newValue = msgSplit[1];
        sessionsActive[controllerID].scoreboardBGColor = newValue;
        io.to(sessionsActive[controllerID].scoreboardSocketID).emit('scoreboard-bg-color-change', msg);
                if (sessionsActive[controllerID].showName != demoShowName) {
                    saveShow(sessionsActive[controllerID],"",controllerID);
                }
    });
    
    // sent when the player inputs their teams button ID (as displayed on Control Panel) into button.html
    socket.on('push-button-code-input', function(msg){// pushButtonID|codeInputed
         // console.log('push-button-code-input');
        var msgSplit = msg.split("|");
        var pushButtonID = msgSplit[0];
        var codeInputed = msgSplit[1];
        // search  playerPushButtonIDsSocketIDs array to find this buttons socket.id
        for (i=0; i < playerPushButtonIDsSocketIDs.length; i++) {
            if (playerPushButtonIDsSocketIDs[i].playerPushButtonID == pushButtonID) {
                
                // add the button to the specific team in sessionsActive array
                if ( typeof sessionsActive !== 'undefined' && sessionsActive ){
                    
                    // loop through each control panel
                    for (var key in sessionsActive) {
                        
                        // loop through each player on that control panel
                        for (z = 0; z < sessionsActive[key].players.length; z++) {  

                            if (sessionsActive[key].players[z].buttonID == codeInputed){
                                
                                // Generate a new player button number for this player     
                                var playerNumberForButton = 1;
                                var playerNumbersUsed=[];
                                for (y=0; y < sessionsActive[key].players[z].buttons.length; y++) {
                                     playerNumbersUsed.push(sessionsActive[key].players[z].buttons[y].playerNumberForButton);            
                                }
                                while (isInArray(playerNumbersUsed, playerNumberForButton)) {
                                    playerNumberForButton++;
                                }
                                
                                // and push the button ID and socket id to the players buttons array
                                sessionsActive[key].players[z].buttons.push({'pushButtonID':pushButtonID, 'playerNumberForButton': playerNumberForButton, 'socketID':playerPushButtonIDsSocketIDs[i].socketID});
                                
                                // send message back to push button that all is ok, send controllerID|pushButtonID|PlayerID|playerName|PlayerScore|playerStatus|pushButtonStatus|playerNumber|scoreScreenBGColor (playerNumber = the n-th player to add a button for this team
                                var dataToSend = key+"|"+pushButtonID+"|"+sessionsActive[key].players[z].playerID+"|"+sessionsActive[key].players[z].playerName+"|"+sessionsActive[key].players[z].playerScore+"|"+sessionsActive[key].players[z].status+"|"+sessionsActive[key].players[z].buttonStatus+"|"+playerNumberForButton+"|"+sessionsActive[key].players[z].scoreScreenBGColor+"|"+sessionsActive[key].players[z].teamScoreScreenBGImage;
                                io.to(sessionsActive[key].players[z].buttons[y].socketID).emit('correct-code-inputed', dataToSend);
                               // io.to(playerPushButtonIDsSocketIDs[i].socketID).emit('correct-code-inputed', dataToSend);                        
                                
                                // send message to controller screen about the new push button
                                var dataToSend = key+"|"+pushButtonID+"|"+sessionsActive[key].players[z].playerID+"|"+playerNumberForButton;      
                                io.to(sessionsActive[key].controllerScreenSocketID).emit('player-push-button-added', dataToSend);
                                                    
                                // delete element from playerPushButtonIDsSocketIDs array as we no longer need it
                                playerPushButtonIDsSocketIDs.splice(i,1);
                            }
                        }
                    }
                }
                
            }
        }    
    });
    
    socket.on('player-push-button-closed', function(msg){// pushButtonID
         // console.log('player-push-button-closed');
        var pushButtonId = msg;
        
        // delete pushButtonID from playerPushButtonIDsUsed array, first we need to find which player this button belongs too
        for (i=0; i < playerPushButtonIDsUsed.length; i++) {
            if (playerPushButtonIDsUsed[i] == pushButtonId) {
                playerPushButtonIDsUsed.splice(i,1);
            }
        }
        
        // delete from playerPushButtonIDsSocketIDs array
        for (i=0; i<playerPushButtonIDsSocketIDs.length; i++) {
            if (playerPushButtonIDsSocketIDs[i].playerPushButtonID == pushButtonId) {
                playerPushButtonIDsSocketIDs.splice(i,1);
            }
        }
        
        // delete the button from sessionsActive array
        if ( typeof sessionsActive !== 'undefined' && sessionsActive ){
            
            // loop through each control panel
            for (var key in sessionsActive) {
                
                // loop through each player on that control panel
                for (z = 0; z < sessionsActive[key].players.length; z++) {
                    
                    // loop through that players buttons
                    for (y=0; y < sessionsActive[key].players[z].buttons.length; y++) {
                        
                        // and if the pushButtonID matches delete that object from array
                        if (sessionsActive[key].players[z].buttons[y].pushButtonID == pushButtonId){
                            sessionsActive[key].players[z].buttons.splice(y,1);
                            
                            // send message to controller to say that the button is gone
                            var dataToSend = pushButtonId+"|"+sessionsActive[key].players[z].playerID;
                            io.to(sessionsActive[key].controllerScreenSocketID).emit('player-push-button-deleted', dataToSend);
                             // console.log('message sent to delete button from  // console: '+dataToSend);
                        }
                    }          
                }    
            }
        }
        
        
    });
    
    // user has pushed their push button
    socket.on('Button Pressed', function(msg){ // controllerID|pushButtonID|playerID|timePressed|playerNumber
         // console.log('Button Pressed: '+msg);
        
        
        var msgSplit = msg.split("|");
        var controllerID = msgSplit[0];
        var pushButtonID = msgSplit[1];
        var playerID = msgSplit[2];
        var timePressed = msgSplit[3];
        
        // send message to controll panel to check button on SCORING tab, highlight button on BUTTON CONFIG tab
        if ( typeof sessionsActive !== 'undefined' && sessionsActive && controllerID != ''){
            
            if ( typeof sessionsActive[controllerID] !== 'undefined' && sessionsActive[controllerID]) {
                
                io.to(sessionsActive[controllerID].controllerScreenSocketID).emit('Button Pressed', msg);
                if (sessionsActive[controllerID].showStarted != 'true') {
                    
                    if ( typeof sessionsActive[controllerID].scoreboardSocketID !== 'undefined' && sessionsActive[controllerID].scoreboardSocketID) {
                        
                        io.to(sessionsActive[controllerID].scoreboardSocketID).emit('Button Pressed', msg);
                    }
                }
            }
        }
    }); 
    
    socket.on('first-to-buzz-in', function(msg){ // controllerID|pushButtonID|playerID|timePressed|dateReadable|playerNumber
         // console.log('server: first-to-buzz-in: '+msg);
        var msgSplit = msg.split("|");
        var controllerID = msgSplit[0];
        var pushButtonID = msgSplit[1];
        var playerID = msgSplit[2];
        var timePressed = msgSplit[3];
        var playerNumber = msgSplit[4];
        io.to(sessionsActive[controllerID].scoreboardSocketID).emit('first-to-buzz-in', msg);
        for (i=0; i < sessionsActive[controllerID].players.length; i++) {
            if (playerID == sessionsActive[controllerID].players[i].playerID) {
                io.to(sessionsActive[controllerID].players[i].scoreScreenSocketID).emit('first-to-buzz-in',msg);
                for (z=0; z < sessionsActive[controllerID].players[i].buttons.length; z++){
                    if (sessionsActive[controllerID].players[i].buttons[z].pushButtonID == pushButtonID) {
                         // console.log('first-to-buzz-in socket.id about to be sent: '+sessionsActive[controllerID].players[i].buttons[z].socketID);
                        io.to(sessionsActive[controllerID].players[i].buttons[z].socketID).emit('first-to-buzz-in',msg);
                    }
                }
                
                
            }   
        }
    });
    
    socket.on('reset-highlights', function(msg){ // controllerID
        var controllerID = "_"+msg;
        io.to(sessionsActive[controllerID].scoreboardSocketID).emit('reset-scoreboard-highlight', '');
        for (i=0; i < sessionsActive[controllerID].players.length; i++) {
            io.to(sessionsActive[controllerID].players[i].scoreScreenSocketID).emit('reset-scorescreen-highlight', '');
            for (z=0; z < sessionsActive[controllerID].players[i].buttons.length; z++) {
                io.to(sessionsActive[controllerID].players[i].buttons[z].socketID).emit('reset-button-highlight','');
            }      
        }
    });

    socket.on('showStarted', function(msg){ // controllerID|true/false
         // console.log('showStarted');
         // console.log(msg);
        var msgSplit = msg.split("|");
        var controllerID = "_"+msgSplit[0];
        var showStatus = msgSplit[1];
        sessionsActive[controllerID].showStarted = showStatus;
        //saveShow(sessionsActive[controllerID]);
    });
    
    socket.on('player-screen-bgcolor-changed', function(msg){ // controlPanelID|FFFFFF|playerID
         // console.log('player-screen-bgcolor-changed');
         // console.log('player-screen-bgcolor-changed: '+msg);
        var msgSplit = msg.split("|");
        var controllerID = "_"+msgSplit[0];
        var newColor = msgSplit[1];
        var playerID = msgSplit[2];
        if ( typeof sessionsActive !== 'undefined' && sessionsActive ){
            for (z = 0; z < sessionsActive[controllerID].players.length; z++) {
                if (sessionsActive[controllerID].players[z].playerID == playerID) {
                    
                    // update the new collor in the sessionsActive array
                    sessionsActive[controllerID].players[z].scoreScreenBGColor = newColor;
                    
                    // send color change to teams screen
                    io.to(sessionsActive[controllerID].players[z].scoreScreenSocketID).emit('player-screen-bgcolor-changed', newColor);
                    
                    // send color change to all the teams players push buttons
                    for (p=0; p < sessionsActive[controllerID].players[z].buttons.length; p++) {
                        io.to(sessionsActive[controllerID].players[z].buttons[p].socketID).emit('player-screen-bgcolor-changed', newColor);
                        
                    }
                    
                    // send the color change to the scoreboard screen if necessary
                    if (sessionsActive[controllerID].SBTeamBGPlyScrBG == 'enabled') {
                        var dataToSend;
                        for (i=0; i < sessionsActive[controllerID].players.length; i++) {
                            if (i==0) { dataToSend = sessionsActive[controllerID].players[i].playerID; }
                            else {
                                dataToSend = dataToSend + "|"+sessionsActive[controllerID].players[i].playerID;
                            }

                            dataToSend = dataToSend + "-"+sessionsActive[controllerID].players[i].scoreScreenBGColor;
                        }
                        io.to(sessionsActive[controllerID].scoreboardSocketID).emit('SB-TeamBG-PlyScrBG-enabled',dataToSend);
                        
                        
                    }
                }
            }
                if (sessionsActive[controllerID].showName != demoShowName) {
                    saveShow(sessionsActive[controllerID],"",controllerID);
                }
        }   
    });
    
    // make the player BG's on the scoreboard the same as the BG's on the player screens
    socket.on('SB-TeamBG-PlyScrBG', function(msg){ // _controlPanelID|enabled/disabled
         // console.log('SB-TeamBG-PlyScrBG');
        var msgSplit = msg.split("|");
        var controllerID = msgSplit[0];
        var status = msgSplit[1];
        
        sessionsActive[controllerID].SBTeamBGPlyScrBG = status;
        switch (status) {
            case "enabled" :
                var dataToSend;
                for (i=0; i < sessionsActive[controllerID].players.length; i++) {
                    if (i==0) { dataToSend = sessionsActive[controllerID].players[i].playerID; }
                    else {
                        dataToSend = dataToSend + "|"+sessionsActive[controllerID].players[i].playerID;
                    }
                    
                    dataToSend = dataToSend + "-"+sessionsActive[controllerID].players[i].scoreScreenBGColor;
                }
                io.to(sessionsActive[controllerID].scoreboardSocketID).emit('SB-TeamBG-PlyScrBG-enabled',dataToSend);
                 // console.log('SB-TeamBG-PlyScrBG-enabled: ' + dataToSend);
                break;
            case "disabled" :
                io.to(sessionsActive[controllerID].scoreboardSocketID).emit('SB-TeamBG-PlyScrBG-disabled',msg);
            break;
        }
                if (sessionsActive[controllerID].showName != demoShowName) {
                    saveShow(sessionsActive[controllerID],"",controllerID);
                } 
    });
    socket.on('scoreboardBorderToggle', function(msg){ // controlPanelID|on/off
        console.log('scoreboardBorderToggle: '+msg);
        var msgSplit = msg.split("|");
        var controllerID = "_"+msgSplit[0];
        var value = msgSplit[1];
        sessionsActive[controllerID].scoreboardBorder = value;
        io.to(sessionsActive[controllerID].scoreboardSocketID).emit('scoreboardBorderToggle',msg);
        if (sessionsActive[controllerID].showName != demoShowName) {
            saveShow(sessionsActive[controllerID],"",controllerID);
        } 
    });
    socket.on('scoreboard-top-margin-changed', function(msg){ // controlPanelID|val
        console.log('scoreboard-top-margin-changed: '+msg);
        var msgSplit = msg.split("|");
        var controllerID = "_"+msgSplit[0];
        var value = msgSplit[1];
        sessionsActive[controllerID].scoreboardTopMargin = value;
        io.to(sessionsActive[controllerID].scoreboardSocketID).emit('scoreboard-top-margin-changed',msg);
        if (sessionsActive[controllerID].showName != demoShowName) {
            saveShow(sessionsActive[controllerID],"",controllerID);
        }
    });
    
    socket.on('hideTeamBgs', function(msg){ // controlPanelID|on/off
        var msgSplit = msg.split("|");
        var controllerID = "_"+msgSplit[0];
        var value = msgSplit[1];
        sessionsActive[controllerID].hideTeamBgs = value;
        io.to(sessionsActive[controllerID].scoreboardSocketID).emit('hideTeamBgs',value);
        if (sessionsActive[controllerID].showName != demoShowName) {
            saveShow(sessionsActive[controllerID],"",controllerID);
        }
    });
    
    
    
    
    
    
    
    
});


http.listen(3000, function(){
    console.log("Server is running on http://localhost:3000");
    con.query("SELECT * FROM savedshows", function (err, result, fields) {
        if (result.length > 0) {
            result.forEach( (row) => {
                activeSessions = JSON.parse(row.activeSessions);
                for (i=0; i < activeSessions.length; i++) {
                    sessionsActive[activeSessions[i]] = JSON.parse(row.showData);
                }
            });
        }
    });
});

