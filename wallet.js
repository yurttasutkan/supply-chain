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

  arrangeFunds(recipient, value, inputs, outputs, txid) {
    if (this.getBalance() < value) {
      console.log('!!! Not Enough funds to send transaction. Transaction Discarded.');
      return;
    }

    let total = 0;

    for (const [txid, UTXO] of this.UTXOs) {
      total += UTXO.amount;
      inputs.push(txid);

      if (total >= value) break;
    }

    const leftOver = total - value;
    outputs.push(new TransactionOutput(recipient, value, txid));
    outputs.push(new TransactionOutput(this.publicKey, leftOver, txid));

    for (const input of inputs) {
      this.UTXOs.delete(input);
    }
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
