const TransactionInput = require('./transactionInput');
const TransactionOutput = require('./transactionOutput');
const crypto = require('crypto');
const StringUtil = require('./stringUtil');

class Transaction {
  constructor(blockchain, fromAddress, toAddress, amount) {
    this.fromAddress = fromAddress;
    this.toAddress = toAddress;
    this.amount = amount;
    this.timestamp = Date.now();
    this.transactionId = this.calculateTransactionId();
    this.signature = null;
    this.inputs = [];
    this.outputs = [];

    // UTXOs for this transaction
    this.createOutputs(blockchain);
  }

  calculateTransactionId() {
    
    const data = this.fromAddress + this.toAddress + this.amount.toString() + this.timestamp.toString();
    return StringUtil.applySha256(data);
  }
  

  signTransaction(signingKey) {
    const sign = crypto.createSign('SHA256');
    sign.update(this.transactionId);
    this.signature = sign.sign(signingKey, 'hex');
  }

  isValid() {
    if (!this.fromAddress || !this.toAddress || this.amount <= 0) {
      return false;
    }

    if (!this.signature || this.signature.length === 0) {
      return false;
    }

    const publicKey = crypto.createPublicKey(this.fromAddress);
    const verify = crypto.createVerify('SHA256');
    verify.update(this.transactionId);

    return verify.verify(publicKey, this.signature, 'hex');
  }

  processTransaction(blockchain) {
    if (!this.isValid()) {
      console.log('Invalid transaction');
      return false;
    }

    const senderBalance = blockchain.getBalanceOfAddress(this.fromAddress);

    if (senderBalance < this.amount) {
      console.log('Insufficient balance. Transaction rejected.');
      return false;
    }

    blockchain.updateBalances();
    return true;
  }

  createOutputs(blockchain) {
    const output = new TransactionOutput(this.toAddress, this.amount);
    output.transactionOutputId = this.transactionId;
    this.outputs.push(output);

    const leftoverAmount = blockchain.getBalanceOfAddress(this.fromAddress) - this.amount;
    if (leftoverAmount > 0) {
      const leftoverOutput = new TransactionOutput(this.fromAddress, leftoverAmount);
      leftoverOutput.transactionOutputId = this.transactionId;
      this.outputs.push(leftoverOutput);
    }
  }

  createInput(unspentOutputs) {
    const input = new TransactionInput(unspentOutputs);
    this.inputs.push(input);
  }
}

module.exports = Transaction;
