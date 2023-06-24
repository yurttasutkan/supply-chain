class TransactionInput {
    constructor(transactionOutputId) {
      this.transactionOutputId = transactionOutputId;
      this.unlockingScript = null;
    }
  }
  
  module.exports = TransactionInput;
  