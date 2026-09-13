import jsonwebtoken from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();


const secret = process.env.JWT_SECRET;

function createTokenForUser(user) {
    const payload = {
        id: user._id,
        email: user.email,
        fullname: user.fullname,
        profileImageUrl: user.profileImageUrl,
        role: user.role
    };

    const token = jsonwebtoken.sign(payload, secret);
    return token;
}


function validateToken(token) {
    try {
        const payload = jsonwebtoken.verify(token, secret);
        return payload;
    }
    catch (err) {
        console.error(err);
        return null;
    }
}


export { createTokenForUser, validateToken };