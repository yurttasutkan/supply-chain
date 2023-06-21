const crypto = require('crypto');

class Transaction {
  constructor(fromAddress, toAddress, amount) {
    this.fromAddress = fromAddress;
    this.toAddress = toAddress;
    this.amount = amount;
    this.timestamp = Date.now();
    this.transactionId = this.calculateTransactionId();
  }

  calculateTransactionId() {
    const data = this.fromAddress + this.toAddress + this.amount.toString() + this.timestamp.toString();
    const hash = crypto.createHash('sha256').update(data).digest('hex');
    return hash;
  }

  processTransaction() {
    // Implement transaction processing logic here
    return true;
  }

  serialize() {
    return JSON.stringify(this);
  }

  static deserialize(serializedTransaction) {
    const { fromAddress, toAddress, amount, timestamp, transactionId } = JSON.parse(serializedTransaction);
    const transaction = new Transaction(fromAddress, toAddress, amount);
    transaction.timestamp = timestamp;
    transaction.transactionId = transactionId;
    return transaction;
  }
}

module.exports = Transaction;
