"use strict";

/** Convenience middleware to handle common auth cases in routes. */

const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");
const { UnauthorizedError } = require("../expressError");


/** Middleware: Authenticate user.
 *
 * If a token was provided, verify it, and, if valid, store the token payload
 * on res.locals (this will include the username and isAdmin field.)
 *
 * It's not an error if no token was provided or if the token is not valid.
 */

function authenticateJWT(req, res, next) {
  try {
    // console.log("authenticate jwt running")
    // console.log(req.headers)
    const authHeader = req.headers && req.headers.authorization;
    if (authHeader) {
      const token = authHeader.replace(/^[Bb]earer /, "").trim();
      res.locals.user = jwt.verify(token, SECRET_KEY);
    }
    return next();
  } catch (err) {
    return next();
  }
}

/** Middleware to use when they must be logged in.
 *
 * If not, raises Unauthorized.
 */

function ensureLoggedIn(req, res, next) {
  try {
    // console.log('ensure logged in running')
    // console.log(res.locals.user)
    if (!res.locals.user) throw new UnauthorizedError();
    return next();
  } catch (err) {
    return next(err);
  }
}
// we want to have middleware that helps by checking if a user object has admin privileges in the payload 
function ensureAdmin(req, res, next) {
  try {
    // console.log('ensure admin is running')
    // there are a couple of cases where we want to throw errors
    // if there is no user object at all we throw an error , or if the isAdmin boolean value is false 
    if (!res.locals.user || !res.locals.user.isAdmin) {
      throw new UnauthorizedError();
    }
    return next();
  } catch (err) {
    return next(err);
  }
}
// this middleware is for the case where if we need to give privileges to both the correct user and an admin like in the assessment that comes after this 
// can be done in a few ways, like adding a conditional in the view but it would be easier to just call the specific middleware we need
function ensureCorrectUserOrAdmin(req, res, next) {

  // we want to throw an error in a few specific cases
  // if the user is not loggedin at all aka no res.locals.user object we throw an error 
  // if the user.username is not the same as that of the user that is trying to be accessed we throw an error 
  // or if the user.isAdmin is false 
  try {
    const user = res.locals.user;
    if (!(user && (user.isAdmin || user.username === req.params.username))) {
      throw new UnauthorizedError();
    }
    return next();
  } catch (err) {
    return next(err)
  }
}


module.exports = {
  authenticateJWT,
  ensureLoggedIn,
  ensureAdmin,
  ensureCorrectUserOrAdmin
};
