const net = require('net');
const crypto = require('crypto');
const Blockchain = require("./blockchain");
const Wallet  = require("./wallet");

class Peer {
  constructor() {
    this.id = 0;
    this.blockchain = new Blockchain();
    this.wallet = new Wallet();
    this.peers = []; // In a real system, this would hold a list of peer objects
    this.messageQueue = [];
    this.server = null;
    this.clientSockets = [];
    this.host = 'localhost';
    this.port = 6000;
  }

  start() {
    this.id = this.peers.length;
    this.initServer();
    this.connectToPeers();
    this.startPeerTransactions();
    this.startConsumer();
  }

  initServer() {
    this.server = net.createServer((socket) => {
      this.receiveMessage(socket);
    });

    this.server.listen(this.port + this.id, this.host, () => {
      console.log(`Peer ${this.id}: Server started on port ${this.port + this.id}`);
    });
  }

  connectToPeers() {
    this.peers.forEach((peer) => {
      if (peer.id !== this.id) {
        const client = net.connect({ port: this.port + peer.id, host: this.host }, () => {
          console.log(`Peer ${this.id}: Connected to Peer ${peer.id}`);
          this.clientSockets.push(client);
        });
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
          const transaction = new Transaction(this.wallet.publicKey, this.peers[receiver].wallet.publicKey, amount);
          this.broadcastToAllPeers(transaction.serialize());
          console.log(`Peer ${this.id}: Transaction broadcasted -> ID: ${transaction.transactionId} Value: ${transaction.value}`);
        }
      }
    }, 5000);
  }

  startConsumer() {
    setInterval(() => {
      if (this.messageQueue.length > 0) {
        const message = this.messageQueue.shift();
        const transaction = Transaction.deserialize(message);
        console.log(`Peer ${this.id}: Transaction received -> ${transaction.sender.substring(0, 5)} ==> Number of txs in my mempool: ${this.blockchain.mempool.length}`);
        if (transaction.processTransaction()) {
          this.blockchain.mempool.push(transaction);
        }
      }
    }, 1000);
  }

  receiveMessage(socket) {
    socket.on('data', (data) => {
      const message = data.toString();
      this.messageQueue.push(message);
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

  mineBlock() {
    const transactionsToMine = [...this.blockchain.mempool];
    this.blockchain.mempool = [];

    const newBlock = new Block(this.blockchain.getLastBlock().hash, transactionsToMine);
    this.blockchain.addBlock(newBlock);
  }
}



const peer = new Peer();
peer.start();
