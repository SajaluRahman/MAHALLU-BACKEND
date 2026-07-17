"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const member_controller_1 = require("../controllers/member.controller");
const auth_1 = require("../middleware/auth");
const shared_config_1 = require("@mahallu/shared-config");
const requestLogger_1 = require("../middleware/requestLogger");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
router.get('/stats', (0, auth_1.authorize)(shared_config_1.PERMISSIONS.MEMBER_VIEW), member_controller_1.MemberController.getStats);
router.get('/search', (0, auth_1.authorize)(shared_config_1.PERMISSIONS.MEMBER_VIEW), member_controller_1.MemberController.search);
router.get('/', (0, auth_1.authorize)(shared_config_1.PERMISSIONS.MEMBER_VIEW), member_controller_1.MemberController.getAll);
router.get('/:id', (0, auth_1.authorize)(shared_config_1.PERMISSIONS.MEMBER_VIEW), member_controller_1.MemberController.getById);
router.get('/:id/qr-card', (0, auth_1.authorize)(shared_config_1.PERMISSIONS.MEMBER_VIEW), member_controller_1.MemberController.getQRCard);
router.post('/', (0, auth_1.authorize)(shared_config_1.PERMISSIONS.MEMBER_CREATE), (0, requestLogger_1.auditLog)('Member', 'CREATE'), member_controller_1.MemberController.create);
router.put('/:id', (0, auth_1.authorize)(shared_config_1.PERMISSIONS.MEMBER_UPDATE), (0, requestLogger_1.auditLog)('Member', 'UPDATE'), member_controller_1.MemberController.update);
router.delete('/:id', (0, auth_1.authorize)(shared_config_1.PERMISSIONS.MEMBER_DELETE), (0, requestLogger_1.auditLog)('Member', 'DELETE'), member_controller_1.MemberController.delete);
exports.default = router;
//# sourceMappingURL=member.routes.js.map