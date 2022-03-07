const bcrypt = require('bcryptjs');
const { col, Op, where } = require('sequelize');
const moment = require('moment');
const crypto = require('crypto');




/**
 * @param {Object} errObj 
 * @param {boolean} throwError 
 * @returns error message or throw the error
 */
const errorMessage = (errObj, throwError = false) => {
	const commonMessage = `Something went wrong!`;
	let message = errObj?.message || (typeof (errObj) === 'string' ? errObj : null) || commonMessage;
	if (['Truncated incorrect', `WHERE parameter`, `Cannot add or update a child row`, `You have an error in your SQL syntax`].some(el => message.includes(el))) message = 'Something went wrong. Please try again!';
	if (throwError) throw new TypeError(message);
	return (message);
};

const parse = el => JSON.parse(JSON.stringify(el));

const colorLog = (text, color, bg, other) => `${color ? `\x1b[${color}m` : ''}${bg ? `\x1b[${bg}m` : ''}${other ? `\x1b[${other}m` : ''} ${text || 'No text provided'} \x1b[0m`;

const createPassword = pwd => {
	try {
		if (!pwd) throw new TypeError('Invalid string provided.')
		return bcrypt.hashSync(pwd, bcrypt.genSaltSync(8), null);
	} catch (error) {
		errorMessage('Something went wrong.', true);;
	}
};

const validatePassword = (dbPassword, checkPassword) => {
	try {
		return bcrypt.compareSync(checkPassword, dbPassword);
	} catch (error) {
		return false;
	}
};


/**
 * @param {Object} req 
 * @param {Object} req.query
 * @param {string} req.query.page
 * @param {string} req.query.limit
 */
const pagination = req => {
	let query = req.query;
	query.page = parseInt(query.page || 1);
	query.limit = parseInt(query.limit || 10);
	if (!query.page || !query.limit) return {};
	return {
		limit: query.limit,
		offset: query.limit * (query.page - 1)
	}
};


/**
 * @param {Object} req 
 * @param {Object} req.query
 * @param {string} req.query.order
 * @param {string} req.query.orderby
 */
const sequelize_order = (req, colPrefix = '') => {
	return [[col(`${colPrefix}${req.query.orderby || 'created_at'}`), req.query.order || 'desc']]
};

const calculateExpireOn = (days) => {
	var date = new Date(); // Now
	date.setDate(date.getDate() + days); // Set now + 30 days as the new date
	return date;
}

/**
 * @param {Array} searchAttr - Array of attribute to search from
 * @param {Object} req
 * @param {Object} req.query
 * @param {string} req.query.search
 */
const searchQuery = (searchAttr = [], req) => {
	let searchQuery = {};
	console.log(req.query);
	let _or = [];
	if (!req.query.search) return searchQuery;
	searchAttr.map(el => {
		let searchQuery = null;
		if (el.split('.').length > 1) {
			searchQuery = where(col(el), 'like', `%${req.query.search}%`)
		} else {
			searchQuery = {
				[el]: {
					[Op.like]: `%${req.query.search}%`
				}
			};
		}
		_or = [
			..._or,
			searchQuery
		];
	});
	searchQuery[Op.or] = _or;
	return searchQuery;
}

let password = "JFDSJWHVCVNSDHFDSFDL#4324332435412312421Sdjsakjfl@J@#@VCjdsfdsf";
const ENCRYPTION_KEY = crypto.scryptSync(password, 'salt', 32); // Must be 256 bits (32 characters)
const IV_LENGTH = 16; // For AES, this is always 16

function cipher(text) {
	text = text.toString();
	let iv = crypto.randomBytes(IV_LENGTH);
	let cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
	let encrypted = cipher.update(text);
	encrypted = Buffer.concat([encrypted, cipher.final()]);

	return iv.toString('hex') + ':' + encrypted.toString('hex');
}

function decipher(text) {
	let textParts = text.split(':');
	let iv = Buffer.from(textParts.shift(), 'hex');
	let encryptedText = Buffer.from(textParts.join(':'), 'hex');
	let decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
	let decrypted = decipher.update(encryptedText);
	decrypted = Buffer.concat([decrypted, decipher.final()]);

	return decrypted.toString();
}


/**
 * @param {string} time - Hours and seconds eg. 2:10
 * @returns UTC time.
 */
let timeToDate = (time, tz = true) => {
	if (!time) return null;
	time = time.split(':').map(el => el.length === 1 ? `0${el}` : el).join(':');
	if ((time?.length > 5) || !time) return time || null;
	let currentDate = moment().utc().format('YYYY-MM-DD');
	return tz ? `${currentDate}T${time}:00Z` : `${currentDate} ${time}:00`;
};



/**
 * @param {object} req - req obj
 * @param {boolean} getArray - If true returns queries in array. If false then returns in sequelize [Op.or] array eg. **{** *[Op.or]: [...queries]* **}**
 * @param {object} req.query
 * @param {object} req.query.from_date
 * @param {object} req.query.to_date
 * @param {string} attr - Date attribute to compare date with. By default **'created_at'** will be used.
 * @returns If getArray is **true** then *Array with date attributes or empty Array. Use them in [Op.or]* if **false** then *sequelize [Op.or] object or empty object*.
 * 	#### When getArray is true
 * 	[] **or** [created_at: {[Op.gt]...}...]
 * 	#### When getArray is false
 *  {} **or** {[Op.and]: [created_at: {[Op.gt]...}...]}
 */
let sequelizeDateFilter = (req, getArray, attr = 'created_at') => {
	let from_date = req.query.from_date ? moment(req.query.from_date.split(' ').join('+')).utc().format() : null;
	let to_date = req.query.to_date ? moment(req.query.to_date.split(' ').join('+')).utc().format() : null;

	if (from_date && to_date) {
		let dateDiff = moment(to_date).diff(moment(from_date), 'second');
		console.log({ from_date, to_date, dateDiff });
		if (dateDiff < 0) errorMessage('from_date should be the date before to_date.', true);
	}


	let arr = [
		...from_date ? [{
			[attr]: {
				[Op.gte]: from_date
			}
		}] : [],
		...to_date ? [{
			[attr]: {
				[Op.lte]: to_date
			}
		}] : []
	];
	return getArray ? arr : (arr.length ? { [Op.and]: arr } : {});
}


module.exports = {
	errorMessage,
	parse,
	colorLog,
	createPassword,
	validatePassword,
	pagination,
	sequelize_order,
	decipher,
	cipher,
	searchQuery,
	timeToDate,
	calculateExpireOn,
	sequelizeDateFilter
};
