const crypto = require('crypto');
const Block = require('./block');
const Transaction = require('./transaction');
let wallet = require('./walletHelper');

// let wallet = new WalletData();
class Chain {
	constructor() {
		this.chain = [
			// Genesis block
			// let transaction= new Transaction(100, 'genesis', 'satoshi')
			new Block('', wallet.createTransactionHash(new Transaction(100, 'genesis', 'satoshi')))
		];
	}
	// Most recent block
	get lastBlock() {
		return this.chain[this.chain.length - 1];
	}
	// Proof of work system
	mine(nonce) {
		let solution = 1;
		console.log('⛏️  mining...');
		while (true) {
			const hash = crypto.createHash('MD5');
			hash.update((nonce + solution).toString()).end();
			const attempt = hash.digest('hex');
			if (attempt.substr(0, 4) === '0000') {
				console.log(`Solved: ${solution}`);
				return solution;
			}
			solution += 1;
		}
	}
	// Add a new block to the chain if valid signature & proof of work is complete
	addBlock(transaction, senderPublicKey, signature) {
		console.log("Adddidbnfgdf",transaction);
		console.log("jsdsajjkasddkh");
		const verify = crypto.createVerify('SHA256');
		console.log("verify", verify);
		let proof = verify.update(transaction.toString());
		console.log("Proof", proof);
		const isValid = verify.verify(senderPublicKey, signature);
		console.log("isValid", isValid);
		if (isValid) {
			const newBlock = new Block(this.lastBlock.hash, transaction, this.lastBlock.height + 1);
			console.log("newBlock", newBlock);
			// this.mine(newBlock.nonce);
			this.chain.push(newBlock);
		}
	}
}


// Chain.instance = new Chain();

module.exports = Chain;