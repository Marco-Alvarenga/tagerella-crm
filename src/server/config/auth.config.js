// src/server/config/auth.config.js
const passport = require('passport');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const pool = require('./database');

const options = {
   jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
   secretOrKey: process.env.JWT_SECRET
};

passport.use(new JwtStrategy(options, async (payload, done) => {
   try {
       const result = await pool.query('SELECT * FROM usuario WHERE usuario_id = $1', [payload.id]);
       if (result.rows.length > 0) {
           return done(null, result.rows[0]);
       }
       return done(null, false);
   } catch (error) {
       return done(error, false);
   }
}));

// Adicionar ao server.js
app.use(passport.initialize());