const jwt = require("jsonwebtoken");
const User = require("../models/user"); // or Buyer if you use separate models

const auth = async (req, res, next) => {
    try {
        const token = req.header("Authorization")?.replace("Bearer ", "");
        if (!token) {
            return res.status(401).json({ error: "Unauthorized: Missing or invalid Authorization header" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET); // Make sure your secret is correct

        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(401).json({ error: "Unauthorized: User not found" });
        }

        req.user = user;
        next();
    } catch (e) {
        res.status(401).json({ error: "Unauthorized: " + e.message });
    }
};

module.exports = { auth };
