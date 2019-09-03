$(function () {
    var sessionData = sessionStorage.getItem("Authentication");
    if (sessionData == null || JSON.parse(sessionData).data == undefined) {
        redirectUrl();
    } else {
        var paramObj = {
            url: lmsUrl,
            token: JSON.parse(sessionData).data,
            mescroll: {}
        }
        // tab切换
        $('.tabs li').each(function () {
            $(this).click(function () {
                $('.tabs li a').removeClass('liactive');
                $(this).children().addClass('liactive');
                var name = $(this).children().attr("name");
                if (name == "information") {
                    $(".info_ul").empty();
                    $(".info_ul").show();
                    $(".index_ul").hide();
                    // 资讯列表
                    paramObj.mescroll.destroy();
                    paramObj.mescroll = new MeScroll("main", {
                        up: {
                            clearEmptyId: "info_ul",
                            page: {
                                num: 0,
                                size: 5,
                                type: "news",
                                className: '.info_ul'
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
                } else if (name == "index") {
                    $(".index_ul").empty();
                    $(".info_ul").hide();
                    $(".index_ul").show();
                    // 指标列表
                    paramObj.mescroll.destroy();
                    paramObj.mescroll = new MeScroll("main", {
                        up: {
                            clearEmptyId: "index_ul",
                            page: {
                                num: 0,
                                size: 5,
                                type: "index",
                                className: '.index_ul'
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
        paramObj.mescroll = new MeScroll("main", {
            up: {
                clearEmptyId: "info_ul",
                page: {
                    num: 0,
                    size: 5,
                    type: "news",
                    className: '.info_ul'
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
                flag: params.flag,
                type: params.type,
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
            if (params.type == "index") {
                for (var i = 0; i < params.data.length; i++) {
                    lidom += `<li><div><a href="./../pages/forecast_index.html?topic=${params.data[i].id}">${params.data[i].name}</a></div><div><p>${params.data[i].totalFee} ${params.data[i].unit}</p><p>${params.data[i].timeEnd}</p></div></li>`;
                }
            } else if (params.type == "news") {
                for (var i = 0; i < params.data.length; i++) {
                    if (params.data[i].imageUrl == null) {
                        lidom += `<li><div class="content"><div class="tip"><a href="./../pages/essay_detail.html?fInfoId=${params.data[i].id}">${params.data[i].name}</a><p>${params.data[i].totalFee} ${params.data[i].unit}</p></div><div class="time">${params.data[i].timeEnd}</div></div></li>`;
                    } else {
                        lidom += `<li><img class="img" src="${params.data[i].imageUrl}"><div class="content"><div class="tip"><a href="./../pages/essay_detail.html?fInfoId=${params.data[i].id}">${params.data[i].name}</a><p>${params.data[i].totalFee} ${params.data[i].unit}</p></div><div class="time">${params.data[i].timeEnd}</div></div></li>`;
                    }
                }
            }
            $(params.className).append(lidom);
        }

        /*加载列表数据*/
        function getListData(params) {
            $.ajax({
                url: paramObj.url + "orders/findUserOrdersByUserId",
                beforeSend: function (xhr) {
                    xhr.setRequestHeader("Authentication", paramObj.token);
                },
                data: {
                    page: params.num,
                    size: params.size,
                    type: params.type
                },
                success: function (result) {
                    if (result.resultCode == "200") {
                        paramObj.mescroll.endSuccess();
                        params.successCallback({
                            data: result.resultBody,
                            className: params.className,
                            type: params.type
                        });
                    } else if (result.resultCode == "201") {
                        paramObj.mescroll.endSuccess(false);
                        params.successCallback({
                            data: [],
                            className: params.className,
                            type: params.type
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
    $(".order_header .back").click(function () {
        window.location.href = "./../myself.html";
    })
    $("#info_ul").on("click", ".title", function () {
        sessionStorage.setItem("inforSource", "./order.html")
    })
})