const { errorMessage } = require("./utils");



const Roles = {
    employee: 'EMPLOYEE',
    user: 'USER',
    get any() {
        return [this.employee,this.user];
    }
};


module.exports = Roles;