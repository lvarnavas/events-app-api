const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const sendgridTransport = require("nodemailer-sendgrid-transport");

const HttpError = require("../models/http-error");

const Users = require("../models/users");

const transporter = nodemailer.createTransport(
  sendgridTransport({
    auth: {
      api_key: process.env.SENDGRID_KEY,
    },
  })
);

const getUsersById = async (req, res, next) => {
  const userId = req.params.uid;

  let user;
  try {
    user = await Users.findAll({
      where: {
        id: userId,
      },
      raw: true,
      attributes: {
        exclude: ["resetToken", "resetTokenExpiration", "password"],
      },
    });
  } catch (err) {
    console.log(err);
    const error = new HttpError("Fetching user failed, please try again.", 500);
    return next(error);
  }

  if (!user) {
    const error = new HttpError(
      "Could not find a user for the provided id",
      404
    );
    return next(error);
  }

  res.json({ user });
  console.log(user);
};

const signup = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid inputs passed, please check your data.", 422)
    );
  }

  const { name, email, password, images } = req.body;

  let existingUser;
  try {
    existingUser = await Users.findOne({ where: { email: email } });
  } catch (err) {
    const error = new HttpError("Signing up failed, please try again.", 500);
    return next(error);
  }

  if (existingUser) {
    const error = new HttpError("User already exists", 422);
    return next(error);
  }

  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(password, 12);
  } catch (err) {
    const error = new HttpError(
      "Could not create user, please try again.",
      500
    );
    return next(error);
  }

  const createdUser = Users.build({
    name,
    email,
    password: hashedPassword,
    images,
  });

  try {
    await createdUser.save();
  } catch (err) {
    const error = new HttpError("Signing up failed, please try again.", 500);
    return next(error);
  }

  transporter.sendMail({
    to: email,
    from: "info@eventsapp.com",
    subject: "Sign up succeeded!",
    html: "<h1>You successfully signed up!</h1>",
  });

  let token;
  try {
    token = jwt.sign(
      { userId: createdUser.id, email: createdUser.email },
      process.env.JWT_KEY,
      { expiresIn: "1h" }
    );
  } catch (err) {
    const error = new HttpError("Signing up failed, please try again.", 500);
    return next(error);
  }

  res.status(201).json({
    user: createdUser,
    userId: createdUser.id,
    email: createdUser.email,
    token: token,
  });
};

const login = async (req, res, next) => {
  const { email, password } = req.body;

  let existingUser;

  try {
    existingUser = await Users.findOne({ where: { email: email } });
  } catch (err) {
    const error = new HttpError("Logging in failed, please try again.", 500);
    return next(error);
  }

  if (!existingUser) {
    const error = new HttpError(
      "Invalid credentials, could not log you in",
      403
    );
    return next(error);
  }

  let isValidPassword = false;
  try {
    isValidPassword = await bcrypt.compare(password, existingUser.password);
  } catch (err) {
    const error = new HttpError(
      "Could not log you in, please check your credentials and try again",
      500
    );
    return next(error);
  }
  console.log(isValidPassword);

  if (!isValidPassword) {
    const error = new HttpError(
      "Invalid credentials, could not log you in",
      403
    );
    return next(error);
  }

  let token;
  try {
    token = jwt.sign(
      { userId: existingUser.id, email: existingUser.email },
      process.env.JWT_KEY,
      { expiresIn: "1h" }
    );
  } catch (err) {
    const error = new HttpError("Logging in failed, please try again.", 500);
    return next(error);
  }

  res.json({
    user: existingUser,
    userId: existingUser.id,
    email: existingUser.email,
    token: token,
  });
};

const updatePassword = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid inputs passed, please check your data.", 422)
    );
  }

  const { password, oldpassword } = req.body;
  const userId = req.params.uid;

  let user;
  try {
    user = await Users.findByPk(userId);
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not update event.",
      500
    );
    return next(error);
  }

  let isValidPassword = false;
  try {
    isValidPassword = await bcrypt.compare(oldpassword, user.password);
  } catch (err) {
    const error = new HttpError("Old password is not the same.", 500);
    return next(error);
  }
  console.log(isValidPassword);

  if (!isValidPassword) {
    const error = new HttpError("Invalid credentials", 403);
    return next(error);
  }

  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(password, 12);
  } catch (err) {
    const error = new HttpError("Something went wrong, please try again.", 500);
    return next(error);
  }

  user.password = hashedPassword;

  try {
    await user.save();
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not update password",
      500
    );
    return next(error);
  }

  let userEmail = user.email;
  try {
    transporter.sendMail({
      to: userEmail,
      from: "info@eventsapp.com",
      subject: "Password changed!",
      html: "<h1>You successfully changed your password!</h1>",
    });
  } catch (err) {
    const error = new HttpError("Could not send email", 500);
    return next(error);
  }

  res.status(200).json({ user });
};

const postReset = async (req, res, next) => {
  const { email } = req.body;

  crypto.randomBytes(32, async (err, buffer) => {
    const token = buffer.toString("hex");
    let user;
    try {
      user = await Users.findOne({ where: { email: email } });
    } catch (err) {
      const error = new HttpError("Could not find that email.", 404);
      return next(error);
    }

    if (!user) {
      const error = new HttpError("No account with that email found", 404);
      return next(error);
    }

    user.resetToken = token;
    user.resetTokenExpiration = Date.now() + 3600000;

    try {
      await user.save();
    } catch (err) {
      const error = new HttpError("Could not save the token", 500);
      return next(error);
    }

    transporter.sendMail({
      to: email,
      from: "info@eventsapp.com",
      subject: "Password Reset",
      html: `<h1>You requested a password reset.</h1> 
             <h2>Click this 
                <a href="http://localhost/reset/${token}"> Link </a> 
                to change your password.
            </h2>`,
    });
    res.json({ user });
  });
};

const getNewPassword = async (req, res, next) => {
  const token = req.params.token;
  let user;
  try {
    user = await Users.findOne({
      where: {
        resetToken: token,
        resetTokenExpiration: { $gt: Date.now() },
      },
    });
  } catch (err) {
    const error = new HttpError("error", 500);
    return next(error);
  }

  res.json({ userId: user.id, passwordToken: user.resetToken });
};

const postNewPassword = async (req, res, next) => {
  const { password, userId, passwordToken } = req.body;

  let user;
  try {
    user = await Users.findOne({
      where: {
        resetToken: passwordToken,
        id: userId,
        resetTokenExpiration: { $gt: Date.now() },
      },
    });
  } catch (err) {
    const error = new HttpError("error", 500);
    return next(error);
  }

  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(password, 12);
  } catch (err) {
    const error = new HttpError("Something went wrong, please try again.", 500);
    return next(error);
  }

  user.password = hashedPassword;
  user.resetToken = undefined;
  user.resetTokenExpiration = undefined;

  try {
    await user.save();
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not update password",
      500
    );
    return next(error);
  }

  let userEmail = user.email;
  try {
    transporter.sendMail({
      to: userEmail,
      from: "info@eventsapp.com",
      subject: "Password changed!",
      html: "<h1>You successfully changed your password!</h1>",
    });
  } catch (err) {
    const error = new HttpError("Could not send email", 500);
    return next(error);
  }

  res.status(200).json({ user });
};

const imgProfile = async (req, res, next) => {
  const { images, userId } = req.body;

  let user;
  try {
    user = await Users.findByPk(userId);
  } catch (err) {
    console.log(err);
  }

  user.images = images;

  try {
    await user.save();
  } catch (err) {
    console.log(err);
    const error = new HttpError("Could not save image", 500);
    return next(error);
  }

  res.json({ image });
};

exports.getUsersById = getUsersById;
exports.signup = signup;
exports.login = login;
exports.updatePassword = updatePassword;
exports.postReset = postReset;
exports.getNewPassword = getNewPassword;
exports.postNewPassword = postNewPassword;
exports.imgProfile = imgProfile;
