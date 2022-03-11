const { Op } = require('sequelize');
const { errorMessage, parse, createPassword, validatePassword, searchQuery, calculateExpireOn, pagination, sequelize_order, sequelizeDateFilter } = require("../helpers/utils");
const resPattern = require("../helpers/responsePattern");
const models = require('../models');
const WalletClass = require('../helpers/wallet');

let Wallet = WalletClass.Wallet
let Money = WalletClass.SendMoney

/**
 * @param {Object} req 
 * @param {Object} req.body
 * @param {Object} req.body.password
 * @param {Object} req.body.role
 */

const userRegister = async (req, res, next) => {
    try {
        req.body.password = req.body.password ? createPassword(req.body.password) : undefined;
        let createBody = {
            email: req.body.email,
            phone: req.body.phone,
            age: req.body.age,
            address: req.body.address,
            gender: req.body.gender,
            password: req.body.password
        };
        createBody = parse(createBody);
        //
        let wallet = new Wallet()
        wallet = wallet.initializeWallet()

        createBody.name = wallet.name;

        let userDetails = await models.employee.create(createBody, { transaction: req.tx });
        if (!userDetails) errorMessage('Failed to create employee.', true);

        userDetails = parse(userDetails);
        console.log(userDetails);
        let createWalletBody = {
            user_id: userDetails.employee_id,
            balance: 100,
            address: wallet.name,
            public_key: wallet.publicKey,
            private_key: wallet.privateKey,
        }
        let walletDetails = await models.wallet.create(createWalletBody, { transaction: req.tx });
        if (!walletDetails) errorMessage('Failed to initate wallet.', true);

        userDetails.publicKey = wallet.publicKey;
        console.log("userDetails created", userDetails);

        let data = new resPattern.successResponse({ userDetails, walletDetails }, 'User created.');
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

        // Check if employee exists.
        const findUser = await models.employee.findOne({
            where: {
                employee_id: req.params.id
            },
        });
        if (!findUser) return errorMessage('Invalid employee details. Please try again.', true);

        // Check duplicate employee
        if ((req.body.email !== findUser.email) || (req.body.phone !== findUser.phone)) {
            let findDuplicateEmailOrPhone = await models.employee.findOne({
                where: {
                    [Op.or]: [
                        ...req.body.email ? [{ email: req.body.email }] : [],
                        ...req.body.phone ? [{ phone: req.body.phone }] : [],
                    ],
                    employee_id: {
                        [Op.ne]: findUser.employee_id
                    }
                },
            });
            if (findDuplicateEmailOrPhone) {
                let emailIsSame = findDuplicateEmailOrPhone.email === req.body.email;
                let phoneIsSame = findDuplicateEmailOrPhone.phone === req.body.phone;
                if (emailIsSame || phoneIsSame) errorMessage(`${emailIsSame ? (phoneIsSame ? 'Email and phone no.' : 'Email') : 'Phone no.'} already exist${!(emailIsSame && phoneIsSame) ? 's' : ''}.`, true);
            }
        }

        // Update employee
        let updateBody = {
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone,
            age: req.body.age,
            address: req.body.address,
            gender: req.body.gender,
            password: req.body.password
        };

        // make sure above details can only be updated by admin
        updateBody = parse(updateBody);
        const updateUser = await models.employee.update(updateBody, {
            where: { employee_id: req.params.id },
            transaction: req.tx
        });
        if (!updateUser) errorMessage('Failed to update employee details. Please try again.', true);


        let userDetails = await models.employee.findOne({
            where: {
                employee_id: req.params.id,
            },
            attributes: { exclude: ['password'] },
            transaction: req.tx
        });

        let data = new resPattern.successResponse({ userDetails }, 'User updated.');
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
        // Check if employee exists.
        const findUser = await models.employee.findOne({
            where: {
                employee_id: req.params.id,
                is_deleted: false
            },
        });
        if (!findUser) return errorMessage('Invalid employee details. Please try again.', true);

        // Delete query
        const userDetails = await models.employee.update({
            is_active: false,
            is_deleted: true,
        }, {
            where: {
                employee_id: req.params.id
            },
            transaction: req.tx
        });
        if (!userDetails) errorMessage('Failed to delete employee.', true);

        let data = new resPattern.successResponse({}, 'User deleted.');
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
        let userDetails = await models.employee.findOne({
            where: {
                employee_id: req.params.id,
            },
            include: [models.wallet],
            attributes: { exclude: ['password'] },
            transaction: req.tx
        });

        if (!userDetails) errorMessage('No employee found.', true);

        let data = new resPattern.successResponse({ userDetails });
        res.status(data.status).json(data);
    } catch (error) {
        console.log(error);
        return next(new resPattern.failedResponse(errorMessage(error)));
    }
};


const getAllUsers = async (req, res, next) => {
    try {
        let userDetails = await models.employee.findAndCountAll();

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
        let payeePublicKey = req.body.payee_public_Key;
        let amount = req.body.amount;

        console.log("payeer name : " + payeerPublicKey + "Payee name : " + payeePublicKey);

        /**
         * get instance of wallet 
         * check the identies 
         * send money()
        */

        let wallet = new Wallet()

        // let identities = wallet.getIdentities()  
        // console.log(identities[payeerPublicKey].publicKey,identities[payeePublicKey].publicKey);

        //checkBalance();

        //build a block
        let tDetails = {}
        let moneySend = wallet.sendMoney(amount, payeerPublicKey, payeePublicKey);
        if (moneySend) {
            /**
             * transactionHistory add entry(node height,user_id) 
            */
            console.log(moneySend.chain[moneySend.chain.length - 1].height);
            let createTransactionHistory = {
                node: moneySend.chain[moneySend.chain.length - 1].height
            }
            tDetails = await models.transaction_history.create(createTransactionHistory, { transaction: req.tx });
            if (!tDetails) errorMessage('Failed to initate wallet.', true);

        }

        let data = new resPattern.successResponse({ data: { moneySend, tDetails } }, 'User created.');
        res.status(data.status).json(data);
    } catch (error) {
        console.log(`---> `, error);
        return next(new resPattern.failedResponse(errorMessage(error)));
    }
};


const getBlockChainInstance = async (req, res, next) => {
    try {

        let wallet = new Wallet()
        // let identities = wallet.getIdentities()  
        // console.log(identities[payeerPublicKey].publicKey,identities[payeePublicKey].publicKey);
        let blockdata = wallet.getChainInstance()

        let data = new resPattern.successResponse({ data: blockdata }, 'Block chain .');
        res.status(data.status).json(data);
    } catch (error) {
        console.log(`---> `, error);
        return next(new resPattern.failedResponse(errorMessage(error)));
    }
};

module.exports = {
    userRegister,
    updateUser,
    getUserByID,
    getAllUsers,
    deleteUser,
    sendMoney,
    getBlockChainInstance
};
