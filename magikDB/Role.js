const mongoose = require('mongoose');
const Schema = require('mongoose').Schema;
const assert = require('assert');

const roleSchema = new Schema({
    name: String,
    permissions: [{
        type: Schema.Types.ObjectId,
        ref: 'Permission'
    }]
});
const Role = mongoose.model('Role', roleSchema);

Role.get = function (id, fields = 'name ACL') {
    if (Array.isArray(id)) {
        return Role.find({
            _id: { $in: id.map(d => mongoose.Types.ObjectId(d)) }
        }).select(fields)
            .exec();
    } else {
        return Role.findById(id)
            .select(fields)
            .exec();
    }
};

module.exports = Role;
