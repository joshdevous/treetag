import mongoose, { Schema, type InferSchemaType } from 'mongoose';

const photoSchema = new Schema(
	{
		url: { type: String, required: true },
		key: { type: String, required: true }, // R2 object key
		caption: String,
		uploadedBy: { type: String, required: true }, // better-auth user ID
		tree: { type: Schema.Types.ObjectId, ref: 'Tree' },
		observation: { type: Schema.Types.ObjectId, ref: 'Observation' }
	},
	{ timestamps: true }
);

export type Photo = InferSchemaType<typeof photoSchema>;
export const PhotoModel =
	(mongoose.models['Photo'] as mongoose.Model<Photo>) ||
	mongoose.model<Photo>('Photo', photoSchema);
