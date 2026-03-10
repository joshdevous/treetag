import mongoose, { Schema, type InferSchemaType } from 'mongoose';

const treeSchema = new Schema(
	{
		name: { type: String, required: true },
		species: { type: String, required: true },
		estimatedAge: Number,
		plantedDate: Date,
		plantedBy: String,
		height: Number,
		trunkDiameter: Number,
		location: {
			type: {
				type: String,
				enum: ['Point'],
				required: true
			},
			coordinates: {
				type: [Number], // [longitude, latitude]
				required: true
			},
			address: String
		},
		qrCodeId: { type: String, required: true, unique: true },
		photos: [{ type: Schema.Types.ObjectId, ref: 'Photo' }],
		adoptedBy: { type: String, default: null }, // better-auth user ID
		adoptedAt: Date,
		tags: [String],
		features: [String],
		description: String,
		status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
		iNaturalistId: String,
		createdBy: { type: String, required: true } // better-auth user ID
	},
	{ timestamps: true, versionKey: false }
);

treeSchema.index({ location: '2dsphere' });
treeSchema.index({ species: 1 });
treeSchema.index({ qrCodeId: 1 }, { unique: true });

export type Tree = InferSchemaType<typeof treeSchema>;
const existingTreeModel = mongoose.models['Tree'] as mongoose.Model<Tree> | undefined;

// In dev, HMR can keep an old compiled model in memory after schema changes.
// If that stale model is missing the status path, recreate it so writes include status.
export const TreeModel = existingTreeModel
	? existingTreeModel.schema.path('status')
		? existingTreeModel
		: (mongoose.deleteModel('Tree'), mongoose.model<Tree>('Tree', treeSchema))
	: mongoose.model<Tree>('Tree', treeSchema);
