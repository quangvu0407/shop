import passport from "passport";
import { Strategy as FacebookStrategy } from "passport-facebook";
import userModel from "../models/userModel.js";

passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_APP_ID,
      clientSecret: process.env.FACEBOOK_APP_SECRET,
      callbackURL: process.env.FACEBOOK_CALLBACK_URL || "/user/auth/facebook/callback",
      profileFields: ["id", "displayName", "email"],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email =
          profile.emails?.[0]?.value || `fb_${profile.id}@facebook.com`;

        let user = await userModel.findOne({ facebookId: profile.id });

        if (!user) {
          // Nếu email đã tồn tại thì liên kết tài khoản
          user = await userModel.findOne({ email });
          if (user) {
            user.facebookId = profile.id;
            await user.save();
          } else {
            user = await userModel.create({
              name: profile.displayName,
              email,
              password: "FACEBOOK_OAUTH_NO_PASSWORD",
              facebookId: profile.id,
            });
          }
        }

        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

export default passport;
