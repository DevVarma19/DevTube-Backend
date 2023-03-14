const express = require("express");

const Video = require("../models/Video");
const User = require("../models/User");
const verifyToken = require("../middleware/verifyToken");
const createError = require("../error");

const router = express.Router();

// Create a video
router.post("/", verifyToken, async (req, res, next) => {
  try {
    const newVideo = new Video({ userId: req.user.id, ...req.body });
    const savedVideo = await newVideo.save();
    return res.status(200).json(savedVideo);
  } catch (err) {
    next(err);
  }
});

// Update a video
router.put("/:id", verifyToken, async (req, res, next) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) return next(createError(404, "Not found!"));
    if (req.user.id === video.userId) {
      const updatedVideo = await Video.findByIdAndUpdate(
        req.params.id,
        {
          $set: req.body,
        },
        { new: true }
      );
      return res.status(200).json(updatedVideo);
    } else {
      return next(createError(403, "You can only edit your vidoes"));
    }
  } catch (err) {
    next(err);
  }
});

// Delete a video
router.delete("/:id", verifyToken, async (req, res, next) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) return next(createError(404, "Not found!"));
    if (req.user.id === video.userId) {
      await Video.findByIdAndDelete(req.params.id);
      return res.status(200).json("Deleted video successfully!");
    } else {
      return next(createError(403, "You can only delete your vidoes"));
    }
  } catch (err) {
    next(err);
  }
});

// Get a video
router.get("/find/:id", async (req, res, next) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) return next(createError(404, "Not found!"));
    return res.status(200).json(video);
  } catch (err) {
    next(err);
  }
});

// Update views
router.put("/view/:id", async (req, res, next) => {
  try {
    await Video.findByIdAndUpdate(req.params.id, {
      $inc: { views: 1 },
    });
    res.status(200).json("Views has been increased");
  } catch (err) {
    next(err);
  }
});

// Trending videos
router.get("/trend", async (req, res, next) => {
  try {
    const videos = await Video.find().sort({ views: -1 });
    res.status(200).send(videos);
  } catch (err) {
    next(err);
  }
});

// Random videos
router.get("/random", async (req, res, next) => {
  try {
    const videos = await Video.aggregate([{ $sample: { size: 40 } }]);
    res.status(200).json(videos);
  } catch (err) {
    next(err);
  }
});

// Subscribed Channel videos
router.get("/sub", verifyToken, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    const subscribedChannels = user.subscribedUsers;
    const VideoList = await Promise.all(
      subscribedChannels.map((channelId) => {
        return Video.find({ userId: channelId });
      })
    );
    return res.status(200).json(VideoList);
  } catch (err) {
    next(err);
  }
});

// Tags
router.get("/tags", async (req, res, next) => {
  const tags = req.query.tags.split(",");
  try {
    const videos = await Video.find({ tags: { $in: tags } }).limit(20);
    res.status(200).json(videos);
  } catch (err) {
    next(err);
  }
});

// Search
router.get("/search", async (req, res, next) => {
  const query = req.query.q;
  try {
    const videos = await Video.find({
      title: { $regex: query, $options: "i" },
    }).limit(40);
    res.status(200).json(videos);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
