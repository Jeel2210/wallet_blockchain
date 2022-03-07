const sha256 = require('crypto-js/sha256');
const models = require('../models');




class WalletHelper {


	createTransactionHash(transaction) {
		console.log(transaction);
		transaction = JSON.stringify(transaction)
		console.log(transaction);

		return sha256(
			transaction
		).toString();

	}
	async getBlockchainElements() {
		// console.log("balancefrom balance wallet object========");

		let blockchain = await models.blockchain.findOne({

			where: {
				blockchain_id: 1,
			},
			// transaction: req.tx
		});
		// console.log("balancefrom balance wallet object========", JSON.parse(blockchain));
		// console.log("balancefrom balance balance object========", blockchain);
		return blockchain;
	}
	parse = el => JSON.parse(JSON.stringify(el));


}






module.exports = new WalletHelper()