const crypto = require('crypto');
const { MerkleTree } = require('./merkleTree');

class StringUtil {
  static applySha256(input) {
    try {
      const hash = crypto.createHash('sha256').update(input, 'utf8').digest('hex');
      return hash;
    } catch (error) {
      throw new Error(error);
    }
  }

  static getJson(obj) {
    return JSON.stringify(obj, null, 2);
  }

  static getDifficultyString(difficulty) {
    return '0'.repeat(difficulty);
  }

  static applyECDSASig(privateKey, input) {
    try {
      const sign = crypto.createSign('SHA256');
      sign.update(input);
      const signature = sign.sign(privateKey, 'hex');
      return Buffer.from(signature, 'hex');
    } catch (error) {
      throw new Error(error);
    }
  }

  static verifyECDSASig(publicKey, data, signature) {
    try {
      const verify = crypto.createVerify('SHA256');
      verify.update(data);
      return verify.verify(publicKey, signature);
    } catch (error) {
      throw new Error(error);
    }
  }

  static getStringFromKey(key) {
    return key.export({ type: 'pkcs1', format: 'pem' });
  }

  static getMerkleRoot(transactions) {
    const transactionIds = transactions.map((transaction) => transaction.transactionId);
    const merkleTree = new MerkleTree(transactionIds);
    return merkleTree.getRoot();
  }

  static serialize(data) {
    return JSON.stringify(data);
  }

  static deserialize(serializedData) {
    return JSON.parse(serializedData);
  }
}

module.exports = StringUtil;
