import mongoose from 'mongoose';
import { slugify } from '../utils/slugify.js';

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      trim: true,
      maxlength: [120, 'Name cannot exceed 120 characters'],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
      default: '',
    },
  },
  { timestamps: true }
);

categorySchema.pre('validate', async function assignUniqueSlug() {
  const Model = this.constructor;

  if (!this.isModified('name') && this.slug) {
    return;
  }

  let base = slugify(this.name);
  if (!base) {
    base = 'category';
  }

  let slug = base;
  let counter = 1;

  while (await Model.exists({ slug, _id: { $ne: this._id } })) {
    slug = `${base}-${counter}`;
    counter += 1;
  }

  this.slug = slug;
});

const Category = mongoose.model('Category', categorySchema);

export default Category;
