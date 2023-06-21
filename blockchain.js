const Block = require("./block");
const Transaction = require("./transaction");


class Blockchain {
  constructor() {
    this.chain = [this.createGenesisBlock()];
    this.difficulty = 4;
    this.pendingTransactions = [];
    this.miningReward = 100;
    this.balances = {};
  }

  createGenesisBlock() {
    return new Block(0, Date.now(), [], "0", 0);
  }

  getLastBlock() {
    return this.chain[this.chain.length - 1];
  }

  minePendingTransactions(miningRewardAddress) {
    const rewardTx = new Transaction(
      null,
      miningRewardAddress,
      this.miningReward
    );
    this.pendingTransactions.push(rewardTx);

    const block = new Block(
      this.chain.length,
      Date.now(),
      this.pendingTransactions,
      this.getLastBlock().hash,
      0
    );
    block.mineBlock(this.difficulty);

    console.log("Block successfully mined!");
    this.chain.push(block);

    this.pendingTransactions = [];
  }

  createTransaction(transaction) {
    const { fromAddress, toAddress, amount } = transaction;
    const senderBalance = this.getBalanceOfAddress(fromAddress);

    if (senderBalance >= amount) {
      this.pendingTransactions.push(transaction);
    } else {
      console.log("Insufficient balance. Transaction rejected.");
    }
  }

  getBalanceOfAddress(address) {
    if (!(address in this.balances)) {
      this.balances[address] = 0;
    }

    let balance = this.balances[address];

    for (const block of this.chain) {
      for (const transaction of block.transactions) {
        if (transaction.fromAddress === address) {
          balance -= transaction.amount;
        }

        if (transaction.toAddress === address) {
          balance += transaction.amount;
        }
      }
    }

    return balance;
  }

  isChainValid() {
    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i];
      const previousBlock = this.chain[i - 1];

      if (currentBlock.hash !== currentBlock.calculateHash()) {
        return false;
      }

      if (currentBlock.previousHash !== previousBlock.hash) {
        return false;
      }
    }

    return true;
  }
}

module.exports =  Blockchain;
