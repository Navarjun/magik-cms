const mongoose = require('mongoose');
const Schema = require('mongoose').Schema;

const permissionSchema = new Schema({
    name: { type: String, required: true },
    type: {
        type: String,
        enum: ['content', 'admin']
    },
    level: {
        type: String,
        enum: ['blog', 'pages', 'container', 'site', 'navigation']
    },
    granularity: {
        type: String,
        enum: ['general', 'specific']
    },
    blogId: {
        type: Schema.Types.ObjectId,
        ref: 'Blog'
    },
    pageId: {
        type: Schema.Types.ObjectId,
        ref: 'Page'
    },
    containerId: {
        type: Schema.Types.ObjectId,
        ref: 'Container'
    },
    withPermissions: [{type: String, enum: ['read', 'write', 'edit', 'delete', 'publish']}]
});
const Permission = mongoose.model('Permission', permissionSchema);

module.exports = Permission;
