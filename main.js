const express = require('express')
const http = require('http');
const wsServer = require('./wsServer');

var cors = require('cors');
require('dotenv').config()
const app = express()
app.use(express.json())
app.use(express.urlencoded({ extended: true }));
// app.use(express.text())
app.use(express.static(__dirname + '/public'));
app.use(cors())

app.get('/api', (req, res) =>
{
    res.json({ message: `Welcome to Perago push notification api.` })
})

const server = http.createServer(app);
const wss = wsServer();
server.listen(Number(process.env.PORT), () =>
{
    console.log(`Server running on port ${process.env.PORT}`)

})

server.on('upgrade', function (request, socket, head)
{
    wss.handleUpgrade(request, socket, head, function (ws)
    {
        console.log("Websocket ")
        wss.emit('connection', ws, request);
    })
})
