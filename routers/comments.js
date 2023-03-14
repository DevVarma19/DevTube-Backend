const express = require('express');

const Comment = require('../models/Comments');
const Video = require('../models/Video');
const createError = require("../error");
const verifyToken = require("../middleware/verifyToken");

const router = express.Router();

// Add comment
router.post("/", verifyToken, async (req, res, next) => {
    const newComment = new Comment({...req.body, userId: req.user.id});
    try {
        const savedComment = await newComment.save();
        return res.status(200).json(savedComment);
    } catch (err) {
        next(err);
    }
});

// Delete comment
router.delete("/:id", verifyToken, async (req, res, next) => {
    try {
        const comment = await Comment.findById(req.params.id);
        const video = await Video.findById(req.params.id);
        if(req.user.id === comment.userId || req.user.id === video.userId) {
            await Comment.findByIdAndDelete(req.params.id);
            res.status(200).json("The comment has been deleted");
        } else {
            return next(createError(403, "You can delete only your comment!"));
        }
    } catch (err) {
        next(err);
    }
});

// Get all comments of a video
router.get("/:videoId", async (req, res, next) => {
    try {
        const comments = await Comment.find({videoId: req.params.videoId});
        res.status(200).json(comments);
    } catch (err) {
        next(err);
    }
});

module.exports = router