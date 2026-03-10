import mongoose, { Schema, type InferSchemaType } from 'mongoose';

const faqSchema = new Schema(
	{
		question: { type: String, required: true },
		answer: { type: String, required: true },
		category: { type: String, required: true },
		order: { type: Number, default: 0 }
	},
	{ timestamps: true, versionKey: false }
);

faqSchema.index({ category: 1, order: 1 });

export type FAQ = InferSchemaType<typeof faqSchema>;
export const FAQModel =
	(mongoose.models['FAQ'] as mongoose.Model<FAQ>) ||
	mongoose.model<FAQ>('FAQ', faqSchema);
