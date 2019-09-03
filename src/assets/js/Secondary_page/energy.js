$(function () {
    var sessionData = sessionStorage.getItem("Authentication");
    var paramObj = {
        indexUrl: indexUrl,
        newCmsUrl: newCmsUrl,
        token: sessionData ? JSON.parse(sessionData).data : "",
        topicId: parseURL(window.location.href).topic,
        indexName: "经济增长动能",
        rankColor: [],
        barChart: null,
        // 中下堆积图
        pictorialBarData: [],
        // 存储多选的行业标签
        pictorialBarString: [],
        size: 5,
        mescroll: {},
        infoId: "",
        toUserId: "",
        toUserName: "",
        topCommentId: "",
        toCommentId: "",
        infoTitle: "",
        fFlag: 0,
    }
    var result_chart = echarts.init(document.getElementById("result_chart"));
    new Swiper('.swiper-container', {
        pagination: '.my-pagination-ul',
        paginationClickable: true,
        paginationBulletRender: function (swiper, index, className) {
            var name = '',
                //类型
                type = "";
            switch (index) {
                case 0:
                    name = '总量';
                    type = "_abs_r";
                    break;
                case 1:
                    name = '增量';
                    type = "_inc_r";
                    break;
                case 2:
                    name = '增量增速';
                    type = "_inc_inc_yoy";
                    break;
                default:
                    name = '';
            }
            return '<li class="' + className + '" type="' + type + '">' + name + '</li>';
        }

    })

    function drawBar(chartId, type) {
        if (paramObj.barChart != null && paramObj.barChart != "" && paramObj.barChart != undefined) {
            paramObj.barChart.dispose();
        }
        // 基于准备好的dom，初始化echarts实例
        paramObj.barChart = echarts.init(document.getElementById(chartId));
        $.ajax({
            url: paramObj.indexUrl + "IncreaseKineticEnergyIndex",
            data: {
                datatypename: type,
                size: 70
            },
            success: function (result) {
                result = JSON.parse(result);
                if (result.resultCode === "200" && result.resultBody.data.resultData.length) {
                    var resjson = result.resultBody.data.resultData;
                    var barOption = {
                        baseOption: {
                            tooltip: {
                                trigger: 'axis',
                                axisPointer: {
                                    type: 'shadow'
                                },
                                formatter: function (params) {
                                    return params[0].name + '<br/>数值:' + params[0].value.toFixed(2) + '%';
                                },
                                position: function (pos) {
                                    var obj = {
                                        right: '10%',
                                        top: pos[1] + 20
                                    };
                                    return obj;
                                }
                            },
                            grid: {
                                width: '98%',
                                height: '94%',
                                left: '0%',
                                top: '0%',
                                containLabel: true
                            },
                            xAxis: {
                                type: 'value',
                                position: 'top',
                                splitLine: {
                                    show: false
                                },
                                axisLine: {
                                    show: false,
                                    lineStyle: {
                                        color: '#fff',
                                        width: 1
                                    }
                                },
                                axisTick: {
                                    show: false
                                },
                                axisLabel: {
                                    show: false,
                                    formatter: function (v) {
                                        return v;
                                    }
                                }
                            },
                            yAxis: {
                                type: 'category',
                                axisLine: {
                                    show: false
                                },
                                axisTick: {
                                    show: false
                                },
                                inverse: true,
                                axisLabel: {
                                    align: 'right',
                                    color: "#fff"
                                },
                                axisLine: {
                                    lineStyle: {
                                        color: '#fff',
                                        width: 1
                                    }
                                },
                                splitLine: {
                                    show: false
                                },
                                // 给y轴的lable添加点击事件
                                triggerEvent: true,
                                data: (function () {
                                    var newData = [];
                                    for (var k = 0; k < resjson.length; k++) {
                                        newData.push({
                                            name: resjson[k].indusName,
                                            value: resjson[k].value
                                        });
                                    }
                                    // newData.sort(compare('value')); //根据数值排序
                                    var sortData = [];
                                    for (var j = 0; j < newData.length; j++) {
                                        sortData.push(newData[j].name);
                                    }
                                    return sortData;
                                })()
                            },
                            color: paramObj.rankColor,
                            series: function () {
                                var data = [];
                                for (var j = 0; j < resjson.length; j++) {
                                    data.push({
                                        value: resjson[j].value,
                                        itemStyle: {
                                            normal: function () {
                                                var itemColor = {};
                                                for (var i = 0; i < paramObj.rankColor.length; i++) {
                                                    if (resjson[j].indusName == paramObj.rankColor[i][1]) {
                                                        itemColor.color = paramObj.rankColor[i][0];
                                                    }
                                                }
                                                return itemColor;
                                            }()
                                        },
                                        label: {
                                            normal: {
                                                show: false,
                                                position: 'top'
                                            }
                                        }
                                    });
                                }
                                var series = [{
                                    type: 'bar',
                                    data: data,
                                    markLine: {
                                        symbol: ['none', 'none'],
                                        silent: true,
                                        label: {
                                            normal: {
                                                show: false,
                                            }
                                        },
                                        lineStyle: {
                                            normal: {
                                                type: 'solid',
                                                color: "#00ff32",
                                                width: 2
                                            }
                                        },
                                        data: [],
                                        animation: false
                                    }
                                }, {
                                    name: 'glyph',
                                    type: 'pictorialBar',
                                    barGap: '-100%',
                                    symbolPosition: 'end',
                                    symbolSize: 14,
                                    symbolOffset: ['-600%', 0],
                                    data: paramObj.pictorialBarData
                                }];
                                return series;
                            }()
                        }
                    };
                    if (type != "_inc_inc_yoy") {
                        barOption.baseOption.tooltip.formatter = function (params) {
                            return params[0].name + '<br/>数值：' + params[0].value.toFixed(2) + "<br/>占比：" + (params[0].value / result.resultBody.data.total * 100).toFixed(2) + '%';
                        }
                    }
                    paramObj.barChart.setOption(barOption, true);
                } else if (result.resultCode === "201") {
                    $.dialog({
                        type: "alert",
                        onClickOk: function () {},
                        autoClose: 0,
                        contentHtml: `<p style="text-align:center;">暂时无数据</p>`
                    });
                }
            },
            error: function (err) {
                console.log(err);
            }
        })
    }

    $("li.swiper-pagination-bullet").on("click", function () {
        //判断是否在原标签点击
        if (!$(this).hasClass("swiper-pagination-bullet-active")) {
            //确认chart
            var chartIndex = $(this).index(),
                chartBox = $(".energy_swiper_wrap .swiper-slide").eq(chartIndex).children(),
                chartId = chartBox.attr("id"),
                energy_type = $(this).attr("type");
            //请求柱状图数据
            drawBar(chartId, energy_type);
        }
    })

    //颜色请求
    function getColor() {
        var color = localStorage.getItem("barColor")
        if (color) {
            color = JSON.parse(color);
            paramObj.rankColor = color.color;
        } else {
            $.ajax({
                url: paramObj.newCmsUrl + "colour/findIndexColourInfo/VA",
                async: false,
                success: function (result) {
                    if (result && result.resultCode === "200") {
                        var colorData = result.resultBody,
                            color = [];
                        for (var industry in colorData) {
                            color.push([colorData[industry], industry])
                        }
                        paramObj.rankColor = color;
                        //将颜色存到localStorage中
                        var storageColor = JSON.stringify({
                            color: color
                        });
                        localStorage.setItem("barColor", storageColor)
                    }
                },
                error: function (err) {
                    console.log(err + "请求柱状图颜色失败");
                }
            })
        }
    }

    function getArticle(params) {
        $.ajax({
            url: params.url,
            data: {
                topicId: params.topicId
            },
            success: function (result) {
                if (result.news == null) {
                    $(".comment").show();
                    $(".comment .content").hide();
                    $(".comment .tips").show();
                    $("#publish").hide();
                } else {
                    $(".comment").show();
                    $(".comment .content").show();
                    $(".comment .tips").hide();
                    $("#publish").css("display", "flex");
                    $(".article")[0].innerHTML = result.news.infoSummary;
                    paramObj.infoId = result.news.infoId;
                    paramObj.infoTitle = result.news.infoTitle;
                    $(".content a").attr("href", "./../pages/article.html?topic=" + result.news.topicId + "&info=" + result.news.infoId);
                    initOperate({
                        url: paramObj.newCmsUrl + "news/infoDetail",
                        token: paramObj.token,
                        infoId: paramObj.infoId
                    });
                    if (paramObj.token != "") {
                        getOperateData({
                            url: paramObj.newCmsUrl + "news/likeAgainstCountByTopic",
                            token: paramObj.token,
                            topicId: paramObj.topicId,
                            dom: result_chart
                        });
                    }
                    getOpinion({
                        url: paramObj.newCmsUrl + "comment/hotCommentForTopic",
                        proUrl: paramObj.newCmsUrl + "support/save",
                        token: paramObj.token,
                        infoId: paramObj.infoId,
                        sessionData: sessionData
                    });
                    paramObj.mescroll = new MeScroll("main", {
                        up: {
                            clearEmptyId: "opinion_ul",
                            page: {
                                num: 0,
                                size: 5,
                                url: paramObj.newCmsUrl + "comment/topCommentForTopic",
                                infoId: paramObj.infoId,
                                sessionData: sessionData,
                                token: paramObj.token
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
                }
            },
            error: function (err) {
                console.log(err);
            }
        })
    }
    // 上拉加载插件
    function upCallBack(params) {
        getNewOpinion({
            num: params.num,
            size: params.size,
            url: params.url,
            infoId: params.infoId,
            sessionData: params.sessionData,
            token: params.token,
            successCallback: function (result) {
                paramObj.mescroll.endSuccess(result.data.length);
                setNewOpinion(result);
            },
            errorCallback: function () {
                paramObj.mescroll.endErr();
            }
        });
    }
    // 最新评论
    function getNewOpinion(params) {
        $.ajax({
            url: params.url,
            beforeSend: function (xhr) {
                xhr.setRequestHeader("Authentication", params.token);
            },
            data: {
                pageNo: params.num,
                infoId: params.infoId,
                pageSize: params.size
            },
            success: function (result) {
                if (result.success) {
                    if (result.lastComment.length == 0 && params.page == 1) {
                        $(".newOpinion").hide();
                    } else {
                        $(".newOpinion").show();
                        if (result.lastComment.length > 0) {
                            paramObj.mescroll.endSuccess();
                            params.successCallback({
                                data: result.lastComment,
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
                } else {
                    redirectUrl();
                }
            },
            error: function (err) {
                params.errorCallback();
                console.log(err);
            }
        })
    }

    function setNewOpinion(params) {
        var lidom = createDom(params.data);
        $("#opinion_ul").append(lidom);
        $("#opinion_ul .btns .reply").click(function () {
            if (params.sessionData == null || JSON.parse(params.sessionData).data == undefined) {
                redirectUrl();
            } else {
                paramObj.fFlag = 1;
                paramObj.toUserName = $(this).attr("userName");
                paramObj.toUserId = $(this).attr("toUserId");
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
                        paramObj.toUserName = $(this).attr("userName");
                        paramObj.toUserId = $(this).attr("toUserId");
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
    // 支持专家评论
    $(".comment .btns .support").click(function () {
        if (sessionData == null || JSON.parse(sessionData).data == undefined) {
            redirectUrl();
        } else {
            getOperateRes({
                url: paramObj.newCmsUrl + "news/attitude",
                infoId: paramObj.infoId,
                flag: "like",
                token: paramObj.token
            });
            getOperateData({
                url: paramObj.newCmsUrl + "news/likeAgainstCountByTopic",
                token: paramObj.token,
                topicId: paramObj.topicId,
                dom: result_chart
            });
        }
    })
    // 反对专家评论
    $(".comment .btns .oppose").click(function () {
        if (sessionData == null || JSON.parse(sessionData).data == undefined) {
            redirectUrl();
        } else {
            getOperateRes({
                url: paramObj.newCmsUrl + "news/attitude",
                infoId: paramObj.infoId,
                flag: "against",
                token: paramObj.token
            });
            getOperateData({
                url: paramObj.newCmsUrl + "news/likeAgainstCountByTopic",
                token: paramObj.token,
                topicId: paramObj.topicId,
                dom: result_chart
            });
        }
    })
    $(".follow").click(function () {
        if (sessionData == null || JSON.parse(sessionData).data == undefined) {
            redirectUrl();
        } else {
            proFollow({
                url: paramObj.newCmsUrl + "indexCollention/insertIndexCollection",
                token: paramObj.token,
                collectionId: paramObj.topicId,
                collectionName: paramObj.indexName
            });
        }
    })
    // 返回按钮
    $(".header .back").click(function () {
        if (document.referrer.indexOf("collect") > -1 || document.referrer.indexOf("order") > -1) {
            window.location.href = document.referrer;
        } else {
            window.location.href = "./../forecast.html";
        }
    })
    // 精彩评论
    function getOpinion(params) {
        $.ajax({
            url: params.url,
            beforeSend: function (xhr) {
                xhr.setRequestHeader("Authentication", params.token);
            },
            data: {
                infoId: params.infoId
            },
            success: function (result) {
                if (result.success) {
                    if (result.hotComment.length == 0) {
                        $(".opinion").hide();
                    } else {
                        $(".opinion").show();
                        var lidom = "",
                            res = result.hotComment;
                        lidom = createDom(res);
                        $(".opinion .opinion_ul").append(lidom);
                        // 回复
                        $(".opinion .opinion_ul .btns .reply").click(function () {
                            if (params.sessionData == null || JSON.parse(params.sessionData).data == undefined) {
                                redirectUrl();
                            } else {
                                paramObj.fFlag = 1;
                                paramObj.toUserName = $(this).attr("userName");
                                paramObj.toUserId = $(this).attr("toUserId");
                                paramObj.topCommentId = $(this).attr("topCommentId");
                                paramObj.toCommentId = $(this).attr("toCommentId");
                                $("#txt").focus();
                            }
                        })
                        // 点赞or踩
                        clickFun({
                            url: params.proUrl,
                            sessionData: params.sessionData,
                            token: params.token
                        });

                        $(".opinion .opinion_ul .replyli").unbind("click").click(function () {
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
                                        paramObj.toUserName = $(this).attr("userName");
                                        paramObj.toUserId = $(this).attr("toUserId");
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
                }
            },
            error: function (err) {
                console.log(err);
            }
        })
    }
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
                            infoType: "expert_comment_news",
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
                            infoType: "expert_comment_news",
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

    initPage();

    function initPage() {
        getColor();
        drawBar("total", "_abs_r");
        // 初始化收藏
        if (sessionData == null || JSON.parse(sessionData).data == undefined) {

        } else {
            initFollow({
                url: paramObj.newCmsUrl + "indexCollention/findIndexCollectionByUserAndId",
                token: paramObj.token,
                collectionId: paramObj.topicId
            });
        }

        // 获取专家评论
        getArticle({
            url: paramObj.newCmsUrl + "news/lastInfoByTopic",
            topicId: paramObj.topicId
        });
    }
})