export const isEmailVerified = async (req, res, next) => {
  const user = req.user
  if(!user.isEmailVerified) {
    return res.status(403).send({ message: "First verify your email to continue"})
  }

  next()
}