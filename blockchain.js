const { Block } = require("./block");
const Transaction = require("./transaction");
const StringUtil = require("./stringUtil");

class Blockchain {
  constructor() {
    this.chain = [this.createGenesisBlock()];
    this.difficulty = 4;
    this.pendingTransactions = [];
    this.miningReward = 100;
    this.balances = {};
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

    block.mineBlock(this.difficulty); // Mine the block

    console.log("Block successfully mined!");
    this.chain.push(block);

    this.pendingTransactions = [];
  }

  createGenesisBlock() {
    const transactions = []; // Initialize an empty array for transactions

    // Add initial transactions to establish the initial distribution of funds
    const initialTransaction1 = new Transaction(null, "address1", 100);
    transactions.push(initialTransaction1);

    const initialTransaction2 = new Transaction(null, "address2", 50);
    transactions.push(initialTransaction2);

    // Create the genesis block with the initial transactions
    return new Block(0, Date.now(), transactions, "0", 0);
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

  serialize() {
    return StringUtil.serialize(this);
  }

  static deserialize(data) {
    return StringUtil.deserialize(data, Blockchain);
  }
}

module.exports = Blockchain;
