const { get } = require("../database/db");
const { throwErrorForEmptyValue } = require("../helpers/util");

const getRequest = async (tblName = throwErrorForEmptyValue(), query={}) => {
  return await get({...{tblName}, ...query}); 
}

module.exports = {
  getRequest
};
