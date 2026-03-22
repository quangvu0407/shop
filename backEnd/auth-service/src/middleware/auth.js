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
    const token_decode = jwt.verify(token, process.env.JWT_SECRET);

    let userId;
    if (typeof token_decode === "object" && token_decode !== null) {
      userId = token_decode.id ?? token_decode._id ?? token_decode.userId;
    }
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Token không hợp lệ cho tài khoản người dùng",
      });
    }

    req.user = { id: String(userId) };
    next();
  } catch (error) {
    console.log(error);
    res.status(401).json({ success: false, message: error.message });
  }
}

export default authUser