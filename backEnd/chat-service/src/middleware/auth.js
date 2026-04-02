import jwt from 'jsonwebtoken'

const authUser = async (req, res, next) => {

  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      success: false,
      message: "Not authorized login again",
    });
  }

  try {
    const token = authHeader.split(" ")[1];
    const token_decode = jwt.verify(token, process.env.JWT_SECRET)
    req.user = { id: token_decode.id };
    next();

  } catch (error) {
    console.log(error);
    res.status(401).json({ success: false, message: error.message });
  }
}

export default authUser