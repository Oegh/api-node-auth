const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const refreshTokenSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'user' },
    token: { type: String, unique: true },
    created: { type: Date, default: Date.now },
    revoked: Boolean,
    createdByIp: String,
    replacedByToken: String,
    revokedByIp: String
});

refreshTokenSchema.virtual('isExpired').get(function() {
    return Date.now() >= this.expires;
});

refreshTokenSchema.virtual('isActive').get(function() {
    return !this.revoked && !this.isExpired;
});

refreshTokenSchema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: function(doc, ret) {
        // remove these props when object is serialized
        delete ret._id;
        delete ret.id;
        delete ret.user;
    }
});

module.exports = mongoose.model('RefreshToken', refreshTokenSchema);