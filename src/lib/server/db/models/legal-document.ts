import mongoose, { Schema, type InferSchemaType } from 'mongoose';

const legalDocumentSchema = new Schema(
	{
		slug: { type: String, required: true, unique: true },
		title: { type: String, required: true },
		subtitle: { type: String, required: true },
		description: { type: String, required: true },
		icon: { type: String, required: true },
		content: { type: String, required: true },
		lastUpdated: { type: Date, required: true }
	},
	{ timestamps: true, versionKey: false }
);

legalDocumentSchema.index({ slug: 1 });

export type LegalDocument = InferSchemaType<typeof legalDocumentSchema>;
export const LegalDocumentModel =
	(mongoose.models['LegalDocument'] as mongoose.Model<LegalDocument>) ||
	mongoose.model<LegalDocument>('LegalDocument', legalDocumentSchema);
