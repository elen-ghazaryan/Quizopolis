export const authorize = (allowedRoles = []) => {
  return (req, res, next) => {
    if(!req.user) return res.status(401).send({ message: "Not authenticated user" })

    if(allowedRoles.length && !allowedRoles.includes(req.user.role)) {
      return res.status(403).send({ message: 'Forbidden: insufficient permissions'});
    }

    next()
  }
}