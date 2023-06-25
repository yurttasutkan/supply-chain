class TransactionOutput {
    constructor(blockchain, recipientAddress, amount) {
      this.blockchain = blockchain;
      this.recipientAddress = recipientAddress;
      this.amount = amount;
      this.transactionOutputId = null;
    }
  }
  
  module.exports = TransactionOutput;