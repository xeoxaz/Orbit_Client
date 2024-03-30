console.clear();

const { io } = require("socket.io-client");
const si = require("systeminformation");

const socket = io("http://192.168.1.51:2163");

socket.on("connect", ()=>{
    console.log("Connected.");

    socket.emit("_type", "CLI-Client");
    si.osInfo().then((data)=>{
        socket.emit("_hostname", data.hostname);
    });
});

socket.on("disconnect", (reason) => {
    console.log("Lost connection.");
    if (reason === "io server disconnect") {
        socket.connect();
    }
});

setInterval(async () => {
    
    socket.emit("_system", await GetSystem());

}, 5000);

async function GetSystem(){
    _data = {
        motherboard: `${await si.baseboard().then((d) => d.model)}`,
        cpu: `${await si.cpu().then((d)=>d.brand)}`
    };
    return _data;
}