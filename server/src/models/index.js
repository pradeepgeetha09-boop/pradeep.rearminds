import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

export const User = sequelize.define('User', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name: { type: DataTypes.STRING(100), allowNull: false },
  email: { type: DataTypes.STRING(255), allowNull: false, unique: true, validate: { isEmail: true } },
  passwordHash: { type: DataTypes.STRING, allowNull: false },
  role: { type: DataTypes.ENUM('MANAGER', 'USER'), allowNull: false, defaultValue: 'USER' }
}, { defaultScope: { attributes: { exclude: ['passwordHash'] } } });

export const Task = sequelize.define('Task', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  title: { type: DataTypes.STRING(160), allowNull: false, validate: { notEmpty: true } },
  description: { type: DataTypes.TEXT, allowNull: true },
  status: { type: DataTypes.ENUM('TODO', 'IN_PROGRESS', 'COMPLETED'), allowNull: false, defaultValue: 'TODO' },
  dueDate: { type: DataTypes.DATEONLY, allowNull: true }
});

export const ActivityLog = sequelize.define('ActivityLog', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  action: { type: DataTypes.STRING(80), allowNull: false },
  details: { type: DataTypes.JSONB, allowNull: false, defaultValue: {} }
}, { updatedAt: false });

User.hasMany(Task, { as: 'createdTasks', foreignKey: { name: 'createdBy', allowNull: false } });
Task.belongsTo(User, { as: 'creator', foreignKey: 'createdBy' });
User.hasMany(Task, { as: 'assignedTasks', foreignKey: { name: 'assignedTo', allowNull: false } });
Task.belongsTo(User, { as: 'assignee', foreignKey: 'assignedTo' });
Task.hasMany(ActivityLog, { as: 'activity', foreignKey: { name: 'taskId', allowNull: false }, onDelete: 'CASCADE' });
ActivityLog.belongsTo(Task, { foreignKey: 'taskId' });
ActivityLog.belongsTo(User, { as: 'actor', foreignKey: { name: 'userId', allowNull: false } });

export { sequelize };
