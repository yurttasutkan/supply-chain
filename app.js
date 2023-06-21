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
  const { fromAddress, toAddress, amount } = req.body;
  const balance = blockchain.getBalanceOfAddress(fromAddress);

  if (balance >= amount) {
    const transaction = new Transaction(fromAddress, toAddress, amount);
    blockchain.createTransaction(transaction);
    res.json({ message: "Transaction added to pending transactions." });
  } else {
    res.status(400).json({ error: "Insufficient balance. Transaction rejected." });
  }
});


app.get("/mine", (req, res) => {
  const miningRewardAddress = req.query.address;
  blockchain.minePendingTransactions(miningRewardAddress);
  res.json({ message: "Block mined and added to the blockchain." });
});

app.get("/balance/:address", (req, res) => {
  const address = req.params.address;
  const balance = blockchain.getBalanceOfAddress(address);
  res.json({ balance });
});

// Start the server
const port = 3000;
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
