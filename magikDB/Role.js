const mongoose = require('mongoose');
const Schema = require('mongoose').Schema;

const roleSchema = new Schema({
    name: String,
    ACL: {
        isAdmin: Boolean,
        structure: { isAdmin: Boolean, editNavigation: Boolean },
        blogs: [{
            id: {
                type: Schema.Types.ObjectId,
                ref: 'Blog'
            },
            isAdmin: Boolean,
            postPublish: Boolean,
            postDelete: Boolean,
            postEdit: Boolean,
            postAdd: Boolean
        }],
        staticPages: [{
            id: {
                type: Schema.Types.ObjectId,
                ref: 'StaticPages'
            }
        }]
    }
});
const Role = mongoose.model('Role', roleSchema);

/**
 * ACL
 * ACL can contain following attributes:
 * isAdmin: true/false
 * structure: [
 *  {
 *      isAdmin: true/false
 *      editNavigation: true/false
 *  }
 * ]
 * blogs: [
 *  {
 *      id: blogId
 *      isAdmin: true/false
 *      postPublish: true/false
 *      postDelete: true/false
 *      postEdit: true/false
 *      postAdd: true/false
 *  }
 * ]
 * staticPages: [
 *  {
 *      id: staticPageId
 *      isAdmin: true/false
 *  }
 * ]
 * 
 */

Role.initialSetup = function () {
    return new Promise(function (resolve, reject) {
        Role.find().count().exec()
            .then(function (count) {
                if (count === 0) {
                    const adminRole = new Role({ name: 'SuperAdmin', ACL: { isAdmin: true } });
                    adminRole.save(function (err) {
                        if (err) {
                            reject(err);
                            return;
                        }
                        resolve(adminRole);
                    });
                }
            })
            .catch(function (err) {
                reject(err);
            });
    });
};

Role.get = function (id, fields = 'name acl') {
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
