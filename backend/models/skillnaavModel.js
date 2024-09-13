const mongoose = require("mongoose");

const discoverSchema = new mongoose.Schema({
  discoverheading: {
    type: String,
    required: true,
  },
  discoversubheading: {
    type: String,
    required: true,
  },
  tryforfreebtn: {
    type: String,
    required: true,
  },
  viewpricebtn: {
    type: String,
    required: true,
  },
  imgUrl: {
    type: String,
    required: true,
  },
});

const discoverCompImgSchema = new mongoose.Schema({
  imageUrl: {
    type: String,
    required: true,
  },
});

const visionheadingSchema = new mongoose.Schema({
  visionheading: {
    type: String,
    required: true,
  },
  visionsub: {
    type: String,
    required: true,
  },
  visionImg: {
    type: String,
    required: true,
  },
});
const visionpointsSchema = new mongoose.Schema({
  visionpoint: {
    type: String,
    required: true,
  },
});

const featureSchema = new mongoose.Schema({
  feature: {
    type: String,
    required: true,
  },
  featuredesc: {
    type: String,
    required: true,
  },
  subfeature: {
    type: String,
    required: true,
  },
  point1: {
    type: String,
    required: true,
  },
  point2: {
    type: String,
    required: true,
  },
  point3: {
    type: String,
    required: true,
  },
  point4: {
    type: String,
    required: true,
  },
  featureImg: {
    type: String,
    required: true,
  },
});

const teamSchema = new mongoose.Schema({
  teamheading: {
    type: String,
    required: true,
  },
  teamsubheading: {
    type: String,
    required: true,
  },
});

const teammembersSchema = new mongoose.Schema({
  image: {
    type: String,
    required: true,
  },
  teammemberName: {
    type: String,
    required: true,
  },
  teammemberDesgn: {
    type: String,
    required: true,
  },
  teammemberDesc: {
    type: String,
    required: true,
  },
  teammemberLinkedin: {
    type: String,
    required: true,
  },
});

const pricingSchema = new mongoose.Schema({
  priceheading: {
    type: String,
    required: true,
  },
});

const pricingcardSchema = new mongoose.Schema({
  plantype: {
    type: String,
    required: true,
  },
  plantypesubhead: {
    type: String,
    required: true,
  },
  price: {
    type: String,
    required: true,
  },
  pricepoint1: {
    type: String,
    required: true,
  },
  pricepoint2: {
    type: String,
    required: true,
  },
  pricepoint3: {
    type: String,
    required: true,
  },
  pricebtn: {
    type: String,
    required: true,
  },
  bgcolor: {
    type: String,
    required: true,
  },
  color: {
    type: String,
    required: true,
  },
});

const faqSchema = new mongoose.Schema({
  faqheading: {
    type: String,
    required: true,
  },
  faqsubheading: {
    type: String,
    required: true,
  },
});

const faqcardSchema = new mongoose.Schema({
  faq: {
    type: String,
    required: true,
  },
  answer: {
    type: String,
    required: true,
  },
});

const contactSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    subject: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const footerSchema = new mongoose.Schema({
  contactdetails: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  usefullinksheader: {
    type: String,
    required: true,
  },
  usefullink1: {
    type: String,
    required: true,
  },
  usefullink2: {
    type: String,
    required: true,
  },
  usefullink3: {
    type: String,
    required: true,
  },
  usefullink4: {
    type: String,
    required: true,
  },
  stayinformedheader: {
    type: String,
    required: true,
  },
  stayinformedsubtext: {
    type: String,
    required: true,
  },
  subscribetext: {
    type: String,
    required: true,
  },
  copyrighttext: {
    type: String,
    required: true,
  },
  copyrightsubtext: {
    type: String,
    required: true,
  },
});

module.exports = {
  Discover: mongoose.model("discovers", discoverSchema),
  DiscoverCompImg: mongoose.model("discovercompimg", discoverCompImgSchema),
  VisionHead: mongoose.model("visionhead", visionheadingSchema),
  VisionPoint: mongoose.model("visionpoint", visionpointsSchema),
  Feature: mongoose.model("features", featureSchema),
  Team: mongoose.model("team", teamSchema),
  TeamMember: mongoose.model("teammember", teammembersSchema),
  Pricing: mongoose.model("pricing", pricingSchema),
  PricingCard: mongoose.model("pricingcard", pricingcardSchema),
  FAQ: mongoose.model("faq", faqSchema),
  FAQCard: mongoose.model("faqcard", faqcardSchema),
  Contact: mongoose.model("contact", contactSchema),
  Footer: mongoose.model("footer", footerSchema),
};
