const express = require("express");
const NodeCache = require("node-cache");
const router = express.Router();
const {
  Discover,
  DiscoverCompImg,
  VisionHead,
  VisionPoint,
  Feature,
  Team,
  TeamMember,
  Pricing,
  PricingCard,
  FAQ,
  FAQCard,
  Contact,
  Footer,
} = require("../models/skillnaavModel");

const User = require("../models/userModel");

// Initialize cache
const cache = new NodeCache({ stdTTL: 600, checkperiod: 120 }); // TTL of 10 minutes

// Middleware for handling asynchronous route handlers
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

// Error handling middleware
const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  res
    .status(500)
    .json({ success: false, message: "Server Error", error: err.message });
};

// Generalized CRUD operations
const createOne = async (model, data) => {
  const instance = new model(data);
  await instance.save();
  return instance;
};

const updateOne = async (model, filter, data) => {
  const instance = await model.findOneAndUpdate(filter, data, { new: true });
  return instance;
};

const deleteOneById = async (model, id) => {
  await model.findByIdAndDelete(id);
};

// Route to get all SkillNaav data with caching
router.get(
  "/get-skillnaav-data",
  asyncHandler(async (req, res) => {
    const cacheKey = "skillnaav-data";
    const cachedData = cache.get(cacheKey);

    if (cachedData) {
      return res.status(200).json(cachedData);
    }

    const [
      discovers,
      discovercompimg,
      visionhead,
      visionpoint,
      features,
      team,
      teammember,
      pricing,
      pricingcard,
      faq,
      faqcard,
      contact,
      footer,
    ] = await Promise.all([
      Discover.find(),
      DiscoverCompImg.find(),
      VisionHead.find(),
      VisionPoint.find(),
      Feature.find(),
      Team.find(),
      TeamMember.find(),
      Pricing.find(),
      PricingCard.find(),
      FAQ.find(),
      FAQCard.find(),
      Contact.find(),
      Footer.find(),
    ]);

    const responseData = {
      discover: discovers,
      discovercompimg,
      visionhead,
      visionpoint,
      features,
      team,
      teammember,
      pricing,
      pricingcard,
      faq,
      faqcard,
      contact,
      footer,
    };

    cache.set(cacheKey, responseData);
    res.status(200).json(responseData);
  })
);

// Define CRUD routes generically
const createRoute = (path, model) => {
  router.post(
    path,
    asyncHandler(async (req, res) => {
      const instance = await createOne(model, req.body);
      cache.flushAll();
      res.status(200).json({
        data: instance,
        success: true,
        message: `${model.modelName} added successfully`,
      });
    })
  );
};

const updateRoute = (path, model) => {
  router.put(
    `${path}/:id`,
    asyncHandler(async (req, res) => {
      const { id } = req.params;

      try {
        const updatedInstance = await model.findByIdAndUpdate(id, req.body, {
          new: true,
        });

        if (!updatedInstance) {
          return res.status(404).json({
            success: false,
            message: `${model.modelName} not found`,
          });
        }

        cache.flushAll();
        res.status(200).json({
          success: true,
          message: `${model.modelName} updated successfully`,
          data: updatedInstance,
        });
      } catch (error) {
        console.error(`Error updating ${model.modelName}:`, error);
        res.status(500).json({
          success: false,
          message: "Server Error",
          error: error.message,
        });
      }
    })
  );
};

const deleteRoute = (path, model) => {
  router.delete(
    `${path}/:id`,
    asyncHandler(async (req, res) => {
      const { id } = req.params;
      await deleteOneById(model, id);
      cache.flushAll();
      res.status(200).json({
        success: true,
        message: `${model.modelName} deleted successfully`,
      });
    })
  );
};

// Define specific routes for each model
createRoute("/add-discover", Discover);
updateRoute("/update-discover", Discover);
deleteRoute("/delete-discover", Discover);

createRoute("/add-discover-comp-img", DiscoverCompImg);
deleteRoute("/delete-discover-comp-img", DiscoverCompImg);

createRoute("/add-visionhead", VisionHead);
updateRoute("/update-visionhead", VisionHead);
deleteRoute("/delete-visionhead", VisionHead);

createRoute("/add-visionpoint", VisionPoint);
updateRoute("/update-visionpoint", VisionPoint);
deleteRoute("/delete-visionpoint", VisionPoint);

createRoute("/add-feature", Feature);
updateRoute("/update-feature", Feature);
deleteRoute("/delete-feature", Feature);

createRoute("/add-teammember", TeamMember);
updateRoute("/update-teammember", TeamMember);
deleteRoute("/delete-teammember", TeamMember);

router.post(
  "/update-priceheading",
  asyncHandler(async (req, res) => {
    const { _id, priceheading } = req.body;

    try {
      const updatedPricing = await Pricing.findByIdAndUpdate(
        _id,
        { priceheading },
        { new: true }
      );

      if (!updatedPricing) {
        return res.status(404).json({
          success: false,
          message: "Pricing not found",
        });
      }

      cache.flushAll();
      res.status(200).json({
        success: true,
        message: "Price heading updated successfully",
        data: updatedPricing,
      });
    } catch (error) {
      console.error("Error updating price heading:", error);
      res.status(500).json({
        success: false,
        message: "Server Error",
        error: error.message,
      });
    }
  })
);

createRoute("/add-pricing", Pricing);
updateRoute("/update-pricing", Pricing);
deleteRoute("/delete-pricing", Pricing);

createRoute("/add-pricingcard", PricingCard);
updateRoute("/update-pricingcard", PricingCard);
deleteRoute("/delete-pricingcard", PricingCard);

router.post(
  "/update-faqheading",
  asyncHandler(async (req, res) => {
    const { _id, faqheading, faqsubheading } = req.body;

    try {
      const updatedFAQ = await FAQ.findByIdAndUpdate(
        _id,
        { faqheading, faqsubheading },
        { new: true }
      );

      if (!updatedFAQ) {
        return res.status(404).json({
          success: false,
          message: "FAQ not found",
        });
      }

      cache.flushAll();
      res.status(200).json({
        success: true,
        message: "FAQ heading and subheading updated successfully",
        data: updatedFAQ,
      });
    } catch (error) {
      console.error("Error updating FAQ heading:", error);
      res.status(500).json({
        success: false,
        message: "Server Error",
        error: error.message,
      });
    }
  })
);

createRoute("/add-faq", FAQ);
updateRoute("/update-faq", FAQ);
deleteRoute("/delete-faq", FAQ);

createRoute("/add-faqcard", FAQCard);
updateRoute("/update-faqcard", FAQCard);
deleteRoute("/delete-faqcard", FAQCard);

// Route to get all contacts with pagination, search, and sorting
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const {
      page = 1,
      pageSize = 10,
      search = "",
      sort = "-createdAt",
    } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(pageSize);
    const total = await Contact.countDocuments({
      $or: [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ],
    });
    const contacts = await Contact.find({
      $or: [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ],
    })
      .sort(sort)
      .skip(skip)
      .limit(parseInt(pageSize))
      .exec();
    res.status(200).json({ contacts, total });
  })
);

// Route to add a new contact
router.post(
  "/",
  asyncHandler(async (req, res) => {
    const { name, email, subject, message } = req.body;
    const newContact = new Contact({ name, email, subject, message });
    await newContact.save();
    res.status(201).json(newContact);
  })
);

// Route to delete a contact by ID
router.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    await Contact.findByIdAndDelete(id);
    res.status(200).json({
      success: true,
      message: "Contact deleted successfully",
    });
  })
);
// Admin login route
router.post(
  "/admin-login",
  asyncHandler(async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username, password });
    if (user) {
      user.password = ""; // Remove password from response
      res
        .status(200)
        .json({ data: user, success: true, message: "Login Successfully" });
    } else {
      res
        .status(401)
        .json({ success: false, message: "Invalid username or password" });
    }
  })
);
module.exports = router;
