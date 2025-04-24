import { loadStripe } from '@stripe/stripe-js';

// Replace with your publishable key
const stripePromise = loadStripe('pk_test_51R6qvWGgEvMbvRSODC04sIqooNr7K4aZDGLEGLHfFNDh2Ix6WyygElGZLRLTWf1KNHVWkx87cyQhCJasgyLn2fsh00x96Fewxs');

export default stripePromise;