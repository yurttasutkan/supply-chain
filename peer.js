const net = require('net');
const { Block } = require('./block');
const Blockchain = require('./blockchain');
const Transaction = require('./transaction');
const Wallet = require('./wallet');

class Peer {
  constructor() {
    this.id = 0;
    this.blockchain = new Blockchain();
    this.wallet = new Wallet();
    this.peers = [
      { id: 1, host: 'localhost' },
      { id: 2, host: 'localhost' },
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
    this.clientSockets.push(this.server);
    this.startPeerTransactions();
    this.startConsumer();
    // Set the peerId for each client socket
    this.clientSockets.forEach((socket, index) => {
      socket.peerId = this.peers[index].id;
    });
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
        let client = net.connect({ port: this.port + peer.id, host: this.host }, () => {
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
          const transaction = new Transaction(
            this.wallet.publicKey,
            this.peers[receiver].wallet.publicKey,
            amount
          );
          this.broadcastToAllPeers(transaction.serialize());
          console.log(`Peer ${this.id}: Transaction broadcasted -> ID: ${transaction.transactionId} Value: ${transaction.amount}`);
        }
      }
    }, 5000);
  }

  startConsumer() {
    setInterval(() => {
      if (this.messageQueue.length > 0) {
        const message = this.messageQueue.shift();
        const transaction = Transaction.deserialize(message);
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
    const { type, data } = JSON.parse(message);
    if (type === 'sync') {
      if (data === 'blockchain') {
        const blockchain = this.blockchain.serialize();
        const message = JSON.stringify({ type: 'blockchain', data: blockchain });
        this.sendMessage(peerId, message);
      }
    }
  }

  handleSyncResponse(message) {
    const { type, data } = JSON.parse(message);
    if (type === 'blockchain') {
      const blockchain = Blockchain.deserialize(data);
      if (blockchain.isValid() && blockchain.blocks.length > this.blockchain.blocks.length) {
        this.blockchain = blockchain;
        console.log(`Peer ${this.id}: Updated blockchain from synchronization`);
      }
    }
  }

  handleIncomingMessage(message, peerId) {
    const { type } = JSON.parse(message);
    if (type === 'sync') {
      this.handleSyncRequest(message, peerId);
    } else {
      this.messageQueue.push(message);
    }
  }
}

const peer = new Peer();
peer.start();
