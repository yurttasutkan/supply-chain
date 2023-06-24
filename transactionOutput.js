class TransactionOutput {
    constructor(recipientAddress, amount) {
      this.recipientAddress = recipientAddress;
      this.amount = amount;
      this.transactionOutputId = null;
    }
  }
  
  module.exports = TransactionOutput;