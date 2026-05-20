const jwt = require("jsonwebtoken");

const SECRET = "SECRET_KEY_DKV";

const authMiddleware = (req,res,next)=>{

  const authHeader = req.headers.authorization;

  if(!authHeader){
    return res.status(401).json({
      message:"Token tidak ada"
    });
  }

  const token = authHeader.split(" ")[1];

  try{

    const decoded = jwt.verify(token,SECRET);

    req.user = decoded;

    next();

  }catch(err){

    return res.status(401).json({
      message:"Token tidak valid"
    });

  }

};

module.exports = authMiddleware;