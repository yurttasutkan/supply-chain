const crypto = require('crypto');

class Transaction {
  constructor(fromAddress, toAddress, amount) {
    this.fromAddress = fromAddress;
    this.toAddress = toAddress;
    this.amount = amount;
    this.timestamp = Date.now();
    this.transactionId = this.calculateTransactionId();
    this.signature = null;
  }

  calculateTransactionId() {
    const data = this.fromAddress + this.toAddress + this.amount.toString() + this.timestamp.toString();
    const hash = crypto.createHash('sha256').update(data).digest('hex');
    return hash;
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

  processTransaction() {
    if (!this.isValid()) {
      console.log('Invalid transaction');
      return false;
    }

    const senderBalance = getBalanceOfAddress(this.fromAddress);

    if (senderBalance < this.amount) {
      console.log('Insufficient balance. Transaction rejected.');
      return false;
    }

    updateBalances();
    return true;
  }
}

module.exports = Transaction;
