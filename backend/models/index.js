const User = require('./User');
const Role = require('./Role');
const Department = require('./Department');
const Designation = require('./Designation');
const Shift = require('./Shift');
const AttendanceLog = require('./AttendanceLog');
const Location = require('./Location');
const Holiday = require('./Holiday');
const ApiToken = require('./ApiToken');
const UserDeviceToken = require('./UserDeviceToken');
const LocationHistory = require('./LocationHistory');
const Leave = require('./Leave');
const LeaveType = require('./LeaveType');

// Define Associations
User.belongsTo(Role, { foreignKey: 'roleId' });
Role.hasMany(User, { foreignKey: 'roleId' });

User.belongsTo(Department, { foreignKey: 'departmentId' });
Department.hasMany(User, { foreignKey: 'departmentId' });

User.belongsTo(Designation, { foreignKey: 'designationId' });
Designation.hasMany(User, { foreignKey: 'designationId' });

User.belongsTo(Shift, { foreignKey: 'shiftId' });
Shift.hasMany(User, { foreignKey: 'shiftId' });

AttendanceLog.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(AttendanceLog, { foreignKey: 'userId' });

ApiToken.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(ApiToken, { foreignKey: 'userId' });

UserDeviceToken.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(UserDeviceToken, { foreignKey: 'userId' });

LocationHistory.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(LocationHistory, { foreignKey: 'userId' });

Leave.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(Leave, { foreignKey: 'userId' });

Leave.belongsTo(LeaveType, { foreignKey: 'leaveTypeId' });
LeaveType.hasMany(Leave, { foreignKey: 'leaveTypeId' });

module.exports = {
    User,
    Role,
    Department,
    Designation,
    Shift,
    AttendanceLog,
    Location,
    Holiday,
    ApiToken,
    UserDeviceToken,
    LocationHistory,
    Leave,
    LeaveType,
};