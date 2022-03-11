let tagList = {
	auth: 'Auth Apis',
    employee: 'User Apis',
};

module.exports = {
	tagList,
	tags: Object.keys(tagList).map(el => {return {name: tagList[el]}})
}