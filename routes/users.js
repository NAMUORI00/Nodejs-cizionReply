const express = require('express');
const router = express.Router();
const models = require("../models");

const jwt = require("jsonwebtoken");
const secretObj = require("../config/jwt");

// 회원가입 페이지 이동
router.get('/signUp', function(req, res, next) {
  res.render("signup");
});

// 회원가입
router.post("/signUp", function(req, res, next){
  let body = req.body;

  models.user.create({
    email: body.userEmail,
    password: body.password
  })
  .then(result => {
    res.redirect("/");
  })
  .catch(err => {
    console.log(err)
  });
});

// 로그인
router.post("/login", function(req, res, next){
  let token = jwt.sign({
        email: req.body.userEmail   // 토큰의 내용(payload)
      },
      secretObj.secret,             // 비밀 키
      {
        expiresIn: '10m'            // 유효시간 설정
      });

  // find
  models.user.findOne({
    where: {
      email: req.body.userEmail
    }
  })
  .then(user => {
    if(user.password === req.body.password){
      res.cookie("user", token);
      res.redirect("/posts");
    } else {
      res.redirect("/users/signUp");
    }
  });
});

module.exports = router;
