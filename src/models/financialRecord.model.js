const mongoose = require("mongoose");

const financialRecordSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User reference is required"],
    },
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [0.01, "Amount must be greater than 0"],
    },
    type: {
      type: String,
      enum: ["income", "expense"],
      required: [true, "Type is required (income or expense)"],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
      // Examples: "salary", "rent", "food", "utilities", "freelance", etc.
    },
    date: {
      type: Date,
      required: [true, "Date is required"],
      default: Date.now,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, "Notes cannot exceed 500 characters"],
    },
    isDeleted: {
      type: Boolean,
      default: false, // soft delete — records are never truly removed
    },
  },
  {
    timestamps: true,
  },
);

// Global query filter: automatically exclude soft-deleted records
financialRecordSchema.pre(/^find/, function () {
  this.where({ isDeleted: false });
});

module.exports = mongoose.model("FinancialRecord", financialRecordSchema);
