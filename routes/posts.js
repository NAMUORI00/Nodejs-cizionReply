const express = require('express');
const router = express.Router();
const models = require("../models");

// 게시글 목록 조회
router.get('/', function(req, res, next) {
    models.post.findAll().then(result => {
        res.render("list", {
            posts: result
        });
    });
});

// 게시글 등록
router.post('/', function(req, res, next) {
    const auther = auth(req);

    models.post.create({
        userEmail: auther,
        title: req.body.inputTitle
    })
    .then(result => {
        res.redirect("/posts");
    })
    .catch(err => {
        console.log(err);
    });
});

module.exports = router;