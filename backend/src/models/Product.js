import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      maxlength: [200, 'Name cannot exceed 200 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [10000, 'Description cannot exceed 10000 characters'],
      default: '',
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    stock: {
      type: Number,
      required: [true, 'Stock is required'],
      min: [0, 'Stock cannot be negative'],
      validate: {
        validator: Number.isInteger,
        message: 'Stock must be a whole number',
      },
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category is required'],
    },
    images: {
      type: [String],
      default: [],
      validate: {
        validator(arr) {
          return arr.length <= 20;
        },
        message: 'A maximum of 20 images is allowed',
      },
    },
    sku: {
      type: String,
      required: [true, 'SKU is required'],
      unique: true,
      uppercase: true,
      trim: true,
      maxlength: [64, 'SKU cannot exceed 64 characters'],
    },
  },
  { timestamps: true }
);

productSchema.index({ category: 1, createdAt: -1 });

productSchema.pre('validate', function normalizeSku() {
  if (typeof this.sku === 'string') {
    this.sku = this.sku.trim().toUpperCase();
  }
});

const Product = mongoose.model('Product', productSchema);

export default Product;
