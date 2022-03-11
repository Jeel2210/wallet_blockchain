const { Op } = require("sequelize");
const {
  errorMessage,
  parse,
  createPassword,
  validatePassword,
  searchQuery,
  calculateExpireOn,
  pagination,
  sequelize_order,
  sequelizeDateFilter,
} = require("../helpers/utils");
const resPattern = require("../helpers/responsePattern");
const models = require("../models");
const WalletClass = require("../helpers/wallet");
const Transaction = require("../helpers/transaction");
const sha256 = require("crypto-js/sha256");
const crypto = require("crypto");
const { prevUntil } = require("cheerio/lib/api/traversing");
let Wallet = WalletClass.Wallet;
let Money = WalletClass.SendMoney;
let signature;
/**
 * @param {Object} req
 * @param {Object} req.body
 * @param {Object} req.body.password
 * @param {Object} req.body.role
 */

const userRegister = async (req, res, next) => {
  try {
    req.body.password = req.body.password
      ? createPassword(req.body.password)
      : undefined;
    let createBody = {
      role: req.body.role,
      name: req.body.firstName + " " + req.body.lastName,
      email: req.body.email,
      phone: req.body.contact,
      // age: req.body.age,
      // address: req.body.address,
      gender: req.body.gender,
      password: req.body.password,
    };
    createBody = parse(createBody);
    //
    let wallet = new Wallet();
    wallet = wallet.initializeWallet();

    // createBody.name = wallet.name;

    let userDetails = await models.user.create(createBody, {
      transaction: req.tx,
    });
    if (!userDetails) errorMessage("Failed to create user.", true);

    userDetails = parse(userDetails);
    console.log(userDetails);
    let createWalletBody = {
      user_id: userDetails.user_id,
      balance: 100,
      address: wallet.name,
      public_key: wallet.publicKey,
      private_key: wallet.privateKey,
    };
    console.log("walletBalance", createWalletBody);
    let walletDetails = await models.wallet.create(createWalletBody, {
      transaction: req.tx,
    });
    console.log("walletDetails", walletDetails);

    if (!walletDetails) errorMessage("Failed to initate wallet.", true);

    userDetails.publicKey = wallet.publicKey;
    console.log("userDetails created", userDetails);

    let data = new resPattern.successResponse(
      { userDetails, walletDetails },
      "User created."
    );
    res.status(data.status).json(data);
  } catch (error) {
    console.log(`---> `, error);
    return next(new resPattern.failedResponse(errorMessage(error)));
  }
};

/**
 * @param {Object} req
 * @param {Object} req.body
 * @param {Object} req.params
 * @param {number} req.params.id
 */
const updateUser = async (req, res, next) => {
  try {
    // Check if user exists.
    const findUser = await models.user.findOne({
      where: {
        user_id: req.params.id,
      },
    });
    if (!findUser)
      return errorMessage("Invalid user details. Please try again.", true);

    // Check duplicate user
    if (
      req.body.email !== findUser.email ||
      req.body.phone !== findUser.phone
    ) {
      let findDuplicateEmailOrPhone = await models.user.findOne({
        where: {
          [Op.or]: [
            ...(req.body.email ? [{ email: req.body.email }] : []),
            ...(req.body.phone ? [{ phone: req.body.phone }] : []),
          ],
          user_id: {
            [Op.ne]: findUser.user_id,
          },
        },
      });
      if (findDuplicateEmailOrPhone) {
        let emailIsSame = findDuplicateEmailOrPhone.email === req.body.email;
        let phoneIsSame = findDuplicateEmailOrPhone.phone === req.body.phone;
        if (emailIsSame || phoneIsSame)
          errorMessage(
            `${
              emailIsSame
                ? phoneIsSame
                  ? "Email and phone no."
                  : "Email"
                : "Phone no."
            } already exist${!(emailIsSame && phoneIsSame) ? "s" : ""}.`,
            true
          );
      }
    }

    // Update user
    let updateBody = {
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      age: req.body.age,
      address: req.body.address,
      gender: req.body.gender,
      password: req.body.password,
    };

    // make sure above details can only be updated by admin
    updateBody = parse(updateBody);
    const updateUser = await models.user.update(updateBody, {
      where: { user_id: req.params.id },
      transaction: req.tx,
    });
    if (!updateUser)
      errorMessage("Failed to update user details. Please try again.", true);

    let userDetails = await models.user.findOne({
      where: {
        user_id: req.params.id,
      },
      attributes: { exclude: ["password"] },
      transaction: req.tx,
    });

    let data = new resPattern.successResponse({ userDetails }, "User updated.");
    res.status(data.status).json(data);
  } catch (error) {
    console.log(error);
    return next(new resPattern.failedResponse(errorMessage(error)));
  }
};

/**
 * @param {Object} req
 * @param {Object} req.params
 * @param {number} req.params.id
 */
const deleteUser = async (req, res, next) => {
  try {
    // Check if user exists.
    const findUser = await models.user.findOne({
      where: {
        user_id: req.params.id,
        is_deleted: false,
      },
    });
    if (!findUser)
      return errorMessage("Invalid user details. Please try again.", true);

    // Delete query
    const userDetails = await models.user.update(
      {
        is_active: false,
        is_deleted: true,
      },
      {
        where: {
          user_id: req.params.id,
        },
        transaction: req.tx,
      }
    );
    if (!userDetails) errorMessage("Failed to delete user.", true);

    let data = new resPattern.successResponse({}, "User deleted.");
    res.status(data.status).json(data);
  } catch (error) {
    console.log(error);
    return next(new resPattern.failedResponse(errorMessage(error)));
  }
};

/**
 * @param {Object} req
 * @param {Object} req.params
 * @param {integer} req.params.id
 */
const getUserByID = async (req, res, next) => {
  try {
    console.log("req==>", req.params);
    let userDetails = await models.user.findOne({
      where: {
        user_id: req.params.id,
      },
      include: [{ model: models.wallet, as: "wallet" }],
      attributes: { exclude: ["password"] },
      transaction: req.tx,
    });
    // userDetails= parse(userDetails);
    console.log("data==>");

    if (!userDetails) errorMessage("No user found.", true);

    let data = new resPattern.successResponse({ userDetails });
    res.status(data.status).json(data);
  } catch (error) {
    console.log(error);
    return next(new resPattern.failedResponse(errorMessage(error)));
  }
};

const getAllUsers = async (req, res, next) => {
  try {
    let where = {};
    if (req.query.user_id) {
      where = {
        user_id: {
          [Op.ne]: req.query.user_id,
        },
      };
      // where = user_id:{
      // 	[Op.ne]: req.query.user_id ? req.query.user_id : 10000
      // }
    }

    let userDetails = await models.user.findAndCountAll({
      where,
      include: [
        {
          model: models.wallet,
          as: "wallet",
          attributes: { exclude: ["private_key"] },
        },
      ],
    });
    let wallet = new Wallet();
    let walletData = await wallet.getAllWalletIdentities(req);
    console.log("wallet", walletData);
    let data = new resPattern.successResponse(userDetails);
    res.status(data.status).json(data);
  } catch (error) {
    console.log(error);
    return next(new resPattern.failedResponse(errorMessage(error)));
  }
};

const sendMoney = async (req, res, next) => {
  try {
    /**
     * @param {String} payeer_name
     * @param {String} payee_name
     * @param {Number} amount
     * */
    let payeerPublicKey = req.body.payeer_public_key;
    let payeePublicKey = req.body.payee_public_key;
    let amount = req.body.amount;
    let payeerWalletId = req.body.payeer_wallet_id;
    let payeeWalletId = req.body.payee_wallet_id;

    console.log(
      "payeer name : " + payeerPublicKey + "Payee name : " + payeePublicKey
    );

    /**
     * get instance of wallet
     * check the identies
     * send money()
     */

    let wallet = new Wallet();

    // let identities = wallet.getIdentities()
    // console.log(identities[payeerPublicKey].publicKey,identities[payeePublicKey].publicKey);

    let check = await wallet.checkBalance(req, payeerPublicKey, amount);
    if (check === false) errorMessage("Insuficient balance", true);
    //build a block
    let tDetails = {};
    let moneySend = await wallet.sendMoney(
      amount,
      payeerPublicKey,
      payeePublicKey
    );
    if (moneySend) {
      /**
       * transactionHistory add entry(node height,user_id)
       */
      //update  balance
      //get balance

      let walletPayeerBalance = await wallet.getbalance(req, payeerPublicKey);

      console.log(
        "walletBalance=====================================================",
        walletPayeerBalance
      );
      // console.log("Payee", payeePublicKey);

      let walletPayeeBalance = await wallet.getbalance(req, payeePublicKey);

      console.log(
        "walletBalance=====================================================",
        walletPayeerBalance,
        walletPayeeBalance
      );
      // Update user
      let updatePayeerBody = {
        balance: walletPayeerBalance - amount,
      };
      let updatePayeeBody = {
        balance: walletPayeeBalance + amount,
      };

      let updatePayeerUser = await models.wallet.update(updatePayeerBody, {
        where: { public_key: payeerPublicKey },
        transaction: req.tx,
      });
      updatePayeerUser = parse(updatePayeerUser);
      if (!updatePayeerUser) errorMessage("Transaction Failed.", true);

      let updatePayeeUser = await models.wallet.update(updatePayeeBody, {
        where: { public_key: payeePublicKey },
        transaction: req.tx,
      });
      updatePayeeUser = parse(updatePayeeUser);
      if (!updatePayeeUser) errorMessage("Transaction Failed.", true);

      // console.log(moneySend.chain[moneySend.chain.length - 1].height);
      let createTransactionHistory = {
        // wallet_id: req.body.wallet_id,
        node: moneySend.chain[moneySend.chain.length - 1].height,
      };

      tDetails = await models.transaction_history.create(
        createTransactionHistory,
        { transaction: req.tx }
      );
      if (!tDetails) errorMessage("Transaction Failed.", true);
    }

    let data = new resPattern.successResponse(
      { data: { moneySend, tDetails } },
      "User created."
    );
    res.status(data.status).json(data);
  } catch (error) {
    console.log(`---> `, error);
    return next(new resPattern.failedResponse(errorMessage(error)));
  }
};

const getBlockChainInstance = async (req, res, next) => {
  try {
    let wallet = new Wallet();
    // let identities = wallet.getIdentities()
    // console.log(identities[payeerPublicKey].publicKey,identities[payeePublicKey].publicKey);
    let blockdata = wallet.getChainInstance();

    let data = new resPattern.successResponse(
      { data: blockdata },
      "Block chain ."
    );
    res.status(data.status).json(data);
  } catch (error) {
    console.log(`---> `, error);
    return next(new resPattern.failedResponse(errorMessage(error)));
  }
};

const createTranscationHash = async (req, res, next) => {
  try {
    let payeerPublicKey = req.body.payeer_public_key;
    let payeePublicKey = req.body.payee_public_key;
    let amount = req.body.amount;

    console.log(
      "payeer name : " + payeerPublicKey + "Payee name : " + payeePublicKey
    );

    /**
     * get instance of wallet
     * check the identies
     * send money()
     */

    let wallet = new Wallet();

    // let identities = wallet.getIdentities()
    // console.log(identities[payeerPublicKey].publicKey,identities[payeePublicKey].publicKey);

    let check = await wallet.checkBalance(req, payeerPublicKey, amount);
    if (check === false) errorMessage("Insuficient balance", true);
    //build a block
    console.log("Amount", amount);
    //th
    const transaction = new Transaction(
      amount,
      payeerPublicKey,
      payeePublicKey
    );

    const transactionHash = wallet.createTransactionHash(transaction);

    let data = new resPattern.successResponse(transactionHash, "ts");
    res.status(data.status).json(data);
  } catch (error) {
    console.log(`---> `, error);
    return next(new resPattern.failedResponse(errorMessage(error)));
  }
};

const createSignature = async (req, res, next) => {
  try {
    let payeerPublicKey = req.body.payeer_public_key;
    let payeePublicKey = req.body.payee_public_key;
    let amount = req.body.amount;
    let transactionHash = req.body.transaction_hash;

    console.log(
      "payeer name : " + payeerPublicKey + "Payee name : " + payeePublicKey
    );

    let wallet = new Wallet();

    let check = await wallet.checkBalance(req, payeerPublicKey, amount);
    if (check === false) errorMessage("Insuficient balance", true);

    //build a block
    console.log("Amount", amount);
    //th
    const sign = crypto.createSign("SHA256");
    console.log(sign);
    sign.update(transactionHash.toString()).end();

    let identity = await wallet.getAllWalletIdentities();
    console.log(
      "Identies============================================",
      identity
    );
    let Ndata = identity[payeerPublicKey];
    console.log(Ndata);
    signature = sign.sign(Ndata.privateKey);
    console.log("signature: " + signature);

    let data = new resPattern.successResponse(
      { signature, transactionHash },
      "ts"
    );
    res.status(data.status).json(data);
  } catch (error) {
    console.log(`---> `, error);
    return next(new resPattern.failedResponse(errorMessage(error)));
  }
};

const createBlock = async (req, res, next) => {
  try {
    let payeerPublicKey = req.body.payeer_public_key;
    let payeePublicKey = req.body.payee_public_key;
    let amount = req.body.amount;
    let transactionHash = req.body.transactionHash;
    // let signature = req.body.signature

    console.log(
      "payeer name : " + payeerPublicKey + "Payee name : " + transactionHash,
      signature
    );

    let wallet = new Wallet();

    // let check = await wallet.checkBalance(req, payeerPublicKey, amount);
    // if (check === false) errorMessage('Insuficient balance', true);
    let chain = await wallet.addBlockData(
      transactionHash,
      payeerPublicKey,
      signature
    );
    console.log(chain);
    // chain.addBlock(transactionHash, payeerPublicKey, signature);
    // console.log(chain);
    //build a block
    let tDetails = {};
    let moneySend = await wallet.sendMoney(
      amount,
      payeerPublicKey,
      payeePublicKey
    );
    if (moneySend) {
      /**
       * transactionHistory add entry(node height,user_id)
       */
      //update  balance
      //get balance

      let walletPayeerBalance = await wallet.getbalance(req, payeerPublicKey);

      console.log(
        "walletBalance=====================================================",
        walletPayeerBalance
      );
      // console.log("Payee", payeePublicKey);

      let walletPayeeBalance = await wallet.getbalance(req, payeePublicKey);

      console.log(
        "walletBalance=====================================================",
        walletPayeerBalance,
        walletPayeeBalance
      );
      // Update user
      let updatePayeerBody = {
        balance: parseFloat(walletPayeerBalance) - parseFloat(amount),
      };
      let updatePayeeBody = {
        balance: parseFloat(walletPayeeBalance) + parseFloat(amount),
      };

      let updatePayeerUser = await models.wallet.update(updatePayeerBody, {
        where: { public_key: payeerPublicKey },
        transaction: req.tx,
      });
      // updatePayeerUser = parse(updatePayeerUser);
      if (!updatePayeerUser) errorMessage("Transaction Failed.", true);

      let updatePayeeUser = await models.wallet.update(updatePayeeBody, {
        where: { public_key: payeePublicKey },
        transaction: req.tx,
      });
      console.log("updatePayeeUser", updatePayeeUser);
      // updatePayeeUser = parse(updatePayeeUser);
      if (!updatePayeeUser) errorMessage("Transaction Failed.", true);

      // console.log(moneySend.chain[moneySend.chain.length - 1].height);
      let createTransactionHistory = {
        /***
         * 1. payeerPublicKey
         * 2. payeePublicKey
         */
        payer_public_key: payeerPublicKey,
        payee_public_key: payeePublicKey,
        amount: amount,
        node: moneySend.chain[moneySend.chain.length - 1].height,
      };

      tDetails = await models.transaction_history.create(
        createTransactionHistory,
        { transaction: req.tx }
      );
      if (!tDetails) errorMessage("Transaction Failed.", true);
    }
    let data = new resPattern.successResponse({ chain }, "ts");
    res.status(data.status).json(data);
  } catch (error) {
    console.log(`---> `, error);
    return next(new resPattern.failedResponse(errorMessage(error)));
  }
};

const transactionHistory = async (req, res, next) => {
  try {
    let count = 0;

    console.log("public_key", req.body, req.query);
    let public_key = req.body.public_key || req.query.public_key;
    let page_number = req.body.page || req.query.page || 1;
    let page_size = req.body.limit || req.query.limit || 10;

    let senderBlockHistories = await models.transaction_history.findAndCountAll(
      {
        attributes: ["node"],
        where: {
          [Op.or]: [
            { payer_public_key: public_key },
            { payee_public_key: public_key },
          ],
        },
        transaction: req.tx,
      }
    );
    senderBlockHistories = parse(senderBlockHistories);

    console.log("data==>", senderBlockHistories.rows);
    console.log(
      "data12==>",
      senderBlockHistories.rows.map((el) => {
        console.log(el.node);
        el.node;
      })
    );

    let wallet = new Wallet();
    let chain = wallet.getChainInstance();
    let nodes = { node: senderBlockHistories.rows.map((el) => el.node) };
    console.log("Nodes==>", nodes);
    let chainInstance = chain.chain.filter(function (value) {
      console.log(value.height, this.node);
      if (this.node.includes(value.height.toString())) return value;
    }, nodes);

    console.log("Transaction History", chainInstance);
    count = chainInstance.length;
    chainInstance = chainInstance.slice(
      (page_number - 1) * page_size,
      page_number * page_size
    );

    let data = new resPattern.successResponse(
      { count, chainInstance },
      "Transaction History Successfully retrived"
    );
    res.status(data.status).json(data);
  } catch (error) {
    console.log(`---> `, error);
    return next(new resPattern.failedResponse(errorMessage(error)));
  }
};

const requestMoney = async (req, res, next) => {
  try {
    /**
     * @param {String} requestor_public_key
     * @param {String} requested_to_public_key
     * @param {Number} amount
     * @param {Enum} status
     **/

    let requestorPublicKey = req.body.requestor_public_key;
    let requestedToPublicKey = req.body.requested_to_public_key;
    let requestorWalletId = req.body.requestor_wallet_id;
    let requestedToWalletId = req.body.requested_to_wallet_id;

    let amount = req.body.amount;
    let status = req.body.status;

    console.log(
      "Requestor name : " +
        requestorPublicKey.slice(0, 8) +
        "Requested to name : " +
        requestedToPublicKey.slice(0, 8)
    );

    let createRequest = {
      requestor_public_key: requestorPublicKey,
      requested_to_public_key: requestedToPublicKey,
      requestor_wallet_id: requestorWalletId,
      requested_to_wallet_id: requestedToWalletId,
      status: status,
      amount: amount,
    };
    let requestedMoney = await models.request_money.create(createRequest, {
      transaction: req.tx,
    });

    console.log("Requested Money details");

    if (!requestedMoney) errorMessage("Failed to send the Request.", true);

    let data = new resPattern.successResponse(
      { data: requestedMoney },
      "Request Sent successfully"
    );
    res.status(data.status).json(data);
  } catch (error) {
    console.log(`---> `, error);
    return next(new resPattern.failedResponse(errorMessage(error)));
  }
};

const ApproveToPay = async (req, res, next) => {
  try {
    /**
     * @param {String} requestor_public_key
     * @param {String} requested_to_public_key
     * @param {Number} amount
     * @param {Enum} status
     **/

    let status = req.body.status;
    let requestId = req.body.request_money_id;

    console.log("Requestor name : " + parseInt(requestId), status);

    let createRequest = {
      status: status,
    };
    let updateRequest = await models.request_money.update(createRequest, {
      where: {
        request_money_id: parseInt(requestId),
      },
      transaction: req.tx,
    });
    console.log("Requested Money details");

    if (!updateRequest) errorMessage("Failed to send the Request.", true);

    let data = new resPattern.successResponse(
      { data: updateRequest },
      "Request updated successfully"
    );
    res.status(data.status).json(data);
  } catch (error) {
    console.log(`---> `, error);
    return next(new resPattern.failedResponse(errorMessage(error)));
  }
};

const getAllRequestMoneyHistory = async (req, res, next) => {
  try {
    /**
     * @param {String} requestor_public_key
     * @param {String} requested_to_public_key
     **/
    let publicKey = "";
    let requestorPublicKey =
      req.body.requestor_public_key || req.query.requestor_public_key;
    let requestedToPublicKey =
      req.body.requested_to_public_key || req.query.requested_to_public_key;
    let status = req.body.status || req.query.status;
    let countResult;
    console.log("Requestor name : ", requestedToPublicKey, requestorPublicKey);

    let result;
    // requested_to_public_key will gonna aprove or reject it.
    if (requestedToPublicKey) {
      //ApproveToPay
      publicKey = requestedToPublicKey;
      console.log("requested to=================================>");
      result = await models.request_money.findAndCountAll({
        where: {
          requested_to_public_key: requestedToPublicKey,
          status: status,
        },
        include: [{ model: models.wallet, as: "requestor" }],

        transaction: req.tx,
      });

      countResult = await models.request_money.count({
        where: {
          requested_to_public_key: requestedToPublicKey,
          // status: status,
        },
        // include: [{ model: models.wallet, as: 'requestor' }],
        group: ["status"],
        transaction: req.tx,
      });
    } else if (requestorPublicKey) {
      //requestor_public_key who will watch the status
      //Requestor History
      publicKey = requestorPublicKey;

      console.log("requestor=================================>");

      result = await models.request_money.findAndCountAll({
        where: {
          requestor_public_key: requestorPublicKey,
          status: status,
        },
        include: [{ model: models.wallet, as: "requested_to" }],

        transaction: req.tx,
      });

      countResult = await models.request_money.count({
        where: {
          requestor_public_key: requestorPublicKey,
          // status: status,
        },
        // include: [{ model: models.wallet, as: 'requestor' }],
        group: ["status"],
        transaction: req.tx,
      });
    }

    console.log("fetch the History.", countResult);
    // console.log(result);
    // if (!result) errorMessage('Failed to fetch the request history.', true);
    let data = new resPattern.successResponse(
      { result, statusCount: countResult },
      "Request History fetched successfully"
    );
    res.status(data.status).json(data);
  } catch (error) {
    console.log(`---> `, error);
    return next(new resPattern.failedResponse(errorMessage(error)));
  }
};
const getRequestMoneyById = async (req, res, next) => {
  try {
    /**
     **/

    let requestId = req.body.request_money_id || req.query.request_money_id;

    console.log("Requestor name : " + parseInt(requestId));

    let resultset = await models.request_money.findOne({
      where: {
        request_money_id: requestId,
      },
      include: [
        { model: models.wallet, as: "requestor" },
        { model: models.wallet, as: "requested_to" },
      ],
      transaction: req.tx,
    });
    console.log("Requested Money details");

    if (!resultset) errorMessage("Request failed.", true);

    let data = new resPattern.successResponse(
      { data: resultset },
      "Request updated successfully"
    );
    res.status(data.status).json(data);
  } catch (error) {
    console.log(`---> `, error);
    return next(new resPattern.failedResponse(errorMessage(error)));
  }
};

module.exports = {
  //user crud
  userRegister,
  updateUser,
  getUserByID,
  getAllUsers,
  deleteUser,

  //send Money
  sendMoney,

  //send Money
  getBlockChainInstance,
  createTranscationHash,
  createSignature,
  createBlock,
  transactionHistory,

  //request money
  requestMoney,
  ApproveToPay,
  getAllRequestMoneyHistory,
  getRequestMoneyById,
};
