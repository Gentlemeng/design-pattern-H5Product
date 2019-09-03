$(function () {
    var sessionData = sessionStorage.getItem("Authentication");
    if (document.referrer.indexOf("forecast_detail") > -1) {
        sessionStorage.setItem("indexId", parseURL(document.referrer).indexId);
    }
    var paramObj = {
        indexUrl: indexUrl,
        newCmsUrl: newCmsUrl,
        token: sessionData ? JSON.parse(sessionData).data : "",
        topicId: parseURL(window.location.href).topic,
        indexId: parseURL(window.location.href).index,
        back: parseURL(window.location.href).back,
        flag: parseURL(window.location.href).flag,
        indexName: "",
        infoId: "",
        toUserId: "",
        toUserName: "",
        topCommentId: "",
        toCommentId: "",
        infoTitle: "",
        fFlag: 0,
        mescroll: {},
        hasComment: 0,
        shelterAttribute: 3,
        showNumLimit: "",
        date: "",
        seasonAdjustShow: 0,
        hFlag: false
    };
    var data_chart = echarts.init(document.getElementById("data_chart")),
        data_chart_new = echarts.init(document.getElementById("data_chart_new")),
        result_chart = echarts.init(document.getElementById("result_chart")),
        data_chart_newNew = echarts.init(document.getElementById("data_chart_newNew"));
    initPage();
    // 返回按钮
    $(".chart .header .back").click(function () {
        if (document.referrer.indexOf("collect") > -1 || document.referrer.indexOf("order") > -1) {
            window.location.href = document.referrer;
        } else {
            window.location.href = "./forecast_detail.html?indexId=" + paramObj.back;
        }
    })
    // 文字滑动
    function getText(params) {
        $.ajax({
            url: params.url,
            data: {
                topicId: params.topicId,
                flag: params.flag
            },
            success: function (result) {
                if (result.status == "200") {
                    $(".chart .header .title")[0].innerHTML = window.decodeURI(result.body.fullName);
                    $(".chart .header .title").css({
                        "margin-left": "-" + $(".chart .header .title").width() / 2 + "px",
                        "left": "50%"
                    });
                    paramObj.indexName = result.body.fullName;
                    paramObj.hasComment = result.body.hasComment;
                    // 获取专家评论
                    getArticle({
                        url: paramObj.newCmsUrl + "news/lastInfoByTopic",
                        topicId: paramObj.topicId
                    });
                    paramObj.shelterAttribute = result.body.shelterAttribute;
                    paramObj.showNumLimit = result.body.showNumLimit;
                    getModeComment();
                    if (result.body.showAccuracy == 0) {
                        $(".chart .rate p").hide();
                    } else {
                        $(".chart .rate p").show();
                        $(".chart .rate .value")[0].innerText = result.body.accuracy == null ? "无" : result.body.accuracy + "%";
                    }
                    if (result.body.hasPopUp == 0) {
                        $(".chart .rate .trend").hide();
                    } else {
                        $(".chart .rate .trend").show();
                    }
                    if (result.body.highFlag) {
                        $("#main .highNew .title").css("color", "#" + result.body.color);
                        $("#main .highNew").show();
                        paramObj.hFlag = true;
                    } else {
                        $("#main .highNew").hide();
                        paramObj.hFlag = false;
                    }
                    if (result.body.timeZone != null) {
                        let lidom = ``;
                        JSON.parse(result.body.timeZone).forEach(function (v, index) {
                            if (index == 0) {
                                paramObj.date = v.value.split("-")[1];
                                lidom += `<li><a class="liactive" href="javascript:;" flag="${v.value.split("-")[1]}">${v.value.split("-")[0]}</a></li>`
                            } else {
                                lidom += `<li><a href="javascript:;" flag="${v.value.split("-")[1]}">${v.value.split("-")[0]}</a></li>`
                            }
                        })
                        $(".chart .old .tabSelect ul").append(lidom);
                        $(".chart .old .tabSelect ul li").css("width", 100 / JSON.parse(result.body.timeZone).length + "%");
                        // tab切换
                        $('.chart .tabs li').each(function () {
                            $(this).click(function () {
                                $('.tabs li a').removeClass('liactive');
                                $(this).children().addClass('liactive');
                                paramObj.date = $(this).children().attr("flag");
                                getData({
                                    url: paramObj.indexUrl + "findMacroHistoryPredictInfo",
                                    token: paramObj.token,
                                    data: {
                                        topicId: paramObj.topicId,
                                        indexId: paramObj.indexId,
                                        seasonAdjustShow: paramObj.seasonAdjustShow,
                                        date: paramObj.date,
                                        flag: paramObj.flag
                                    },
                                    dom: data_chart
                                });
                            })
                        })
                        getData({
                            url: paramObj.indexUrl + "findMacroHistoryPredictInfo",
                            token: paramObj.token,
                            data: {
                                topicId: paramObj.topicId,
                                date: paramObj.date,
                                indexId: paramObj.indexId,
                                seasonAdjustShow: paramObj.seasonAdjustShow,
                                flag: paramObj.flag
                            },
                            dom: data_chart
                        });
                    }
                    if (result.body.seasonAdjustButton) {
                        $(".chart .old .original").show();
                        $(".chart .old .original span").removeClass("hide");
                        $(".chart .old .original span").addClass("show");
                        $(".chart .old .original span").attr("flag", 1);
                        $(".chart .old .original span")[0].innerText = "查看原始数据";
                    } else {
                        $(".chart .old .original").hide();
                    }
                    $(".chart .old .original span").click(function () {
                        paramObj.seasonAdjustShow = parseInt($(this).attr("flag"));
                        getData({
                            url: paramObj.indexUrl + "findMacroHistoryPredictInfo",
                            token: paramObj.token,
                            data: {
                                topicId: paramObj.topicId,
                                date: paramObj.date,
                                indexId: paramObj.indexId,
                                seasonAdjustShow: paramObj.seasonAdjustShow,
                                flag: paramObj.flag
                            },
                            dom: data_chart
                        });
                        if ($(this).attr("class") == "show") {
                            $(".chart .old .original span").removeClass("show");
                            $(".chart .old .original span").addClass("hide");
                            $(".chart .old .original span").attr("flag", 0);
                            $(".chart .old .original span")[0].innerText = "隐藏原始数据";
                        } else {
                            $(".chart .old .original span").removeClass("hide");
                            $(".chart .old .original span").addClass("show");
                            $(".chart .old .original span").attr("flag", 1);
                            $(".chart .old .original span")[0].innerText = "查看原始数据";
                        }
                    })
                }
            },
            error: function (err) {
                console.log(err);
            }
        })
    }
    // 轮播专家评论
    function getModeComment() {
        $.ajax({
            url: paramObj.indexUrl + "findAllIndexTopicDescription",
            data: {
                indexId: paramObj.indexId
            },
            success: function (res) {
                if (res.status == 200) {
                    if (res.body != null) {
                        $(".chart .tips div").append(res.body.infoContent);
                        $(".chart .old .tips div").css("animation", $(".chart .old .tips div").outerHeight(true) / 20 + "s wordsLoop linear infinite normal");
                        $(".chart .old .tips").click(function () {
                            window.location.href = "./../pages/article.html?index=" + res.body.indexId + "&topic=" + res.body.indexId + "&info=" + res.body.infoId + "&type=indexIdFlag";
                        })
                    }
                }
            },
            error: function (err) {
                console.log(err);
            }
        })
    }

    function trendFun(params) {
        $.ajax({
            url: paramObj.indexUrl + "findPopUpRecentData",
            data: params.data,
            beforeSend: function (xhr) {
                xhr.setRequestHeader("Authentication", paramObj.token);
            },
            success: function (result) {
                if (result.resultCode == 200) {
                    var seriesData = [],
                        option = lineOption();
                    var data = [],
                        color = "#00e15f";
                        // color = "#" + result.resultBody.popColor;
                    result.resultBody.data.forEach(function (v) {
                        data.push([v.date, v.value])
                    })
                    seriesData.push({
                        name: "数值",
                        type: 'line',
                        showAllSymbol: false,
                        symbol: 'circle',
                        symbolSize: 2,
                        data: data,
                        yAxisIndex: 0,
                        smooth: true,
                        itemStyle: {
                            normal: {
                                color: color,
                                lineStyle: {
                                    width: 2,
                                    type: 'solid',
                                    color: color
                                }
                            }
                        },
                        markLine: {},
                        markArea: {},
                        animationDuration: 2000
                    })
                    option.xAxis.type = "category";
                    option.xAxis.axisLabel.textStyle.color = "#fff";
                    if (data.length > 8) {
                        option.xAxis.axisLabel.interval = 3;
                    }
                    option.yAxis.axisLabel.color = "#fff";
                    option.series = seriesData;
                    option.tooltip.show = true;
                    params.dom.clear();
                    params.dom.resize();
                    params.dom.setOption(option, true);
                    $(".newNew").show();
                    $(".newNew").css("height", $(".old").outerHeight(true) + "px");
                    $(".old").hide();
                } else if (result.resultCode == 401) {
                    sessionStorage.removeItem("Authentication");
                    $.dialog({
                        type: "confirm",
                        onClickOk: function () {
                            sessionStorage.setItem('url', document.referrer);
                            window.location.href = commonParamObj.redirectUrl;
                        },
                        onClickCancel: function () {
                            $(".old").show();
                            $(".newNew").hide();
                        },
                        contentHtml: `<p style="text-align:left;">未登录或登录信息失效，请点击“确定”重新登录</p>`
                    });
                } else if (result.resultCode == 201) {
                    $.dialog({
                        type: "alert",
                        onClickOk: function () {
                            return false;
                        },
                        autoClose: 0,
                        contentHtml: `<p style="text-align:center;">暂无数据</p>`
                    });
                }
            },
            error: function (err) {
                console.log(err);
            }
        })
    }
    $(".rate .trend").click(function (e) {
        if ($(".newNew").css("display") == "none") {
            trendFun({
                data: {
                    topicId: paramObj.topicId,
                    showNumLimit: parseInt(paramObj.showNumLimit),
                    indexId: paramObj.indexId
                },
                dom: data_chart_newNew
            });
        } else {
            $(".old").show();
            $(".newNew").hide();
        }
    })
    $(".chart .newNew .title .close").click(function () {
        $(".old").show();
        $(".newNew").hide();
    })
    // 预测数据
    function getData(params) {
        $.ajax({
            url: params.url,
            beforeSend: function (xhr) {
                xhr.setRequestHeader("Authentication", params.token);
            },
            data: params.data,
            dataType: "json",
            success: function (res) {
                if (res.resultCode == "200") {
                    var seriesData = [],
                        option = lineOption(),
                        result = res.resultBody.data,
                        markLineData = [{
                            xAxis: new Date()
                        }],
                        spotShow = false;
                    $(".chart .old .data_info .unit")[0].innerText = res.resultBody.indexUnit == null ? '' : res.resultBody.indexUnit;
                    $(".chart .old .legend .history").css("display", "none");
                    $(".chart .old .legend .pre").css("display", "none");
                    $(".chart .old .legend .season").css("display", "none");
                    for (let i = 0; i < result.length; i++) {
                        var item, serieData = time2Datetime(result[i].children),
                            color = "";
                        if (result[i].type == 11) {
                            color = '#' + JSON.parse(res.resultBody.color).his.split("-")[0];
                            $(".chart .old .legend .history hr").css("background-color", '#' + JSON.parse(res.resultBody.color).his.split("-")[0]);
                            $(".chart .old .legend .history span")[0].innerText = JSON.parse(res.resultBody.color).his.split("-")[1];
                            $(".chart .old .legend .history").css("display", "flex");
                        } else if (result[i].type == 22) {
                            color = '#' + JSON.parse(res.resultBody.color).season.split("-")[0];
                            $(".chart .old .legend .season hr").css("background-color", '#' + JSON.parse(res.resultBody.color).season.split("-")[0]);
                            $(".chart .old .legend .season span")[0].innerText = JSON.parse(res.resultBody.color).season.split("-")[1];
                            $(".chart .old .legend .season").css("display", "flex");
                        } else {
                            color = '#' + JSON.parse(res.resultBody.color).pre.split("-")[0];
                            $(".chart .old .legend .pre hr").css("background-color", '#' + JSON.parse(res.resultBody.color).pre.split("-")[0]);
                            $(".chart .old .legend .pre span")[0].innerText = JSON.parse(res.resultBody.color).pre.split("-")[1];
                            $(".chart .old .legend .pre").css("display", "flex");
                        }
                        if (result[i].type == 18) {
                            spotShow = true;
                        }
                        item = {
                            name: result[i].itemName,
                            type: 'line',
                            showAllSymbol: false,
                            symbol: 'circle',
                            symbolSize: 2,
                            data: serieData,
                            yAxisIndex: 0,
                            smooth: true,
                            itemStyle: {
                                normal: {
                                    color: color,
                                    lineStyle: {
                                        width: 2,
                                        type: 'solid',
                                        color: color
                                    }
                                }
                            },
                            markLine: {},
                            markArea: {},
                            animationDuration: 5000
                        };
                        seriesData.push(item);
                    }
                    // 高频模拟
                    if (paramObj.flag == "true" && res.resultBody.result != undefined) {
                        $(".chart .old .data_info .high_data").css("display", "flex");
                        $(".chart .old .data_info .high_data .time")[0].innerText = JSON.parse(res.resultBody.result).date;
                        $(".chart .old .data_info .high_data .name")[0].innerText = JSON.parse(res.resultBody.color).pre.split("-")[1];
                        $(".chart .old .data_info .data span")[0].innerText = JSON.parse(res.resultBody.result).value.toFixed(2);
                        if (JSON.parse(res.resultBody.result).arrow == 1) {
                            $(".chart .old .data_info .data span").css("color", "#fca5a8");
                            $(".chart .old .data_info .data img").attr("src", "./../../assets/images/forecast/rise.png");
                        } else if (JSON.parse(res.resultBody.result).arrow == -1) {
                            $(".chart .old .data_info .data span").css("color", "#6cfd70");
                            $(".chart .old .data_info .data img").attr("src", "./../../assets/images/forecast/drop.png");
                        } else if (JSON.parse(res.resultBody.result).arrow == 0) {
                            $(".chart .old .data_info .data span").css("color", "#fff6ac");
                            $(".chart .old .data_info .data img").attr("src", "./../../assets/images/forecast/just.png");
                        }
                    }else if(paramObj.hFlag){                        
                        $("#main .highNew").show();
                    }else{               
                        $("#main .highNew").hide();
                    }
                    option.xAxis.axisLabel.textStyle.color = "#fff";
                    option.yAxis.axisLabel.color = "#fff";
                    option.tooltip.show = true;
                    option.series = seriesData;
                    let start = result[0].children[0].date,
                        end = result[0].children[result[0].children.length - 1].date;
                    result.forEach(function (v) {
                        if (v.type == 11) {
                            start = v.children[0].date;
                            end = v.children[v.children.length - 1].date;
                        }
                        if (v.type == 18 && v.children.length != 0) {
                            end = v.children[v.children.length - 1].date;
                        }
                        if (v.type == 19) {
                            if (new Date(v.children[0].date).getTime() < new Date(start).getTime()) {
                                start = v.children[0].date;
                            }
                            if (new Date(v.children[v.children.length - 1].date).getTime() > new Date(end).getTime()) {
                                end = v.children[v.children.length - 1].date;
                            }
                        }
                        if (v.type == 22) {
                            if (new Date(v.children[0].date).getTime() < new Date(start).getTime()) {
                                start = v.children[0].date;
                            }
                            if (new Date(v.children[v.children.length - 1].date).getTime() > new Date(end).getTime()) {
                                end = v.children[v.children.length - 1].date;
                            }
                        }
                    })
                    option.xAxis.interval = 3600 * 24 * 1000 * (Math.floor((new Date(end).getTime() - new Date(start).getTime()) / (24 * 3600 * 1000)) / 5);
                    if (params.token != "") {
                        $(".old .line_chart #data_chart").css("width", "100%");
                        $(".old .line_chart #data_chart div").css("width", "100%");
                        $(".old .line_chart #data_chart div canvas").css("width", "100%");
                        if (result.length != 1 && paramObj.flag == "false") {
                            if (parseInt(params.data.date) <= 365 && spotShow) {
                                markLineData = [{
                                    xAxis: new Date()
                                }, {
                                    xAxis: seriesData[seriesData.length - 1].data[seriesData[seriesData.length - 1].data.length - 2][0]
                                }]
                            }
                            seriesData[seriesData.length - 1].markLine = {
                                symbol: ['none', 'none'],
                                silent: true,
                                label: {
                                    normal: {
                                        show: true,
                                        formatter: function (param) {
                                            var month = param.value.getMonth() + 1,
                                                date = param.value.getDate();
                                            if (month < 10) {
                                                month = "0" + month;
                                            }
                                            if (date < 10) {
                                                date = "0" + date;
                                            }
                                            return param.value.getFullYear() + '.' + month + '.' + date
                                        },
                                        padding: [-4, 10, -2, -4]
                                    }
                                },
                                lineStyle: {
                                    normal: {
                                        type: 'solid',
                                        color: "#818181",
                                        width: 0.5
                                    }
                                },
                                data: markLineData
                            };
                            if (spotShow) {
                                seriesData[seriesData.length - 1].data[seriesData[seriesData.length - 1].data.length - 1][1] = null;
                            }
                        }
                        // 高频模拟
                        if (paramObj.flag == "true" && parseInt(params.data.date) <= 30) {
                            spotShow = true;
                            markLineData = [{
                                xAxis: new Date(JSON.parse(res.resultBody.result).date)
                            }];
                            // {xAxis: new Date(JSON.parse(res.resultBody.result).startDate)}
                            seriesData[seriesData.length - 1].markLine = {
                                symbol: ['none', 'none'],
                                silent: true,
                                label: {
                                    normal: {
                                        show: true,
                                        formatter: function (param) {
                                            var month = param.value.getMonth() + 1,
                                                date = param.value.getDate();
                                            if (month < 10) {
                                                month = "0" + month;
                                            }
                                            if (date < 10) {
                                                date = "0" + date;
                                            }
                                            return param.value.getFullYear() + '.' + month + '.' + date
                                        },
                                        padding: [-4, 10, -2, -4]
                                    }
                                },
                                lineStyle: {
                                    normal: {
                                        type: 'solid',
                                        color: "#818181",
                                        width: 0.5
                                    }
                                },
                                data: markLineData
                            };
                            seriesData[seriesData.length - 1].data[seriesData[seriesData.length - 1].data.length - 1][1] = null;
                        }
                        $(".spot").hide();
                        params.dom.clear();
                        params.dom.resize();
                        params.dom.setOption(option, true);
                        params.dom.on('finished', function () {
                            if (spotShow && params.dom.getOption().series.length != 0) {
                                var px = params.dom.convertToPixel('grid', seriesData[seriesData.length - 1].data[seriesData[seriesData.length - 1].data.length - 2]);
                                $(".spot").show();
                                $(".spot").css({
                                    "left": px[0] + $(".spot").height(),
                                    "top": px[1] - ($(".spot").height() / 2)
                                });
                            }
                        });
                    } else {
                        if (paramObj.shelterAttribute == 1) {
                            $(".old .line_chart #data_chart").hide();
                        } else if (paramObj.shelterAttribute == 2) {
                            $(".old .line_chart #data_chart").css("width", "70%");
                        } else if (paramObj.shelterAttribute == 3) {
                            $(".old .line_chart #data_chart").css("width", "100%");
                        }
                        $(".old .line_chart #data_chart div").css("width", "100%");
                        $(".old .line_chart #data_chart div canvas").css("width", "100%");
                        $(".spot").hide();
                        params.dom.clear();
                        params.dom.resize();
                        params.dom.setOption(option, true);
                    }
                } else if (res.resultCode == "401") {
                    redirectUrl();
                }
            },
            error: function (err) {
                console.log(err);
            }
        })
    }
    // 获取高频数据
    function getHighData(params) {
        $.ajax({
            url: params.url,
            data: {
                topicId: params.topicId
            },
            dataType: "json",
            success: function (result) {
                if (result.resultCode == "200") {
                    if (result.resultBody.high.length == 0) {
                        $(".high").hide();
                    } else {
                        $(".high").show();
                        var high = result.resultBody.high,
                            dom = "",
                            freeDom = "";
                        for (var i = 0; i < high.length; i++) {
                            if (high[i].unit == "") {
                                dom += `<div class="table-box"><div class="text">${high[i].freItemName}</div><div class="data"><a href="./../pages/high.html?topic=${paramObj.topicId}&id=${high[i].id}&flag=${high[i].flag}">${high[i].value.toFixed(2)}</a></div></div>`;
                            } else {
                                dom += `<div class="table-box"><div class="text">${high[i].freItemName}</div><div class="data"><a href="./../pages/high.html?topic=${paramObj.topicId}&id=${high[i].id}&flag=${high[i].flag}">${high[i].value.toFixed(2)}${high[i].unit}</a></div></div>`;
                            }
                        }
                        for (var j = 0; j < 3 * Math.ceil(high.length / 3) - high.length; j++) {
                            freeDom += '<div class="table-box"><div class="text"></div><div class="data"><a></a></div></div>';
                        }
                        $(".high .table").append(dom);
                        $(".high .table").append(freeDom);
                    }
                    if (result.resultBody.dataStatus) {
                        $(".rate .contrast").css("display", "flex");
                    } else {
                        $(".rate .contrast").css("display", "none");
                    }
                }
            },
            error: function (err) {
                console.log(err);
            }
        })
    }
    // 获取高频new数据
    function getHighNewData(params) {
        $.ajax({
            url: params.url,
            data: params.data,
            beforeSend: function (xhr) {
                xhr.setRequestHeader("Authentication", paramObj.token);
            },
            success: function (res) {
                if (res.resultCode == 200) {
                    var tableDom = ``;
                    for (let i = 0; i < res.resultBody.row; i++) {
                        let dom = ``,
                            j = i * res.resultBody.column;
                        for (j; j < (i + 1) * res.resultBody.column; j++) {
                            let data = res.resultBody.data[j].value % 1 === 0 ? res.resultBody.data[j].value : res.resultBody.data[j].value.toFixed(2);
                            dom += `<div class="table-box"><div class="text">${res.resultBody.data[j].date.split("-")[0]}<br>${res.resultBody.data[j].date.split("-")[1]}-${res.resultBody.data[j].date.split("-")[2]}</div><div class="data">${data}</div></div>`;
                        }
                        tableDom += `<div class="table">${dom}</div>`;
                    }
                    $(".highNew .con").append(tableDom);
                    $(".highNew .table .table-box").css("width", 100 / res.resultBody.column + "%");
                }
            },
            error: function (err) {
                console.log(err);
            }
        })
    }
    // 获取预测对比数据
    $(".rate .contrast").click(function (e) {
        if ($(".new").css("display") == "none") {
            getContrastData({
                url: paramObj.indexUrl + 'findCompareData',
                topicId: paramObj.topicId,
                token: paramObj.token,
                dom: data_chart_new
            });
        } else {
            $(".old").show();
            $(".new").hide();
            $(".rate .contrast span")[0].innerHTML = "预测对比图";
        }
    })
    $(".chart .new .title .close").click(function () {
        $(".old").show();
        $(".new").hide();
        $(".rate .contrast span")[0].innerHTML = "预测对比图";
    })

    function getContrastData(params) {
        $.ajax({
            url: params.url,
            beforeSend: function (xhr) {
                xhr.setRequestHeader("Authentication", params.token);
            },
            data: {
                topicId: params.topicId
            },
            dataType: "json",
            success: function (result) {
                if (result.resultCode == 200) {
                    var seriesData = [],
                        option = lineOption();
                    for (var i = 0; i < Object.keys(result.resultBody).length; i++) {
                        var data = [],
                            color = "#ec4968",
                            name = "腾景网预测数据";
                        if (Object.keys(result.resultBody)[i] == "onlineUserData") {
                            color = "#00ddfe";
                            name = "用户预测平均值";
                        }
                        result.resultBody[Object.keys(result.resultBody)[i]].forEach(function (v) {
                            data.push([v.date, v.value])
                        })
                        seriesData.push({
                            name: name,
                            type: 'line',
                            showAllSymbol: false,
                            symbol: 'circle',
                            symbolSize: 2,
                            data: data,
                            yAxisIndex: 0,
                            smooth: true,
                            itemStyle: {
                                normal: {
                                    color: color,
                                    lineStyle: {
                                        width: 2,
                                        type: 'solid',
                                        color: color
                                    }
                                }
                            },
                            markLine: {},
                            markArea: {},
                            animationDuration: 2000
                        })
                    }
                    option.xAxis.type = "category";
                    option.xAxis.axisLabel.textStyle.color = "#fff";
                    option.yAxis.axisLabel.color = "#fff";
                    option.series = seriesData;
                    option.tooltip.show = true;
                    params.dom.clear();
                    params.dom.resize();
                    params.dom.setOption(option, true);
                    $(".new").show();
                    $(".old").hide();
                    $(".rate .contrast span")[0].innerHTML = "返回预测数据";
                } else if (result.resultCode == 401) {
                    sessionStorage.removeItem("Authentication");
                    $.dialog({
                        type: "confirm",
                        onClickOk: function () {
                            sessionStorage.setItem('url', document.referrer);
                            window.location.href = commonParamObj.redirectUrl;
                        },
                        onClickCancel: function () {
                            $(".old").show();
                            $(".new").hide();
                            $(".rate .contrast span")[0].innerHTML = "预测对比图";
                        },
                        contentHtml: `<p style="text-align:left;">未登录或登录信息失效，请点击“确定”重新登录</p>`
                    });
                } else if (result.resultCode == 201) {
                    $.dialog({
                        type: "alert",
                        onClickOk: function () {
                            return false;
                        },
                        autoClose: 0,
                        contentHtml: `<p style="text-align:center;">暂无数据</p>`
                    });
                }
            },
            error: function (err) {
                console.log(err);
            }
        })
    }
    // 预测对比结果
    function preResults(params) {
        $.ajax({
            url: params.url,
            beforeSend: function (xhr) {
                xhr.setRequestHeader("Authentication", params.token);
            },
            data: {
                topicId: params.topicId,
                indexId: params.indexId
            },
            dataType: "json",
            success: function (res) {
                if (res.resultCode == 200) {
                    $(".preResult .title").css("color", "#" + res.resultBody.tipsColor);
                    var data = res.resultBody.trendData,
                        dom = "",
                        img = "";
                    for (var i = 0; i < data.length; i++) {
                        if (data[i].value == 3) {
                            img = `<img src="./../../assets/images/forecast/down.png">`;
                        } else if (data[i].value == 2) {
                            img = `<img src="./../../assets/images/forecast/fair.png">`;
                        } else if (data[i].value == 1) {
                            img = `<img src="./../../assets/images/forecast/up.png">`;
                        } else if (data[i].value == 4) {
                            img = `<img src="./../../assets/images/forecast/downup.png">`;
                        } else if (data[i].value == 5) {
                            img = `<img src="./../../assets/images/forecast/updown.png">`;
                        }
                        dom += `<div class="table-box"><div class="text">${data[i].date.substr(0, 4)}<br/>${data[i].date.substr(4, 2)}月</div><div class="data">${img}</div></div>`;
                    }
                    $(".preResult .table").append(dom);
                    $(".preResult .table .table-box").css("width", 1 / data.length * 100 + "%");
                    $(".preResult .describe")[0].innerText = res.resultBody.comment;
                    $(".preResult").show();
                } else if (res.resultCode == 201) {
                    $(".preResult").hide();
                } else if (res.resultCode == 401 || res.resultCode == 402 || res.resultCode == 405) {
                    redirectUrl();
                }
            },
            error: function (err) {
                console.log(err);
            }
        })
    }
    // 获取首席专家评论
    function getArticle(params) {
        $.ajax({
            url: params.url,
            data: {
                topicId: params.topicId
            },
            success: function (result) {
                if (paramObj.hasComment == 0) {
                    $(".comment").hide();
                } else if (result.news == null && paramObj.hasComment != 0) {
                    $(".comment").show();
                    $(".comment .content").hide();
                    $(".comment .commentTips").show();
                    $("#publish").hide();
                    $(".container .main").css("margin-bottom", "unset");
                } else {
                    $(".comment").show();
                    $(".comment .content").show();
                    $(".comment .commentTips").hide();
                    $(".container .main").css("margin-bottom", "1rem");
                    $("#publish").css("display", "flex");
                    $(".article")[0].innerHTML = result.news.infoSummary;
                    paramObj.infoId = result.news.infoId;
                    paramObj.infoTitle = result.news.infoTitle;
                    $(".content a").attr("href", "./../pages/article.html?index=" + paramObj.indexId + "&topic=" + result.news.topicId + "&info=" + result.news.infoId + "&type=topicIdFlag");
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
                            dom: result_chart,
                            type: "topicIdFlag"
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
    // 支持专家评论
    $(".comment .btns .support").click(function () {
        if (sessionData == null || JSON.parse(sessionData).data == undefined) {
            redirectUrl();
        } else {
            $.dialog({
                type: "confirm",
                onClickOk: function () {
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
                        dom: result_chart,
                        type: "topicIdFlag"
                    });
                },
                autoClose: 0,
                contentHtml: `<p style="text-align:center;">是否确定？</p>`
            });
        }
    })
    // 反对专家评论
    $(".comment .btns .oppose").click(function () {
        if (sessionData == null || JSON.parse(sessionData).data == undefined) {
            redirectUrl();
        } else {
            $.dialog({
                type: "confirm",
                onClickOk: function () {
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
                        dom: result_chart,
                        type: "topicIdFlag"
                    });
                },
                autoClose: 0,
                contentHtml: `<p style="text-align:center;">是否确定？</p>`
            });
        }
    })
    // 操作收藏按钮
    $(".follow").click(function () {
        if (sessionData == null || JSON.parse(sessionData).data == undefined) {
            redirectUrl();
        } else {
            proFollow({
                url: paramObj.newCmsUrl + "indexCollention/insertIndexCollection",
                token: paramObj.token,
                collectionId: paramObj.topicId,
                collectionName: paramObj.indexName,
                indexId: paramObj.indexId
            });
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
                                paramObj.toUserId = $(this).attr("toUserId");
                                paramObj.toUserName = $(this).attr("userName");
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
        $("#opinion_ul").show();
        $("#opinion_ul").append(lidom);
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
    // 初始化页面
    function initPage() {
        // 初始化收藏
        if (sessionData == null || JSON.parse(sessionData).data == undefined) {
            redirectUrl();
        } else {
            initFollow({
                url: paramObj.newCmsUrl + "indexCollention/findIndexCollectionByUserAndId",
                token: paramObj.token,
                collectionId: paramObj.topicId,
                indexId: paramObj.indexId
            });
        }
        getText({
            url: paramObj.indexUrl + "findIndexTopicByTopicId",
            topicId: paramObj.topicId,
            flag: paramObj.flag
        });
        preResults({
            url: paramObj.indexUrl + "findTrendData",
            token: paramObj.token,
            topicId: paramObj.topicId,
            indexId: paramObj.indexId
        });
        getHighNewData({
            url: paramObj.indexUrl + "findHighTableData",
            data: {
                topicId: paramObj.topicId,
                indexId: paramObj.indexId,
                flag: paramObj.flag
            }
        });
        // 获取高频数据
        // getHighData({
        //     url: paramObj.indexUrl + "findIndexHighDetail",
        //     topicId: paramObj.topicId
        // });
    }
})