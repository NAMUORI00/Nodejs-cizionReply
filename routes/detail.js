const express = require('express');
const router = express.Router();
const models = require("../models");

const auth = require("./func/auth");
const replyConfig = require("./func/replyConfig");

// 도배방지 카운트(10 미만)
const spamCnt = replyConfig.spamCnt;
// 금지어 리스트
const badWords = replyConfig.badWords;

// 글 상세페이지 조회
router.get('/:id', function(req, res, next) {
    const postID = req.params.id;
    // 게시글 정보
    models.post.findOne({
        where: {id: postID}
    })
    .then(result1 => {
        // 댓글 정보
        models.reply.findAll({
            where: {postId: postID}
        })
        .then(result2 => {
            res.render("detail", {
                post: result1,
                replies: result2
            });
        })
        .catch(function(err){
            console.log(err);
        });
    })
    .catch(err => {
        console.log(err);
    });
});

// 댓글 등록
router.post("/reply", function(req, res, next){
    const auther = auth(req);
    const body = req.body;
    
    // 도배 방지
    models.reply.findAll({
        where: {postId: body.postID},
        limit: 10,
        order: [['createdAt', 'DESC']]
    })
    .then(results => {
        let hitCnt = 0;
        for(let idx in results){
            if(results[idx].dataValues.userEmail === auther) hitCnt++;
        }

        if(hitCnt < spamCnt){
            // 금지어 필터
            const filterContent = body.replyContent;
            let badFilter = false;

            for(let idx in badWords){
                if(filterContent.includes(badWords[idx])){
                    badFilter = true;
                    break;
                }
            }

            if(badFilter === false){
                // 등록
                models.reply.create({
                    postId: body.postID,
                    userEmail: auther,
                    content: filterContent
                })
                .then(results => {
                    res.redirect("/detail/" + body.postID);
                })
                .catch(err => {
                    console.log(err);
                });
            } else {
                console.log("금지어가 발견되었습니다.");
                res.json({status: "Bad word found"});
            }
            
        } else {
            console.log("도배 방지!");
            res.json({status: "Chat is limited"});
        }
    })
    .catch(function(err){
        console.log(err);
    });
});

// 댓글 삭제
router.delete('/reply/:id', function(req, res, next) {
    const auther = auth(req);
    const replyID = req.params.id;

    if(auther === req.body.replyWriterId){
        models.like.destroy({
            where: {replyId: replyID}
        })
        .then(result1 => {
            models.reply.destroy({
                where: {id: replyID}
            })
            .then(result2 => {
                res.redirect("/detail/" + req.body.postID);
            })
            .catch(err => {
                console.log(err);
            });
        })
        .catch(err => {
            console.log(err);
        });
    } else {
        console.log("권한이 없습니다.");
        res.json({status: "No permission"});
    }
});

// 수정 페이지로 이동
router.get('/edit/:postId/:replyId', function(req, res, next) {
    const auther = auth(req);
    const postID = req.params.postId;
    const replyID = req.params.replyId;

    models.reply.findOne({
        where: {id: replyID}
    })
    .then(result => {
        if(auther === result.userEmail){
            res.render("edit", {
                reply: result,
                postId: postID
            });
        } else {
            console.log("권한이 없습니다.");
            res.json({status: "No permission"});
        }
    })
    .catch(err => {
        console.log(err);
    });
});

// 댓글 수정
router.put('/reply/:replyId', function(req, res, next) {
    const auther = auth(req);
    const replyID = req.params.replyId;
    
    if(auther === req.body.replyWriterId){
        // 금지어 필터
        const filterContent = req.body.editContent;
        let badFilter = false;

        for(let idx in badWords){
            if(filterContent.includes(badWords[idx])){
                badFilter = true;
                break;
            }
        }

        if(badFilter === false){
            // 수정
            models.reply.update({
                content: req.body.editContent
            },{
                where: {id: replyID}
            })
            .then(result => {
                res.redirect("/detail/" + req.body.postID);
            })
            .catch(err => {
                console.log(err);
            });
        } else {
            console.log("금지어가 발견되었습니다.");
            res.json({status: "Bad word found"});
        }
    } else {
        console.log("권한이 없습니다.");
        res.json({status: "No permission"});
    }
});

// 좋아요 혹은 싫어요 기록을 조회하고, 없으면 생성
function historySearch(replyID, writerEmail, Status) {
    return new Promise(function(resolve, reject){
        models.like.findOne({
            where: {
                replyId: replyID,
                userEmail: writerEmail
            }
        })
        .then(result1 => {
            if(result1 !== null){
                resolve({stat:"old", obj:result1.dataValues});
            } else {
                models.like.create({
                    replyId: replyID,
                    userEmail: writerEmail,
                    status: Status
                })
                .then(result2 => {
                    resolve({stat:"new", obj:result2.dataValues});
                })
                .catch(err => {
                    console.log(err);
                });
            }
        })
        .catch(err => {
            console.log(err);
        });
    });
}

// 좋아요
router.post("/like/:replyId", async function(req, res, next){
    const auther = auth(req);
    const replyID = req.params.replyId;

    const history = await historySearch(replyID, auther, "LIKE");

    const historyStatus = history.stat;  // 생성 혹은 조회 결과여부
    const historyResult = history.obj;   // 반환 객체

    if(historyStatus === "new"){
        models.reply.update({
            likeCount: Number(req.body.likeCnt) + 1
        },{
            where: {id: replyID}
        })
        .then(result => {
            res.redirect("/detail/" + req.body.postID);
        })
        .catch(err => {
            console.log(err);
        });
    } else {
        if(historyResult.status === "LIKE"){
            models.reply.update({
                likeCount: Number(req.body.likeCnt) - 1
            },{
                where: {id: replyID}
            })
            .then(result1 => {
                models.like.destroy({
                    where: {id: historyResult.id}
                })
                .then(result2 => {
                    res.redirect("/detail/" + req.body.postID);
                })
                .catch(err => {
                    console.log(err);
                });
            })
            .catch(err => {
                console.log(err);
            });
        } else {
            models.reply.update({
                likeCount: Number(req.body.likeCnt) + 1,
                unlikeCount: Number(req.body.unlikeCnt) - 1
            },{
                where: {id: replyID}
            })
            .then(result1 => {
                models.like.update({
                    status: "LIKE"
                },{
                    where: {id: historyResult.id}
                })
                .then(result2 => {
                    res.redirect("/detail/" + req.body.postID);
                })
                .catch(err => {
                    console.log(err);
                });
            })
            .catch(err => {
                console.log(err);
            });
        }
    }
});

// 싫어요
router.post("/unlike/:replyId", async function(req, res, next){
    const auther = auth(req);
    const replyID = req.params.replyId;

    const history = await historySearch(replyID, auther, "UNLIKE");

    const historyStatus = history.stat;  // 생성 혹은 조회 결과여부
    const historyResult = history.obj;   // 반환 객체

    if(historyStatus === "new"){
        models.reply.update({
            unlikeCount: Number(req.body.unlikeCnt) + 1
        },{
            where: {id: replyID}
        })
        .then(result => {
            res.redirect("/detail/" + req.body.postID);
        })
        .catch(err => {
            console.log(err);
        });
    } else {
        if(historyResult.status === "UNLIKE"){
            models.reply.update({
                unlikeCount: Number(req.body.unlikeCnt) - 1
            },{
                where: {id: replyID}
            })
            .then(result1 => {
                models.like.destroy({
                    where: {id: historyResult.id}
                })
                .then(result2 => {
                    res.redirect("/detail/" + req.body.postID);
                })
                .catch(err => {
                    console.log(err);
                });
            })
            .catch(err => {
                console.log(err);
            });
        } else {
            models.reply.update({
                likeCount: Number(req.body.likeCnt) - 1,
                unlikeCount: Number(req.body.unlikeCnt) + 1
            },{
                where: {id: replyID}
            })
            .then(result1 => {
                models.like.update({
                    status: "UNLIKE"
                },{
                    where: {id: historyResult.id}
                })
                .then(result2 => {
                    res.redirect("/detail/" + req.body.postID);
                })
                .catch(err => {
                    console.log(err);
                });
            })
            .catch(err => {
                console.log(err);
            });
        }
    }
});

module.exports = router;