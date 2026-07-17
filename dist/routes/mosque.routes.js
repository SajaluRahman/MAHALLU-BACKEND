"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const shared_config_1 = require("@mahallu/shared-config");
const Mosque_1 = require("../models/Mosque");
const axios_1 = __importDefault(require("axios"));
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
router.get('/', (0, auth_1.authorize)(shared_config_1.PERMISSIONS.MEMBER_VIEW), async (req, res, next) => {
    try {
        const mosque = await Mosque_1.Mosque.findOne({ tenantId: req.user.tenantId })
            .populate('imamId muazzinId committee.memberId', 'name phone photo').lean();
        res.json({ success: true, data: mosque });
    }
    catch (e) {
        next(e);
    }
});
router.post('/', (0, auth_1.authorize)(shared_config_1.PERMISSIONS.SETTINGS_MANAGE), async (req, res, next) => {
    try {
        const mosque = await Mosque_1.Mosque.findOneAndUpdate({ tenantId: req.user.tenantId }, { ...req.body, tenantId: req.user.tenantId }, { upsert: true, new: true });
        res.json({ success: true, data: mosque });
    }
    catch (e) {
        next(e);
    }
});
router.get('/prayer-times', (0, auth_1.authorize)(shared_config_1.PERMISSIONS.MEMBER_VIEW), async (req, res, next) => {
    try {
        const { lat = '11.0168', lng = '76.9558', method = 1 } = req.query;
        const date = new Date();
        const response = await axios_1.default.get(`https://api.aladhan.com/v1/timings/${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}?latitude=${lat}&longitude=${lng}&method=${method}`);
        res.json({ success: true, data: response.data.data.timings });
    }
    catch (e) {
        next(e);
    }
});
exports.default = router;
//# sourceMappingURL=mosque.routes.js.map