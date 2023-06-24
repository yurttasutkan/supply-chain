const crypto = require('crypto');
const Blockchain = require("./blockchain");
const Transaction = require("./transaction");
const Block = require("./block");
const Peer = require("./peer");

class Wallet {
  constructor(blockchain) {
    this.publicKey = this.generatePublicKey();
    this.blockchain = blockchain;
  }
  
  generatePublicKey() {
    const keyPair = crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: { type: 'spki', format: 'pem' },
      privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
    });
    return keyPair.publicKey;
  }
  
  getBalance() {
    let balance = 0;
    for (const block of this.blockchain.chain) {
      for (const transaction of block.transactions) {
        if (transaction.fromAddress === this.publicKey) {
          balance -= transaction.amount;
        }
  
        if (transaction.toAddress === this.publicKey) {
          balance += transaction.amount;
        }
      }
    }
  
    return balance;
  }
}
    

  module.exports = Wallet;