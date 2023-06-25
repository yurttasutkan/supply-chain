const crypto = require('crypto');
const TransactionOutput = require('./transactionOutput');

class Wallet {
  constructor(peer) {
    this.privateKey = crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: { type: 'spki', format: 'pem' },
      privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
    }).privateKey;

    this.publicKey = crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: { type: 'spki', format: 'pem' },
      privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
    }).publicKey;

    this.peer = peer;
    this.UTXOs = new Map();
  }

  getBalance() {
    let balance = 10;
    const UTXOs = Object.values(this.peer.blockchain.UTXOs);
    for (const UTXO of UTXOs) {
      if (UTXO.belongsTo(this.publicKey)) {
        balance += UTXO.amount;
      }
    }
    return balance;
  }
  
  arrangeFunds(recipient, value, txid) {
    if (this.getBalance() < value) {
      console.log('!!! Not Enough funds to send transaction. Transaction Discarded.');
      return;
    }
  
    let total = 0;
    const inputs = [];
    const outputs = [];
  
    const UTXOs = Array.from(this.peer.blockchain.UTXOs.values());
    for (const UTXO of UTXOs) {
      if (UTXO.belongsTo(this.publicKey)) {
        total += UTXO.amount;
        inputs.push(UTXO.txid);
  
        if (total >= value) break;
      }
    }
  
    const leftOver = total - value;
    const output1 = new TransactionOutput(recipient, value, txid + '1'); // Eşsiz txid kullanımı
    const output2 = new TransactionOutput(this.publicKey, leftOver, txid + '2'); // Eşsiz txid kullanımı
  
    outputs.push(output1);
    outputs.push(output2);
  
    for (const input of inputs) {
      this.peer.blockchain.UTXOs.delete(input);
    }
  
    this.peer.blockchain.UTXOs.set(output1.txid, output1); // Yeni çıkış işlemleri için farklı txid kullanımı
    this.peer.blockchain.UTXOs.set(output2.txid, output2); // Yeni çıkış işlemleri için farklı txid kullanımı
  }
  
  
  

  sign(message) {
    const sign = crypto.createSign('SHA256');
    sign.update(message);
    return sign.sign(this.privateKey, 'hex');
  }

  verify(publicKey, message, signature) {
    const verify = crypto.createVerify('SHA256');
    verify.update(message);
    return verify.verify(publicKey, signature, 'hex');
  }
}

module.exports = Wallet;
