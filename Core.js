console.clear();
process.title = "Orbit Client";

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

socket.io.on("ping", ()=>{
    socket.emit("_pong", Math.floor(new Date().getTime() / 1000));
});

socket.on("disconnect", (reason) => {
    console.log("Lost connection.");
    if (reason === "io server disconnect") {
        socket.connect();
    }
});

setInterval(async () => {
    socket.emit("_system", await getSystem());
}, 5000);

async function getSystem(){
    _data = {
        motherboard: `${await si.baseboard().then((d) => d.model)}`,
        cpu: `${await si.cpu().then((d)=>d.brand)}`,
        ram: `${await si.mem().then((d)=>formatBytes(d.total))}`
    };
    return _data;
}

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