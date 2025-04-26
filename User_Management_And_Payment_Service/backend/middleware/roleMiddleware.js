const roleCheck = (roles = []) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ 
                success: false, 
                message: 'Unauthorized - Authentication required' 
            });
        }
        
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ 
                success: false, 
                message: 'Forbidden - Insufficient permissions' 
            });
        }
        
        next();
    };
};

module.exports = roleCheck;