require("dotenv").config();

export const jwtConstants = {
    secret: process.env.ACCESS_SECRET_KEY,
  };