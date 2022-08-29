module.exports.isLoggedIn = (req,res,next)=>{
    if(!req.isAuthenticated()){
        req.session.returnTo = req.originalUrl
        req.flash('error', 'Please sign in before accessing it')
        return res.redirect('/login')
    }
    next()
}