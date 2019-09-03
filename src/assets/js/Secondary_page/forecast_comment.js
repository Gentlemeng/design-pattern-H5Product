$(function () {
    var sessionData = sessionStorage.getItem("Authentication");
    if (sessionData == null || JSON.parse(sessionData).data == undefined) {
        redirectUrl();
    } else {
        var paramObj = {
            newCmsUrl: newCmsUrl,
            token: sessionData ? JSON.parse(sessionData).data : "",
            infoId: parseURL(window.location.href).info,
            indexId: parseURL(window.location.href).index,
            flag: parseURL(window.location.href).flag,
            toUserId: "",
            toUserName: "",
            topCommentId: "",
            toCommentId: "",
            infoTitle: "",
            fFlag: 0,
            mescroll: {}
        }
        paramObj.mescroll = new MeScroll("main", {
            up: {
                clearEmptyId: "opinion_ul",
                page: {
                    num: 0,
                    size: 5,
                    url: paramObj.newCmsUrl + "comment/hotOrNewCommetForExpertPublic",
                    infoId: paramObj.infoId,
                    sessionData: sessionData,
                    token: paramObj.token,
                    flag: parseInt(paramObj.flag)
                },
                callback: upCallBack,
                empty: {
                    tip: "暂无更多数据",
                },
                htmlNodata: '<p class="upwarp-nodata">暂无更多数据</p>',
                loadFull: {
                    use: true,
                    delay: 0
                }
            },
            down: {
                use: false
            }
        });
        // 上拉加载插件
        function upCallBack(params) {
            getOpinion({
                num: params.num,
                size: params.size,
                url: params.url,
                infoId: params.infoId,
                sessionData: params.sessionData,
                token: params.token,
                flag: params.flag,
                successCallback: function (result) {
                    paramObj.mescroll.endSuccess(result.data.length);
                    setOpinion(result);
                },
                errorCallback: function () {
                    paramObj.mescroll.endErr();
                }
            });
        }
        // 评论
        function getOpinion(params) {
            $.ajax({
                url: params.url,
                beforeSend: function (xhr) {
                    xhr.setRequestHeader("Authentication", params.token);
                },
                data: {
                    pageNo: params.num,
                    infoId: params.infoId,
                    pageSize: params.size,
                    flag: params.flag
                },
                success: function (result) {
                    if (result.resultCode == 200) {
                        if (result.resultBody.comments.length == 0 && params.page == 1) {
                            $(".opinion").hide();
                        } else {
                            $(".opinion").show();
                            if (result.resultBody.comments.length > 0) {
                                paramObj.mescroll.endSuccess();
                                params.successCallback({
                                    data: result.resultBody.comments,
                                    sessionData: params.sessionData
                                });
                            } else {
                                paramObj.mescroll.endSuccess(false);
                                params.successCallback({
                                    data: [],
                                    sessionData: params.sessionData
                                });
                            }
                            clickFun({
                                url: paramObj.newCmsUrl + "support/save",
                                sessionData: params.sessionData,
                                token: params.token
                            });
                        }
                    } else if (result.resultCode == 401 || result.resultCode == 402 || result.resultCode == 405) {
                        redirectUrl();
                    }
                },
                error: function (err) {
                    params.errorCallback();
                    console.log(err);
                }
            })
        }

        function setOpinion(params) {
            var lidom = createDom(params.data);
            $("#opinion_ul").append(lidom);
            $("#opinion_ul .content").each(function () {
                if ($('#' + $(this).attr("id") + " a").length == 0) {
                    let $dot = $('#' + $(this).attr("id"));
                    $dot.remove(".toggle");
                    $dot.append('<a class="toggle" href="#"><span class="open">全文</span><span class="close">收起</span></a>');
                    function createDots() {
                        $dot.dotdotdot({
                            callback: function (isTruncated) {
                                if (!isTruncated) {
                                    $(this).addClass("hide");
                                }
                            },
                            after: 'a.toggle'
                        });
                    }

                    function destroyDots() {
                        $dot.trigger('destroy');
                    }
                    createDots();
                    $dot.on('click', 'a.toggle', function () {
                        $dot.toggleClass('opened');
                        if ($dot.hasClass('opened')) {
                            destroyDots();
                        } else {
                            createDots();
                        }
                        return false;
                    });
                }
            });
            $("#opinion_ul .btns .reply").click(function () {
                if (params.sessionData == null || JSON.parse(params.sessionData).data == undefined) {
                    redirectUrl();
                } else {
                    paramObj.fFlag = 1;
                    paramObj.toUserId = $(this).attr("toUserId");
                    paramObj.toUserName = $(this).attr("userName");
                    paramObj.topCommentId = $(this).attr("topCommentId");
                    paramObj.toCommentId = $(this).attr("toCommentId");
                    $("#txt").focus();
                }
            })
            $("#opinion_ul .replyli").unbind("click").click(function () {
                if ($(this).next().length == 0) {
                    var lindom = replyList({
                        url: paramObj.newCmsUrl + "comment/reply",
                        infoId: paramObj.infoId,
                        topCommentId: $(this).attr("topcommentid")
                    })
                    $(this).parent().append("<div class='reply_content'><ul class='reply_ul'>" + lindom + "</ul></div>");
                    $(".replys").click(function () {
                        if (params.sessionData == null || JSON.parse(params.sessionData).data == undefined) {
                            redirectUrl();
                        } else {
                            paramObj.fFlag = 1;
                            paramObj.toUserId = $(this).attr("toUserId");
                            paramObj.toUserName = $(this).attr("userName");
                            paramObj.topCommentId = $(this).attr("topCommentId");
                            paramObj.toCommentId = $(this).attr("toCommentId");
                            $("#txt").focus();
                        }
                    })
                    if ($(this).next().children().children().length != 0) {
                        $(this).next().show();
                    }
                } else if ($(this).next().children().children().length != 0 && $(this).next().css("display") == "none") {
                    $(this).next().show();
                } else {
                    $(this).next().hide();
                }
            })
        }
        // 发表评论
        var interval;
        $("#txt").focus(function () {
            clearTimeout(interval);
            if (sessionData == null || JSON.parse(sessionData).data == undefined) {
                interval = setTimeout(function () {
                    document.body.scrollTop = document.body.scrollHeight
                }, 100)
                $("#txt").blur();
                sessionStorage.removeItem("Authentication");
                $.dialog({
                    type: "confirm",
                    onClickOk: function () {
                        window.location.href = commonParamObj.redirectUrl;
                    },
                    onClickCancel: function () {
                        return false;
                    },
                    onBeforeShow: function () {
                        $(".main").scrollTop(0);
                    },
                    contentHtml: `<p style="text-align:center;">请先登录再评论或回复</p>`
                });
            } else {
                if (paramObj.fFlag == 1) {
                    $("#txt").attr("placeholder", "回复" + paramObj.toUserName);
                } else {
                    $("#txt").attr("placeholder", "发表观点");
                }
            }
        })
        $('#txt').on('blur', function () {
            window.scroll(0, 0);
        });
        // 回复or发表专家评论
        $(".publish .send").click(function () {
            if (sessionData == null || JSON.parse(sessionData).data == undefined) {
                redirectUrl();
            } else {
                if ($("#txt").val() == "") {
                    $.dialog({
                        type: "alert",
                        onClickOk: function () {},
                        autoClose: 0,
                        contentHtml: `<p style="text-align:center;">请输入观点</p>`
                    });
                } else {
                    if (paramObj.fFlag == 1) { //回复                    
                        paramObj.fFlag = giveReply({
                            url: paramObj.newCmsUrl + "comment/save",
                            token: paramObj.token,
                            data: {
                                commentContent: $("#txt").val(),
                                toUserId: paramObj.toUserId,
                                topCommentId: paramObj.topCommentId,
                                toCommentId: paramObj.toCommentId,
                                infoTitle: paramObj.infoTitle,
                                infoId: paramObj.infoId,
                                infoType: "expert_comment_news_public",
                                type: "reply"
                            },
                            fFlag: 1
                        })
                        $("#txt").attr("placeholder", "发表观点");
                        paramObj.fFlag = 0;
                    } else { //专家
                        paramObj.fFlag = giveReply({
                            url: paramObj.newCmsUrl + "comment/save",
                            token: paramObj.token,
                            data: {
                                infoId: paramObj.infoId,
                                infoType: "expert_comment_news_public",
                                type: "comment",
                                commentContent: $("#txt").val(),
                                infoTitle: paramObj.infoTitle
                            },
                            fFlag: 0
                        })
                    }
                }
            }
        })
        // 返回
        $("header .back").click(function () {
            window.location.href = "./forecast_detail.html?indexId=" + paramObj.indexId;
        })
        // 规则
        $("header .rule").click(function () {
            $.ajax({
                url: paramObj.newCmsUrl + "rule/findRuleById",
                data: {
                    typeId: "1"
                },
                success: function (res) {
                    if (res.resultCode == 200) {
                        var dom = ``;
                        res.resultBody.ruleInfo.forEach(function (v) {
                            dom += `<p>${v.value}</p>`;
                        })
                        $.dialog({
                            type: "alert",
                            titleText: "规则",
                            onClickOk: function () {
                                return false;
                            },
                            dialogClass: "tipBtn",
                            contentHtml: dom,
                            buttonText: {
                                ok: `<img src="./../../assets/images/forecast/close.png">`
                            }
                        });
                    }
                },
                error: function (err) {
                    console.log(err);
                }
            })
        })
    }
})