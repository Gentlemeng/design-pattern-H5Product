$(function () {
    var paramObj = {
        url: newCmsUrl,
        token: "",
        mescroll: {},
        essayId: parseURL(window.location.search).fInfoId,
        essayType: parseURL(window.location.search).essayType,
        starBullText: "利好",
        starBearText: "利空",
        starSupportText: "喜欢",
        starOpposeText: "不喜欢",
        infoType: "",
        //"comment"是评论，"reply_comment"是评论的回复，"comment_insert"是评论回复的回复
        fFlag: "comment",
        fParentId: "",
        fFid: "",
        fCommentId: '',
        pageSize: 10,
        infoTitle: "",
        toCommentId: "",
        userId: "",
        topCommentId: "",
        essayList: JSON.parse(sessionStorage.getItem("essayList")) || [],
        hotList: JSON.parse(sessionStorage.getItem("hotList")) || [],
        shareParams: shareParams
    };
    //处理返回按钮url
    var inforSource = sessionStorage.getItem("inforSource");
    if (inforSource) {
        $(".back").attr({
            "href": inforSource
        });
    }
    $(".back").on("click", function () {
        window.location.href = inforSource
    })
    //获取token
    var sessionData = sessionStorage.getItem("Authentication");
    if (sessionData != null && JSON.parse(sessionData).data != undefined) {
        paramObj.token = JSON.parse(sessionData).data;
        getEssayData();
        //请求上一页、下一页
        getBeforeNextEssay();
        setStarText();
        getWonderfulComment({
            url: "comment/hotComment",
            page: 1,
            className: ".wonderful_comment_ul"
        });
        paramObj.mescroll.newMeScroll = new MeScroll("essayMain", {
            down: {
                use: false
            },
            up: {
                callback: newCommentCallback, //上拉加载的回调
                // isBounce: false, //此处禁止ios回弹,解析(务必认真阅读,特别是最后一点): http://www.mescroll.com/qa.html#q10
                page: {
                    num: 0,
                    url: "comment/topComment",
                    className: ".latest_comment_ul",
                },
                clearEmptyId: "latestCommentUl",
                htmlNodata: '<p class="upwarp-nodata">无更多评论</p>',
                empty: {
                    tip: "无更多评论" //提示
                },
                lazyLoad: {
                    use: true
                },
                noMoreSize: 1,
                // clearEmptyId: "dataList",
            }
        })

    } else {

        tipToLoad();
        return false;
    }
    $(".essay_detail").on("click", ".follow_btn", function () {
        handleFollow({
            token:paramObj.token,
            data: {
                collectionId: paramObj.essayId,
                collectionName: paramObj.essayTitle,
                author: paramObj.essayAuthor,
                picUrl: paramObj.titleImg
            },
            url: paramObj.url + 'newsCollention/insertNewsCollection',
            target:$(".follow_btn")
        });
    })
    // $(".essay_handle").on("click", ".opinion_btn", function () {
    //     // console.log($(this).hasClass("support_btn"))
    //     //flag:1  表示为支持;
    //     if ($(this).hasClass("oppose_btn")) { //用户点击了支持按钮
    //         submitEssayOpinion({
    //             infoId: paramObj.essayId,
    //             token: paramObj.token,
    //             att: "against",

    //         }, "反对");
    //     } else {
    //         submitEssayOpinion({
    //             infoId: paramObj.essayId,
    //             token: paramObj.token,
    //             att: "like",

    //         }, "支持");
    //     }
    // })
    //onfocus
    var interval;
    $("#txt").on("focus", function () {
        clearTimeout(interval);
        if (sessionData == null || JSON.parse(sessionData).data == undefined) {
            interval = setTimeout(function () {
                document.body.scrollTop = document.body.scrollHeight
            }, 0)
            $("#txt").blur();
            dialogConfirm("请先登录再评论或回复");
        }
    })
    //点击非输入框区域和非回复按钮，切换成回答问题
    $(".main").on("click", function (event) {
        if (!$(event.target).hasClass("reply_btn")) {
            $("#txt").attr({
                "placeholder": "发表评论"
            })
        }
    })
    //键盘回弹
    $('#txt').on('blur', function () {
        window.scroll(0, 0);
    });
    //回复显示/隐藏
    $(".main").on("click", ".replyBox", function () {
        var replyDom = $(this).siblings(".comment_response")
        $(this).find(".comment_arrow").toggleClass("comment_arrow_up").toggleClass("comment_arrow_down")
        // $(this).siblings(".comment_response").toggle();
        paramObj.topCommentId = $(this).attr("parent_id");
        if (replyDom.is(":visible")) {
            replyDom.hide();
        } else {
            replyDom.show();
            getReplyData()
        }

    });
    //评论的回复
    $(".main").on("click", ".reply_comment", function () {
        var fParentId = $(this).attr("fCommentId"),
            fFid = $(this).attr("fFid");
        var speak = $.trim($(this).parents(".comment_list").find(".user_name").text());
        var userId = $(this).attr("toUserId");
        $("#txt").attr({
            "placeholder": `回复${speak}`
        })
        $("#txt").focus();
        paramObj.fFlag = "reply_comment";
        paramObj.fParentId = fParentId;
        paramObj.fFid = fFid;
        paramObj.userId = userId;
        paramObj.toCommentId = fParentId;

    })
    //回答回复的回复
    $(".main").on("click", ".response_btn", function () {
        var fParentId = $(this).parent().parent().parent().parent().attr("id"),

            fFid = $(this).parent().attr("fFid");
        var userId = $(this).parent().attr("UserId"),
            toCommentId = $(this).parents(".comment_response_list").attr("fCommentId");
        $("#txt").focus();
        var speak = $.trim($(this).parent().find(".act_response").text());
        $("#txt").attr({
            "placeholder": `回复${speak}`
        })
        paramObj.fFlag = "comment_insert";
        paramObj.fParentId = fParentId;
        paramObj.fFid = fFid;
        paramObj.userId = userId;
        paramObj.toCommentId = toCommentId;
    })
    // 评论or评论回复or对评论回复进行回复
    $(".publish .send").click(function () {
        if (sessionData == null || JSON.parse(sessionData).data == undefined) {
            dialogConfirm(`未登录或登录信息失效，请点击“确定”重新登录`)
            return
        }
        var value = $.trim($("#txt").val());
        if (value === "") {
            dialogAlert(`内容不能为空。`);
        } else {
            var placeholder = $("#txt").attr("placeholder");
            //回答问题
            if (placeholder.indexOf("回复") === -1) {
                commentInsert({
                    data: {
                        infoId: paramObj.essayId,
                        commentContent: value,
                        infoType: paramObj.infoType,
                        type: "comment",
                        infoTitle: paramObj.infoTitle,
                        // token: paramObj.token,

                    }
                });
            }
            //回答的回复、回答的回复的回复
            else {
                commentInsert({
                    data: {
                        infoId: paramObj.essayId,
                        type: "reply",
                        infoType: paramObj.infoType,
                        infoTitle: paramObj.infoTitle,
                        toCommentId: paramObj.toCommentId,
                        commentContent: value,
                        toUserId: paramObj.userId,
                        // token: paramObj.token,
                        topCommentId: paramObj.fParentId,
                    }
                });
            }
            $("#txt").val("");
            paramObj.fFlag = "comment"
            $("#txt").attr({
                "placeholder": "发表评论"
            })
        }
    })
    //关闭利空利好layer
    $(".star_layer").on("click", function () {
        $(this).hide();
    })
    $(".essay_detail").on("click", ".star_ul", function () {
        //判断是否登录
        if (sessionData == null || JSON.parse(sessionData).data == undefined) {
            dialogConfirm("请登录后进行评分");
            return false
        }
        var isClick = $(this).attr("isClick");
        //未评价
        if (isClick === "false") {
            paramObj.star_comment_result = null;
            //置灰评分样式
            $(".star_choose_wrap .star_ul .star").css({
                "color": "#a0a0a0"
            });
            $(".star_choose_wrap .star_text").css({
                "color": "#a0a0a0"
            });
            $(".star_layer").show();
            // $(this).attr({"isClick":"true"})
        } else {
            // console.log("已经点击过了")
        }
    })
    $(".star_confirm").on("click", function () {
        $(".star_layer").hide();
    })
    $(".star_choose_wrap").on("click", function () {
        return false;
    })
    //评分点击
    $(".star_choose_wrap .star_ul").on("click", ".star", function () {
        var star_index = $(this).index();
        paramObj.star_comment_result = showStarInfo($(".star_choose_wrap"), (star_index - Math.floor(starInfo.starColorArr.length / 2)) * -1);
        return false
    })
    //用户确定评分
    $(".star_confirm").on("click", function () {
        if (typeof (paramObj.star_comment_result) == "number") {
            $.ajax({
                url: paramObj.url + 'starScore/save',
                beforeSend: function (xhr) {
                    xhr.setRequestHeader("Authentication", paramObj.token);
                },
                data: {
                    infoId: paramObj.essayId,
                    starCount: paramObj.star_comment_result
                },
                success: function (result) {
                    // console.log(result)
                    if (result.success) {
                        dialogAlert(`评分成功`);
                        //展示到列表上
                        var star_index = result.currentStarCount;
                        var starAvg_index = result.avgStarCount;
                        var starWrpaDom = $(".my_star")
                        $(".star_layer").hide();
                        showStarInfo(starWrpaDom, star_index);
                        showStarAvgInfo($(".other_star"), starAvg_index);
                        $(".other_star").css({
                            "display": "flex"
                        })
                        if (paramObj.essayType === "essay") {
                            updateStorage({
                                listData: paramObj.essayList,
                                listId: paramObj.essayId,
                                listIndex: paramObj.star_comment_result,
                                storageKey: "essayList"
                            })
                        } else if (paramObj.essayType === "hot") {
                            updateStorage({
                                listData: paramObj.hotList,
                                listId: paramObj.essayId,
                                listIndex: paramObj.star_comment_result,
                                storageKey: "hotList"
                            })
                        }
                    } else {
                        if (result.msg === "USERERROR") {
                            dialogConfirm();
                        } else {
                            dialogAlert("评分失败，请稍后重试。")
                        }
                    }
                    paramObj.star_comment_result = null;
                },
                error: function (error) {
                    console.log(error);
                }
            })
        };
    })


    //请求最新评论回调
    function newCommentCallback(page) {
        //联网加载数据
        getCommentData({
            url: page.url,
            pageNum: page.num,
            successCallback: function (curPageData) {
                //联网成功的回调,隐藏下拉刷新和上拉加载的状态;
                //mescroll会根据传的参数,自动判断列表如果无任何数据,则提示空;列表无下一页数据,则提示无更多数据;
                // console.log("page.num="+page.num+", page.size="+page.size+", curPageData.length="+curPageData.length);
                //方法四 (不推荐),会存在一个小问题:比如列表共有20条数据,每页加载10条,共2页.如果只根据当前页的数据个数判断,则需翻到第三页才会知道无更多数据,如果传了hasNext,则翻到第二页即可显示无更多数据.
                paramObj.mescroll.newMeScroll.endSuccess(curPageData.length);

                //设置列表数据,因为配置了emptyClearId,第一页会清空dataList的数据,所以setListData应该写在最后;
                addNewCommentData(curPageData, page.className);
            },
            errorCallback: function () {
                //联网失败的回调,隐藏下拉刷新和上拉加载的状态;
                paramObj.mescroll.newMeScroll.endErr();
            }
        });
    }
    //资讯详情
    function getEssayData() {
        $.ajax({
            url: paramObj.url + 'news/infoDetailWithStar',
            beforeSend: function (xhr) {
                xhr.setRequestHeader("Authentication", paramObj.token);
            },
            data: {
                infoId: paramObj.essayId,
            },
            success: function (result) {
                if (result.success) {
                    paramObj.infoTitle = result.news.infoTitle;
                    paramObj.infoType = result.news.infoType;
                    paramObj.titleImg = result.news.titleImg;
                    var publishTime = getDateDiff(result.news.infoPublishDate);
                    var displayStr = "";
                    if (!result.news.infoSummary) {
                        displayStr = "display:none;"
                    }
                    var star_index = result.news.currentStarCount;
                    var starAvg_index = result.news.avgStarCount;
                    var htmlStr = `<div class="essay_title justify">${result.news.infoTitle}</div>
                                    <div class="follow_wrap">
                                        <div class="follow_btn">收藏</div>
                                    </div>
                                    <div class="essay_introduce">
                                        <div class="essay_author">
                                            <span class="author_txt">作者:</span>
                                            <i class="essay_auth">${result.news.author}</i>
                                            <span class="essay_publish_time">${publishTime}</span>
                                        </div>
                                        <div class="essay_length">
                                            <span class="num_txt">字数</span>
                                            <i class="essay_num">${result.news.wordCount}</i>
                                            <span class="need_txt">阅读需</span>
                                            <span class="essay_need">${result.news.readTime}</span>分钟
                                        </div>
                                    </div>
                                    <div class="essay_summary justify" style="${displayStr}">
                                        <span class="summary">摘要：</span><span class="detail">${result.news.infoSummary}</span>
                                    </div>
                                    <div class="essay_text justify">
                                        ${result.news.infoContent}
                                    </div>
                                    <div class="essay_info_star">
                                        <div class="my_star">
                                            <div class="star_title">我的评价：</div>
                                            <div class="star_wrap">
                                                <p class="bull star_text"></p>
                                                <div class="star_content">
                                                    <ul class="star_ul" isClick=${star_index===null?"false":"true"}>
                                                        <li class='star left_half_star'>R</li>
                                                        <li class='star left_half_star'>R</li>
                                                        <li class='star left_half_star'>R</li>
                                                        <li class='star'>R</li>
                                                        <li class='star right_half_star'>R</li>
                                                        <li class='star right_half_star'>R</li>
                                                        <li class='star right_half_star'>R</li>
                                                    </ul>
                                                </div>
                                                <p class="bear star_text"></p>
                                            </div>
                                        </div>
                                        <div class="other_star" style="display:${star_index===null?"none":"flex"}">
                                            <div class="star_title">综合评价：</div>
                                            <div class="star_wrap">
                                                <p class="bull star_text"></p>
                                                <div class="star_content">
                                                    <ul class='star_ul'>
                                                        <li class='star left_half_star'>R</li>
                                                        <li class='star left_half_star'>R</li>
                                                        <li class='star left_half_star'>R</li>
                                                        <li class='star'>R</li>
                                                        <li class='star right_half_star'>R</li>
                                                        <li class='star right_half_star'>R</li>
                                                        <li class='star right_half_star'>R</li>
                                                    </ul>
                                                </div>
                                                <p class="bear star_text"></p>
                                            </div>
                                        </div>
                                    </div>`
                    $(".essay_detail").append(htmlStr);
                    setStarText();
                    //我的评价画星星
                    if (star_index != null) {
                        var starWrpaDom = $(".my_star");
                        var starAvgWrapDom = $(".other_star");
                        showStarInfo(starWrpaDom, star_index);
                        //综合评价画星星
                        showStarAvgInfo(starAvgWrapDom, starAvg_index);
                    }
                    paramObj.essayAuthor = result.news.author;
                    paramObj.essayTitle = result.news.infoTitle;
                    paramObj.shareParams.title = $(".essay_title")[0] ? $(".essay_title")[0].innerText : '';
                    paramObj.shareParams.desc = $(".essay_summary .detail")[0] ? $(".essay_summary .detail")[0].innerText : '';
                    share(paramObj.shareParams);
                    // //处理 支持与反对
                    // if (result.news.attitude.hasOption) { //用户已经选择了反对或支持
                    //     $(".essay_handle").hide();
                    //     $(".essay_opinion").show();
                    //     showEssayOpinion(result.news.attitude);
                    // } else {
                    //     $(".essay_handle").css({
                    //         "display": "flex" || "-webkit-flex"
                    //     });

                    // }

                    //是否收藏本条资讯
                    handleFollow({ 
                        token:paramObj.token,
                        data: {
                            collectionId: paramObj.essayId,
                        },
                        url: paramObj.url + 'newsCollention/findNewsCollectionByUserAndId',
                        target:$(".follow_btn")
                    });
                } else if (!result.success && result.msg === "USERERROR") {
                    //提示登录，点击取消返回列表页
                    tipToLoad()
                } else if (!result.success) {
                    dialogAlert(`请求文章详情失败`)
                }
            },
            error: function (err) {
                dialogAlert(`请求文章数据失败，请稍后重试。`);
            }

        })
    }
    

    function getBeforeNextEssay() {
        $.ajax({
            url: paramObj.url + "news/lastNextInfo",
            data: {
                infoId: paramObj.essayId
            },
            success: function (result) {
                // console.log(result);
                var htmlStr = '';
                if (result.success && result) {
                    var lastEssay = result.last;
                    var nextEssay = result.next;
                    if (!lastEssay && !nextEssay) {
                        return false
                    } else if (!lastEssay) {
                        htmlStr += `<li class="switch_essay_list">
                                    <a href="./essay_detail.html?fInfoId=${nextEssay.infoId}&essayType=${paramObj.essayType}">
                                        <span class="switch_info">下一篇 >></span>
                                        <span class="switch_essay_title justify">${nextEssay.infoTitle}</span>
                                    </a>
                                </li>`
                    } else if (!nextEssay) {
                        htmlStr += `<li class="switch_essay_list">
                                    <a href="./essay_detail.html?fInfoId=${lastEssay.infoId}&essayType=${paramObj.essayType}">
                                        <span class="switch_info">上一篇 >></span>
                                        <span class="switch_essay_title justify">${lastEssay.infoTitle}</span>
                                    </a>
                                </li>`
                    } else {
                        htmlStr += `<li class="switch_essay_list">
                                    <a href="./essay_detail.html?fInfoId=${lastEssay.infoId}&essayType=${paramObj.essayType}">
                                        <span class="switch_info">上一篇 >></span>
                                        <span class="switch_essay_title justify">${lastEssay.infoTitle}</span>
                                    </a>
                                </li>
                                <li class="switch_essay_list">
                                    <a href="./essay_detail.html?fInfoId=${nextEssay.infoId}&essayType=${paramObj.essayType}">
                                        <span class="switch_info">下一篇 >></span>
                                        <span class="switch_essay_title justify">${nextEssay.infoTitle}</span>
                                    </a>
                                </li>`
                    }
                    $(".switch_essay").append(htmlStr);
                }
            },
            error: function (error) {
                console.log(error)
            }
        })
    }

    function setStarText() {
        if (paramObj.essayType == "essay") {
            $(".bull").text(paramObj.starBullText)
            $(".bear").text(paramObj.starBearText)
        } else {
            $(".bull").text(paramObj.starSupportText)
            $(".bear").text(paramObj.starOpposeText)
        }
    }
    // //支持/反对这篇文章
    // function submitEssayOpinion(data, text) {
    //     $.dialog({
    //         type: "confirm",
    //         onClickOk: function () {
    //             $.ajax({
    //                 // url: paramObj.url + "informations/SupportAgainst",
    //                 url: paramObj.url + "news/attitude",
    //                 beforeSend: function (xhr) {
    //                     xhr.setRequestHeader("Authentication", paramObj.token);
    //                 },
    //                 data: data,
    //                 success: function (result) {

    //                     // console.log(JSON.stringify(result));
    //                     if (result.success) {
    //                         showEssayOpinion(result.attitude);
    //                     } else if (!result.success) {
    //                         setTimeout(() => {
    //                             dialogConfirm(`未登录或登录信息失效，请点击“确定”重新登录后进行操作`)
    //                         }, 200)
    //                     }
    //                 },
    //                 error: function (err) {
    //                     setTimeout(() => {
    //                         dialogAlert(`操作失败，请稍后重试`)
    //                     }, 200)
    //                 }

    //             })
    //         },
    //         autoClose: 0,
    //         contentHtml: `<p style="text-align:center;">确定${text}吗？</p>`
    //     });
    // }
    //获取精彩评论
    function getWonderfulComment(param) {
        var url = param.url;
        $.ajax({
            url: paramObj.url + url,
            beforeSend: function (xhr) {
                xhr.setRequestHeader("Authentication", paramObj.token);
            },
            data: {
                infoId: paramObj.essayId,
                // token: paramObj.token
            },
            success: function (result) {
                if (result.success) {
                    var commentInfo = result.hotComment;
                    if (commentInfo.length) {
                        addNewCommentData(commentInfo, param.className);
                    } else {}
                }
            },
            error: function (err) {
                dialogAlert(`请求精彩评论失败，请稍后重试。`);
            }
        })
    }
    //获取评论的回复
    function getReplyData() {
        $.ajax({
            url: paramObj.url + "comment/reply",
            beforeSend: function (xhr) {
                xhr.setRequestHeader("Authentication", paramObj.token);
            },
            data: {
                infoId: paramObj.essayId,
                pageNo: 1,
                pageSize: 1000,
                // token: paramObj.token,
                topCommentId: paramObj.topCommentId
            },
            success: function (result) {
                if (result.count !== 0) {
                    var htmltr = '',
                        str = '';
                    result.reply.forEach(function (list) {
                        str = `<li class="comment_response_list justify clear" fCommentId="${list.comment.commentId}" fFid="${paramObj.essayId}" UserId="${list.user.userId}">
                                <p class="response_info justify">
                                    <span class="act_response">${list.user.userNickName}</span>
                                    <i class="response_txt">回复</i>
                                    <span class="unact_response">${list.toUser.userNickName}</span>
                                    <i class="colon">:</i>${list.comment.commentContent}
                                </p>
                                <div class="response_btn right reply_btn">回复</div>
                        </li>`
                        htmltr += str;
                    })
                    $(`#${paramObj.topCommentId}`).find(".comment_response_ul").html(htmltr);
                }
            },

            error: function (err) {
                dialogAlert(`请求文章详情数据失败，请稍后重试。`);
            }
        })
    }
    //获取最新评论
    function getCommentData(param) {
        var url = param.url;
        $.ajax({
            url: paramObj.url + url,
            beforeSend: function (xhr) {
                xhr.setRequestHeader("Authentication", paramObj.token);
            },
            data: {
                infoId: paramObj.essayId,
                pageNo: param.pageNum,
                pageSize: paramObj.pageSize,
                type: "comment",
                // token: paramObj.token
            },
            success: function (result) {
                if (result && result.success === true) {
                    var commentInfo = result.lastComment;
                    paramObj.mescroll.newMeScroll.endSuccess();
                    param.successCallback(commentInfo);
                } else {
                    paramObj.mescroll.newMeScroll.endSuccess();
                    param.successCallback([]);
                }
            },
            error: function (err) {
                paramObj.mescroll.newMeScroll.endSuccess();
                param.successCallback([]);
                dialogAlert(`请求文章详情数据失败，请稍后重试。`);
            }
        })
    }

    //添加评论
    // <img class="user_avatar" src="${list.user.userHeadImage}"/>
    function addNewCommentData(commentInfo, className) {
        var commentStr = '';
        commentInfo.forEach(function (list) {
            if (list.comment.replyCount == 0) {
                // commentResponse.push(list.children);
                commentStr = `<li class="comment_list" id="${list.comment.commentId}">
                                    <div class="comment_handle_wrap">
                                        <div class="comment_user">
                                            <div class="user_avatar" style="background:url(${list.user.userHeadImage}) no-repeat center/contain"></div>
                                            <div class="user_name_wrap">
                                                <span class="user_name col_1_hide ">${list.user.userNickName}</span>
                                                <img class="user_status" style="display:${list.userCardUrl?'inline-block':'none'}" src="${list.userCardUrl?list.userCardUrl:''}"/>
                                            </div>
                                        </div>
                                        <div class="comment_handle">
                                            <div class="comment_attitude" parent_id="${list.comment.commentId}">
                                                <span class="hand like" parent_id="${list.comment.commentId}"></span>
                                                <i class="like_num">${list.comment.likeCount||0}</i>
                                                <span class="hand dislike" parent_id="${list.comment.commentId}"></span>
                                                <i class="dislike_num">${list.comment.againstCount||0}</i>
                                                <span class="reply_comment reply_btn" fCommentId="${list.comment.commentId}" fFid="${paramObj.essayId}" toUserId="${list.user.userId}">回复</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="comment_con">
                                        <p class="comment_txt justify">${list.comment.commentContent}</p>
                                    </div>                                    
                                </li>`

            } else {
                commentStr = `<li class="comment_list" id="${list.comment.commentId}">
                                    <div class="comment_handle_wrap">
                                    <div class="comment_user">
                                    <div class="user_avatar" style="background:url(${list.user.userHeadImage}) no-repeat center/contain"></div>
                                    <div class="user_name_wrap">
                                        <span class="user_name col_1_hide ">${list.user.userNickName}</span>
                                        <img class="user_status" style="display:${list.userCardUrl?'inline-block':'none'}" src="${list.userCardUrl?list.userCardUrl:''}"/>
                                    </div>
                                </div>
                                        <div class="comment_handle">
                                            <div class="comment_attitude" parent_id="${list.comment.commentId}">
                                                <span class="hand like" parent_id="${list.comment.commentId}"></span>
                                                <i class="like_num">${list.comment.likeCount||0}</i>
                                                <span class="hand dislike" parent_id="${list.comment.commentId}"></span>
                                                <i class="dislike_num">${list.comment.againstCount||0}</i>
                                                <span class="reply_comment reply_btn" fCommentId="${list.comment.commentId}" fFid="${paramObj.essayId}" toUserId="${list.user.userId}">回复</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="comment_con">
                                        <p class="comment_txt justify">${list.comment.commentContent}</p>
                                    </div>
                                    <div class="replyBox" parent_id="${list.comment.commentId}">
                                        <span class="replaytext">${list.comment.replyCount} 条回复</span>
                                        <div class="comment_arrow_up comment_arrow"></div>
                                    </div>
                                    <div class="comment_response" parent_id="${list.comment.commentId}">
                                        <ul class="comment_response_ul">
                                        </ul>
                                    </div>
                                </li>`
            }
            $(className).append(commentStr);
        })
        //判断是否可以进行点赞操作
        commentInfo.forEach(function (list, index) {
            //之前已经没有进行操作
            if (!list.attitude) {
                // bindOneClick(list.fCommentId,index);
                praiseOneClick({
                    id: list.comment.commentId, //文章回复id
                    index: index, //当前评论索引
                    className: ".comment_attitude", //点赞\踩的直接父级className
                    // parentNodeId:`#${list.fCommentId}`,
                    url: paramObj.url + "support/save", //url
                    token: paramObj.token,
                    sufferId: list.comment.commentId
                });
            }
            //用户之前点击了赞
            else if (list.attitude == "like") {
                $(`.comment_attitude[parent_id=${list.comment.commentId}]`).find(".like").toggleClass("like").toggleClass("like_active")
            }
            //用户之前点击了踩
            else if (list.attitude == "against") {
                $(`.comment_attitude[parent_id=${list.comment.commentId}]`).find(".dislike").toggleClass("dislike").toggleClass("dislike_active")
            }
        })
    }
    //添加评论 和 添加评论的回复 和 添加评论回复的回复
    function commentInsert(param) {
        // if(paramObj.fFlag==="")
        $.ajax({
            url: paramObj.url + "comment/save",
            beforeSend: function (xhr) {
                xhr.setRequestHeader("Authentication", paramObj.token);
            },
            data: param.data,
            success: function (result) {
                if (result.success) {
                    dialogAlert(`回复已提交，待系统审核。`);
                    $("#txt").val("");
                    paramObj.fFlag = "comment";
                } else {
                    dialogConfirm(`登录过期，请重新登录`);
                }
            },
            error: function (err) {
                dialogAlert(`回复失败，请稍后重试。`)
            }
        })
    }

    // //显示支持和反对相关
    // function showEssayOpinion(opinionData) {
    //     var supportNum = opinionData.likeCount, //支持数量
    //         againstNum = opinionData.againstCount,            
    //         allOpinion = supportNum + againstNum;
    //     if (!allOpinion == 0) {
    //         var percentSupport = (supportNum / allOpinion * 100).toFixed(2), //支持百分比
    //             percentAgainst = (againstNum / allOpinion * 100).toFixed(2); //反对百分比
    //         $('.support_percent').text(percentSupport + '%')
    //         $('.oppose_percent').text(percentAgainst + '%')
    //         $('.support_bar').css({
    //             "width": percentSupport + '%'
    //         })
    //         $('.oppose_bar').css({
    //             "width": percentAgainst + '%'
    //         })

    //         $(".essay_handle").hide();
    //         $(".essay_opinion").show();
    //     } else {
    //         $(".essay_handle").show();
    //         $(".essay_opinion").hide();

    //     }

    // }
    //提示登录，点击取消返回列表页
    function tipToLoad() {
        sessionStorage.removeItem("Authentication");
        $.dialog({
            type: "confirm",
            onClickOk: function () {
                //跳转到登录页
                window.location.href = commonParamObj.redirectUrl;
            },
            onClickCancel: function () {
                var origin = window.location.origin;
                var newUrl;
                //本地调试（带端口）
                if(origin.split(":").length>=3){
                    newUrl = window.location.origin+'/src/views/information.html'
                }
                //测试和线上（没有端口一说）
                else{
                    newUrl = window.location.origin+'/views/information.html'                    
                }
                // sessionStorage.setItem("essayDetailBackUrl",newUrl)
                window.location.href = newUrl
            },
            autoClose: 0,
            contentHtml: `<p style="text-align:center;">未登录或登录信息失效，请点击“确定”重新登录</p>`
        });
    }
})