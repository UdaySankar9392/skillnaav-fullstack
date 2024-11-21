const jwt = require('jsonwebtoken');
const Partnerwebapp = require('../models/webapp-models/partnerModel');
const asyncHandler = require('express-async-handler');

const authMiddleware = asyncHandler(async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        try {
            token = req.headers.authorization.split(" ")[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            req.partner = await Partnerwebapp.findById(decoded.id).select("-password");

            if (!req.partner) {
                res.status(401);
                throw new Error("Not authorized, partner not found.");
            }

            next();
        } catch (error) {
            res.status(401);
            throw new Error("Not authorized, token failed.");
        }
    }

    if (!token) {
        res.status(401);
        throw new Error("Not authorized, no token.");
    }
});
module.exports = { authMiddleware };
