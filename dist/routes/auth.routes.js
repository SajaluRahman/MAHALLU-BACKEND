"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const auth_1 = require("../middleware/auth");
const rateLimiter_1 = require("../middleware/rateLimiter");
const shared_types_1 = require("@mahallu/shared-types");
const router = (0, express_1.Router)();
// Public routes
router.post('/login', rateLimiter_1.authRateLimiter, auth_controller_1.AuthController.login);
router.post('/refresh', auth_controller_1.AuthController.refresh);
// Protected routes
router.use(auth_1.authenticate);
router.post('/logout', auth_controller_1.AuthController.logout);
router.get('/me', auth_controller_1.AuthController.me);
router.post('/2fa/setup', auth_controller_1.AuthController.setup2FA);
router.post('/2fa/verify', auth_controller_1.AuthController.verify2FA);
router.post('/change-password', auth_controller_1.AuthController.changePassword);
router.patch('/fcm-token', auth_controller_1.AuthController.updateFCMToken);
router.post('/:memberId/admin-reset-password', (0, auth_1.authorizeRoles)(shared_types_1.UserRole.SUPER_ADMIN, shared_types_1.UserRole.SECRETARY), auth_controller_1.AuthController.adminResetPassword);
exports.default = router;
//# sourceMappingURL=auth.routes.js.map