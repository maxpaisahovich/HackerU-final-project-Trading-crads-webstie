function isAdmin(req, res, next) {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403).send("Access denied. Only admins can perform this action.");
  }
}

module.exports = {
  isAdmin,
};
