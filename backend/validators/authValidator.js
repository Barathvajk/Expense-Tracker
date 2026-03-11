const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

const EMAIL_REGEX = /^\S+@\S+\.\S+$/;

const validateRegister = (req, res, next) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "Please provide name, email and password" });
  }

  if (name.trim().length < 2) {
    return res.status(400).json({ message: "Name must be at least 2 characters" });
  }

  if (!EMAIL_REGEX.test(email)) {
    return res.status(400).json({ message: "Please provide a valid email" });
  }

  if (!PASSWORD_REGEX.test(password)) {
    return res.status(400).json({
      message:
        "Password must be 8+ characters and include uppercase, lowercase, number and special character (@$!%*?&)",
    });
  }

  next();
};

const validateLogin = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Please provide email and password" });
  }

  next();
};

module.exports = { validateRegister, validateLogin };
