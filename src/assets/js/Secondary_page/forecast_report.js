$(function () {
    var sessionData = sessionStorage.getItem("Authentication");
    if (sessionData == null || JSON.parse(sessionData).data == undefined) {
        $.dialog({
            type: "confirm",
            onClickOk: function () {
                window.location.href = commonParamObj.redirectUrl;
            },
            onClickCancel: function() {
                window.location.href="./../pages/forecast_detail.html?indexId=" + parseURL(window.location.href).index;
            },
            autoClose: 0,
            contentHtml: `<p style="text-align:center;">未登录或登录信息失效，请点击“确定”重新登录后进行操作</p>`
        });
    } else {
        var paramObj = {
            indexId: parseURL(window.location.href).index,
            reportCategoryId: parseURL(window.location.href).report,
            topicId: parseURL(window.location.href).topic,
            token: sessionData ? JSON.parse(sessionData).data : "",
            mescroll: [],
            infoId: "",
            indexUrl: indexUrl,
            newCmsUrl: newCmsUrl
        }        
        nowReport();
        // 获取当前周报
        function nowReport() {
            var data = {};
            if (paramObj.infoId == "") {
                data = {
                    reportCategoryId: paramObj.reportCategoryId,
                    topicId: paramObj.topicId,
                    indexId: paramObj.indexId
                }
            } else {
                data = {
                    infoId: paramObj.infoId,
                    topicId: paramObj.topicId,
                    indexId: paramObj.indexId,
                    reportCategoryId: paramObj.reportCategoryId
                }
            }
            $.ajax({
                url: paramObj.indexUrl + "findReport",
                beforeSend: function (xhr) {
                    xhr.setRequestHeader("Authentication", paramObj.token);
                },
                data: data,
                success: function (res) {
                    // console.log(res);
                    if(res.resultCode == 203){
                        $.dialog({
                            type: "confirm",
                            onClickOk: function () {
                                //跳转到购买页面
                                window.location.href = "./../pages/product_center.html";
                            },
                            onClickCancel: function() {
                                WeixinJSBridge.call('closeWindow');
                                if (navigator.userAgent.indexOf("Firefox") != -1 || navigator.userAgent.indexOf("Chrome") !=-1) {
                                    window.location.href="about:blank";
                                    window.close();
                                } else {
                                    window.opener = null;
                                    window.open("", "_self");
                                    window.close();
                                }
                           
                            },
                            autoClose: 0,
                            contentHtml: `<p style="text-align:center;">您当前没有此权限，是否购买该模块</p>`
                        });
                    }else if(res.resultCode == 222){
                        $.dialog({
                            type: "alert",
                            buttonText: {
                                ok: "领取"
                            },
                            onClickOk: function () {
                                $.ajax({
                                    url: paramObj.newCmsUrl + "preferential/preferentialUser",
                                    beforeSend: function (xhr) {
                                        xhr.setRequestHeader("Authentication", paramObj.token);
                                    },
                                    success: function (res) {
                                        if (res.resultCode == 200) {
                                            window.location.reload();
                                        } else if (res.resultCode == 402) {
                                            redirectUrl();
                                        }
                                    },
                                    error: function (err) {
                                        console.log(err);
                                    }
                                })
                            },
                            contentHtml: `<p style="text-align:left;">您的免费体验期已过，为感谢您对腾景数研的支持，我们特赠您90日额外体验期！</p>`
                        });
                    }
                    if (res.status == 200) {
                        if(!($.isEmptyObject(res.body.reportContent))){
                            var param = res.body.reportContent;
                            var htmlStr = `<div class="author_wrap">
                                    <img src="./../../assets/images/header.png">
                                    <div class="author_detail">
                                        <span class="author_name">${param.author}</span>
                                        <span class="time">${param.infoPublishDate}</span>
                                    </div>
                                </div>
                                <div class="detail_wrap">
                                    <span class="detail_title">${param.infoTitle}</span>
                                    <div class="report_detail">${param.infoContent}</div>
                                </div>`
                            $(".tilte_name").html("腾景数研&nbsp;&nbsp;" + res.body.title);
                            $(".report_cont").append(htmlStr);
                            $(".partition").html("往期" + res.body.title);
                        }else{
                            $(".tilte_name").html("腾景数研&nbsp;&nbsp;" + res.body.title);
                            $(".tilte_name").css("color",res.body.titleColor);
                            $(".partition").html("往期" + res.body.title);
                            var Str = `<div class="nomore">当前没有报告</div>`
                            $(".report_cont").append(Str);
                        }
                        
                    } else if (res.status == 201) {
                        var Str = `<div class="nomore">当前没有报告</div>`
                        $(".report_cont").append(Str);
                    }else if (res.status == 203) {
                        $.dialog({
                            type: "confirm",
                            onClickOk: function () {
                                //跳转到登录页
                                window.location.href = commonParamObj.redirectUrl;
                            },
                            onClickCancel: function() {
                                window.location.href="./../pages/forecast_detail.html?indexId=" + paramObj.indexId;
                            },
                            autoClose: 0,
                            contentHtml: `<p style="text-align:center;">未登录或登录信息失效，请点击“确定”重新登录后进行操作</p>`
                        });
                    }
                },
                error: function (e) {
                    console.log(e);
                }
            })
        }
        pastReport();
        // 获取往期周报
        function pastReport(infoId) {
            paramObj.mescroll = new MeScroll("main", {
                down:{
                    use:false
                },
                up: {
                    callback: upCallback,
                    page: {
                        num: 0, //当前页 默认0,回调之前会加1; 即callback(page)会从1开始
                        size: 10, //每页数据条数,默认10
                        infoId: infoId
                    },
                    clearEmptyId: "mescroll",
                    empty: {
                        //提示
                    },
                    lazyLoad: {
                        use: true
                    },
                    htmlNodata: '<p class="upwarp-nodata">—— End ——</p>',
                }

            })
        }

        function upCallback(page) {
            var data = {};
            if (page.infoId == undefined) {
                data = {
                    pageNo: page.num,
                    pageSize: page.size,
                    reportCategoryId: paramObj.reportCategoryId,
                    topicId: paramObj.topicId,
                    indexId: paramObj.indexId
                }
            } else {
                data = {
                    pageNo: page.num,
                    pageSize: page.size,
                    reportCategoryId: paramObj.reportCategoryId,
                    topicId: paramObj.topicId,
                    indexId: paramObj.indexId,
                    infoId: page.infoId
                }
            }
            $.ajax({
                url: paramObj.indexUrl + "findAllReportByCategoryId",
                beforeSend: function (xhr) {
                    xhr.setRequestHeader("Authentication", paramObj.token);
                },
                data: data,
                success: function (curPageData) {
                    // console.log(curPageData);
                    if (curPageData.status == 200) {
                        paramObj.mescroll.endSuccess(curPageData.body.data.length);
                        setListData(curPageData.body.data);
                    } else if (curPageData.status == 201) {
                        var Str = `<div class="nomore">当前没有往期报告</div>`
                        $(".mescroll-hardware").hide();
                        $(".mescroll-upwarp").hide();
                        $(".mescroll").append(Str);
                        $(".past_report").css("padding", "none");
                    } else if (curPageData.status == 202 || curPageData.status == 203) {
                        dialogConfirm(`未登录或登录信息失效，请点击“确定”重新登录后进行操作`);
                    }
                },
                error: function (e) {
                    //联网失败的回调,隐藏下拉刷新和上拉加载的状态
                    paramObj.mescroll.endErr();
                    if(JSON.parse(e.responseText).resultCode == 401){
                        dialogConfirm(`未登录或登录信息失效，请点击“确定”重新登录后进行操作`);
                    }
                }
            })
        }

        function setListData(data) {
            if (!($.isEmptyObject(data))) {
                var liStr = "";
                data.forEach(function (item) {
                    liStr = `<li class="item_wrap" infoId="${item.infoId}">
                                <div class="past_item">
                                    <span class="item_title">${item.infoTitle}</span>
                                    <span class="item_time">${item.infoPublishDate}</span>
                                </div>
                            </li>`
                    $(".mescroll").append(liStr);
                })
                $(".item_wrap").click(function () {
                    paramObj.infoId = $(this).attr("infoId");
                    $(".mescroll").empty();
                    $(".report_cont").empty();
                    $(window).scrollTop(0);
                    nowReport();
                    pastReport(paramObj.infoId);
                })
                $(".mescroll-hardware").hide();
                $(".mescroll-upwarp").hide();
            } 
            // else {
            //     $(".mescroll-hardware").hide();
            //     $(".mescroll-upwarp").hide();
            //     var liStr = "";
            //     liStr = `<div class="nomore">当前没有往期内容</div>`;
            //     $(".mescroll").append(liStr);
            // }
        }
        //返回
        $("header .back").click(function () {
            window.location.href = "./../pages/forecast_detail.html?indexId=" + paramObj.indexId;
        })
    }
})