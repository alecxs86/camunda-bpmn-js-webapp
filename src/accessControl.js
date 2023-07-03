const jwt = require('jsonwebtoken');

export default function checkAccess(token) {
    
    return new Promise((resolve, reject) => {
        // Verify the token and get the payload
        jwt.verify(token, 'YOUR_SECRET_KEY', (err, decoded) => {
        if (err) {
            // Return an error response if the token is invalid or expired
            console.log('token invalid or expired');
            resolve(false);
        } else {
            // Get the expiration time from the payload
            const { iat, exp } = decoded;
    
            // Get the current time
            const now = Math.floor(Date.now() / 1000);

            console.log(now);
    
            // Check if the current time is within the booked timeslot
            if (iat < now && now < exp) {
            // Call the next middleware or route handler
            console.log
            resolve(true);
            } else {
            // Return an error response if the current time is outside the booked timeslot
            resolve(false);
            }
        }
        });
    });
}