//jshint node:true
'use strict';

const ws = require('nodejs-websocket');
const port = 3133;
let clients = [];
let remotes = [];

var server = ws.createServer(connection => {

    connection.send(JSON.stringify({
        type: 'hello'
    }));

    connection.on('close', () => {
        console.log('Lost remote connection', connection.clientIndex);
        clients.splice(connection.clientIndex, 1);
    });

    connection.on('text', data => {

        data = JSON.parse(data);

        if(data.type === 'declare') {

            if(data.payload.type === 'client') {
                var clientIndex = clients.push(connection)-1;
                connection.clientIndex = clientIndex;
                console.log('New client connection', clientIndex);

                connection.on('text', clientHandler);

            } else if(data.payload.type === 'remote') {
                var  remoteIndex = remotes.push(connection)-1;
                connection.clientIndex = remoteIndex;
                console.log('New remote connection', remoteIndex);

                connection.on('text', remoteHandler);
            }
        }
    });
});

server.listen(port, () => {
    console.log('remote server listening on port', port);
});

function clientHandler(data) {
    var deadRemotes = [];

    remotes.forEach(remote => {
        try {
            remote.send(data);
        } catch(e) {
            deadRemotes.push(remote.clientIndex);
        }
    });

    deadRemotes.forEach(remote => {
        remotes.splice(remote.clientIndex, 1);
    });
}

function remoteHandler(data) {
    var deadClients = [];

    clients.forEach(client => {
        try {
            client.send(data);
        } catch(e) {
            deadClients.push(client.clientIndex);
        }
    });

    deadClients.forEach(client => {
        clients.splice(client.clientIndex, 1);
    });
}