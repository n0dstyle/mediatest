const cp = require('child_process');
const http = require('http')
const url = require('url');

const config = require('./config')

let workers = []

for (let i = 0; i < config.threads; i++) {
    workers.push(cp.fork('./worker.js'))
}

const server = new http.Server(function(req, res) {
    const requestUrl = url.parse(req.url);
    const path = requestUrl.pathname;

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "*");
    res.setHeader("Access-Control-Allow-Headers", "content-type");

    if(path === '/list'){
        const data = workers.map(node => ({
            pid: node.pid,
            generateCount: node.generateCount,
            reciveCount: node.reciveCount,
            state: node.state,
            killed: node.killed
        }))

        res.statusCode = 200
        res.end(JSON.stringify(data))
    }

    if(path === '/delete'){
        const pid = requestUrl.query.split('=')[1]
        let node = workers.find(el => el.pid == pid)
        if(node.masterPid == pid){
            const node = workers.find(el => el.pid != pid && !el.killed)
            if(node) setMaster(node.pid)
            else process.exit()
        }
        node.kill();
        const data = workers.map(node => {
            return {
                pid: node.pid,
                generateCount: node.generateCount,
                reciveCount: node.reciveCount,
                state: node.state,
                killed: node.killed
            }
        })

        res.statusCode = 200
        res.end(JSON.stringify(data))
    }
});

function setMaster(pid, start = false){
    for(worker of workers){
        worker.masterPid = pid;
        worker.state = worker.masterPid === worker.pid ? 'master' : 'worker';
        if(!worker.generateCount)
            worker.generateCount = 0
        if(!worker.reciveCount)
            worker.reciveCount = 0
        worker.killed = worker.killed
        if(!worker.killed) {
            worker.send({master: pid, start})
        }
    }
}

function setListeners(){
    for(worker of workers) {
        worker.on('message', (msg) => {
            console.log('Message from worker', msg)
            let node = workers.find(node => node.pid === msg.pid)
            if (msg.cmd == 'generate') {
                node.generateCount += 1;
            }
            if (msg.cmd == 'recive') {
                node.reciveCount += 1;
            }
        })
    }
}



server.listen(3001, () => {
    setMaster(workers[0].pid, true)
    setListeners()
});
