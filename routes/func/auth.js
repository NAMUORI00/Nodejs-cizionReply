const jwt = require("jsonwebtoken");
const secretObj = require("../../config/jwt");

const auth = (req) => {
    const token = req.cookies.user;
    const decoded = jwt.verify(token, secretObj.secret);
    
    return decoded.email;
};

module.exports = auth;