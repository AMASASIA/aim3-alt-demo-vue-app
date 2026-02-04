/**
 * Stripe Payment Service
 * Node.js adaptation of the "One Strike" payment logic.
 */

const executeStripePayment = async (amount, currency = "jpy", email) => {
    const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;

    if (!STRIPE_SECRET_KEY || STRIPE_SECRET_KEY.includes('placeholder')) {
        console.warn('[Stripe] Mock Mode: No valid key found. Returning success.');
        return {
            id: `pi_mock_${Date.now()}`,
            status: 'succeeded',
            amount,
            currency
        };
    }

    const url = "https://api.stripe.com/v1/payment_intents";

    // Construct form-urlencoded body
    const params = new URLSearchParams();
    params.append('amount', amount);
    params.append('currency', currency);
    params.append('payment_method_types[]', 'card');
    if (email) params.append('receipt_email', email);
    params.append('description', 'AMAS Agentic Commerce Purchase');

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: params
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error?.message || 'Stripe API Error');
        }

        return data;
    } catch (error) {
        console.error('[Stripe] Execution Failed:', error);
        throw error;
    }
};

module.exports = { executeStripePayment };
