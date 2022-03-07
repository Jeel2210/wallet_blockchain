const { parse } = require("../helpers/utils");

/**
 * @param {string} prop 
 * @param {string} dataType - First letter of any valid data type eg. [integer, string, boolean, text]
 * @param {string} description 
 * @param {string} example 
 */
function attr(description, example) {
	let checkNumber = (el, defaultVal) => [0, '', true, false].includes(el) ? el : (el || defaultVal)
	return {
		type: Array.isArray(example) ? 'Array' : typeof(checkNumber(example, '')),
		description: checkNumber(description, 'No description provided.'),
		example: checkNumber(example, 'No example provided.')
	};
}

/**
 * 
 * @param {string} name - Name of the parameter.
 * @param {string} _in - first letter of possible values eg. First letter of any of these -- [header, body, query, params]
 * @param {boolean} required 
 * @param {string} schema - Enter schema url.
 * @returns 
 */
const newParam = (name, _in, required, description, schema) => {
	const def = {
		h: 'header', b: 'body',
		q: 'query', p: 'params'
	};
	return parse({ name, in: def[_in?.[0].toLowerCase] || 'header', required: !!required, description, schema });
};

const getModel = (tableName, type, properties) => { return { [tableName]: { type: type || 'object', properties } } };



/**
 * ### Note 
 * 		- Any field can be an object with a table property in it. Field name will be header and table arrays will be used to create table.
 * 		- Same for when creating checklist
 * 
 * @param {Object} obj
 * @param {string} obj.heading
 * @param {Array[]} obj.table 
 * 		- Array[0] will be title and Array[1] will be description.
 * 		- eg. [['title1', 'description1'], ['title2', 'description2']]
 * @param {Array} obj.checklist
 * 		- Each element of array will be checklist item.
 * 		- eg. [['Checklist Item 1'], ['Checklist Item 2', ]['Checklist Item 3', ]['Checklist Item 4']
 * 		- Can be used whith any parameter 
 * 			- eg. {heading: 'some heading', 'random property': {checklist: ['item']}}
 */
 function writeDescription(obj) {
	let description = '';
	if (obj.heading) {
		description += `# ${obj.heading}`;
		delete obj.heading;
	}
	for (let prop in obj) {
		if(['table', 'checklist'].includes(prop)) continue;
		if(obj[prop]?.table) {
			description += writeTables(obj[prop]?.table, prop);
			continue;
		}
		if(obj[prop]?.checklist) {
			description += writeChecklist(obj[prop]?.checklist, prop);
			continue;
		}
		description += `\n### ${prop}: \`${obj[prop]}\``;
	}

	description += writeTables(obj.table);
	description += writeChecklist(obj.checklist);

	function writeTables(table, tableHeading){
		if(table?.length){
			let tableData = '';
			tableData += `\n### ${tableHeading || 'Other information'}`;
			tableData += '\n|**Title**|**Description**|\n|-|-|';
			table?.map(el => {
				tableData += `\n|**${el?.[0]}**|${el?.[1]}|`;
			});
			return tableData;
		}
		return '';
	}

	function writeChecklist(listArr, heading){
		if(listArr?.length) {
			let checklistData = '';
			checklistData += `\n### ${heading || ''}`;
			listArr.map(el => {
				checklistData += `\n${el.includes('-') ? '' : '  - '}${el}`;
			});
			return checklistData;
		}
		return '';
	}
	return description;
};



const commonAttributes = {
	parameters: {
		pagination: [
			{
				name: "page",
				in: "query",
				description: `Page number. **(For pagination to work provode both page and limit).**`,
				required: false,
				type: "string",
			},
			{
				name: "limit",
				in: "query",
				description: `Item count on page. **(For pagination to work provode both page and limit).**`,
				required: false,
				type: "string",
			},
		],
		order: [
			{
				name: "order",
				in: "query",
				description: `Order of result. **Valid values are 'asc' and *'desc'(default)*.**`,
				required: false,
				type: "string",
			},
			{
				name: "orderby",
				in: "query",
				description: `Field you want to order by. **Default value is created_at.**`,
				required: false,
				type: "string",
			},
		]
	}
}



module.exports = {
	attr,
	newParam,
	getModel,
	writeDescription,
	commonAttributes
}