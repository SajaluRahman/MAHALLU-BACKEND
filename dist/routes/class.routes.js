"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const shared_config_1 = require("@mahallu/shared-config");
const Class_1 = require("../models/Class");
const Madrasa_1 = require("../models/Madrasa");
const errorHandler_1 = require("../middleware/errorHandler");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
router.get('/', (0, auth_1.authorize)(shared_config_1.PERMISSIONS.MADRASA_VIEW), async (req, res, next) => {
    try {
        const classes = await Class_1.Class.find({ tenantId: req.user.tenantId })
            .populate({
            path: 'teacherId',
            select: 'employeeId memberId',
            populate: {
                path: 'memberId',
                select: 'name'
            }
        })
            .sort({ level: 1 })
            .lean();
        res.json({ success: true, data: classes });
    }
    catch (e) {
        next(e);
    }
});
router.get('/:id', (0, auth_1.authorize)(shared_config_1.PERMISSIONS.MADRASA_VIEW), async (req, res, next) => {
    try {
        const classData = await Class_1.Class.findOne({ _id: req.params.id, tenantId: req.user.tenantId })
            .populate({
            path: 'teacherId',
            select: 'employeeId memberId subjects qualification',
            populate: {
                path: 'memberId',
                select: 'name photo phone email'
            }
        })
            .lean();
        if (!classData) {
            throw new errorHandler_1.AppError('Class not found', 404);
        }
        res.json({ success: true, data: classData });
    }
    catch (e) {
        next(e);
    }
});
router.post('/', (0, auth_1.authorize)(shared_config_1.PERMISSIONS.MADRASA_UPDATE), async (req, res, next) => {
    try {
        const tenantId = req.user.tenantId;
        // Get Madrasa
        const madrasa = await Madrasa_1.Madrasa.findOne({ tenantId });
        if (!madrasa) {
            throw new errorHandler_1.AppError('Madrasa not found for this tenant', 404);
        }
        const newClass = await Class_1.Class.create({
            ...req.body,
            tenantId,
            madrasaId: madrasa._id,
        });
        // Add to madrasa classes
        madrasa.classes.push(newClass._id);
        await madrasa.save();
        res.status(201).json({ success: true, data: newClass });
    }
    catch (e) {
        next(e);
    }
});
router.put('/:id', (0, auth_1.authorize)(shared_config_1.PERMISSIONS.MADRASA_UPDATE), async (req, res, next) => {
    try {
        const updated = await Class_1.Class.findOneAndUpdate({ _id: req.params.id, tenantId: req.user.tenantId }, { $set: req.body }, { new: true });
        res.json({ success: true, data: updated });
    }
    catch (e) {
        next(e);
    }
});
exports.default = router;
//# sourceMappingURL=class.routes.js.map