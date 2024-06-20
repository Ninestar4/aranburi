import User from "../models/user.model.js";
import bcryptjs from "bcryptjs";
import { errorHandler } from "../utils/error.js";
import jwt from "jsonwebtoken";

export const signup = async (req, res, next) => {
  const { username, email, password, confirmPassword } = req.body;

  // Check if any of the required fields are missing
  if (!username || !email || !password) {
    return res
      .status(400)
      .json({ success: false, message: "Please fill all the fields" });
  }
  // Check if password and confirmPassword are the same
  if (password !== confirmPassword) {
    return res
      .status(501)
      .json({ success: false, message: "Passwords do not match" });
  }

  const hashedPassword = bcryptjs.hashSync(password, 10);
  const newUser = new User({ username, email, password: hashedPassword });

  try {
    await newUser.save();
    const token = jwt.sign(
      { id: newUser._id, username: newUser.username },
      "sdopfsjkdopfjks",
      {
        expiresIn: "2h",
      }
    );
    const { password: pass, ...rest } = newUser._doc;
    res.status(200).send({ token: token });
  } catch (err) {
    next(errorHandler(500, "You already have an account"));
  }
};

export const login = async (req, res, next) => {
  const { email, password } = req.body;

  // Check if any of the required fields are missing
  if (!email || !password) {
    return res
      .status(400)
      .json({ success: false, message: "Please fill all the fields" });
  }

  try {
    const validUser = await User.findOne({ email });
    if (!validUser) return next(errorHandler(404, "User not found"));
    const validPassword = bcryptjs.compareSync(password, validUser.password);
    if (!validPassword) return next(errorHandler(401, "Wrong credentials"));
    const token = jwt.sign(
      { id: validUser._id, username: validUser.username },
      "sdopfsjkdopfjks",
      {
        expiresIn: "2h",
      }
    );
    const { password: pass, ...rest } = validUser._doc;
    res.status(200).send({ token: token });
  } catch (err) {
    next(err);
  }
};

export const google = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (user) {
      console.log(user.username);
      const token = jwt.sign(
        { id: user._id, username: user.username },
        "sdopfsjkdopfjks",
        {
          expiresIn: "2h",
        }
      );
      res.status(200).send({ token: token });
    } else {
      const generatedPassword =
        Math.random().toString(36).slice(-8) +
        Math.random().toString(36).slice(-8);
      const hashedPassword = bcryptjs.hashSync(generatedPassword, 10);
      const newUser = new User({
        username:
          req.body.name.split(" ")[0].toLowerCase() +
          Math.random().toString(36).slice(-3),
        email: req.body.email,
        password: hashedPassword,
      });
      await newUser.save();
      const token = jwt.sign(
        { id: newUser._id, username: newUser.username },
        "sdopfsjkdopfjks",
        {
          expiresIn: "2h",
        }
      );
      res.status(200).send({ token: token });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Internal server error" });
  }
};
