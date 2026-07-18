import { Router } from 'express';
import mongoose from 'mongoose';
import { authenticate, authorize } from '../middleware/auth';
import { PERMISSIONS } from '@mahallu/shared-config';
import { Attendance } from '../models/Attendance';
import { AuthRequest } from '../middleware/auth';
import { AttendanceStatus } from '@mahallu/shared-types';
import dayjs from 'dayjs';
const r = Router();
r.use(authenticate);

r.post('/bulk', authorize(PERMISSIONS.ATTENDANCE_MARK), async (req: AuthRequest, res, next) => {
  try {
    const { records, classId, date, entityType } = req.body; // records: [{entityId, status}]
    const tenantId = req.user!.tenantId;
    const ops = records.map((record: { entityId: string; status: AttendanceStatus }) => ({
      updateOne: {
        filter: {
          tenantId: new mongoose.Types.ObjectId(tenantId),
          entityId: new mongoose.Types.ObjectId(record.entityId),
          date: new Date(date)
        },
        update: {
          $set: {
            tenantId: new mongoose.Types.ObjectId(tenantId),
            entityId: new mongoose.Types.ObjectId(record.entityId),
            entityType,
            classId: classId ? new mongoose.Types.ObjectId(classId) : undefined,
            date: new Date(date),
            status: record.status,
            markedById: new mongoose.Types.ObjectId(req.user!.userId)
          }
        },
        upsert: true,
      },
    }));
    await Attendance.bulkWrite(ops);
    res.json({ success: true, message: `${records.length} attendance records saved` });
  } catch (e) { next(e); }
});

r.get('/class/:classId', authorize(PERMISSIONS.ATTENDANCE_VIEW), async (req: AuthRequest, res, next) => {
  try {
    const { date } = req.query;
    const records = await Attendance.find({
      tenantId: req.user!.tenantId, classId: req.params.classId,
      date: date ? new Date(date as string) : { $gte: dayjs().startOf('day').toDate() },
    }).populate('entityId', 'name admissionNo').lean();
    res.json({ success: true, data: records });
  } catch (e) { next(e); }
});

r.get('/report', authorize(PERMISSIONS.ATTENDANCE_REPORTS), async (req: AuthRequest, res, next) => {
  try {
    const { classId, startDate, endDate, entityType } = req.query;
    const filter: Record<string, unknown> = { tenantId: req.user!.tenantId, entityType };
    if (classId) filter.classId = classId;
    if (startDate && endDate) filter.date = { $gte: new Date(startDate as string), $lte: new Date(endDate as string) };
    const data = await Attendance.aggregate([
      { $match: filter },
      { $group: { _id: { entityId: '$entityId', status: '$status' }, count: { $sum: 1 } } },
      { $group: { _id: '$_id.entityId', attendance: { $push: { status: '$_id.status', count: '$count' } } } },
    ]);
    res.json({ success: true, data });
  } catch (e) { next(e); }
});

export default r;
