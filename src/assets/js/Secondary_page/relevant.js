$(function () {
    var sessionData = sessionStorage.getItem("Authentication");
    if (sessionData == null || JSON.parse(sessionData).data == undefined) {
        redirectUrl();
    } else {
        var paramObj = {
            url: newCmsUrl,
            token: JSON.parse(sessionData).data,
            mescroll: {},
            dateMonth: ""
        };
        if (document.referrer.indexOf("relevant_detail") != -1) {
            $(".guess_ul").empty();
            $(".guess_ul").show();
            $(".join_ul").hide();
            paramObj.dateMonth = "";
            $('.tabs li a').removeClass('liactive');
            $(".tabs li a[name='guess']").addClass('liactive');
            paramObj.mescroll = new MeScroll("main", {
                up: {
                    clearEmptyId: "guess_ul",
                    page: {
                        num: 0,
                        size: 50,
                        flag: "guess",
                        className: '.guess_ul',
                        url: paramObj.url + "guess/findGuessIndexHisForMonth"
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
        } else {
            $(".join_ul").empty();
            $(".guess_ul").hide();
            $(".join_ul").show();
            paramObj.mescroll = new MeScroll("main", {
                up: {
                    clearEmptyId: "join_ul",
                    page: {
                        num: 0,
                        size: 5,
                        flag: "join",
                        className: '.join_ul',
                        url: paramObj.url + "myQuestion/findMyJoinQuestions"
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
        // tab切换
        $('.tabs li').each(function () {
            $(this).click(function () {
                $('.tabs li a').removeClass('liactive');
                $(this).children().addClass('liactive');
                var name = $(this).children().attr("name");
                if (name == "guess") {
                    $(".guess_ul").empty();
                    $(".guess_ul").show();
                    $(".join_ul").hide();
                    paramObj.dateMonth = "";
                    paramObj.mescroll.destroy();
                    paramObj.mescroll = new MeScroll("main", {
                        up: {
                            clearEmptyId: "guess_ul",
                            page: {
                                num: 0,
                                size: 50,
                                flag: name,
                                className: '.guess_ul',
                                url: paramObj.url + "guess/findGuessIndexHisForMonth"
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
                } else if (name == "join") {
                    $(".join_ul").empty();
                    $(".guess_ul").hide();
                    $(".join_ul").show();
                    paramObj.mescroll.destroy();
                    paramObj.mescroll = new MeScroll("main", {
                        up: {
                            clearEmptyId: "join_ul",
                            page: {
                                num: 0,
                                size: 5,
                                flag: name,
                                className: '.join_ul',
                                url: paramObj.url + "myQuestion/findMyJoinQuestions"
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
            if (params.flag == "guess") {
                if (paramObj.dateMonth == "" && params.data.length != 0) {
                    paramObj.dateMonth = params.data[0].firstMonth;
                }
                for (var j = 0; j < params.data.length; j++) {
                    if (paramObj.dateMonth == params.data[j].firstMonth) {
                        lidom += `<li>
                                        <a href="./../pages/relevant_detail.html?id=` + params.data[j].id + `&date=` + params.data[j].firstMonth + `&name=` + params.data[j].indexName + `">
                                            <p class="date">` + params.data[j].firstMonth + `</p>
                                            <div class="content">
                                                <p>` + params.data[j].indexName + `</p>
                                                <img class="img" src="./../../assets/images/myself/arrow.png">
                                            </div>
                                        </a>
                                    </li>`;
                    } else {
                        paramObj.dateMonth = params.data[j].firstMonth;
                        lidom += `<p class="line"></p><li>
                                        <a href="./../pages/relevant_detail.html?id=` + params.data[j].id + `&date=` + params.data[j].firstMonth + `&name=` + params.data[j].indexName + `">
                                            <p class="date">` + params.data[j].firstMonth + `</p>
                                            <div class="content">
                                                <p>` + params.data[j].indexName + `</p>
                                                <img class="img" src="./../../assets/images/myself/arrow.png">
                                            </div>
                                        </a>
                                    </li>`;
                    }
                }
            } else if (params.flag == "join") {
                for (var i = 0; i < params.data.length; i++) {
                    lidom += `<li>
                            <div class="title">
                                <a href="./../pages/question_detail.html?fInfoId=` + params.data[i].fInfoId + `">` + params.data[i].fTitle + `</a>
                            </div>
                            <div class="tips">
                                <p>` + params.data[i].support + `个赞</p>
                                <p>` + params.data[i].against + `个踩</p>
                                <p>` + params.data[i].count + `个回答</p>
                            </div>
                        </li>`;
                }
            }
            $(params.className).append(lidom);
        }

        /*加载列表数据*/
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
    $(".relevant_header .back").click(function () {
        window.location.href = "./../myself.html";
    })
    $(".relevant_content").on("click", ".title", function () {
        sessionStorage.setItem("inforSource", "./relevant.html")
        sessionStorage.setItem("questionSource", "./relevant.html")
    })
})