const httpStatus = require('http-status');
const { parse } = require('./utils');

class successResponse {
    constructor (data, message, status) {
        this.status = status || httpStatus.OK;
		this.message = message || 'Success.';
		this.success = true;
		this.data = data || {};
		if(data?.rows) {
			let providedData = parse(this.data);
			delete providedData.count;
			delete providedData.rows;
			this.data = {
				total_count: this.data.count,
				data_list: this.data.rows,
				...providedData
			};
		}
    }
};




class failedResponse {
    constructor (message, data, status) {
        this.status = status || httpStatus.OK;
		this.message = message || 'Failed.';
		this.success = false;
		this.data = data || {};
		if (message === 'Validation Failed') {
			let messageArr = [];
			data.map(el => messageArr = [...messageArr, `${Object.values(el)}.`])
			messageArr = messageArr?.join()?.split('"')?.join('').replaceAll(/[_]/g, ' ').replaceAll(',', ', ');
			messageArr = messageArr[0].toUpperCase() + messageArr.slice(1);
			if (messageArr) this.message = messageArr;
		}
    }
};



module.exports = {
    successResponse,
    failedResponse
}
