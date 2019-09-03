// 创建评论dom
function createDom(res) {
    var lidom = "";
    for (var i = 0; i < res.length; i++) {
        var support = "",
            oppose = "",
            img = "";
        if (res[i].attitude == null) {
            support = '<div class="support" comment=' + res[i].comment.commentId + ' flag=true style="background-image:url(./../../assets/images/btn/support.png)"></div>';
            oppose = '<div class="oppose" comment=' + res[i].comment.commentId + ' flag=true style="background-image:url(./../../assets/images/btn/oppose.png)"></div>';
        } else if (res[i].attitude == "like") {
            support = '<div class="support" comment=' + res[i].comment.commentId + ' flag=false style="background-image:url(./../../assets/images/btn/support_ed.png)"></div>';
            oppose = '<div class="oppose" comment=' + res[i].comment.commentId + ' flag=false style="background-image:url(./../../assets/images/btn/oppose.png)"></div>';
        } else if (res[i].attitude == "against") {
            support = '<div class="support" comment=' + res[i].comment.commentId + ' flag=false style="background-image:url(./../../assets/images/btn/support.png)"></div>';
            oppose = '<div class="oppose" comment=' + res[i].comment.commentId + ' flag=false style="background-image:url(./../../assets/images/btn/oppose_ed.png)"></div>';
        }
        if(res[i].userCardUrl != null){
            img = '<img src="'+ res[i].userCardUrl +'" alt="">';
        }
        lidom += '<li><div class="user"><div class="tips"><div class="photo" style="background-image:url(' + res[i].user.userHeadImage + ')"></div><div class="info"><p><span>' + res[i].user.userNickName + '</span>'+img+'</p><p>' + res[i].comment.commentTime + '</p></div></div><div class="btns">' + support + '<p class="supp">' + res[i].comment.likeCount + '</p>' + oppose + '<p>' + res[i].comment.againstCount + '</p>' + '<div class="reply" toUserId="' + res[i].user.userId + '" userName="' + res[i].user.userNickName + '" topCommentId="' + res[i].comment.commentId + '" toCommentId="' + res[i].comment.commentId + '">回复</div></div></div><div class="content" id="' + res[i].comment.commentId + '">' + res[i].comment.commentContent + '</div><div class="replyli" topCommentId=' + res[i].comment.commentId + '>' + res[i].comment.replyCount + '条回复</div></li>';
    }
    return lidom;
}

// 线图option
function lineOption() {
    var lineOption = {
        tooltip: {
            show: false,
            trigger: 'axis',
            backgroundColor: 'rgba(0,0,0,0.3)',
            hideDelay: 0,
            confine: true,
            axisPointer: {
                type: "none",
                // lineStyle:{
                //     color:"#818181"
                // }
            },
            formatter: function (params) {
                var tips = '',
                    date;
                if (Array.isArray(params)) {
                    if (params[0].data[1] == null) {
                        return;
                    } else {
                        date = new Date(params[0].data[0]);
                        var tipsTime = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate() + "<br/>";
                        for (var i = 0; i < params.length; i++) {
                            if (i == 0) {
                                tipsTime = tipsTime + params[i].seriesName + '：' + parseFloat(params[i].value[1]).toFixed(2) + '<br>';
                            } else {
                                if (params[i].seriesName == params[i - 1].seriesName) {
                                    continue;
                                } else {
                                    tipsTime = tipsTime + params[i].seriesName + '：' + parseFloat(params[i].value[1]).toFixed(2) + '<br>';
                                }
                            }
                        }
                        return tipsTime;
                    }
                } else {
                    if (params.data[1] == null) {
                        return;
                    } else {
                        date = new Date(params.data[0]);
                        var tipsTime = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate() + "<br/>";
                        tips += tipsTime + (params.seriesName || 'value') + ':' + parseFloat(params.data[1]).toFixed(2);
                        return tips;
                    }
                }
            }
        },
        grid: {
            containLabel: true,
            top: '7%',
            left: '1%',
            width: '98%',
            height: '95%'
        },
        // dataZoom: [{
        //         show: false,
        //         start: 0,
        //         end: 100
        //     },
        //     {
        //         type: 'inside',
        //         start: 0,
        //         end: 100
        //     }
        // ],
        xAxis: {
            type: 'time',
            position: 'bottom',
            axisLabel: {
                margin: 10,
                textStyle: {
                    color: '#aaa9a9',
                    fontSize: 10,
                },
                formatter: function (params) {
                    var year = (new Date(params)).getFullYear(),
                        month = (new Date(params)).getMonth() + 1,
                        date = (new Date(params)).getDate();
                    if (month < 10) {
                        month = '0' + month;
                    }
                    if (date < 10) {
                        date = '0' + date;
                    }
                    return (year + "").substr(2) + "." + month + "." + date;
                },
                rotate: 46
            },
            axisLine: {
                lineStyle: {
                    color: '#787878',
                    width: 1,
                    type: 'solid'
                }
            },
            axisTick: {
                show: false,
                alignWithLabel: true,
                inside: true
            },
            splitLine: {
                show: false,
            },
            splitArea: {
                show: false,
            }
        },
        yAxis: {
            type: 'value',
            nameGap: 10,
            scale: true, //脱离0值比例
            splitNumber: 4,
            boundaryGap: false,
            axisLabel: {
                margin: 12,
                color: '#555',
                fontFamily: 'arial',
                fontSize: 10,
                formatter: function (v) {
                    if (1) {
                        return v.toFixed(1);
                    } else {
                        return '';
                    }
                }
            },
            axisLine: {
                show: false,
                lineStyle: {
                    color: '#ddd', //y轴
                    width: 1,
                    type: 'solid'
                }
            },
            axisTick: {
                onGap: false,
                show: false,
            },
            splitArea: {
                show: false
            },
            splitLine: {
                show: true,
                lineStyle: {
                    color: '#424245'
                }
            },
            axisPointer: {
                show: false,
            }
        },
        series: []
    };
    return lineOption;
}

// yyyy-mm-dd转date格式
function time2Datetime(array) {
    var copyArray = new Array();
    for (var i = 0; i < array.length; i++) {
        copyArray[i] = [new Date(array[i].date || array[i].statDate), array[i].value];
    }
    return copyArray
}

// 获取MarkLine的time值
function getTime() {
    var timeNow = new Date();
    var year = timeNow.getFullYear();
    var month = timeNow.getMonth() + 1;
    if (month < 10) {
        month = '0' + month;
    }
    var date = timeNow.getDate();
    if (date < 10) {
        date = '0' + date;
    }
    var hours = timeNow.getHours();
    if (hours < 10) {
        hours = '0' + hours;
    }
    var minutes = timeNow.getMinutes();
    if (minutes < 10) {
        minutes = '0' + minutes;
    }
    var second = timeNow.getSeconds();
    if (second < 10) {
        second = '0' + second;
    }
    var untilDay = year + '-' + month + '-' + date,
        untilMonth = year + month,
        untilSecond = hours + ':' + minutes + ':' + second;
    return {
        year: year,
        month: month,
        untilDay: untilDay,
        untilMonth: untilMonth,
        untilSecond: untilSecond
    }
}
// 刷新token
function refreshToken(token) {
    var newToken;
    $.ajax({
        url: 'https://m.tjresearch.cn/auth/account/refresh',
        beforeSend: function (xhr) {
            xhr.setRequestHeader("Authentication", token);
        },
        type: "post",
        async: false,
        success: function (res) {
            if (res.status == "200") {
                newToken = res.body;
            } else if (result.status == "401") {
                redirectUrl();
            }
        },
        error: function (err) {
            console.log(err);
        }
    })
    return newToken;
}
// 初始化专家评论的支持or反对
function initOperate(params) {
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
                if (result.news.attitude.isAgainst != 0 || result.news.attitude.isLike != 0) {
                    $(".operate .btns").hide();
                    $(".operate .result").show();
                    if (result.attitude.isLike == 1) {
                        $(".result .tip")[0].innerHTML = "投票成功，感谢您的<span>支持</span>！";
                        $(".result .tip span").css("color", "#de2c00");
                    } else if (result.attitude.isAgainst == 1) {
                        $(".result .tip")[0].innerHTML = "感谢您的参与，我们将继续努力！";
                    }
                } else {
                    $(".operate .btns").show();
                    $(".operate .result").hide();
                }
            } else if (params.token == "") {
                $(".operate .btns").show();
                $(".operate .result").hide();
            } else {
                redirectUrl();
            }
        },
        error: function (err) {
            console.log(err);
        }
    })
}
// 专家评论的支持or反对
function getOperateRes(params) {
    $.ajax({
        url: params.url,
        async: false,
        beforeSend: function (xhr) {
            xhr.setRequestHeader("Authentication", params.token);
        },
        data: {
            infoId: params.infoId,
            att: params.flag
        },
        success: function (result) {
            if (result.success) {
                $(".operate .btns").hide();
                $(".operate .result").show();
                if (result.attitude.isLike == 1) {
                    $(".result .tip")[0].innerHTML = "投票成功，感谢您的<span>支持</span>！";
                    $(".result .tip span").css("color", "#de2c00");
                } else if (result.attitude.isAgainst == 1) {
                    $(".result .tip")[0].innerHTML = "感谢您的参与，我们将继续努力！";
                }
            } else {
                redirectUrl();
            }
        },
        error: function (err) {
            console.log(err);
        }
    })
}
// 获取支持反对图表
function getOperateData(params) {
    var option = {
        tooltip: {
            trigger: 'axis',
            confine: true,
            backgroundColor: 'rgba(0,0,0,0.3)',
            axisPointer: {
                type: 'line'
            },
            formatter: function (params) {
                var tip = "";
                for (var i = params.length - 1; i >= 0; i--) {
                    tip += params[i].seriesName + ":" + params[i].data.toFixed(1) + '%<br>';
                }
                return tip;
            }
        },
        grid: {
            containLabel: true,
            top: '7%',
            left: 'left',
            width: '90%',
            height: '90%'
        },
        yAxis: {
            type: 'value',
            scale: false, //脱离0值比例
            splitNumber: 2,
            boundaryGap: false,
            max: 100,
            axisLabel: {
                color: '#555',
                fontFamily: 'arial',
                fontSize: 10,
                formatter: function (v) {
                    return v + "%";
                }
            },
            axisLine: {
                show: false,
                lineStyle: {
                    color: '#ddd',
                    width: 1,
                    type: 'solid'
                }
            },
            axisTick: {
                onGap: false,
                show: false,
            },
            splitArea: {
                show: false
            },
            splitLine: {
                show: true,
                lineStyle: {
                    color: '#e1e1e7'
                }
            },
            axisPointer: {
                show: false,
            }
        },
        xAxis: {
            type: 'category',
            data: [],
            position: 'bottom',
            axisLabel: {
                margin: 10,
                textStyle: {
                    color: '#aaa9a9',
                    fontSize: 10,
                },
                formatter: function (params) {
                    return params.split("-").join(".");
                }
            },
            axisLine: {
                lineStyle: {
                    color: '#e1e1e7',
                    width: 1,
                    type: 'solid'
                }
            },
            axisTick: {
                show: false,
                alignWithLabel: true,
                inside: true
            },
            splitLine: {
                show: false,
            },
            splitArea: {
                show: false,
            }
        },
        series: [{
            name: '反对',
            type: 'bar',
            stack: '总量',
            barMaxWidth: "30",
            itemStyle: {
                normal: {
                    color: "#009944",
                    lineStyle: {
                        width: 2,
                        type: 'solid',
                        color: "#009944"
                    }
                }
            },
            data: []
        }, {
            name: '支持',
            type: 'bar',
            stack: '总量',
            barMaxWidth: "30",
            itemStyle: {
                normal: {
                    color: "#e02c2c",
                    lineStyle: {
                        width: 2,
                        type: 'solid',
                        color: "#e02c2c"
                    }
                }
            },
            data: []
        }]
    };
    $.ajax({
        url: params.url,
        beforeSend: function (xhr) {
            xhr.setRequestHeader("Authentication", params.token);
        },
        data: {
            topicId: params.topicId,
            type: params.type
        },
        success: function (result) {
            if (result.success) {
                var againstData = [],
                    xdata = [],
                    likeData = [];
                result.againstData.forEach(function (v) {
                    againstData.push(v.value);
                    xdata.push(v.date)
                })
                result.likeData.forEach(function (v) {
                    likeData.push(v.value)
                })
                option.xAxis.data = xdata;
                option.series[1].data = likeData;
                option.series[0].data = againstData;
                params.dom.setOption(option, true);
            } else {
                redirectUrl();
            }
        },
        error: function (err) {
            console.log(err);
        }
    })
}
//初始化收藏
function initFollow(params) {
    $.ajax({
        url: params.url,
        beforeSend: function (xhr) {
            xhr.setRequestHeader("Authentication", params.token);
        },
        data: {
            collectionId: params.collectionId,
            indexId: params.indexId
        },
        cache: false,
        success: function (result) {
            if (result.resultCode == "200") {
                if (result.resultBody.result == 0) {
                    $(".follow").css("background-image", "url(./../../assets/images/forecast/collect.png)");
                } else {
                    $(".follow").css("background-image", "url(./../../assets/images/forecast/collected.png)");
                }
            } else if (result.resultCode == "401" || result.resultCode == "402" || result.resultCode == "405") {
                redirectUrl();
            }
        },
        error: function (err) {
            console.log(err);
        }
    })
}
//操作收藏
function proFollow(params) {
    $.ajax({
        url: params.url,
        beforeSend: function (xhr) {
            xhr.setRequestHeader("Authentication", params.token);
        },
        data: {
            collectionId: params.collectionId,
            collectionName: params.collectionName,
            indexId: params.indexId
        },
        success: function (result) {
            if (result.resultCode == "200") {
                if (result.resultBody.result == 0) {
                    $(".follow").css("background-image", "url(./../../assets/images/forecast/collect.png)");
                } else {
                    $(".follow").css("background-image", "url(./../../assets/images/forecast/collected.png)");
                }
            } else if (result.resultCode == "401" || result.resultCode == "402" || result.resultCode == "405") {
                redirectUrl();
            }
        },
        error: function (err) {
            console.log(err);
        }
    })
}
// 初始化点赞or踩
function insertBtnData(params) {
    var res;
    $.ajax({
        url: params.url,
        async: false,
        beforeSend: function (xhr) {
            xhr.setRequestHeader("Authentication", params.token);
        },
        data: {
            sufferId: params.sufferId,
            attitude: params.attitude,
            sufferType: params.sufferType
        },
        success: function (result) {
            if (result.success) {
                res = result.attitude;
            } else if (result.msg == "REPEATERROR") {
                console.log(result.msg);
            } else {
                redirectUrl();
            }
        },
        error: function (err) {
            console.log(err);
        }
    })
    return res;
}
// 点赞or踩
function clickFun(params) {
    $(".opinion_ul .support").unbind('click').click(function () {
        if (params.sessionData == null || JSON.parse(params.sessionData).data == undefined) {
            redirectUrl();
        } else {
            if ($(this).attr("flag") == "true") {
                var res = insertBtnData({
                    url: params.url,
                    token: params.token,
                    sufferId: $(this).attr("comment"),
                    attitude: "like",
                    sufferType: "comment"
                });
                $(this).attr("flag", "false");
                $(this).css("background-image", "url(./../../assets/images/btn/support_ed.png)");
                $(this).next().next().attr("flag", "false");
                $(this).next()[0].innerText = res.likeCount;
            } else {
                alert("您已赞过或踩过！");
            }
        }
    })

    $(".opinion_ul .oppose").unbind('click').click(function () {
        if (params.sessionData == null || JSON.parse(params.sessionData).data == undefined) {
            redirectUrl();
        } else {
            if ($(this).attr("flag") == "true") {
                var res = insertBtnData({
                    url: params.url,
                    token: params.token,
                    sufferId: $(this).attr("comment"),
                    attitude: "against",
                    sufferType: "comment"
                });
                $(this).attr("flag", "false");
                $(this).css("background-image", "url(./../../assets/images/btn/oppose_ed.png)");
                $(this).prev().prev().attr("flag", "false");
                $(this).next()[0].innerText = res.againstCount;
            } else {
                alert("您已赞过或踩过！");
            }
        }
    })
}
// 发送观点or回复
function giveReply(params) {
    var flag;
    $.ajax({
        url: params.url,
        beforeSend: function (xhr) {
            xhr.setRequestHeader("Authentication", params.token);
        },
        data: params.data,
        success: function (result) {
            if (result.success) {
                if (params.fFlag == 1) {
                    alert("回复已提交，系统审核中...");
                    $("#txt").val("");
                } else {
                    alert("观点已提交，系统审核中...");
                    $("#txt").val("");
                }
                flag = 0;
            } else {
                redirectUrl();
            }
        },
        error: function (err) {
            console.log(err);
        }
    })
    return flag;
}
//查看回复列表
function replyList(params) {
    var res = "";
    $.ajax({
        url: params.url,
        async: false,
        beforeSend: function (xhr) {
            xhr.setRequestHeader("Authentication", params.token);
        },
        data: {
            infoId: params.infoId,
            topCommentId: params.topCommentId
        },
        success: function (result) {
            if (result.reply.length != 0) {
                for (var j = 0; j < result.reply.length; j++) {
                    res += '<li><span>' + result.reply[j].user.userNickName + '<span>回复</span>' + result.reply[j].toUser.userNickName + '</span><span>' + result.reply[j].comment.commentContent + '</span><span class="replys" toUserId="' + result.reply[j].user.userId + '" userName="' + result.reply[j].user.userNickName + '" topCommentId="' + params.topCommentId + '" toCommentId="' + result.reply[j].comment.commentId + '">回复</span></li>';
                }
            }
        },
        error: function (err) {
            console.log(err);
        }
    })
    return res;
}
// url重定向到登录页面 token刷新
function redirectUrl() {
    sessionStorage.removeItem("Authentication");
    $.dialog({
        type: "confirm",
        onClickOk: function () {
            sessionStorage.setItem('url', document.referrer);
            window.location.href = commonParamObj.redirectUrl;
        },
        // onClickCancel: function () {
        //     debugger;
        //     return false;
        // },
        contentHtml: `<p style="text-align:left;">未登录或登录信息失效，请点击“确定”重新登录</p>`
    });
}
/************************************/
//获取数组中最大值，最小值
function gainMaxAndMinFromArr (data) {
    var max = data[0],
        min = data[0];
    for (var i = 1; i < data.length; i++) {
        if (max < data[i]) {
            max = data[i];
        }
        if (min > data[i]) {
            min = data[i];
        }
    }
    return {
        max: max,
        min: min
    }
}
//给点赞和踩绑定点击事件
function bindOneClick(params) {
    var id = params.id,
        index = params.index,
        className = params.className,
        url = params.url,
        periodId = params.periodId;
    $(`${className}[parent_id=${id}]`).one("click", ".hand", function (e) {
        // console.log(e.target)
        var _this = this;
        // var attitudeNum = Number($(this).next().text());
        var targetNode = $(e.target);
        //标识
        var flag = 1;
        if (targetNode.hasClass("like")) {
            // attitudeNum++;
        } else {
            flag = -1;
        }
        $.ajax({
            url: url,
            beforeSend: function (xhr) {
                xhr.setRequestHeader("Authentication", params.token);
            },
            data: {
                infoId: id,
                commentId: id,
                periodId: periodId,
                commentId: id,
                flag: flag
            },
            success: function (result) {
                if (result && result.status === "200") {
                    var attitudeNum = 0;
                    if (flag === 1) {
                        attitudeNum = result.body.praise || result.body.support || result.body.p;
                        targetNode.toggleClass("like").toggleClass("like_active");
                        $(_this).parent().find(".like_num").text(attitudeNum);

                    } else if (flag === -1) {
                        attitudeNum = result.body.trample || result.body.against || result.body.t;
                        targetNode.toggleClass("dislike").toggleClass("dislike_active");
                        //如果有踩计数
                        if ($(_this).parent().find(".dislike_num")) {
                            $(_this).parent().find(".dislike_num").text(attitudeNum);
                        }
                    }
                    // $(_this).next().text(attitudeNum);
                } else if (result.status === "401") {
                    $.dialog({
                        type: "confirm",
                        onClickOk: function () {
                            //跳转到登录页
                            window.location.href = commonParamObj.redirectUrl;
                        },
                        autoClose: 0,
                        contentHtml: `<p style="text-align:center;">未登录或登录信息失效，请点击“确定”重新登录</p>`
                    });
                    //操作失败，需再次绑定事件
                    bindOneClick(params);
                } else {
                    bindOneClick(params);
                }
            },
            error: function (err) {
                console.log(err);
                $.dialog({
                    type: "alert",
                    onClickOk: function () {
                        return false;
                    },
                    autoClose: 0,
                    contentHtml: `<p style="text-align:center;">${err}操作失败，请刷新重试。</p>`
                });
                //操作失败，需再次绑定事件
                bindOneClick(params);
            }
        })
    })
}
//给点赞和踩绑定点击事件 观点拉锯评论/资讯       
function praiseOneClick(params) {
    var id = params.id,
        index = params.index,
        className = params.className,
        url = params.url,
        periodId = params.periodId;

    $(`${className}[parent_id=${id}]`).one("click", ".hand", function (e) {
        // console.log(e.target)
        var _this = this;
        var sufferId = $(this).attr("parent_id");
        // var attitudeNum = Number($(this).next().text());
        var targetNode = $(e.target);
        //标识
        var flag = "like";
        if (targetNode.hasClass("like")) {
            // attitudeNum++;
        } else {
            flag = "against";
        }
        $.ajax({
            url: url,
            beforeSend: function (xhr) {
                xhr.setRequestHeader("Authentication", params.token);
            },
            data: {
                sufferId: sufferId,
                attitude: flag,
                token: params.token,
                sufferType: "comment"
            },
            success: function (result) {
                if (result.success) {
                    var attitudeNum = 0;
                    if (flag === "like") {
                        attitudeNum = result.attitude.likeCount;
                        targetNode.toggleClass("like").toggleClass("like_active");
                        $(_this).parent().find(".like_num").text(attitudeNum);

                    } else if (flag === "against") {
                        attitudeNum = result.attitude.againstCount;
                        targetNode.toggleClass("dislike").toggleClass("dislike_active");
                        //如果有踩计数
                        if ($(_this).parent().find(".dislike_num")) {
                            $(_this).parent().find(".dislike_num").text(attitudeNum);
                        }
                    }
                    // $(_this).next().text(attitudeNum);
                } else if (result.msg = "USERERROR") {
                    $.dialog({
                        type: "confirm",
                        onClickOk: function () {
                            //跳转到登录页
                            window.location.href = commonParamObj.redirectUrl;
                        },
                        autoClose: 0,
                        contentHtml: `<p style="text-align:center;">未登录或登录信息失效，请点击“确定”重新登录</p>`
                    });
                    //操作失败，需再次绑定事件
                    praiseOneClick(params);
                } else {
                    praiseOneClick(params);
                }
            },
            error: function (err) {
                console.log(err);
                $.dialog({
                    type: "alert",
                    onClickOk: function () {
                        return false;
                    },
                    autoClose: 0,
                    contentHtml: `<p style="text-align:center;">${err}操作失败，请刷新重试。</p>`
                });
                //操作失败，需再次绑定事件
                praiseOneClick(params);
            }
        })
    })
}

//获取url中的参数
function parseURL(url) {
    var urlCopy = url.replace(/\&amp;/g,"&").split("?")[1];
    var res = {};
    if (urlCopy) {
        var para = urlCopy.split("&");
        var len = para.length;
        var arr = [];
        for (var i = 0; i < len; i++) {
            arr = para[i].split("=");
            res[arr[0]] = decodeURI(decodeURI(arr[1]))
        }
    }
    return res;
};
//格式化时间戳为'几分钟前'、'几小时前'等
function getDateDiff(dateStr) {
    var dateTimeStamp = Date.parse(dateStr.replace(/-/gi, "/"));
    var minute = 1000 * 60;
    var hour = minute * 60;
    var day = hour * 24;
    // var halfamonth = day * 15;
    var month = day * 30;
    var now = new Date().getTime();
    var diffValue = now - dateTimeStamp;
    if (diffValue < 0) {
        return;
    }
    var monthC = diffValue / month;
    var weekC = diffValue / (7 * day);
    var dayC = diffValue / day;
    var hourC = diffValue / hour;
    var minC = diffValue / minute;
    var result = "";
    if (monthC >= 1) {
        result = "" + parseInt(monthC) + "月前";
    } else if (weekC >= 1) {
        result = "" + parseInt(weekC) + "周前";
    } else if (dayC >= 1) {
        result = "" + parseInt(dayC) + "天前";
    } else if (hourC >= 1) {
        result = "" + parseInt(hourC) + "小时前";
    } else if (minC >= 1) {
        result = "" + parseInt(minC) + "分钟前";
    } else
        result = "刚刚";
    return result;
}
//获取当前周和上周日期
function getWeek(i, lastWeek) {
    var now = new Date();
    //上周
    if (lastWeek) {
        var firstDay = new Date(now - (now.getDay() - 1 + 7) * 86400000);
    }
    //当前周
    else {
        var firstDay = new Date(now - (now.getDay() - 1) * 86400000);
    }
    // var timeData = new Date(firstDay);
    firstDay.setDate(firstDay.getDate() + i);
    var timeData = new Date(firstDay);
    var mon = Number(firstDay.getMonth()) + 1;
    var date = firstDay.getDate();
    mon = mon < 10 ? "0" + mon : mon;
    date = date > 9 ? date : "0" + date;
    // console.log(timeData.getFullYear() + "-" + mon + "-" + date)

    return timeData.getFullYear() + "-" + mon + "-" + date;
}
// 是否跳转到详情页
function toSkip(parentClass, aLinkClass) {
    var sessionData = sessionStorage.getItem("Authentication");
    $(parentClass).on("click", aLinkClass, function (e) {
        if (sessionData == null || JSON.parse(sessionData).data == undefined) {
            $.dialog({
                type: "confirm",
                onClickOk: function () {
                    //跳转到登录页
                    window.location.href = commonParamObj.redirectUrl;
                },
                autoClose: 0,
                contentHtml: `<p style="text-align:center;">未登录或登录信息失效，请点击“确定”重新登录</p>`
            });
            return false;
        }
    })
}
//dialog confirm
function dialogConfirm(tip) {
    sessionStorage.removeItem("Authentication");
    var tip = tip || `未登录或登录信息失效，请点击“确定”重新登录`
    $.dialog({
        type: "confirm",
        onClickOk: function () {
            //跳转到登录页
            window.location.href = commonParamObj.redirectUrl;
        },
        autoClose: 0,
        contentHtml: `<p style="text-align:center;">${tip}</p>`
    });
}
//dialog alert
function dialogAlert(tip, closeTime) {
    var tip = tip || "";
    $.dialog({
        type: "alert",
        onClickOk: function () {
            return false;
        },
        // autoClose: function(){
        //     // 只有传过来的closeTime值为undefined时，才设置默认的2000关闭时间
        //     return closeTime=closeTime==undefined?2000:closeTime;
        // }(),
        autoClose: 0,
        contentHtml: `<p style="text-align:center;">${tip}</p>`
    });
}
// 渲染星星
function showStarInfo(starWrpaDom, star_index) {
    // if(star_index!=null){
    //给.star_ul添加isClick属性
    starWrpaDom.find(".star_ul").attr({
        "isClick": "true"
    })
    var middle_index = Math.floor(starInfo.starColorArr.length / 2);
    //3,2,1,0,-1,-2,-3 转成 0,1,2,3,4,5,6
    star_index = Math.abs(middle_index - star_index);
    //除中间星星外全部置灰
    starWrpaDom.find(".star").css({
        "color": "#a0a0a0"
    })
    starWrpaDom.find(".star").eq(middle_index).css({
        "color": starInfo.starColorArr[middle_index]
    })
    if (star_index === middle_index) {
        starWrpaDom.find(".star_text").css({
            "color": starInfo.starColorArr[middle_index]
        })
    }
    //利好
    else if (star_index < middle_index) {
        starWrpaDom.find(".bear").css({
            "color": "#a0a0a0"
        })
        starWrpaDom.find(".bull").css({
            "color": starInfo.starColorArr[star_index]
        })
        //给星星上色
        for (var i = middle_index; i >= star_index; i--) {
            // console.log(i);
            starWrpaDom.find(".star").eq(i).css({
                "color": starInfo.starColorArr[i]
            })
        }
    }
    //利空
    else {
        starWrpaDom.find(".bull").css({
            "color": "#a0a0a0"
        })
        starWrpaDom.find(".bear").css({
            "color": starInfo.starColorArr[star_index]
        })
        //给星星上色
        for (var i = middle_index + 1; i <= star_index; i++) {
            starWrpaDom.find(".star").eq(i).css({
                "color": starInfo.starColorArr[i]
            })
        }
    }
    return (star_index - middle_index) * -1;
    // }   
}
// 渲染综合评价星星
function showStarAvgInfo(wrapDom, starAvg_index) {
    var middle_index = Math.floor(starInfo.starColorArr.length / 2);

    // starAvg_index = 1.5
    //综合评分为整数
    if ((starAvg_index + '').indexOf(".") === -1) {
        console.log(starAvg_index)
        showStarInfo(wrapDom, starAvg_index)
        return false
    }
    //综合评分为小数
    else {
        var indexArr = (starAvg_index + '').split(".");
        var dotNum = indexArr[1];
        starAvg_index = parseInt(indexArr[0]);

        showStarInfo(wrapDom, starAvg_index)
        //画半颗星:关键点找出半颗星所在li的索引
        var halfStarIndex;
        if (indexArr[0].length <= 1) { //利好
            halfStarIndex = middle_index - starAvg_index - 1
        } else {
            halfStarIndex = middle_index - starAvg_index + 1
        }
        wrapDom.find(".star").eq(halfStarIndex)
            .attr({
                "data-content": "R"
            })
            .css({
                "--half-star-color": starInfo.starColorArr[halfStarIndex]
            })
        // 给“利空”“利好”颜色赋值
        if (halfStarIndex < middle_index) {
            wrapDom.find(".star").eq(halfStarIndex).addClass("left_half_star")
            wrapDom.find(".bear").css({
                "color": "#a0a0a0"
            })
            wrapDom.find(".bull").css({
                "color": starInfo.starColorArr[halfStarIndex]
            })
        } else {
            wrapDom.find(".star").eq(halfStarIndex).addClass("right_half_star")
            wrapDom.find(".bull").css({
                "color": "#a0a0a0"
            })
            wrapDom.find(".bear").css({
                "color": starInfo.starColorArr[halfStarIndex]
            })

        }

        // var halfStarStyle = window.getComputedStyle($(".half_star")[0], ':before')
        // .getPropertyValue('position');
        // halfStarStyle.color = starInfo.starColorArr[halfStarIndex]
        // .setProperty("color",starInfo.starColorArr[halfStarIndex])




        // wrapDom.find(".half_star:before")
        // document.styleSheet[0].addRule('.half_star:before','color:'+starInfo.starColorArr[halfStarIndex]);
        // $(".half_star").css({"color":starInfo.starColorArr[halfStarIndex]})
        // $(".half_star").attr({"data-content":"向后"})

        // console.log()
        // return starWidth

    }

}
//将评分操作同步到sessionStorage中
function updateStorage(obj) {
    obj.listData.forEach(data => {
        if (data.infoId === obj.listId) {
            data.currentStarCount = obj.listIndex
        }
    })
    sessionStorage.setItem(obj.storageKey, JSON.stringify(obj.listData));
}
//初始化 “收藏”功能
function handleFollow(params) {
    var target = params.target
    // new Promise(function(resolve,reject){
        var followResult;
        $.ajax({
            url: params.url,
            async:false,
            beforeSend: function (xhr) {
                xhr.setRequestHeader("Authentication", params.token);
            },
            data: params.data,
            success: function (result) {
                // console.log(result);
                if (result.resultBody && result.resultCode === "200") {
                    var followData = result.resultBody;
                    // resolve(followData)
                    if (!followData.result) { //未收藏
                        target.removeClass("followed").addClass("unFollow").text("收藏");
                    } else {
                        target.removeClass("unFollow").addClass("followed").text("取消收藏");
                    }
                    followResult = followData.result
                } else if (result.resultCode === "401" || result.resultCode === "402" || result.resultCode === "405") {
                    dialogConfirm(`未登录或登录信息失效，请点击“确定”重新登录后进行操作`);
                }else{
                    throw new Error("收藏操作错误")        
                }
            }
        })
        return followResult
    // }).then(function(followData){
        
    //     return followData
    // }).catch(function(err){
    // })
}
//"观点拉锯战"-显示支持和反对相关
function showViewOpinion(opinionData) {
    var supportNum = opinionData.likeCount , //支持数量
        againstNum = opinionData.againstCount ,
        neutralNum = opinionData.neutralCount || 0,
        // opinionText= opinionData.choice===1?:"反对",
        allOpinion = supportNum + againstNum + neutralNum,
        percentSupport = (supportNum / allOpinion * 100).toFixed(2), //支持百分比
        percentAgainst = (againstNum / allOpinion * 100).toFixed(2),
        percentNeutral = (neutralNum / allOpinion * 100).toFixed(2);
    $('.support_percent').text(percentSupport + '%')
    $('.oppose_percent').text(percentAgainst + '%')
    $('.neutral_percent').text(percentNeutral + '%')
    $('.support_bar').css({ "width": percentSupport + '%' })
    $('.oppose_bar').css({ "width": percentAgainst + '%' })
    $('.neutral_bar').css({ "width": percentNeutral + '%' })
        // percentSupport=90;
    $('.neutral_detail').css({ "left": percentSupport > 69 ? 69 + "%" : percentSupport + '%' })


    if (opinionData.isLike==1) {
        var opinionText = "支持";
        $(".opinion_txt").addClass("support_txt").removeClass("oppose_txt").removeClass("neutral_txt")
    } else if (opinionData.isAgainst==1) {
        var opinionText = "反对";
        $(".opinion_txt").addClass("oppose_txt").removeClass("support_txt").removeClass("neutral_txt")
    } else if(opinionData.isNeutral==1){
        var opinionText = "中立";
        $(".opinion_txt").addClass("neutral_txt").removeClass("support_txt").removeClass("oppose_txt")
    }
    $(".opinion_txt").text(opinionText)
    $(".essay_handle").hide();
    $(".essay_opinion").show();
}
var LinesCompareChart = function (param) {
    this.linesCompareChart = null;
    this.id = param.id || '';
    this.unit = param.unit || '';
    this.color = param.color || [];
    this.indexName = param.indexName || "历史数据"
    this.legend = param.legend || {
        show: false
    };
    this.grid = param.grid;
    this.xData = param.xData || [];
    this.seriesData = param.seriesData || [];
    this.axisLabelArr = [];
    this.option = {
        color: this.color,
        title: {
            text: this.indexName,
            top: "6%",
            textStyle: {
                color: '#00ffff',
                fontSize: 12,

            },
            left: 'center'
            // top: echart_option.rightTop
        },
        legend: this.legend,
        tooltip: {
            trigger: 'axis',
            formatter: function (params) {
                // console.log(params);
                // if(params.length>1){
                var formatterStr = '';
                params.forEach(data => {
                    // console.log(data)
                    // data.data[1] +=''+data.seriesName;
                    var seriesName = data.seriesName;
                    var value = Array.isArray(data.value) ? data.value[1] : data.value;
                    if (value) {
                        formatterStr += seriesName + ' ' + data.name + ' : ' + value + '<br/>'
                    }

                })
                return formatterStr
                // return params
                // }

            }
        },
        grid: this.grid || {
            left: 'center',
            width: '86%',
            height: '70%',
            bottom: '5%',
            containLabel: true
        },
        xAxis: {
            type: 'category',
            boundaryGap: true,
            splitNumber: 0,
            splitLine: {
                show: false,
                interval: 'auto',
                lineStyle: {
                    color: '#ddd'
                }
            },
            axisTick: {
                show: false,
                alignWithLabel: true,
            },
            axisLine: {
                lineStyle: {
                    color: '#eeeeee'
                }
            },
            axisLabel: {
                margin: 10,
                textStyle: {
                    color: "#fff",
                    fontSize: 14
                }
            },
            axisPointer: {
                show: true,
                label: {
                    show: false
                },
                lineStyle: {
                    width: 1,
                    type: 'solid'
                },
            },
            data: this.xData
        },
        yAxis: {
            type: 'value',
            name: this.unit,
            min: function (value) {
                return Math.floor(value.min).toFixed(1);
            },
            // min: 6,
            splitLine: {
                show: true,
                lineStyle: {
                    color: '#454545',
                }
            },
            axisTick: {
                show: false
            },
            axisLine: {
                show: true,
                lineStyle: {
                    color: '#eeeeee'
                }
            },
            axisLabel: {
                margin: 10,
                textStyle: {
                    color: "#fff",
                    fontSize: 12
                }
            }
        },
        series: [{
            type: 'line',
            name: this.indexName,
            smooth: true,
            symbol: "circle",
            showSymbol: true,
            symbolSize: 4,
            itemStyle: {
                normal: {
                    color: '#fff',
                    borderColor: "#0ff",
                    borderWidth: 2,
                }
            },
            lineStyle: {
                normal: {
                    width: 2,
                    color: '#00ffff'
                }
            },
            data: this.seriesData
        }]
    }
};
LinesCompareChart.prototype = {
    init: function () {
        var _this = this;
        this.linesCompareChart = echarts.init(document.getElementById(this.id));
        this.linesCompareChart.clear();
        this.linesCompareChart.setOption(this.option, true);
    },
    resize: function () {
        var _this = this;
        window.addEventListener('resize', function () {
            _this.linesCompareChart.resize();
        })
    },
}
//水平单条柱状图
var HorBarChart = function(param){
    this.chartDom = param.chartDom;
    this.horBarChart = echarts.init(this.chartDom);
    this.title = param.title||"";
    this.legend = param.legend||[];
    this.colors = ["#c89fec", "#81a6ec", "#a3ea8b", "#eac774", "#ea7274"];
    this.seriesData = param.seriesData;
    var _max = 1;
    this._label = {
        normal: {
            show: true,
            position: 'inside',
            formatter: function (v) {
                // return (v.value / _max * 100).toFixed(0)
            },
            textStyle: {
                color: '#fff',
                fontSize: 16
            }
        }
    };
    this.option = {
        backgroundColor: '#42424f',
        title: {
            text: this.title,//统计图标题
            left: 'center',
            top: 'top',
            textStyle: {
                color: '#ffffff',//统计图标题的文字颜色
                fontSize: '12',
                fontWeight: "lighter"
            }
        },
        legend: {
            data: this.legend,
            textStyle: {
                color: '#ffffff',
                fontWeight:"lighter"
            },
            bottom: 'bottom'
        },
        grid: {
            containLabel: true,
            left: "center",
            top: "15%",
            width: "88.2%",
            height: "50%",
        },
        tooltip: {
            show: true,
            // backgroundColor: '#fff',
            // borderColor: '#ddd',
            // borderWidth: 1,
            textStyle: {
                color: '#ffffff',
                fontWeight:"lighter"
            },
            formatter: function (obj) {
                return obj.seriesName+'<br>'+obj.value+"%"
            },
            // extraCssText: 'box-shadow: 0 0 5px rgba(0, 0, 0, 0.1)'
        },
        xAxis: {
            // splitNumber: spNum,
            // interval: _max / spNum,
            // max: _max,
            // boundaryGap:"1%",
            position: "top",
            show: true,
            // axisLabel: {
            //     show: true,
            //     formatter: function (v) {
            //         var _v = (v / _max * 100).toFixed(0);
            //         return _v == 0 ? _v : _v + '%';
            //     }
            // },
            axisLine: {
                show: false
            },
            axisTick: {
                show: false
            },
            axisLabel: {
                color: "#ffffff",
                fontWeight: "lighter",
                formatter: function (v) {
                    return v+"%";
                },
            },
            splitLine: {
                show: true,
                lineStyle: {
                    color: "#717171"
                }
            }

        },
        yAxis: {
            data: [''],
            boundaryGap: ['20%', '20%'],
            axisLabel: {
                // show:false,
                fontSize: 16,
                color: '#fff'
            },
            axisLine: {
                show: false
            },
            axisTick: {
                show: false
            },
            splitLine: {
                show: false
            }
        },
        series: []
    };
    this.init();
}
HorBarChart.prototype.init = function(){
    this.option.series = [];
    for(var i=0;i<this.seriesData.length;i++){
        var data = {
            type: 'bar',
            name: this.legend[i],
            stack: '2',
            legendHoverLink: false,
            barWidth: 40,
            // label: this._label,
            itemStyle: {
                normal: {
                    color: this.colors[i]
                }
            },
            data: [this.seriesData[i]]
        };
        this.option.series.push(data);
    }
    this.horBarChart.setOption(this.option);
}
//雷达图
var RadarChart = function(param){
    this.chartDom = param.chartDom;
    this.radarChart = echarts.init(this.chartDom);
    this.title = param.title||'';
    this.name = param.name||'';
    this.indicator = param.indicator;
    this.seriesData = param.seriesData;
    var _this = this;
    this.option = {
        title: {
            text: 'VAD组成成分贡献率（%）',//统计图标题
            left: 'left',
            top: 'top',
            textStyle: {
                color: '#fff71b',//统计图标题的文字颜色
                fontSize: '12',
                fontWeight: "lighter"
            }
        },
        tooltip:{
            show:true,
            textStyle:{
                fontWeight:"lighter"
            },
            position:"bottom",
            formatter:function(params){
                let tooltipStr = params.name;
                for(var i=0;i<params.value.length;i++){
                    tooltipStr += `<br>${_this.indicator[i]}:${params.value[i]}%`
                }
                return tooltipStr;
            }
        },
        legend: { //图例的设置
            show: true, //是否显示图例
            icon: 'roundRect',//图例形状，示例为原型
            left: 'left',
            top: '8%',
            orient:"vertical",
            itemGap:5,
            // bottom: 15,//图例离底部的距离
            itemWidth: 12, // 图例标记的图形宽度。
            itemHeight: 12, // 图例标记的图形高度。
            itemGap: 20, // 图例每项之间的间隔。
            textStyle: {//图例文字的样式设置
                fontSize: 12,
                color: '#fff',
                fontWeight: "lighter"
            },
            data: [this.name],//图例的名称数据
        },
        radar: [{//每个网格的指数名称，类似于X轴或Y轴上的数据的值大小
            indicator: function(){
                var indicator = [];
                for(var i=0;i<_this.indicator.length;i++){
                    var data = {
                        text:_this.indicator[i],
                        // max:1,
                        // min:-1
                    }
                    indicator.push(data);
                }
                return indicator;
            }(),
            center: ['50%', '50%'],//统计图位置，示例是居中
            radius: '70%',//统计图大小
            startAngle: 90,//统计图起始的角度
            splitNumber: 3,//统计图蛛网的网格分段，示例分为三段
            // shape: 'circle',//蛛网是圆角还是尖角
            name: {
                formatter: '{value}',//蛛网轴尖的数据名称
                textStyle: {//蛛网轴尖的文字样式
                    fontSize: 12, //外圈标签字体大小
                    color: '#ffffff', //外圈标签字体颜色
                    fontWeight: "lighter"
                }
            },
            splitArea: { // 蛛网在 grid 区域中的分隔区域，默认不显示。
                show: true,
                areaStyle: { // 分隔区域的样式设置。
                    // color: ['rgba(76, 140, 200, 0.05)', 'rgba(76, 140, 200, 0.1)'], // 分隔区域颜色。分隔区域会按数组中颜色的顺序依次循环设置颜色。默认是一个深浅的间隔色。
                    color: ["#2c2c3b", "#42424f"]
                }
            },
            axisLine: { //蛛网轴线上的颜色，由内向外发散的那条
                lineStyle: {
                    color: '#6d6d6d'
                }
            },
            splitLine: {//蛛网环形的线条颜色
                lineStyle: {
                    color: 'rgba(255, 255, 255, 0.5)', // 分隔线颜色
                    width: 1, // 分隔线线宽
                }
            }
        },],
        color:["#04e9eb","#f06161"],
        series: [{
            name: '',
            type: 'radar',
            itemStyle: {//数据样式设置
                emphasis: {//鼠标悬浮效果
                    lineStyle: {
                        width: 2//线条粗细变成4
                    }
                }
            },
            lineStyle: {
                width: 1
            },
            emphasis:{
                label:{
                    show:false,
                    color:"#ffffff",
                    fontWeight:"lighter",
                    formatter: '{c}'+"%",
                    // position:"bottom"
                }
            },
            data: [{
                name: this.name,//数据名称
                value: this.seriesData,
                areaStyle: {
                    normal: { // 单项区域填充样式
                        color: {
                            x: 0, //右
                            y: 0, //下
                            x2: 1, //左
                            y2: 1, //上
                            colorStops: [{
                                offset: 0,
                                // color: 'rgba(228,52,70,0.5)',
                                color: 'rgba(26,253,253,0.2)'
                            }, {
                                offset: 0,
                                color: 'rgba(26,253,253,0.2)'
                            }, {
                                offset: 0,
                                color: 'rgba(26,253,253,0.2)'
                            }],
                        },
                        opacity: 1 // 区域透明度
                    }
                },
                symbolSize: 0.2, // 单个数据标记的大小，可以设置成诸如 10 这样单一的数字，也可以用数组分开表示宽和高，例如 [20, 10] 表示标记宽为20，高为10。
                label: { // 单个拐点文本的样式设置                            
                    normal: { // 单个拐点文本的样式设置。[ default: false ]
                        position: 'top', // 标签的位置。[ default: top ]
                        distance: 4, // 距离图形元素的距离。当 position 为字符描述值（如 'top'、'insideRight'）时候有效。[ default: 5 ]
                        color: '#ccc', // 文字的颜色。如果设置为 'auto'，则为视觉映射得到的颜色，如系列色。[ default: "#fff" ]
                        fontSize: 12, // 文字的字体大小
                    },
                },
                lineStyle: {
                    color: "#04e9eb"
                },
                itemStyle: {
                    normal: { //图形悬浮效果
                        borderColor: '#ccc',//单个数据标记描边的颜色
                        borderWidth: 2.5//单个数据标记描边的大小
                    }
                },
            }, 
            // {
            //     name: '2019年09月',//数据名称
            //     value: [80, 85, 70, 50, 40],
            //     areaStyle: {
            //         normal: { // 单项区域填充样式
            //             color: {
            //                 x: 0, //右
            //                 y: 0, //下
            //                 x2: 1, //左
            //                 y2: 1, //上
            //                 colorStops: [{
            //                     offset: 0,
            //                     // color: 'rgba(228,52,70,0.5)',
            //                     color: 'rgba(240,97,97,0.2)'
            //                 }, {
            //                     offset: 0,
            //                     color: 'rgba(240,97,97,0.2)'
            //                 }, {
            //                     offset: 0,
            //                     color: 'rgba(240,97,97,0.2)'
            //                 }],
            //             },
            //             opacity: 1 // 区域透明度
            //         }
            //     },
            //     symbolSize: 0.2, // 单个数据标记的大小，可以设置成诸如 10 这样单一的数字，也可以用数组分开表示宽和高，例如 [20, 10] 表示标记宽为20，高为10。
            //     label: { // 单个拐点文本的样式设置                            
            //         normal: { // 单个拐点文本的样式设置。[ default: false ]
            //             position: 'top', // 标签的位置。[ default: top ]
            //             distance: 4, // 距离图形元素的距离。当 position 为字符描述值（如 'top'、'insideRight'）时候有效。[ default: 5 ]
            //             color: '#ccc', // 文字的颜色。如果设置为 'auto'，则为视觉映射得到的颜色，如系列色。[ default: "#fff" ]
            //             fontSize: 12, // 文字的字体大小
            //         },
            //         emphasis: {
            //             show: true,
            //             formatter: '{c}'//显示分析的数字值，a为统计图名称，b为学生姓名,c为学生这项能力的值
            //         }
            //     },
            //     lineStyle: {
            //         color: "#f06161"
            //     },
            //     itemStyle: {
            //         normal: { //图形悬浮效果
            //             borderColor: '#ccc',//单个数据标记描边的颜色
            //             borderWidth: 2.5//单个数据标记描边的大小
            //         }
            //     },
            // }
            ]
        },]
    };
    this.init();
}
RadarChart.prototype.init = function(){
    let valueArr = [];
    let dataArr = this.option.series[0].data;
    // let indicator = this.option.radar[0].indicator;
    dataArr.forEach((data,index)=>{
        valueArr = valueArr.concat(data.value)
    })
    let {min,max} = gainMaxAndMinFromArr(valueArr);
    let indicator = this.indicator.map(function(text){
        return {
            text:text,
            min:min-10,
            max:max+10,
        }
    })
    this.option.radar[0].indicator = indicator
    // console.log(gainMaxAndMinFromArr(valueArr))

    // console.log(valueArr)
    this.radarChart.setOption(this.option,true);
}
//单例堆积柱状图
var SingleStackBar = function(param){
    this.chartDom = param.chartDom;
    this.stackChart = echarts.init(this.chartDom);
    this.colors = ["#c89fec", "#81a6ec", "#a3ea8b", "#eac774", "#ea7274"];
    this.option = {
        color: this.colors,
        tooltip: {
            trigger: 'axis',
            textStyle:{
                fontWeight:"lighter"
            },
            formatter: function (params) {
                // console.log(params);
                let tooltipStr = params[0].name;
                for(var i=0;i<params.length;i++){
                    tooltipStr += `<br>${params[i].seriesName}:${params[i].value}%`
                }
                return tooltipStr;
                // return params[0].name + '<br/>数值:' + params[0].value + '%';
            },
        },
        legend: {
            bottom: '2%',
            textStyle:{
                color:"#fff",
                fontWeight:"lighter"
            },
            data: [],
        },
        grid: { //图表的位置
            top: '2%',
            left: 'left',
            height:"75%",
            right: '4%',
            // bottom: '5%',
            containLabel: true
        },
        xAxis: {
            type: 'category',
            axisLabel: {
                // interval: 0,
                // show: true,
                // splitNumber: 15,
                textStyle: {
                    // fontSize: 10,
                    color: '#b7b7c4',
                    fontWeight:"lighter"
                },
            },
            axisLine: {
                lineStyle: {
                    color: "#d2d2d2"
                }
            },
            axisTick: {
                show: false
            },
            data: [],
        },
        yAxis: {
            type: 'value',
            axisLine: {
                show: false,
            },
            axisLabel: {
                show: true,
                interval: 'auto',
                formatter: '{value} ',
                textStyle: {
                    color: "#b7b7c4",
                    fontWeight:"lighter"
                }
            },
            splitLine: {
                show: true,
                lineStyle: {
                    // type: 'dashed'
                    color: "#535353"
                }
            },
            show: true

        },
        series: []
        // {
        //     name: '1',
        //     type: 'bar',
        //     stack: 'sum',
        //     // barWidth: '20px',
        //     data: [-20, 30, 20, 30, 20, 30]
        // },
        // {
        //     name: '2',
        //     type: 'bar',
        //     // barWidth: '20px',
        //     stack: 'sum',
        //     data: [-9, 30, 9, 60, 70, 20],
    };
}
SingleStackBar.prototype.init = function(){
    this.stackChart.setOption(this.option,true)
}
SingleStackBar.getInstance = function(){
    let instance
    return function(param){
        if(!instance){
            instance = new SingleStackBar(param);
            // instance.init();
        }
        return instance;
    }
}();
//单例水平柱状图
var SingleHorBars = function(param){
    this.chartDom = param.chartDom;
    this.horBarsChart = echarts.init(this.chartDom);
    this.title = param.title;
    this.resjson = [
        // {
        //     indusId: 49,
        //     indusName: "批发零售",
        //     value: 7462.191206293
        // },
        // {
        //     indusId: 1,
        //     indusName: "农林",
        //     value: 5883.804652514
        // },
        // {
        //     indusId: 40,
        //     indusName: "建筑",
        //     value: 5790.99203225
        // },
        // {
        //     indusId: 52,
        //     indusName: "银行",
        //     value: 4697.79527311
        // },
        // {
        //     indusId: 54,
        //     indusName: "房地产",
        //     value: 4103.462570491
        // },
        // {
        //     indusId: 48,
        //     indusName: "信息",
        //     value: 2739.619621343
        // },
        // {
        //     indusId: 57,
        //     indusName: "科学研究",
        //     value: 2025.418006415
        // },
        // {
        //     indusId: 33,
        //     indusName: "计算机制造",
        //     value: 1982.603257381
        // }
    ]
    this.option = {
        baseOption: {
            title:{
                text:this.title,
                textStyle:{
                    color:"#ffffff",
                    fontSize:12,
                    fontWeight:"lighter"
                },
                left:"center"
            },
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'shadow'
                },
                formatter: function (params) {
                    return params[0].name + '<br/>数值:' + (params[0].value).toFixed(2) + '%';
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
                // width: '98%',
                // height: '88%',
                left: '0%',
                right:"8%",
                top: 30,
                bottom:"10%",
                containLabel: true
            },
            xAxis: {
                type: 'value',
                position: 'top',
                
                splitLine: {
                    show: true,
                    lineStyle:{
                        color:"#777777"
                    }
                },
                axisLine: {
                    show: false,
                    lineStyle: {
                        color: '#b1b1b7',
                        width: 1
                    }
                },
                axisTick: {
                    show: false
                },
                axisLabel: {
                    show: true,
                    formatter: function (v) {
                        return v+"%";
                    },
                    fontWeight:"lighter",
                    color:"#fff"
                }
            },
            yAxis: {
                type: 'category',
                axisLine: {
                    show: true,
                    lineStyle:{
                        color:"#b1b1b7"
                    }
                },
                axisTick: {
                    show: false
                },
                inverse: true,
                axisLabel: {
                    align: 'right',
                    color: "#ffffff",
                    fontWeight:"lighter"

                },
                splitLine: {
                    show: false
                },
                // 给y轴的lable添加点击事件
                triggerEvent: true,
                data: [],
            },
            // color: paramObj.rankColor,
            color: "#64ceff",
            series:[]
        }
    };
}
SingleHorBars.prototype.init = function(){
    var newData = [];
    for (var k = 0; k < this.resjson.length; k++) {
        newData.push({
            name: this.resjson[k].indusName,
            value: this.resjson[k].value
        });
    }
    // newData.sort(compare('value')); //根据数值排序
    var sortData = [];
    for (var j = 0; j < newData.length; j++) {
        sortData.push(newData[j].name);
    }
    // return sortData;
    this.option.baseOption.yAxis.data = sortData;
    var data = [];
    for (var j = 0; j < this.resjson.length; j++) {
        data.push({
            value: this.resjson[j].value,
            // itemStyle: {
            //     normal: function () {
            //         var itemColor = {};
            //         for (var i = 0; i < paramObj.rankColor.length; i++) {
            //             if (_this.resjson[j].indusName == paramObj.rankColor[i][1]) {
            //                 itemColor.color = paramObj.rankColor[i][0];
            //             }
            //         }
            //         return itemColor;
            //     }()
            // },
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
        barWidth:20,
        itemStyle: {
            color: "#64ceff"
            // color:"rgb(100,206,255)"
        },
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
    },
        // {
        //     name: 'glyph',
        //     type: 'pictorialBar',
        //     barGap: '-100%',
        //     symbolPosition: 'end',
        //     symbolSize: 14,
        //     symbolOffset: ['-600%', 0],
        //     // data: paramObj.pictorialBarData
        //     data:[]
        // }
    ];
    this.option.baseOption.series = series;
}
SingleHorBars.prototype.setOption = function(){
    this.horBarsChart.setOption(this.option,true)
}
SingleHorBars.prototype.dispose = function(){
    echarts.getInstanceByDom(this.chartDom).dispose();
}
SingleHorBars.getInstance = function(){
    let instance;
    return function(param){
            instance = new SingleHorBars(param);
        return instance;
    }
}();
//规则单例模式
var SingleRule = function(){
    this.ruleLayerDom = $(".rule_layer_wrap");
    this.ruleClose = this.ruleLayerDom.find(".rule_close")
    this.htmlStr = '';
}
SingleRule.prototype = {
    init: function () {
        let _this = this
        // this.customRultBtnClick();
        this.customCloseRuleLayer();
        
        this.ruleLayerDom.on("click", function () {
            $(this).hide();
            return false
        })
        this.ruleLayerDom.on("click", ".rule_info_wrap", function () {
            return false
        })
    },
    drawData:function(data){
        let _this = this
        if (data.length) {
            let htmlStr = ''
            data.forEach(function (rule) {
                htmlStr += `<li>${rule.ruleInfo||rule.value}</li>`
            })
            this.ruleLayerDom.find(".rule_info").html(htmlStr);
        }
    },
    customRultBtnClick:function(selector,data){
        let _this = this
        $(selector).on("click", function () {
            _this.drawData(data)
            _this.ruleLayerDom.css({
                "display": 'block'
            })
        })
    },
    customCloseRuleLayer: function () {
        let _this = this;
        this.ruleClose.on("click", function () {
            _this.ruleLayerDom.css({
                "display": 'none'
            })
        })
    }
}
SingleRule.getInstance = function(){
    let instance
    return function(){
        if(!instance){
            instance = new SingleRule()
            instance.init()
        }
        return instance
    }
}()
//动能选项卡
var TabsComponent = function(param){
    this.$parent = param.$parent;
    this.$targetClass = param.$targetClass;
    this.callback = param.callback;
    this.tabs();
}
TabsComponent.prototype.tabs = function(){
    var _this = this;
    this.$parent.on("click",this.$targetClass,function(){
        if(!$(this).hasClass("active")){
            _this.$parent.find(".time_split_list").removeClass("active");
            $(this).addClass("active");
            let recentTime = $(this).attr("recentTime");
            _this.callback(recentTime);
        }
    })
}
/************************************/
// token
var authUrl = "https://m.tjresearch.cn/auth";
// var authUrl = "http://192.168.1.113:7001/auth";
// 本地
// var indexUrl = "http://192.168.2.109:8700/";
// var newCmsUrl = "http://192.168.2.110:8102/h5/";
// 正式
// var indexUrl = "https://m.tjresearch.cn/index/";
// var newCmsUrl = "https://m.tjresearch.cn/h5/";
// var payUrl = "https://m.tjresearch.cn/wxpay/tjrs/";
// 测试
// var indexUrl = "http://192.168.1.113/index/";
// var newCmsUrl = "http://192.168.1.113/h5/";
var payUrl = "http://m.tjresearch.cn/test/xxx/tjrs/";
// 综合
var indexUrl = "/index/";
var newCmsUrl = "/h5/";
var commonParamObj = {
    redirectUrl: "",
    payUrl: payUrl + "mPay",
    h5payUrl: payUrl + "h5Pay",
    openIdUrl: authUrl + "/account/openid"
};
var starInfo = {
    starColorArr: ["#f21c1c", "#ff5e19", "#ff9c17", "#ffce16", "#cdd919", "#7dd91d", "#22d922"],
}
// 分享
var shareParams = {
    title: "腾景经济预测上线了！",
    desc: "注册成为会员即可获得15日免费体验期,并有精彩纷呈的活动等您来参与！",
    link: getUrlParam(window.location.href).split("#")[0],
    imgUrl: "https://m.tjresearch.cn/images/logo520." + "png"
}

function share(params) {
    $.ajax({
        url: authUrl + "/js/config",
        type: "GET",
        dataType: "json",
        data: {
            "url": getUrlParam(window.location.href).split("#")[0]
        },
        success: function (config) {
            config.debug = false;
            config.jsApiList = ['updateAppMessageShareData', 'updateTimelineShareData', 'onMenuShareTimeline', 'onMenuShareAppMessage'];
            wx.config(config);
            wx.ready(function () {
                wx.checkJsApi({
                    jsApiList: ['updateAppMessageShareData', 'updateTimelineShareData', 'onMenuShareTimeline', 'onMenuShareAppMessage'],
                });
                //分享好友
                wx.updateAppMessageShareData(params);
                wx.onMenuShareAppMessage(params);
                //分享到朋友圈
                wx.updateTimelineShareData(params);
                wx.onMenuShareTimeline(params);
            });
        },
        error: function (err) {
            console.log(err);
            console.log("分享错误");
        }
    });
}
function is_weixin() {
    if (window.navigator.userAgent.toLowerCase().match(/MicroMessenger/i) == "micromessenger") {
        return true;
    } else {
        return false;
    }
}

function is_phone() {
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent)) {
        return true;
    } else {
        return false;
    }
}

function domOnload() {
    var deviceType;
    if (is_phone() && is_weixin()) {
        deviceType = "wechat";
        commonParamObj.redirectUrl = "https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx1f8aa745e4ae3904&redirect_uri=" + encodeURIComponent(authUrl + "/callback/public?redirect_uri=" + encodeURIComponent(window.location.href)) + "&response_type=code&scope=snsapi_userinfo&state=1#wechat_redirect";
    } else if (is_phone() && !is_weixin()) {
        deviceType = "other";
        commonParamObj.redirectUrl = authUrl + "/loginPage.html?redirect_uri=" + encodeURIComponent(window.location.href);
    } else if (!is_phone()) {
        deviceType = "pc";
        window.location.href = "http://www.tjresearch.cn";
    }
    sessionStorage.setItem("deviceType", deviceType);
    window.addEventListener("onorientationchange" in window ? "orientationchange" : "resize", function () {
        window.location.reload();
    }, false);
    if (parseURL(window.location.href).token == undefined) {
        share(shareParams);
    }
    if (sessionStorage.getItem("invited") == null && window.location.href.indexOf("forecast.html") != -1) {
        invite();
    }
}

function invite() {
    sessionStorage.setItem("invited", true);
    $(".scroller .invite_bg").css("display","block");
    $(".scroller .invite").css({
        "display": "flex",
        "animation": "bounceInDown 2s  1",
        "-webkit-animation": "bounceInDown 2s 1"
    });
}
document.ready = domOnload();