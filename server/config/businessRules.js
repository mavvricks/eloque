// Eloquente Catering - Business Logic & Constants

const BusinessRules = {
    // 1. Staffing Calculation
    // Rule: Base 3 staff for 50 pax. Add 1 staff for every 25 additional pax.
    calcStaff: (pax) => {
        if (pax <= 50) return 3;
        const additionalPax = pax - 50;
        const additionalStaff = Math.ceil(additionalPax / 25);
        return 3 + additionalStaff;
    },

    // 2. Fees
    FEES: {
        highRiseServiceFee: 0.03, // 3%
        outOfTownFee: 0.20        // 20%
    },

    // 3. Payment Terms
    // Standard breakdown: 10% down, 40% 2nd, 30% 3rd, 20% final
    PAYMENT_TERMS: [0.10, 0.40, 0.30, 0.20]
};

module.exports = BusinessRules;
