import { Router } from 'express';
import { Op } from 'sequelize';
import { Task, User, ActivityLog } from '../models/index.js';
import { authenticate, allowRoles } from '../middleware/auth.js';

const router = Router();
router.use(authenticate);

const includes = [
  { model: User, as: 'creator', attributes: ['id', 'name', 'email'] },
  { model: User, as: 'assignee', attributes: ['id', 'name', 'email'] }
];
const validStatuses = ['TODO', 'IN_PROGRESS', 'COMPLETED'];

async function logActivity(task, userId, action, details = {}) {
  return ActivityLog.create({ taskId: task.id, userId, action, details });
}
async function visibleTask(req, res) {
  const task = await Task.findByPk(req.params.id, { include: includes });
  if (!task) { res.status(404).json({ message: 'Task not found.' }); return null; }
  const allowed = req.user.role === 'MANAGER'
    ? task.createdBy === req.user.id
    : task.assignedTo === req.user.id;
  if (!allowed) { res.status(403).json({ message: 'You cannot access this task.' }); return null; }
  return task;
}

router.get('/users', allowRoles('MANAGER'), async (req, res, next) => {
  try {
    const users = await User.findAll({ where: { role: 'USER' }, attributes: ['id', 'name', 'email'], order: [['name', 'ASC']] });
    res.json({ users });
  } catch (err) { next(err); }
});

router.get('/', async (req, res, next) => {
  try {
    const where = req.user.role === 'MANAGER'
      ? { createdBy: req.user.id }
      : { assignedTo: req.user.id };
    const tasks = await Task.findAll({ where, include: includes, order: [['createdAt', 'DESC']] });
    res.json({ tasks });
  } catch (err) { next(err); }
});

router.post('/', allowRoles('MANAGER'), async (req, res, next) => {
  try {
    const { title, description = '', assignedTo, status = 'TODO', dueDate = null } = req.body;
    if (!title?.trim() || !assignedTo) return res.status(400).json({ message: 'Title and assignee are required.' });
    if (!validStatuses.includes(status)) return res.status(400).json({ message: 'Invalid task status.' });
    const assignee = await User.findByPk(assignedTo);
    if (!assignee || assignee.role !== 'USER') return res.status(400).json({ message: 'Choose a valid User account as assignee.' });
    const task = await Task.create({ title: title.trim(), description: description.trim(), assignedTo, createdBy: req.user.id, status, dueDate: dueDate || null });
    await logActivity(task, req.user.id, 'TASK_CREATED', { title: task.title, assignedTo });
    res.status(201).json({ task: await Task.findByPk(task.id, { include: includes }) });
  } catch (err) { next(err); }
});

router.get('/:id/activity', async (req, res, next) => {
  try {
    const task = await visibleTask(req, res);
    if (!task) return;
    const activity = await ActivityLog.findAll({
      where: { taskId: task.id },
      include: [{ model: User, as: 'actor', attributes: ['id', 'name', 'email'] }],
      order: [['createdAt', 'DESC']]
    });
    res.json({ activity });
  } catch (err) { next(err); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const task = await visibleTask(req, res);
    if (task) res.json({ task });
  } catch (err) { next(err); }
});

router.patch('/:id', async (req, res, next) => {
  try {
    const task = await Task.findByPk(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found.' });

    if (req.user.role === 'USER') {
      if (task.assignedTo !== req.user.id) return res.status(403).json({ message: 'You can update only your assigned tasks.' });
      const keys = Object.keys(req.body);
      if (keys.length !== 1 || keys[0] !== 'status') return res.status(403).json({ message: 'Users can update only task status.' });
      if (!validStatuses.includes(req.body.status)) return res.status(400).json({ message: 'Invalid task status.' });
      const oldStatus = task.status;
      task.status = req.body.status;
      await task.save();
      await logActivity(task, req.user.id, 'STATUS_CHANGED', { from: oldStatus, to: task.status });
    } else {
      if (task.createdBy !== req.user.id) return res.status(403).json({ message: 'Managers can edit only tasks they created.' });
      const allowedFields = ['title', 'description', 'assignedTo', 'status', 'dueDate'];
      if (Object.keys(req.body).some(k => !allowedFields.includes(k))) return res.status(400).json({ message: 'Unsupported field supplied.' });
      if (req.body.title !== undefined && !req.body.title.trim()) return res.status(400).json({ message: 'Title cannot be empty.' });
      if (req.body.status !== undefined && !validStatuses.includes(req.body.status)) return res.status(400).json({ message: 'Invalid task status.' });
      if (req.body.assignedTo !== undefined) {
        const assignee = await User.findByPk(req.body.assignedTo);
        if (!assignee || assignee.role !== 'USER') return res.status(400).json({ message: 'Choose a valid User account as assignee.' });
      }
      const before = { title: task.title, description: task.description, assignedTo: task.assignedTo, status: task.status, dueDate: task.dueDate };
      const updateData = { ...req.body };
      if (Object.prototype.hasOwnProperty.call(req.body, 'dueDate')) updateData.dueDate = req.body.dueDate || null;
      await task.update(updateData);
      const changes = {};
      for (const key of allowedFields) if (before[key] !== task[key]) changes[key] = { from: before[key], to: task[key] };
      if (Object.keys(changes).length) await logActivity(task, req.user.id, changes.assignedTo ? 'TASK_REASSIGNED' : 'TASK_UPDATED', changes);
    }
    res.json({ task: await Task.findByPk(task.id, { include: includes }) });
  } catch (err) { next(err); }
});

router.delete('/:id', allowRoles('MANAGER'), async (req, res, next) => {
  try {
    const task = await Task.findByPk(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found.' });
    if (task.createdBy !== req.user.id) return res.status(403).json({ message: 'Managers can delete only tasks they created.' });
    await ActivityLog.destroy({ where: { taskId: task.id } });
    await task.destroy();
    res.json({ message: 'Task deleted.' });
  } catch (err) { next(err); }
});

export default router;
