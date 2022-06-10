const WebSocketServer = require('ws').Server;
const WebSocket = require('ws');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config()
const msgType = {
    Register: "register",
    Logout: "logout",
    AddToGroup: "addToGroup",
    Send: "send"
}
let connectedDevices = [];
module.exports = () =>
{
    const wsServer = new WebSocketServer({ noServer: true, path: "/notification" })
    wsServer.on('connection', function connection(ws, request)
    {
        const sessionId = uuidv4();
        Object.assign(ws, { sessionId: sessionId });
        console.log(ws.sessionId)
        ws.on('message', function message(data)
        {
            try
            {
                const payload = JSON.parse(data)
                if (payload.type)
                {
                    const type = payload.type;
                    switch (type)
                    {
                        case msgType.Register:
                            const user = {
                                sessionId: ws.sessionId,
                                ...payload.user
                            };
                            // console.log("user", user);
                            connectedDevices.push(user);
                            console.log(connectedDevices);
                            break;
                        case msgType.Send:
                            const toUsers = connectedDevices.filter(c => c.id === payload.to);
                            const fromUser = connectedDevices.find(c => c.sessionId === ws.sessionId);
                            const msg = {
                                sender: fromUser,
                                msg: payload.data
                            }
                            const clients = [...wsServer.clients];
                            const receivers = [];
                            toUsers.forEach(user =>
                            {
                                const receiver = clients.find(client =>
                                {
                                    return client.sessionId === user.sessionId;
                                });
                                if (receiver)
                                {
                                    receivers.push(receiver);
                                }
                            })

                            receivers.forEach(receiver =>
                            {
                                sendMessage(receiver, msg);
                            })
                            break;
                    }

                }
                // console.log('at server', payload);
                // wsServer.clients.forEach(function each(client)
                // {
                //     if (client.readyState === WebSocket.OPEN)
                //     {
                //         sendMessage(client, payload);
                //     }
                // });
            } catch (err)
            {
                console.log(err)
            }
        });
        ws.on('close', function connection(reason)
        {
            console.log(ws.sessionId, reason);
            connectedDevices = connectedDevices.filter(d =>
            {
                return d.sessionId != ws.sessionId;
            })
            console.log(connectedDevices);
        });
    });
    return wsServer;
};
const sendMessage = async (client, payload) =>
{
    if (client.readyState === WebSocket.OPEN)
    {
        client.send(JSON.stringify(payload));
    }
}