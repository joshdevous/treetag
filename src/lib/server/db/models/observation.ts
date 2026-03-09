import mongoose, { Schema, type InferSchemaType } from 'mongoose';

const observationSchema = new Schema(
	{
		tree: { type: Schema.Types.ObjectId, ref: 'Tree', required: true },
		userId: { type: String, required: true }, // better-auth user ID
		type: {
			type: String,
			enum: ['tag', 'health_check', 'wildlife', 'disease', 'photo', 'note'],
			required: true
		},
		content: String,
		photos: [{ type: Schema.Types.ObjectId, ref: 'Photo' }],
		wildlife: {
			species: String,
			category: {
				type: String,
				enum: ['bird', 'insect', 'mammal', 'other']
			}
		},
		healthStatus: {
			type: String,
			enum: ['healthy', 'concern', 'diseased', 'dead']
		},
		pointsAwarded: { type: Number, default: 0 }
	},
	{ timestamps: true }
);

observationSchema.index({ tree: 1, createdAt: -1 });
observationSchema.index({ userId: 1 });

export type Observation = InferSchemaType<typeof observationSchema>;
export const ObservationModel =
	(mongoose.models['Observation'] as mongoose.Model<Observation>) ||
	mongoose.model<Observation>('Observation', observationSchema);
