import mongoose, { Schema, type InferSchemaType } from 'mongoose';

const lovValueSchema = new Schema(
	{
		type: {
			type: String,
			required: true,
			enum: ['species', 'plantedBy', 'tag', 'feature']
		},
		value: { type: String, required: true },
		normalized: { type: String, required: true },
		usageCount: { type: Number, default: 0 },
		lastUsedAt: { type: Date, default: Date.now }
	},
	{ timestamps: true, versionKey: false }
);

lovValueSchema.index({ type: 1, normalized: 1 }, { unique: true });
lovValueSchema.index({ type: 1, usageCount: -1, lastUsedAt: -1 });

export type LovValue = InferSchemaType<typeof lovValueSchema>;
export const LovValueModel =
	(mongoose.models['LovValue'] as mongoose.Model<LovValue>) ||
	mongoose.model<LovValue>('LovValue', lovValueSchema);
