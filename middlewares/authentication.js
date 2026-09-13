import { validateToken } from "../services/authentication.js";

function checkForAuthenticationCookie(cookieName) {
    return function (req, res, next) {
        const tokenCookieValue = req.cookies && req.cookies[cookieName];
        if (!tokenCookieValue) {
            return res.status(401).send("Unauthorized: No token provided");
        }

        try {
            const userPayload = validateToken(tokenCookieValue);
            if (!userPayload) {
                return res.status(401).send("Unauthorized: Invalid token");
            }
            console.log("userPayload:- ", userPayload);
            
            req.user = userPayload;
            return next();
        } catch (err) {
            console.error(err);
            return res.status(500).send("Internal Server Error");
        }
    };
}

export { checkForAuthenticationCookie };