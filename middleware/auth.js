//Connection between Express server and GraphQl resolvers

const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const authHeader = req.get('Authorization');


  //No error catch, woul block all requests. Instead, if condition is not met mark as unauthenticated and continue
  if (!authHeader) {
    req.isAuth = false;
    return next();
  }

  // Authorization header format: "Bearer TOKEN_HERE"
  const token = authHeader.split(' ')[1];

  if (!token || token === '') {
    req.isAuth = false;
    return next();
  }

  let decodedToken;
  try {
    decodedToken = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    req.isAuth = false;
    return next();
  }

  if (!decodedToken) {
    req.isAuth = false;
    return next();
  }

  req.isAuth = true;
  req.userId = decodedToken.userId;
  next();
};