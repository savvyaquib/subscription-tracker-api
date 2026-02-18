import Subscription from "../models/subscription.model.js";
import { workflowClient } from "../config/upstash.js";
import { SERVER_URL } from "../config/env.js";

export const createSubscription = async (req, res, next) => {
  try {
    // Use new + save instead of create to ensure middleware runs
    const subscription = new Subscription({
      ...req.body,
      user: req.user._id,
    });

    await subscription.save();

    const { workflowRunId } = await workflowClient.trigger({
      url: `${SERVER_URL}/api/v1/workflows/subscription/reminder`,
      body: {
        subscriptionId: subscription.id,
      },
      headers: {
        "content-type": "application/json",
      },
      retries: 0,
    });

    res.status(201).json({
      success: true,
      data: { subscription, workflowRunId },
    });
  } catch (error) {
    next(error);
  }
};

export const getUserSubscriptions = async (req, res, next) => {
  try {
    // check if the user is the same as the user in token
    if (req.user._id.toString() !== req.params.id) {
      const error = new Error("You are not the owner of this account");
      error.status = 401;
      throw error;
    }

    const subscriptions = await Subscription.find({ user: req.params.id });

    res.status(200).json({
      success: true,
      data: subscriptions,
    });
  } catch (error) {
    next(error);
  }
};


export const cancelSubscription = async (req, res, next) => {

  try {

    const subscription = await Subscription.findById(req.params.id);

    if (!subscription) {

      const error = new Error("Subscription not found");

      error.statusCode = 404; throw error;

    }

    if (subscription.user.toString() !== req.user._id.toString()) {

      const error = new Error("Unauthorized");

      error.statusCode = 401; throw error;

    }

    subscription.status = "cancelled";

    await subscription.save();

    res.status(200).json({ success: true, data: subscription });

  } catch (error) { next(error); }

};

export const deleteSubscription = async (req, res, next) => {

  try {

    const subscription = await Subscription.findById(req.params.id);

    if (!subscription) {

      const error = new Error("Subscription not found");

      error.statusCode = 404; throw error;

    }

    if (subscription.user.toString() !== req.user._id.toString()) {

      const error = new Error("Unauthorized");

      error.statusCode = 401; throw error;

    }

    await Subscription.findByIdAndDelete(req.params.id);

    res.status(200).json({ success: true, message: "Subscription deleted" });

  } catch (error) { next(error); }

};