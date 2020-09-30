const Redis = require("ioredis");
const redis = new Redis();
const pub = new Redis();

let masterPid;

async function start() {
    console.log(`node is running ${process.pid}`)
    process.on('message', (msg) => {
        masterPid = msg.master
        if (masterPid == process.pid && !msg.start) {
            pub.publish('random', Math.random())
            process.send({cmd: 'generate', pid: process.pid})
        }
    })
    
    setTimeout(() => {
        if (masterPid == process.pid) {
            pub.publish('random', Math.random())
            process.send({cmd: 'generate', pid: process.pid})
        }
    }, 5000)

}

redis.subscribe("random", 'system');
redis.on('message', (chanel, msg) => {
    if (chanel === 'random' && masterPid !== process.pid) {
        console.log(`Random numbers from master ${msg}`)
        process.send({cmd: 'recive', pid: process.pid})
    }
})
start()