const prisma = require('../config/db');
const { hashPassword } = require('../utils/password');
const { success, error } = require('../utils/apiResponse');

async function createUser(req, res) {
  try {
    const { email, name, role, batchId, primaryMentorId } = req.validated;

    if (req.user.role === 'MENTOR' && role !== 'INTERN') {
      return error(res, 'Mentors can only create intern accounts', 403);
    }
    if (req.user.role === 'ADMIN' && role === 'ADMIN') {
      return error(res, 'Cannot create admin accounts via API', 403);
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return error(res, 'Email already exists', 409);

    const tempPassword = Math.random().toString(36).slice(-10);
    const passwordHash = await hashPassword(tempPassword);

    const user = await prisma.user.create({
      data: {
        email,
        name,
        role,
        passwordHash,
        batchId: batchId || null,
        primaryMentorId: primaryMentorId || null,
        status: 'INVITED',
        forcePasswordChange: true,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        batchId: true,
        createdAt: true,
      },
    });

    if (role === 'INTERN' && (primaryMentorId || req.user.role === 'MENTOR')) {
      const mentorId = primaryMentorId || req.user.id;
      await prisma.mentorIntern.create({
        data: { mentorId, internId: user.id, isPrimary: true },
      });
    }

    return success(res, { user, tempPassword }, 201);
  } catch (err) {
    return error(res, 'Failed to create user', 500);
  }
}

async function listUsers(req, res) {
  try {
    const { role, batchId, status } = req.query;
    const where = {};

    if (role) where.role = role;
    if (batchId) where.batchId = batchId;
    if (status) where.status = status;

    if (req.user.role === 'MENTOR') {
      const assignments = await prisma.mentorIntern.findMany({
        where: { mentorId: req.user.id },
        select: { internId: true },
      });
      where.id = { in: assignments.map((a) => a.internId) };
      where.role = 'INTERN';
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        avatarUrl: true,
        batchId: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return success(res, users);
  } catch (err) {
    return error(res, 'Failed to list users', 500);
  }
}

async function getUser(req, res) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        avatarUrl: true,
        batchId: true,
        primaryMentorId: true,
        forcePasswordChange: true,
        createdAt: true,
        batch: { select: { id: true, name: true } },
      },
    });
    if (!user) return error(res, 'User not found', 404);
    return success(res, user);
  } catch (err) {
    return error(res, 'Failed to get user', 500);
  }
}

async function updateUser(req, res) {
  try {
    const { name, status, batchId, primaryMentorId } = req.validated;

    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: {
        ...(name && { name }),
        ...(status && { status }),
        ...(batchId !== undefined && { batchId }),
        ...(primaryMentorId !== undefined && { primaryMentorId }),
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        batchId: true,
        primaryMentorId: true,
      },
    });

    return success(res, user);
  } catch (err) {
    return error(res, 'Failed to update user', 500);
  }
}

async function deleteUser(req, res) {
  try {
    await prisma.user.update({
      where: { id: req.params.id },
      data: { status: 'REMOVED' },
    });
    return success(res, { message: 'User deactivated' });
  } catch (err) {
    return error(res, 'Failed to deactivate user', 500);
  }
}

module.exports = { createUser, listUsers, getUser, updateUser, deleteUser };
