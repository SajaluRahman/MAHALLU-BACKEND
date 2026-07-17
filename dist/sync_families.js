"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const Member_1 = require("./models/Member");
const Family_1 = require("./models/Family");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config({ path: './.env' });
async function syncFamilies() {
    try {
        await mongoose_1.default.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mahallu');
        console.log('Connected to MongoDB');
        const membersWithFamilies = await Member_1.Member.find({ familyId: { $exists: true, $ne: null } });
        console.log(`Found ${membersWithFamilies.length} members with a familyId.`);
        let synced = 0;
        for (const member of membersWithFamilies) {
            const family = await Family_1.Family.findById(member.familyId);
            if (family) {
                const isMemberInFamily = family.members.some((fm) => fm.memberId && fm.memberId.toString() === member._id.toString());
                if (!isMemberInFamily) {
                    console.log(`Syncing member ${member.memberId} to family ${family.familyCode}`);
                    family.members.push({
                        memberId: member._id,
                        relationship: member.relationship || 'Member',
                        isHead: false,
                    });
                    await family.save();
                    synced++;
                }
            }
        }
        console.log(`Synced ${synced} missing members into their family arrays.`);
    }
    catch (error) {
        console.error('Error syncing:', error);
    }
    finally {
        await mongoose_1.default.disconnect();
        console.log('Disconnected from MongoDB');
    }
}
syncFamilies();
//# sourceMappingURL=sync_families.js.map