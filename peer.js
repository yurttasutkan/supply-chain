const net = require('net');
const { Block } = require('./block');
const Blockchain = require('./blockchain');
const Transaction = require('./transaction');
const Wallet = require('./wallet');
const StringUtil = require('./stringUtil');

class Peer {
  constructor() {
    this.id = 0;
    this.blockchain = new Blockchain();
    this.wallet = new Wallet();
    this.peers = [
      { id: 1, host: 'localhost', port: 6001 },
      { id: 2, host: 'localhost', port: 6002 },
      // Add more peers here
    ];

    this.messageQueue = [];
    this.server = null;
    this.clientSockets = [];
    this.host = 'localhost';
    this.port = 6000;
  }

  start() {
    this.id = this.peers.length - 1;
    this.initServer();
    this.connectToPeers();
    this.startPeerTransactions();
    this.startConsumer();
    // Set the peerId for each client socket
    console.log(this.clientSockets.length)
    this.clientSockets.forEach((socket, index) => {
      console.log(`socket: ${socket} id: ${this.peers[index].id}`);
      socket.peerId = this.peers[index].id;
    });
  }

  initServer() {
    this.peers.forEach((peer) => {
      const server = net.createServer((socket) => {
        this.receiveMessage(socket);
      });
  
      server.listen(this.port + peer.id, this.host, () => {
        console.log(`Peer ${this.id}: Server started on port ${this.port + peer.id}`);
      });
  
      this.clientSockets.push(server);
    });
  }
  

  connectToPeers() {
    this.peers.forEach((peer) => {
      if (peer.id !== this.id) {
        setTimeout(() => {
          let client = net.connect({ port: this.port + peer.id, host: this.host }, () => {
            console.log(`Peer ${this.id}: Connected to Peer ${peer.id}`);
            this.clientSockets.push(client);
          });

          client.on('error', (error) => {
            console.log(`Peer ${this.id}: Connection to Peer ${peer.id} failed. Error: ${error.message}`);
          });
        }, 1000); // Add a delay of 1 second (adjust as needed)
      }
    });
  }

  startPeerTransactions() {
    setInterval(() => {
      const receiver = Math.floor(Math.random() * this.peers.length);
      if (receiver !== this.id) {
        const balance = this.wallet.getBalance();
        if (balance > 0) {
          const amount = Math.floor(Math.random() * (balance * 1.2));
          const transaction = new Transaction(
            this.wallet.publicKey,
            this.peers[receiver].wallet.publicKey,
            amount
          );
          this.broadcastToAllPeers(StringUtil.serialize(transaction));
          console.log(`Peer ${this.id}: Transaction broadcasted -> ID: ${transaction.transactionId} Value: ${transaction.amount}`);
        }
      }
    }, 5000);
  }

  startConsumer() {
    setInterval(() => {
      if (this.messageQueue.length > 0) {
        const message = this.messageQueue.shift();
        const transaction = StringUtil.deserialize(message, Transaction);
        console.log(`Peer ${this.id}: Transaction received -> ${transaction.fromAddress.substring(0, 5)} ==> Number of txs in my mempool: ${this.blockchain.mempool.length}`);
        if (transaction.isValid()) {
          this.blockchain.mempool.push(transaction);
        }
      }
    }, 1000);
  }

  receiveMessage(socket) {
    socket.on('data', (data) => {
      const message = data.toString();
      this.handleIncomingMessage(message, socket.peerId);
    });
  }

  sendMessage(peerId, message) {
    const socket = this.clientSockets[peerId];
    if (socket) {
      socket.write(message);
    }
  }

  broadcastToAllPeers(message) {
    this.clientSockets.forEach((socket) => {
      socket.write(message);
    });
  }

  mineNewBlock() {
    const transactionsToMine = [...this.blockchain.mempool];
    this.blockchain.mempool = [];

    const newBlock = new Block(this.blockchain.getLastBlock().hash, transactionsToMine);
    this.blockchain.addBlock(newBlock);
  }

  handleSyncRequest(message, peerId) {
    const { type, data } = StringUtil.deserialize(message);
    if (type === 'sync') {
      if (data === 'blockchain') {
        const blockchain = this.blockchain.serialize();
        const serializedBlockchain = StringUtil.serialize(blockchain);
        const response = StringUtil.serialize({ type: 'blockchain', data: serializedBlockchain });
        this.sendMessage(peerId, response);
      }
    }
  }

  handleSyncResponse(message) {
    const { type, data } = StringUtil.deserialize(message);
    if (type === 'blockchain') {
      const deserializedData = StringUtil.deserialize(data);
      const blockchain = Blockchain.deserialize(deserializedData);
      if (blockchain.isValid() && blockchain.blocks.length > this.blockchain.blocks.length) {
        this.blockchain = blockchain;
        console.log(`Peer ${this.id}: Updated blockchain from synchronization`);
      }
    }
  }

  handleIncomingMessage(message, peerId) {
    const { type } = StringUtil.deserialize(message);
    if (type === 'sync') {
      this.handleSyncRequest(message, peerId);
    } else {
      this.messageQueue.push(message);
    }
  }
}

const peer = new Peer();
peer.start();
