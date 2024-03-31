console.clear();
process.title = "[Orbit Client]";

const { io } = require("socket.io-client");
const si = require("systeminformation");
const { DateTime } = require("luxon");
var clc = require("cli-color");

post();

const socket = io("http://192.168.1.51:2163");

socket.on("connect", ()=>{
    socket.emit("_type", "CLI-Client");
    si.osInfo().then((data)=>{
        socket.emit("_hostname", data.hostname);
        process.title = `${data.hostname} [Orbit Client]`;
    });

    log(clc.greenBright(`Connected to the server.`));
});

socket.io.on("error", (err)=>{
    if(err.message == "xhr poll error"){
        log(clc.redBright(`Server unavailable.`));
    }else{
        log(clc.redBright(`Connection error: ${err.message}`));
    }
});

socket.io.on("reconnect", (count)=>{
    log(clc.yellowBright(`Reconnected to the server!`));
});

socket.io.on("reconnect_attempt", (count)=>{
    log(clc.yellowBright(`Trying to reconnect to the server (${count})`));
});

socket.io.on("reconnect_error", (err)=>{
    // log(`re: ${err.message}`);
    // Mimics io.on(error);
});

socket.io.on("reconnect_failed", ()=>{
    log(clc.redBright(`Failed to reconnect to the server.`));
});

socket.io.on("ping", ()=>{
    socket.emit("_pong", Math.floor(new Date().getTime() / 1000));
});

socket.on("disconnect", (reason) => {
    log(clc.redBright(`Lost connection to the server.`))
    if (reason === "io server disconnect") {
        // Kicked from server ?
        socket.connect();
    }
});

setInterval(async () => {
    socket.emit("_system", await getSystem());
}, 5000);


// The meat of the code.
async function getSystem(){
    _data = {
        motherboard: `${await si.baseboard().then((d) => d.model)}`,
        cpu: `${await si.cpu().then((d)=>d.brand)}`,
        ram: `${await si.mem().then((d)=>formatBytes(d.total))}`,
        ecc: `${await si.memLayout().then((d) => d[0].ecc)}`,
    };
    return _data;
}

// help
function formatBytes(bytes) {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) {
        return 'n/a';
    }
    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
    if (i === 0) {
        return bytes + ' ' + sizes[i];
    }
    return (bytes / Math.pow(1024, i)).toFixed(1) + ' ' + sizes[i];
}

//
// Enabled timestamps,
//         colors
//
function log(_data){
    var dt = DateTime.now();
    var cdt = clc.cyanBright(`${dt.toFormat('tt')}`);
    console.log(`${cdt} ${_data}`);
}

function post(){
    console.log("");
    console.log("");
    log(clc.white(`  ___       _     _ _    `));
    log(clc.whiteBright(` / _ \\ _ __| |__ (_) |_ `));
    log(clc.blue(`: | | | '__| '_ \\| | __|:`));
    log(clc.blueBright(`: |_| | |  | |_) | | |_ :`));
    log(clc.cyan(` \\___/|_|  |_.__/|_|\\__|`));
    log(clc.cyanBright(` [Client]       ~ Xeoxaz`));
    console.log("");
    console.log("");
}