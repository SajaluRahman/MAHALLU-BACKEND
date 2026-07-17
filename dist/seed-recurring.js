"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const Family_1 = require("./models/Family");
dotenv_1.default.config();
async function seedRecurring() {
    try {
        await mongoose_1.default.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');
        const families = await Family_1.Family.find({ isDeleted: { $ne: true } }).limit(5);
        if (families.length < 2) {
            console.log('Not enough families to seed. Please create families first.');
            process.exit(0);
        }
        // Assign Monthly to first 2 families
        for (let i = 0; i < 2; i++) {
            families[i].recurringDonationType = 'monthly';
            families[i].recurringDonationAmount = 500;
            families[i].outstandingBalance = 1500; // Unpaid (3 months due)
            await families[i].save();
            console.log(`Updated ${families[i].familyCode} to Monthly (Unpaid 1500)`);
        }
        // Assign Yearly to next 2 families
        for (let i = 2; i < 4 && i < families.length; i++) {
            families[i].recurringDonationType = 'yearly';
            families[i].recurringDonationAmount = 12000;
            families[i].outstandingBalance = 0; // Paid
            await families[i].save();
            console.log(`Updated ${families[i].familyCode} to Yearly (Paid)`);
        }
        console.log('✅ Seeding recurring donations completed successfully');
        process.exit(0);
    }
    catch (err) {
        console.error('Error seeding recurring donations:', err);
        process.exit(1);
    }
}
seedRecurring();
//# sourceMappingURL=seed-recurring.js.map