const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const CustomError = require('../utils/error');

// exports.checkRole = (...roles) => async (req,res,next) => {
//   // ['ADMIN']          'CUSTOMER'
//   if (!roles.includes(req.user.role)) {
//     return res.status(403).json({message: 'you are not allowed'})
//   }
//   next()
// }

exports.authenticate = async (req, res, next) => {
  try {
    // get request headers
    // const headers = req.headers;
    const { authorization } = req.headers;
    if (!authorization || !authorization.startsWith('Bearer')) {
      return res.status(401).json({ message: 'you are unauthorized' });
    }

    const token = authorization.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'you are unauthorized' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    // decoded { id: , email: , username }

    const user = await User.findOne({ where: { id: decoded.id } });
    if (!user) {
      return res.status(401).json({ message: 'you are unauthorized' });
    }

    req.user = user;
    req.data = decoded;
    next();
  } catch (err) {
    next(err);
  }
};

exports.register = async (req, res, next) => {
  try {
    // req.body: username ,email, password, confirmPassword
    const { username, email, password, confirmPassword } = req.body;

    // check password match confirm password
    if (password !== confirmPassword) {
      // return res.status(400).json({ message: 'password and confirm password did not match' });
      throw new CustomError('password and confirm password did not match', 400);
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    await User.create({
      username,
      email,
      password: hashedPassword
    });
    res.status(200).json({ message: 'your account has been created' });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    // SELECT * FROM users WHERE username = username
    const user = await User.findOne({ where: { username: username } });
    // username not found
    if (!user) {
      return res.status(400).json({ message: 'invalid username or password' });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    // password did not match
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: 'invalid username or password' });
    }

    const payload = {
      id: user.id,
      email: user.email,
      username: user.username
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET_KEY, { expiresIn: 3600 }); // '30d'
    res.json({ message: 'success logged in', token });
  } catch (err) {
    next(err);
  }
};
