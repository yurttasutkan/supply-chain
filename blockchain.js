const { Block } = require("./block");
const Transaction = require("./transaction");
const StringUtil = require("./stringUtil");

class Blockchain {
  constructor() {
    this.chain = [];
    this.difficulty = 4;
    this.pendingTransactions = [];
    this.miningReward = 100;
    this.balances = {};
    this.mempool = [];
    // Create the genesis block and update balances
    this.chain.push(this.createGenesisBlock());
    this.balances = this.updateBalances();
    this.UTXOs = {};
  }

  minePendingTransactions(miningRewardAddress) {
    const rewardTx = new Transaction(
      this,
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
    this.updateBalances(); // Update balances after mining
  }

  createGenesisBlock() {
    const transactions = [];
    const initialTransaction1 = new Transaction(
      this,
      "address1",
      "address2",
      100
    );
    transactions.push(initialTransaction1);
    
    const initialTransaction2 = new Transaction(
      this,
      "address2",
      "address3",
      50
    );
    transactions.push(initialTransaction2);
    

    return new Block(0, Date.now(), transactions, "0", 0);
  }

  getLastBlock() {
    return this.chain[this.chain.length - 1];
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

  updateBalances() {
    const updatedBalances = {};
  
    for (const block of this.chain) {
      for (const transaction of block.transactions) {
        const { fromAddress, toAddress, amount } = transaction;
  
        if (fromAddress) {
          // Decrease the balance of the sender
          updatedBalances[fromAddress] = (updatedBalances[fromAddress] || 0) - amount;
        }
  
        // Increase the balance of the recipient
        updatedBalances[toAddress] = (updatedBalances[toAddress] || 0) + amount;
      }
    }
  
    return updatedBalances;
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

  updateUTXOs(block) {
    for (const transaction of block.transactions) {
      // Remove spent transaction outputs
      for (const input of transaction.inputs) {
        delete this.UTXOs[input.transactionOutputId];
      }

      // Add new transaction outputs
      for (let i = 0; i < transaction.outputs.length; i++) {
        const output = transaction.outputs[i];
        this.UTXOs[output.id] = output;
      }
    }
  }
}

module.exports = Blockchain;
