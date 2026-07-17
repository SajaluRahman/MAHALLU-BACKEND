"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const dashboard_controller_1 = require("../controllers/dashboard.controller");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
router.get('/kpis', dashboard_controller_1.DashboardController.getKPIs);
router.get('/charts/income-expense', dashboard_controller_1.DashboardController.getIncomeExpenseChart);
router.get('/charts/attendance', dashboard_controller_1.DashboardController.getAttendanceChart);
router.get('/charts/member-growth', dashboard_controller_1.DashboardController.getMemberGrowthChart);
router.get('/recent-activity', dashboard_controller_1.DashboardController.getRecentActivity);
exports.default = router;
//# sourceMappingURL=dashboard.routes.js.map