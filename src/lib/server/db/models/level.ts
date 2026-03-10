import mongoose, { Schema, type InferSchemaType } from 'mongoose';

const levelSchema = new Schema(
	{
		level: { type: Number, required: true, unique: true },
		title: { type: String, required: true },
		minPoints: { type: Number, required: true },
		colour: { type: String, required: true },
		icon: { type: String, required: true }
	},
	{ timestamps: true, versionKey: false }
);

levelSchema.index({ minPoints: 1 });

export type Level = InferSchemaType<typeof levelSchema>;
export const LevelModel =
	(mongoose.models['Level'] as mongoose.Model<Level>) ||
	mongoose.model<Level>('Level', levelSchema);
