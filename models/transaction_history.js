'use strict';
const { Model } = require('sequelize');
const Roles = require('../helpers/roles');


module.exports = (sequelize, DataTypes) => {
    class transaction_history extends Model {
        static associate(models) {
            // this.belongsTo(models.wallet, {
            //     foreignKey: 'wallet',
            //     as: 'wallet_th'
            // });
        }
    };
    transaction_history.init({
        transaction_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            unique: true,
            autoIncrement: true,
        },
        node: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: null
        },
        wallet_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: null,
        },
        amount: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: null
        },
        payer_public_key: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: null
        },
        payee_public_key: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: null
        },
        is_active: {
            type: DataTypes.TINYINT,
            defaultValue: 1
        },
        is_deleted: {
            type: DataTypes.TINYINT,
            defaultValue: 0
        },
        created_at: {
            allowNull: false,
            type: DataTypes.DATE,
        },
        updated_at: {
            allowNull: false,
            type: DataTypes.DATE,
        }
    }, {
        sequelize,
        modelName: 'transaction_history',
        freezeTableName: true,
        underscored: true,
        freezeTableName: true,
    });
    return transaction_history;
};
