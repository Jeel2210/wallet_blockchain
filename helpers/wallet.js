const crypto = require('crypto');
const sha256 = require('crypto-js/sha256')
const Transaction = require('./transaction');
var identities = [];

let Chain = require('./chain');
const models = require('../models');
// const WH = require('./walletHelper');
// let data = [];
// let call = () => {
// 	console.log("runnin");
	
// 	checkBC = async () => {
// 		console.log("runnin");
// 		let ele = await WH.getBlockchainElements()
		
// 		ele = WH.parse(ele);
// 		let blockchain=WH.parse(ele.blockchain)
// 		Chain.instance=JSON.parse(blockchain).chain
// 		console.log(data);

// 	}
// 	checkBC()
// }
// call()
// console.log("Data",data);
Chain.instance = new Chain();
console.log(Chain.instance);



class Wallet {

	initializeWallet() {
		const keypair = crypto.generateKeyPairSync('rsa', {
			modulusLength: 2048,
			publicKeyEncoding: { type: 'spki', format: 'pem' },
			privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
		})
		let privateKey = keypair.privateKey;
		let publicKey = keypair.publicKey;
		let name = "Node " + publicKey.substr(34, 40);
		this.addIdentities({ publicKey: publicKey, privateKey: privateKey, name: name });

		console.log(identities);
		return { publicKey: publicKey, privateKey: privateKey, name: name }
	}

	addIdentities(identity) {
		identities[identity.publicKey] = identity;
		console.log(identities);
		return identities;
	}

	async getAllWalletIdentities() {
		let wallets = await models.wallet.findAndCountAll();
		console.log(wallets.count);
		let identitiesData = [];
		wallets.rows.map(wallet => { identitiesData[wallet.public_key] = { publicKey: wallet.public_key, privateKey: wallet.private_key } })
		console.log(identitiesData);
		return identitiesData;
	}

	getIdentities() {
		// console.log(identities);
		return identities;
	}
	async sendMoney(amount, payeerPublicKey, payeePublicKey) {
		// console.log("Data==>",payeerPublicKey);
		console.log("Amount", amount);
		//th
		const transaction = new Transaction(amount, payeerPublicKey, payeePublicKey);

		const transactionHash = this.createTransactionHash(transaction);

		//signature
		const sign = crypto.createSign('SHA256');
		console.log(sign);
		sign.update(transactionHash.toString()).end();

		let identity = await this.getAllWalletIdentities()
		console.log("Identies============================================", identity);
		let data = identity[payeerPublicKey];
		console.log(data);
		const signature = sign.sign(data.privateKey);
		console.log("signature: " + signature);

		//chain
		Chain.instance.addBlock(transactionHash, payeerPublicKey, signature);
		console.log("chain:======================================================================= " + typeof Chain.instance, JSON.stringify(Chain.instance));

		let updateBody = {
			blockchain: JSON.stringify(Chain.instance),
		};

		// make sure above details can only be updated by admin
		const updateBlockchain = await models.blockchain.update(updateBody, {
			where: { blockchain_id: 1 },
			// transaction: req.tx
		});
		console.log();

		// return payeePublicKey;
		return Chain.instance;
	}


	
	async addBlockData(transactionHash, payeerPublicKey, signature) {
		console.log("cnkasdfjkal",transactionHash);
		Chain.instance.addBlock(transactionHash, payeerPublicKey, signature);
		console.log("chain:======================================================================= " + typeof Chain.instance, JSON.stringify(Chain.instance));

		// let updateBody = {
		// 	blockchain: JSON.stringify(Chain.instance),
		// };

		// // make sure above details can only be updated by admin
		// const updateBlockchain = await models.blockchain.update(updateBody, {
		// 	where: { blockchain_id: 1 },
		// 	// transaction: req.tx
		// });
		// console.log();

		// return payeePublicKey;
		return Chain.instance;
	}

	getChainInstance() {
		return Chain.instance;
	}


	async checkBalance(req, publicKey, amount) {
		console.log("publicKey", publicKey);
		let balance = await this.getbalance(req, publicKey)
		console.log("balance", balance);
		if (balance > amount) return true;
		else return false;
	}


	async getbalance(req, publicKey) {
		let balance = await models.wallet.findOne({
			// attribute: ['balance'],
			where: {
				public_key: publicKey,
			},
			transaction: req.tx
		});
		console.log("balancefrom balance wallet object========", balance);
		console.log("balancefrom balance balance object========", balance.balance);
		return balance.balance;
	}


	createTransactionHash(transaction) {
		console.log(transaction);
		transaction = JSON.stringify(transaction)
		console.log(transaction);

		return sha256(
			transaction
		).toString();

	}





}






module.exports = { Wallet }