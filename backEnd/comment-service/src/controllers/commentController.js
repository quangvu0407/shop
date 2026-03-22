import {
  createComment,
  listCommentsByProductId,
} from "../services/commentService.js";

export const addComment = async (req, res) => {
  try {
    const userId = req.user.id;
    const { Id, description, rate } = req.body;

    const comment = await createComment({
      userId,
      Id,
      description,
      rate,
    });

    res.json({
      success: true,
      message: "Đã gửi bình luận",
      comment,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const listComments = async (req, res) => {
  try {
    const { productId } = req.params;
    const comments = await listCommentsByProductId(productId);
    res.json({ success: true, comments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
