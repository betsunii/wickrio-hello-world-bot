const WickrIOAPI = require('wickrio_addon');
const WickrIOBotAPI = require('wickrio-bot-api');
const WickrUser = WickrIOBotAPI.WickrUser;
const bot = new WickrIOBotAPI.WickrIOBot();

var fs = require('fs');

process.stdin.resume(); //so the program will not close instantly

bot.processesJsonToProcessEnv()

var bot_username;

async function exitHandler(options, err) {
  try {
    var closed = await bot.close();
    if (err || options.exit) {
      console.log("Exit reason:", err);
      process.exit();
    } else if (options.pid) {
      process.kill(process.pid);
    }
  } catch (err) {
    console.log(err);
  }
}

//catches ctrl+c and stop.sh events
process.on('SIGINT', exitHandler.bind(null, {exit: true}));

// catches "kill pid" (for example: nodemon restart)
process.on('SIGUSR1', exitHandler.bind(null, {pid: true}));
process.on('SIGUSR2', exitHandler.bind(null, {pid: true}));

//catches uncaught exceptions
process.on('uncaughtException', exitHandler.bind(null, {exit: true}));


var responseMessageList = [

Preco por g/un: 1-9 | 10-49 | 50-99

🧀Cheese 8 | 7 | 6
🥭Somango 8 | 7 | 6
💫Amnesia 7,5 | 6 | 5
🍈Melon CBD 5 | 4 | 3
🍫Superpolen 7,5 | 5 | 4
🍄 Cogus 7,5 | 6 | 5
🌈Assid 10 | 7 | 5
💊Tilhas 7,5 | 6 | 5
];


async function main() {
  try {
    var tokens = JSON.parse(process.env.tokens);
    var status = await bot.start(tokens.WICKRIO_BOT_NAME.value)
    if (!status) {
      exitHandler(null, {
        exit: true,
        reason: 'Client not able to start'
      });
    }

    //Passes a callback function that will receive incoming messages into the bot client
    bot.startListening(listen);

  } catch (err) {
    return console.log(err);
  }
}





function listen(message) {
    var wickrUser;
    //Parses an incoming message and returns and object with command, argument, vGroupID and Sender fields
    var parsedMessage = bot.parseMessage(message);
    if (!parsedMessage) {
      return;
    }
    var vGroupID = parsedMessage.vgroupid;
    var userEmail = parsedMessage.userEmail;
    var convoType = parsedMessage.convoType;
    var personal_vGroupID = "";
    if (convoType === 'personal')
      personal_vGroupID = vGroupID;
    var user = bot.getUser(userEmail); //Look up user by their wickr email
    if (user === undefined) { //Check if a user exists in the database
      wickrUser = new WickrUser(userEmail, {
        index: 0,
        personal_vGroupID: personal_vGroupID,
        command: "",
        argument: ""
      });
      user = bot.addUser(wickrUser); //Add a new user to the database
    }
    var current = user.index;
    if (current > responseMessageList.length - 1) {
      user.index = 0;
    }
    current = user.index;
    if (current < responseMessageList.length && current != -1) {
      try {
        var csrm = WickrIOAPI.cmdSendRoomMessage(vGroupID, responseMessageList[current]);
        console.log(csrm);
      } catch (err) {
        console.log(err);
      }
      user.index = current + 1;
    }
}




main();
