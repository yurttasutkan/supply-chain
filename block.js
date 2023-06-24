const StringUtil = require('./stringUtil');

class Block {
  constructor(index, timestamp, transactions, previousHash, nonce) {
    this.index = index;
    this.timestamp = timestamp;
    this.transactions = transactions;
    this.previousHash = previousHash;
    this.nonce = nonce;
    this.hash = this.calculateHash();
  }

  calculateHash() {
    return StringUtil.applySha256(
      this.index +
      this.timestamp +
      JSON.stringify(this.transactions) +
      this.previousHash +
      this.nonce
    );
  }

  mineBlock(difficulty) {
    while (this.hash.substring(0, difficulty) !== StringUtil.getDifficultyString(difficulty)) {
      this.nonce++;
      this.hash = this.calculateHash();
    }
    console.log("Block mined: " + this.hash);
  }

  isBlockValid(previousBlock) {
    if (this.hash !== this.calculateHash()) {
      return false;
    }

    if (this.previousHash !== previousBlock.hash) {
      return false;
    }

    // Validate timestamp
    if (this.timestamp <= previousBlock.timestamp) {
      return false;
    }

    // Validate transactions
    for (const transaction of this.transactions) {
      if (!transaction.isValid()) {
        return false;
      }
    }

    return true;
  }
}

module.exports = {
  Block
};
