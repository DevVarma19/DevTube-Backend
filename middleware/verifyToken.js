const jwt = require('jsonwebtoken');
const createError = require('../error');

const verifyToken = (req, res, next) => {
    const token = req.cookies.access_token;
    if(!token) return next(createError(401, "You are not authenticated!"));

    try {
        const payLoad = jwt.verify(token, process.env.JWTSecret);
        req.user = payLoad;
        next();
    } catch (err) {
        return next(createError(403, "Token not valid!"));
    }
}

module.exports = verifyToken;