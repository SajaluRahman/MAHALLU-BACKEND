"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const registration_controller_1 = require("../controllers/registration.controller");
const auth_1 = require("../middleware/auth");
const shared_types_1 = require("@mahallu/shared-types");
const router = (0, express_1.Router)();
// Public route for mobile app
router.post('/submit', registration_controller_1.submitRegistration);
// Protected admin routes
router.use(auth_1.authenticate);
router.use((0, auth_1.authorize)(shared_types_1.UserRole.SUPER_ADMIN, shared_types_1.UserRole.SECRETARY));
router.get('/pending', registration_controller_1.getPendingRegistrations);
router.post('/:id/approve', registration_controller_1.approveRegistration);
router.post('/:id/reject', registration_controller_1.rejectRegistration);
exports.default = router;
//# sourceMappingURL=registration.routes.js.map