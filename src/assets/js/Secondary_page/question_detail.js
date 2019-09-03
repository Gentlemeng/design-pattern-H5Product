$(function() {
    
    var paramObj = {
        url: newCmsUrl,
        token: '',
        mescroll: {},
        questionId: parseURL(window.location.search).fInfoId,
        // pageSize:3,
        //"answer"是回答，"answer_comment"是回答的回复，"comment_insert"是回答回复的回复
        fFlag: "answer",
        fParentId: "",
        fFid: "",
        fCommentId: '',
    };
    //获取token
    var sessionData = sessionStorage.getItem("Authentication");
    if (sessionData != null && JSON.parse(sessionData).data != undefined) {
        paramObj.token = JSON.parse(sessionData).data;
    }
    //处理返回按钮url
    var questionSource = sessionStorage.getItem("questionSource");
    if (questionSource) {
        $(".back").attr({ "href": questionSource });
    }
    getQuestionInfo();
    //初始化懒加载
    var answerScrollDom = document.getElementsByClassName("question_detail")[0];
    paramObj.mescroll.answerMescroll = new MeScroll(answerScrollDom, {
        down: {
            use: false
        },
        up: {
            callback: answerCallback, //上拉加载的回调
            // isBounce: false, //此处禁止ios回弹,解析(务必认真阅读,特别是最后一点): http://www.mescroll.com/qa.html#q10
            page: {
                num: 0,
                size: 8
            },
            clearEmptyId: "answerUl",
            noMoreSize: 1,
            htmlNodata: '<p class="upwarp-nodata">无更多回答</p>',
            empty: {
                tip: "无更多回答" //提示
            },
            lazyLoad: {
                use: true
            }
        }
    })
    //点击非输入框区域和非回复按钮，切换成回答问题
    $(".question_detail").on("click",function(event){
        if(!$(event.target).hasClass("reply_btn")){
            $("#txt").attr({"placeholder":"回答问题"})
        }
    })
    //收缩展开回答的回复
    $(".answer_ul").on("click",".comment_show_btn",function(){
        var replyUl = $(this).siblings(".answer_response_ul");
        if(replyUl.is(":visible")){
            replyUl.hide();
        }else{
            var answerId = $(this).parents(".answer_list").attr("id");
            reqReplyForAnswer(answerId);        
            replyUl.show();
        }
        $(this).find(".comment_arrow").toggleClass("comment_arrow_up").toggleClass("comment_arrow_down");
    })
    //回答的回复
    $(".answer_ul").on("click", ".answer_comment", function() {
            var fParentId = $(this).attr("fCommentId"),
                fFid = $(this).attr("fFid");
            var speak = $.trim($(this).parents(".answer_list").find(".user_name").text());
            $("#txt").attr({ "placeholder": `回复${speak}` })
            $("#txt").focus();
            paramObj.fFlag = "answer_comment";
            paramObj.fParentId = fParentId;
            paramObj.fFid = fFid;
        })
        //回答回复的回复
    $(".answer_ul").on("click", ".response_btn", function() {
            var fParentId = $(this).parent().attr("fCommentId"),
                fFid = $(this).parent().attr("fFid");
            $("#txt").focus();
            var speak = $.trim($(this).parent().find(".act_response").text());
            $("#txt").attr({ "placeholder": `回复${speak}` })
            paramObj.fFlag = "comment_insert";
            paramObj.fParentId = fParentId;
            paramObj.fFid = fFid;
        })
        //onfocus
    var interval;
    $("#txt").on("focus", function() {
            clearTimeout(interval);
            if (sessionData == null || JSON.parse(sessionData).data == undefined) {
                interval = setTimeout(function() {
                    document.body.scrollTop = document.body.scrollHeight
                }, 0)
                $("#txt").blur();
                dialogConfirm("请先登录再评论或回复");
            }
        })
        //键盘回弹
    $('#txt').on('blur', function() {
        window.scroll(0, 0);
        // $(this).attr({"placeholder":"回答问题"})
    });
    // 回复or发表回答问题
    $(".publish .send").click(function() {
            if (sessionData == null || JSON.parse(sessionData).data == undefined) {
                dialogConfirm(`未登录或登录信息失效，请点击“确定”重新登录`);
                return
            }
            var value = $.trim($("#txt").val());
            if (value === "") {
                dialogAlert(`内容不能为空`);
            } else {
                var placeholder = $("#txt").attr("placeholder");

                //回答问题
                if (placeholder.indexOf("回复") === -1) {
                    answerQuestion(value);
                }
                //回答的回复、回答的回复的回复
                else {
                    commentInsert(value);
                }
                $("#txt").val("");
                paramObj.fFlag = "answer"
                $("#txt").attr({ "placeholder": "回答问题" })
            }
        })
        //请求问题详情
    function getQuestionInfo() {
        $.ajax({
            url: paramObj.url + "question/detail",
            beforeSend: function(xhr) {
                xhr.setRequestHeader("Authentication", paramObj.token);
            },
            data: {
                infoId: paramObj.questionId,
                page: 1
            },
            success: function(result) {
                // console.log(JSON.stringify(result));
                if (result.status === "200") {
                    var questionInfo = result.body;
                    var publishTime = questionInfo.publishTime;
                    var timeTempArr = publishTime.split(":")
                        timeTempArr.pop()
                        publishTime = timeTempArr.join(":")
                    var questionStr = `<div class="question_con">
                                        <p class="question_title">${questionInfo.fTitle}</p>
                                    </div>
                                    <div class="question_bottom">
                                        <div class="question_asker_wrap">
                                            <p class="question_asker col_1_hide">${questionInfo.asker}</p>
                                            <p>提问</p>
                                        </div>
                                        <div class="question_reply">
                                            <em class="reply_num">${questionInfo.count}</em>
                                            <span class="reply_text">个回答</span>
                                        </div>
                                    </div>
                                    <div class="question_time">${publishTime}</div>`;

                    $(".question_info_wrap").append(questionStr);
                }
            },
            error: function(err) {
                dialogAlert(`请求问题详情数据失败，请稍后重试。`);
            }
        })
    }
    //回答问题
    function answerQuestion(value) {
        $.ajax({
            url: paramObj.url + "question/answer",
            beforeSend: function(xhr) {
                xhr.setRequestHeader("Authentication", paramObj.token);
            },
            data: {
                fFid: paramObj.questionId,
                fText: value
            },
            success: function(result) {
                if (result.status === "200") {
                    dialogAlert(`回答已提交，待系统审核。`)
                    $("#txt").val("");
                } else if (result.status === "401") {
                    dialogConfirm(`未登录或登录信息失效，请点击“确定”重新登录`)
                }
            },
            error: function(err) {
                dialogAlert(`回答问题失败，请稍后重试。`)
            }
        })
    }
    //添加回答的回复 和 添加回答回复的回复
    function commentInsert(value) {
        $.ajax({
            url: paramObj.url + "question/answer/comment/insert",
            beforeSend: function(xhr) {
                xhr.setRequestHeader("Authentication", paramObj.token);
            },
            data: {
                fParentId: paramObj.fParentId,
                fFid: paramObj.fFid,
                fText: value
            },
            success: function(result) {
                if (result.status === "200") {
                    dialogAlert(`回复已提交，待系统审核。`);
                    $("#txt").val("");
                    paramObj.fFlag = "answer";
                } else if (result.status === "401") {
                    dialogConfirm(`操作失败，请点击“确定”重新登录`);
                }
            },
            error: function(err) {
                dialogAlert(`回复失败，请稍后重试。`);
            }
        })
    }

    function answerCallback(page) {
        getMoreAnswer({
            pageNum: page.num,
            successCallback: function(curPageData) {
                //联网成功的回调,隐藏下拉刷新和上拉加载的状态;
                //mescroll会根据传的参数,自动判断列表如果无任何数据,则提示空;列表无下一页数据,则提示无更多数据;
                // console.log("page.num="+page.num+", page.size="+page.size+", curPageData.length="+curPageData.length);
                //方法四 (不推荐),会存在一个小问题:比如列表共有20条数据,每页加载10条,共2页.如果只根据当前页的数据个数判断,则需翻到第三页才会知道无更多数据,如果传了hasNext,则翻到第二页即可显示无更多数据.
                paramObj.mescroll.answerMescroll.endSuccess(curPageData.length);

                //设置列表数据,因为配置了emptyClearId,第一页会清空dataList的数据,所以setListData应该写在最后;
                appendAnswer(curPageData, page.num);
            },
            errorCallback: function() {
                //联网失败的回调,隐藏下拉刷新和上拉加载的状态;
                paramObj.mescroll.answerMescroll.endErr();
            }
        })
    }

    function getMoreAnswer(param) {
        $.ajax({
            url: paramObj.url + "question/detail/moreAnswer",
            beforeSend: function(xhr) {
                xhr.setRequestHeader("Authentication", paramObj.token);
            },
            data: {
                infoId: paramObj.questionId,
                page: param.pageNum
            },
            success: function(result) {
                if (result.status === "200") {
                    paramObj.mescroll.answerMescroll.endSuccess();
                    var answerData = result.body;
                    param.successCallback(answerData);
                } else if (result.status === "401") {
                    paramObj.mescroll.questionMescroll.endSuccess();
                    param.successCallback([]);
                }
            },
            error: function(err) {
                dialogAlert(`请求更多问题失败，请稍后重试。`);
            }
        })
    }
    // 添加问题的回答
    function appendAnswer(questionInfo, pageNum) {
        var answerStr = '';
        var commentIds = [];
        questionInfo.forEach(function(list) {
            if (list.comment) {
                commentIds.push(list.fCommentId);
            }
            
            var commentTime = list.commentTime;
            var timeTempArr = commentTime.split(":")
                timeTempArr.pop()
                commentTime = timeTempArr.join(":");
            var userCardUrl = list.userCardUrl;
            // <img class="user_avatar" src="${list.speakerImage}" />
            //渲染一级回答
            answerStr += `<li class="answer_list comment_list" id="${list.fCommentId}">
                            <div class="answer_user">
                                <div class="user_avatar" style="background:url(${list.speakerImage}) no-repeat center/contain"></div>
                                <div class="answer_info user_name_wrap">
                                    <p class="user_name ">
                                        <span class="user_name_main col_1_hide">${list.speak}</span>
                                        <img class="user_status" style="display:${userCardUrl?'inline-block':'none'}" src="${userCardUrl?userCardUrl:''}"/>
                                    </p>
                                    <p class="answer_time">${commentTime}</p>
                                </div>
                            </div>
                            <div class="answer_con">
                                <p class="answer_txt">${list.fText}</p>
                            </div>
                            <div class="answer_handle">
                                <div class="answer_attitude" parent_id="${list.fCommentId}">
                                    <span class="hand like"></span>
                                    <i class="like_num">${list.praise}</i>
                                    <span class="hand dislike"></span>
                                    <i class="dislike_num">${list.trample}</i>
                                    <span class="answer_comment reply_btn" fCommentId ="${list.fCommentId}" fFid="${list.fFid}">回复</span>
                                </div>
                            </div>
                            <div class="answer_response">
                                <div class="comment_show_btn" style="display:${list.comment>0?"flex":"none"}">
                                    <div class="comment_num_info">${list.comment}条回复</div>
                                    <div class="comment_arrow_up comment_arrow"></div>
                                </div>
                                <ul class="answer_response_ul">
                                </ul>
                            </div>
                        </li>`
        })
        $(".answer_ul").append(answerStr);
        //请求并渲染一级回答的回复
        commentIds.forEach(function(id) {
                
            })
            //判断是否可以进行点赞或踩操作
        questionInfo.forEach(function(list, index) {
            //之前已经没有进行操作
            if (!list.choice) {
                // bindOneClick(list.fCommentId,index);
                bindOneClick({
                    id: list.fCommentId, //问题回复id
                    index: index, //问题回复索引
                    className: ".answer_attitude", //点赞\踩的直接父级className
                    url: paramObj.url + "question/answer/PraiseTrample", //url
                    token: paramObj.token
                });
            }
            //用户之前点击了赞
            else if (list.choice === 1) {
                $(`.answer_attitude[parent_id=${list.fCommentId}]`).find(".like").toggleClass("like").toggleClass("like_active")
            }
            //用户之前点击了踩
            else if (list.choice === -1) {
                $(`.answer_attitude[parent_id=${list.fCommentId}]`).find(".dislike").toggleClass("dislike").toggleClass("dislike_active")
            }
        })
    }
    //请求一级回答的回复
    function reqReplyForAnswer(id){
        $.ajax({
            url: paramObj.url + "question/answer/comment",
            beforeSend: function(xhr) {
                xhr.setRequestHeader("Authentication", paramObj.token);
            },
            data: {
                fCommentId: id
            },
            success: function(result) {
                if (result.status === "200") {
                    var resData = result.body;
                    if (resData.length) {
                        var htmlStr = '';
                        resData.forEach(function(data) {
                            if (data.to) {
                                // <span class="response_content">${data.fText}</span>
                                var str = `<li class="answer_response_list justify clear" fCommentId="${data.fCommentId}" fFid="${data.fFid}">
                                                <p class="response_info justify"> 
                                                    <span class="act_response">${data.speak}</span>
                                                    <i class="response_txt">回复</i>
                                                    <span class="unact_response">${data.to}</span>
                                                    <i class="colon">:</i>${data.fText}</p>
                                                <div class="response_btn right reply_btn">回复</div>            
                                            </li>`
                            } else {
                                var str = `<li class="answer_response_list justify" fCommentId="${data.fCommentId}" fFid="${data.fFid}">
                                                        <span class="act_response">${data.speak}</span>
                                                        <i class="colon">:</i>${data.fText}
                                                    </li>`
                            }
                            htmlStr += str;
                        })
                        $(`#${id}`).find(".answer_response_ul").html(htmlStr);
                    }
                }
            },
            error: function() {
                dialogAlert(`error--请求id为${id}的回答的回复出错`)
            }
        })
    }
})