$(function () {
    var sessionData = sessionStorage.getItem("Authentication");
    if (sessionData == null || JSON.parse(sessionData).data == undefined) {
        redirectUrl();
    } else {
        var paramObj = {
            url: newCmsUrl,
            token: JSON.parse(sessionData).data,
            mescroll: {}
        };
        // tab切换
        $('.tabs li').each(function () {
            $(this).click(function () {
                $('.tabs li a').removeClass('liactive');
                $(this).children().addClass('liactive');
                var name = $(this).children().attr("name");
                if (name == "integral") {
                    $(".integral_ul").empty();
                    $(".integral_ul").show();
                    $(".gold_ul").hide();
                    // 资讯列表
                    paramObj.mescroll.destroy();
                    paramObj.mescroll = new MeScroll("main", {
                        up: {
                            clearEmptyId: "integral_ul",
                            page: {
                                num: 0,
                                size: 10,
                                flag: name,
                                className: '.integral_ul',
                                url: paramObj.url + "score/findUserScoreList"
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
                } else if (name == "gold") {
                    $(".gold_ul").empty();
                    $(".integral_ul").hide();
                    $(".gold_ul").show();
                    // 指标列表
                    paramObj.mescroll.destroy();
                    paramObj.mescroll = new MeScroll("main", {
                        up: {
                            clearEmptyId: "gold_ul",
                            page: {
                                num: 0,
                                size: 10,
                                flag: name,
                                className: '.gold_ul',
                                url: paramObj.url + "gold/findUserGoldList"
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
            })
        })
        // 获取总积分
        function getTotal(params) {
            $.ajax({
                url: params.url,
                beforeSend: function (xhr) {
                    xhr.setRequestHeader("Authentication", params.token);
                },
                dataType: "json",
                async: false,
                success: function (res) {
                    var total = 0;
                    if (res.resultCode == "200") {
                        if (params.flag == "integral") {
                            total = res.resultBody.score;
                        } else if (params.flag == "gold") {
                            total = res.resultBody.goldTotal;
                        }
                        $("." + params.flag + "_banner .total")[0].innerText = total;
                    } else if (res.resultCode == "201") {
                        $("." + params.flag + "_banner .total")[0].innerText = total;
                    } else if (res.resultCode == "401" || res.resultCode == "402" || res.resultCode == "405") {
                        redirectUrl();
                    }
                },
                error: function (err) {
                    console.log(err);
                }
            })
        }
        // 获取详细
        paramObj.mescroll = new MeScroll("main", {
            up: {
                clearEmptyId: "integral_ul",
                page: {
                    num: 0,
                    size: 10,
                    flag: "integral",
                    className: '.integral_ul',
                    url: paramObj.url + "score/findUserScoreList"
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
                flag: params.flag,
                className: params.className,
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
            if (params.flag == "integral") {
                getTotal({
                    url: paramObj.url + "score/findUserTotalScore",
                    token: paramObj.token,
                    flag: params.flag
                });
                for (var i = 0; i < params.data.length; i++) {
                    if (params.data[i].score > 0) {
                        lidom += `<li><div><p>${params.data[i].typeName}</p><p>${params.data[i].lastUpdateTime}</p></div><div>+${params.data[i].score}</div></li>`;
                    } else {
                        lidom += `<li><div><p>${params.data[i].typeName}</p><p>${params.data[i].lastUpdateTime}</p></div><div class="negative">${params.data[i].score}</div></li>`;
                    }
                }
                $(".gold_banner").css("display", "none");
            } else if (params.flag == "gold") {
                getTotal({
                    url: paramObj.url + "gold/findUserTotalGold",
                    token: paramObj.token,
                    flag: params.flag
                });
                for (var i = 0; i < params.data.length; i++) {
                    if (params.data[i].gold > 0) {
                        lidom += `<li><div><p>${params.data[i].typeName}</p><p>${params.data[i].createTime}</p></div><div>+${params.data[i].gold}</div></li>`;
                    } else {
                        lidom += `<li><div><p>${params.data[i].typeName}</p><p>${params.data[i].createTime}</p></div><div class="negative">${params.data[i].gold}</div></li>`;
                    }
                }
                $(".integral_banner").css("display", "none");
            }
            $("." + params.flag + "_banner").css("display", "flex");
            $(".total").css("padding-top", "0.4rem");
            $(params.className).append(lidom);
        }
        // 获取数据
        function getListData(params) {
            $.ajax({
                url: params.url,
                beforeSend: function (xhr) {
                    xhr.setRequestHeader("Authentication", paramObj.token);
                },
                data: {
                    page: params.num,
                    size: params.size
                },
                success: function (result) {
                    if (result.resultCode == "200") {
                        paramObj.mescroll.endSuccess();
                        params.successCallback({
                            data: result.resultBody,
                            className: params.className,
                            flag: params.flag
                        });
                    } else if (result.resultCode == "201") {
                        paramObj.mescroll.endSuccess(false);
                        params.successCallback({
                            data: [],
                            className: params.className,
                            flag: params.flag
                        });
                    } else if (result.resultCode == "401" || result.resultCode == "402" || result.resultCode == "405") {
                        redirectUrl();
                    }
                },
                error: function (err) {
                    params.errorCallback();
                    console.log(err);
                }
            })
        }
    }
    $("header .back").click(function () {
        window.location.href = "./../myself.html";
    })
})