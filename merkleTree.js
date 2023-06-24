class MerkleTree {
    constructor(transactionIds) {
      this.transactionIds = transactionIds;
      this.root = this.buildTree(transactionIds);
    }
  
    buildTree(transactions) {
      if (transactions.length === 1) {
        return transactions[0];
      }
  
      const nextLevel = [];
      for (let i = 0; i < transactions.length; i += 2) {
        const transaction1 = transactions[i];
        const transaction2 = (i + 1 === transactions.length) ? transaction1 : transactions[i + 1];
        const combinedHash = StringUtil.applySha256(transaction1 + transaction2);
        nextLevel.push(combinedHash);
      }
  
      return this.buildTree(nextLevel);
    }
  
    getRoot() {
      return this.root;
    }
  }
  
  module.exports = MerkleTree;
  