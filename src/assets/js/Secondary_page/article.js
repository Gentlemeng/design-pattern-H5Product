$(function () {
    var sessionData = sessionStorage.getItem("Authentication");
    var paramObj = {
        url: newCmsUrl,
        token: sessionData ? JSON.parse(sessionData).data : "",
        topicId: parseURL(window.location.href).topic,
        indexName: "",
        infoId: parseURL(window.location.href).info,
        type: parseURL(window.location.href).type,
        indexId: parseURL(window.location.href).index
    };
    var result_chart = echarts.init(document.getElementById("result_chart"));
    getArticle({
        url: paramObj.url + "news/infoDetailSim",
        topicId: paramObj.topicId,
        infoId: paramObj.infoId,
        type: paramObj.type
    });
    // 获取专家评论
    function getArticle(params) {
        $.ajax({
            url: params.url,
            data: {
                topicId: params.topicId,
                infoId: params.infoId,
                type: params.type
            },
            success: function (result) {
                if (Object.keys(result).length != 0) {
                    $(".article .name")[0].innerText = result.news.author;
                    $(".article .time")[0].innerText = result.news.lastUpdateTime;
                    $(".article .infoTitle")[0].innerText = result.news.infoTitle;
                    $(".article .label").empty();
                    if (result.topic.full_name == "经济增长动能") {
                        $(".article .label").append('<a href="./energy.html?topic=' + paramObj.topicId + '">' + result.topic.full_name + '</a>');
                    } else if (params.type == "indexIdFlag") {
                        $(".article .label").append('<a href="./forecast_detail.html?indexId=' + result.topic.index_id + '">' + result.topic.full_name + '</a>');
                    } else {
                        $(".article .label").append('<a href="./forecast_index.html?index='+ paramObj.indexId +'&topic=' + paramObj.topicId + '">' + result.topic.full_name + '</a>');
                    }
                    $(".article .content")[0].innerHTML = result.news.infoContent;
                    // $(".article .content p").css("text-indent", $(".article .content p span").css("font-size").substr(0, 2) * 2 + 1 + "px");
                    initOperate({
                        url: paramObj.url + "news/infoDetail",
                        token: paramObj.token,
                        infoId: params.infoId
                    });
                    if (paramObj.token != "") {
                        getOperateData({
                            url: paramObj.url + "news/likeAgainstCountByTopic",
                            token: paramObj.token,
                            topicId: params.topicId,
                            dom: result_chart,
                            type: paramObj.type
                        });
                    }
                }
            },
            error: function (err) {
                console.log(err);
            }
        })
    }
    // 支持专家评论
    $(".support").click(function () {
        if (sessionData == null || JSON.parse(sessionData).data == undefined) {
            redirectUrl();
        } else {
            $.dialog({
                type: "confirm",
                onClickOk: function () {
                    getOperateRes({
                        url: paramObj.url + "news/attitude",
                        infoId: paramObj.infoId,
                        flag: "like",
                        token: paramObj.token
                    });
                    getOperateData({
                        url: paramObj.url + "news/likeAgainstCountByTopic",
                        token: paramObj.token,
                        topicId: paramObj.topicId,
                        dom: result_chart,
                        type: paramObj.type
                    });
                },
                autoClose: 0,
                contentHtml: `<p style="text-align:center;">是否确定？</p>`
            });
        }
    })
    // 反对专家评论
    $(".oppose").click(function () {
        if (sessionData == null || JSON.parse(sessionData).data == undefined) {
            redirectUrl();
        } else {
            $.dialog({
                type: "confirm",
                onClickOk: function () {
                    getOperateRes({
                        url: paramObj.url + "news/attitude",
                        infoId: paramObj.infoId,
                        flag: "against",
                        token: paramObj.token
                    });
                    getOperateData({
                        url: paramObj.url + "news/likeAgainstCountByTopic",
                        token: paramObj.token,
                        topicId: paramObj.topicId,
                        dom: result_chart,
                        type: paramObj.type
                    });
                },
                autoClose: 0,
                contentHtml: `<p style="text-align:center;">是否确定？</p>`
            });
        }
    })
    // 文章懒加载
    paramObj.mescroll = new MeScroll("main", {
        up: {
            clearEmptyId: "list_ul",
            page: {
                num: 0,
                size: 10,
                topicId: paramObj.topicId,
                infoId: paramObj.infoId,
                url: paramObj.url + "news/oldInfoByTopic",
                type: paramObj.type
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

    function upCallBack(params) {
        getListData({
            num: params.num,
            size: params.size,
            url: params.url,
            topicId: params.topicId,
            infoId: params.infoId,
            type: params.type,
            successCallback: function (result) {
                paramObj.mescroll.endSuccess(result.data.length);
                setListData(result);
            },
            errorCallback: function () {
                paramObj.mescroll.endErr();
            }
        });
    }
    /*设置列表数据*/
    function setListData(params) {
        var lidom = "";
        for (var i = 0; i < params.data.length; i++) {
            lidom += `<div class="essay"><div class="content"><a  href="./../pages/article.html?topic=${paramObj.topicId}&info=${params.data[i].infoId}&type=${paramObj.type}" class="detail">${params.data[i].infoTitle}</a></div><div class="time">${ params.data[i].infoPublishDate}</div></div></li>`;
        }
        $(params.className).append(lidom);
    }
    // 获取数据
    function getListData(params) {
        $.ajax({
            url: params.url,
            data: {
                pageNo: params.num,
                pageSize: params.size,
                topicId: params.topicId,
                type: params.type,
                infoId: params.infoId
            },
            async: false,
            success: function (result) {
                if (result.length > 0) {
                    paramObj.mescroll.endSuccess();
                    params.successCallback({
                        data: result,
                        className: ".list_ul"
                    });
                } else {
                    paramObj.mescroll.endSuccess(false);
                    params.successCallback({
                        data: [],
                        className: ".list_ul"
                    });
                }
            },
            error: function (err) {
                params.errorCallback();
                console.log(err);
            }
        })
    }
    // 返回按钮
    $(".header .back").click(function () {
        window.location.href = $(".article .label a").attr("href");
        // var url = sessionStorage.getItem("url");
        // if (document.referrer.indexOf("token=") > -1) {
        //     window.location.href = url;
        // } else if (document.referrer.indexOf("auth") > -1) {
        //     window.location.href = url;
        // } else {
        //     window.history.back();
        // }
    })
})