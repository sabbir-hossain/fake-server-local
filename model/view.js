const { get } = require("../database/db");
const { throwErrorForEmptyValue } = require("../helpers/util");

const findAll = async ( app = "default-app", query={}) => {
  return await get({...{app}, ...query}); 
}

module.exports = {
 findAll
};
