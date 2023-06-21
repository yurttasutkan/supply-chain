const express = require("express");
const { Blockchain, Transaction } = require("./blockchain");

// Create the blockchain
const blockchain = new Blockchain();

// Create the Express server
const app = express();
app.use(express.json());

// Define the API endpoints
app.get("/chain", (req, res) => {
  res.json(blockchain.chain);
});

app.post("/transaction", (req, res) => {
  const { data } = req.body;
  const blockIndex = blockchain.addBlock(data);
  res.json({ message: `Block added with index ${blockIndex}` });
});

// Start the server
const port = 3000;
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});


const myBlockchain = new Blockchain();

// Create some transactions
const transaction1 = new Transaction("address1", "address2", 100);
const transaction2 = new Transaction("address2", "address1", 200);

// Add the transactions to the pending transactions
myBlockchain.createTransaction(transaction1); // Transaction will be added
myBlockchain.createTransaction(transaction2); // Transaction will be rejected

// Mine a new block
myBlockchain.minePendingTransactions("my-address");

// Check balance
console.log("Balance of address1:", Math.max(0, myBlockchain.getBalanceOfAddress("address1")));
console.log("Balance of address2:", Math.max(0, myBlockchain.getBalanceOfAddress("address2")));

// Print the blockchain
console.log(JSON.stringify(myBlockchain.chain, null, 2));

