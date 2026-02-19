const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1]; // remove "Bearer"

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified.id; // VERY IMPORTANT
    next();
  } catch (err) {
    res.status(403).json({ message: "Invalid token" });
  }
};

module.exports = authMiddleware;
