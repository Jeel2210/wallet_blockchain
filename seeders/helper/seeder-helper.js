
const seeder_helper = {
	/**
	 * @param {Array} attr - Single array of attribute name
	 * @param {Array[]} data - Array of (array of data)
	 */
	setAttr: (attr = [], data = []) => {
		let out = [];
		data.map(_data => {
			let obj = {
				created_at: new Date(),
				updated_at: new Date(),
				is_active: 1,
				is_deleted: 0
			};
			attr.map((el,i) => {
				obj[el] = _data[i];
			})
			out = [...out, obj];
		})
		return out;
	}
};



module.exports = seeder_helper;