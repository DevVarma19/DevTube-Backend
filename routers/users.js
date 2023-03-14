const express = require("express");

const User = require("../models/User");
const Video = require("../models/Video");
const createError = require("../error");
const verifyToken = require("../middleware/verifyToken");

const router = express.Router();

// Update a user
router.put("/:id", verifyToken, async (req, res, next) => {
  // user should only be able to edit his own account
  if (req.params.id === req.user.id) {
    try {
      const updatedUser = await User.findByIdAndUpdate(
        req.params.id,
        {
          $set: req.body,
        },
        { new: true }
      );
      res.status(200).json(updatedUser);
    } catch (err) {
      next(err);
    }
  } else {
    return next(createError(403, "You can only update your account."));
  }
});

// Delete a user
router.delete("/:id", verifyToken, async (req, res, next) => {
  if (req.params.id === req.user.id) {
    try {
      await User.findByIdAndDelete(req.params.id);
      res.status(200).json("User has been deleted!");
    } catch (err) {
      next(err);
    }
  } else {
    return next(createError(403, "You can only delete your account."));
  }
});

// Get a user
router.get("/find/:id", async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    const {password, ...others} = user;
    res.status(200).json(others);
  } catch (err) {
    next(err);
  }
});

// Subscribe a user
// ID = ID of the channel that we want to sub
// Add this ID to current users subscribedUsers list + Increment the subscribers count of the user with ID passed as param
router.put("/sub/:id", verifyToken, async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(req.user.id, {
      $push: { subscribedUsers: req.params.id },
    });
    await User.findByIdAndUpdate(req.params.id, {
      $inc: { subscribers: 1 },
    });
    return res.status(200).json("Subscription successfull");
  } catch (err) {
    next(err);
  }
});

// Unsubscribe a user
router.put("/unsub/:id", verifyToken, async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(req.user.id, {
      $pull: { subscribedUsers: req.params.id },
    });
    await User.findByIdAndUpdate(req.params.id, {
      $inc: { subscribers: -1 },
    });
    return res.status(200).json("UnSubscription successfull");
  } catch (err) {
    next(err);
  }
});

// Like a video
router.put("/like/:videoId", verifyToken, async (req, res, next) => {
  const id = req.user.id;
  const videoId = req.params.videoId;
  try {
    await Video.findByIdAndUpdate(videoId, {
      $addToSet: { likes: id },
      $pull: { dislikes: id },
    });
    res.status(200).json("The video has been liked");
  } catch (err) {
    next(err);
  }
});

// Dislike a video
router.put("/unlike/:videoId", verifyToken, async (req, res, next) => {
  const id = req.user.id;
  const videoId = req.params.videoId;
  try {
    await Video.findByIdAndUpdate(videoId, {
      $addToSet: { dislikes: id },
      $pull: { likes: id },
    });
    res.status(200).json("The video has been disliked");
  } catch (err) {
    next(err);
  }
});

module.exports = router;