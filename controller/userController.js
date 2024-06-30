const User = require("../model/User");
const { resetPasswordCode } = require("../utils/sendEmail");
const catchAsyncError = require("../utils/catchAsyncError");
const ErrorHandler = require("../utils/errorHandler");
const { generateCode } = require("../utils/generateCode");

const isStrongPassword = (password) => {
  const uppercaseRegex = /[A-Z]/;
  const lowercaseRegex = /[a-z]/;
  const numericRegex = /\d/;
  const specialCharRegex = /[!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]/;

  if (
    uppercaseRegex.test(password) &&
    lowercaseRegex.test(password) &&
    numericRegex.test(password) &&
    specialCharRegex.test(password)
  ) {
    return true;
  } else {
    return false;
  }
};

const sendData = async (res, statusCode, user, message) => {
  const token = await user.getToken();
  res.status(statusCode).json({
    success: true,
    user,
    token,
    message,
  });
};

exports.registerUser = catchAsyncError(async (req, res, next) => {
  let { name, email, password, confirmPassword } = req.body;

  if (!isStrongPassword(password)) {
    return next(
      new ErrorHandler(
        "Password must contain one Uppercase, Lowercase, Numeric and Special Character",
        400
      )
    );
  }

  if (password !== confirmPassword)
    return next(new ErrorHandler("Confirm Password does not match", 400));

  const user_exist = await User.findOne({
    email: { $regex: new RegExp(email, "i") },
  });

  if (user_exist) {
    return next(new ErrorHandler(`Email already exists`, 400));
  }

  if (email) email = email.toLowerCase();

  let user = await User.create({
    name,
    email: email,
    password,
  });

  sendData(res, 201, user, "User Registered Successfully");
});

exports.loginUser = catchAsyncError(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new ErrorHandler("Please Enter Email & Password", 400));
  }

  const user = await User.findOne({ email: email.toLowerCase() }).select(
    "+password"
  );

  if (!user) {
    return next(new ErrorHandler("Invalid Credentials", 401));
  }

  const isPasswordMatched = await user.matchPassword(password);
  if (!isPasswordMatched)
    return next(new ErrorHandler("Invalid Credentials", 401));

  sendData(res, 200, user, "User Logged In Successfully");
});

exports.getProfile = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.userId).lean();
  if (!user) return next(new ErrorHandler("User not found.", 400));

  res.status(200).json({
    user,
  });
});

// forgot & resetting password
exports.sendForgotPasswordCode = catchAsyncError(async (req, res, next) => {
  const { email } = req.body;
  if (!email) return next(new ErrorHandler("Please enter your email", 400));

  const user = await User.findOne({ email });
  if (!user) return next(new ErrorHandler("User does not exist", 400));

  const code = generateCode();

  await User.findOneAndUpdate({ email }, { temp_code: code });
  await resetPasswordCode(user.email, user.name, code);

  res.status(200).json({
    success: true,
    message: "Password Reset Code sent successfully",
  });
});

exports.validateCode = catchAsyncError(async (req, res, next) => {
  const { email, code } = req.body;
  if (!email || !code) return next(new ErrorHandler("Code is required", 400));

  const user = await User.findOne({ email });
  if (!user) return next(new ErrorHandler("User does not exist", 400));

  if (user.temp_code !== code)
    return next(new ErrorHandler("Invalid/Expired Code", 400));

  user.temp_code = null;
  await user.save();

  res.status(200).json({
    success: true,
    message: "Code Validated successfully",
  });
});

exports.resetPassword = catchAsyncError(async (req, res, next) => {
  const { email, password, confirmPassword } = req.body;
  if (!email || !password || !confirmPassword)
    return next(new ErrorHandler("Please enter all fields", 400));

  if (!isStrongPassword(password)) {
    return next(
      new ErrorHandler(
        "Password must contain one Uppercase, Lowercase, Numeric and Special Character",
        400
      )
    );
  }

  if (password.length < 8)
    return next(new ErrorHandler("Password must be atleast 8 characters", 400));

  if (password !== confirmPassword)
    return next(new ErrorHandler("Confirm Password does not match", 400));

  const user = await User.findOne({ email: email.toLowerCase() }).select(
    "+password"
  );
  if (!user) return next(new ErrorHandler("User does not exist", 400));

  const isMatch = await user.matchPassword(password);

  if (isMatch) {
    return next(
      new ErrorHandler("New Password cannot be same as old password", 400)
    );
  }

  user.password = password;
  await user.save();

  res.status(200).json({
    success: true,
    message: "Password Reset successfully",
  });
});

// admin routes
exports.getAllUsers = catchAsyncError(async (req, res, next) => {
  const users = await User.find().lean();

  res.status(200).json({
    success: true,
    users,
  });
});
