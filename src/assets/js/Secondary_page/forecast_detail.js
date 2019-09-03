$(function () {
    var paramObj = {
        indexId: parseURL(window.location.href).indexId,
        indexUrl: indexUrl,
        newCmsUrl: newCmsUrl,
        diaUrl: "",
        diamond: {},
        contentColor: ""
    }
    initPage();

    function initPage() {
        $.ajax({
            url: paramObj.indexUrl + "findAllIndexTopicByIndexDivId",
            data: {
                indexId: paramObj.indexId
            },
            success: function (res) {
                if (res.status == 200) {
                    $("header .title img").attr("src", res.body.head.indexImageUrl);
                    $("header .title span")[0].innerHTML = res.body.head.name;
                    if (res.body.head.name == "宏观") {
                        $("header .tip").css("background-image", "url(./../../assets/images/forecast/indexColumn.png)");
                    } else {
                        $("header .tip").css("background-image", "url(./../../assets/images/forecast/index.png)");
                    }
                    if (res.body.head.type == 5 || res.body.head.type == 6) {
                        $("header .title .time")[0].innerHTML = "";
                        $("header .title").css({
                            "position": "absolute",
                            "left": "50%",
                            "margin-left": "-" + $("header .title").css("width").split("px")[0] / 2 + "px",
                        })
                    } else {
                        $("header .title .time")[0].innerHTML = res.body.head.goldCoinAttribute + "金币" + res.body.head.typeUnitName;
                        $("header .title").css("margin-left", $("header .title .time").css("width").split("px")[0] / 2 + "px");
                    }
                    // 指标说明
                    $("header .tip").click(function () {
                        sessionStorage.setItem("describeBackUrl",'./forecast_detail.html')
                        window.location.href = "./../../views/pages/forecast_describe.html?index=" + paramObj.indexId;
                    })
                    // 指标
                    if ($.inArray("top", Object.keys(res.body.data)) == -1) {
                        $(".content .left").css("margin-top", ".2rem");
                        $(".content .right").css("margin-top", ".2rem");
                    }
                    if (Object.keys(res.body.data).length != 0) {
                        Object.keys(res.body.data).forEach(function (domV) {
                            $("#" + domV)[0].innerHTML = "";
                            $("#" + domV).css("display", "block");
                            setDom({
                                data: res.body.data[domV],
                                dom: domV,
                                index: 1
                            })
                        });
                    } else {
                        $("#top")[0].innerHTML = "";
                        $("#right")[0].innerHTML = "";
                        $("#left")[0].innerHTML = "";
                    }
                    if ($(".article").length != 0) {
                        $(".content .indexHref h4").css("font-size", "12px");
                        // 段落空两格
                        // $(".content .indexHref .article p").css("text-indent", $(".content .indexHref .article p span").css("font-size").substr(0, 2) * 2 + 1 + "px");
                        // 专家评论高度
                        // if ($(".content .right").height() < $(".content .left").height()) {
                        //     $(".article").parent().css("height", $(".content .left").height() - parseInt($(".article").parent().css('marginTop')) + "px");
                        // }
                    }
                    let height, totalH, contentH = $(".content .left").outerHeight(true) > $(".content .right").outerHeight(true) ? $(".content .left").outerHeight(true) : $(".content .right").outerHeight(true);
                    if ($(".content .top").css("display") != "none") {
                        totalH = $("header").outerHeight(true) + $(".content .top").outerHeight(true) - parseInt($(".content .top .indexHref").css('marginTop')) + contentH;
                    } else {
                        totalH = $("header").outerHeight(true) + contentH;
                    }
                    if ($(document).height() < totalH) {
                        height = contentH;
                    } else {
                        height = $(document).height() - totalH + contentH;
                    }
                    $(".content .left").css("height", height + "px");
                    $(".content .right").css("height", height + "px");
                    $(".content .indexHref").click(function () {
                        buyFun({
                            url: $(this).attr("href"),
                            sessionData: sessionStorage.getItem("Authentication")
                        })
                    })
                    $(".content .indexHref .report p").click(function (e) {
                        e.stopPropagation();
                        e.preventDefault();
                        if ($(this).attr("href") != "javascript:;") {
                            buyFun({
                                url: $(this).attr("href"),
                                sessionData: sessionStorage.getItem("Authentication")
                            })
                        }
                    })
                    $(".content .indexHref .article .loop.article").css("animation", $(".loop.article").outerHeight(true) / 30 + "s wordsLoop linear infinite normal");
                    $(".content .indexHref .article .loop.comment").css("animation", $(".loop.comment").outerHeight(true) / 30 + "s wordsLoop linear infinite normal");
                    $(".content .indexHref .loop.article p").css("color", "#" + paramObj.contentColor);
                    if (sessionStorage.getItem("Authentication") == null) {
                        $(".chartCopy.describe").each(function (i, dom) {
                            $(this).css({
                                "display": "flex",
                                "width": $(this).next().outerWidth(true) + "px",
                                "height": $(this).next().outerHeight(true) + "px",
                                "z-index": 6
                            });
                        });
                        $(".chartCopy.high").each(function (i, dom) {
                            $(this).css({
                                "display": "flex",
                                "width": $(this).parent().outerWidth(true) + "px",
                                "height": $(this).parent().outerHeight(true) + "px",
                                "z-index": 6
                            });
                        })
                    }
                    $(".content .indexHref .title div").each(function () {
                        if ($(this).first().outerHeight(true) != 0) {
                            $(".content .indexHref .title.high div span").css("height", $(this).first().outerHeight(true) + "px");
                        }
                    })
                }
            },
            error: function (err) {
                console.log(err);
            }
        })
    }

    function buyFun(params) {
        $.ajax({
            url: paramObj.indexUrl + "findUserInfoStatus",
            beforeSend: function (xhr) {
                xhr.setRequestHeader("Authentication", params.sessionData ? JSON.parse(params.sessionData).data : "");
            },
            data: {
                indexId: paramObj.indexId
            },
            success: function (res) {
                if (res.resultCode == 202) {
                    redirectUrl();
                } else if (res.resultCode == 203) {
                    $.dialog({
                        type: "confirm",
                        onClickOk: function () {
                            window.location.href = "./../../views/pages/product_center.html";
                        },
                        contentHtml: `<p style="text-align:left;">您的免费体验期已过，欢迎订阅本版块。</p>`
                    });
                } else if (res.resultCode == 222) {
                    $.dialog({
                        type: "alert",
                        buttonText: {
                            ok: "领取"
                        },
                        onClickOk: function () {
                            $.ajax({
                                url: paramObj.newCmsUrl + "preferential/preferentialUser",
                                beforeSend: function (xhr) {
                                    xhr.setRequestHeader("Authentication", params.sessionData ? JSON.parse(params.sessionData).data : "");
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
                } else if (res.resultCode == 200) {
                    window.location.href = params.url;
                }
            },
            error: function (err) {
                if (JSON.parse(err.responseText).resultCode == 401) {
                    redirectUrl();
                }
                console.log(err);
            }
        })
    }

    function setDom(param) {
        param.data.forEach(function (val) {
            let href = "",
                flag = "index",
                marginTop = 0.18,
                chartDom = `<div class="chart" id="${val.topicId}" flag="${flag}"></div>`,
                imgDom = ``,
                commentDom = ``,
                style = "";
            if (val.memberId.split(",").length != 0) {
                for (var i = val.memberId.split(",").length - 1; i >= 0; i--) {
                    getDiamond(parseInt(val.memberId.split(",")[i]));
                    if (paramObj.diaUrl != "") {
                        imgDom += `<img src="${paramObj.diaUrl}" alt="">`;
                    }
                }
            }
            if (val.lineData.length == 0) {
                chartDom = `<div class="chart" id="${val.topicId}" flag="${flag}" style="display:none;"></div>`;
                style = "flex:1;";
            }
            if (val.valid == 1 && val.type != 3 && val.type != 4 && val.keyType == null) {
                href = "./../../views/pages/forecast_index.html?index=" + paramObj.indexId + "&topic=" + val.topicId + "&back=" + paramObj.indexId + "&flag=false";
            } else if (val.type == 3 && val.article != null && val.keyType == null) {
                href = "./../../views/pages/article.html?index=" + paramObj.indexId + "&info=" + val.article.infoId + "&topic=" + paramObj.indexId + "&type=indexIdFlag";
                flag = "article";
                style = "";
                chartDom = `<h4 style="color:#${val.article.titleColor};">${val.article.infoTitle}</h4>
                <div class="chart article" flag="${flag}" style="overflow-y: scroll;margin-bottom: 0.2rem;">
                    <div class="loop article" style="font-size: 12px;">
                        <div class="space"></div>
                        ${val.article.infoContent}
                    </div>
                </div>`;
                paramObj.contentColor = val.article.contentColor;
                if (val.publicComment != null) {
                    commentDom = getComment({
                        url: paramObj.newCmsUrl + "comment/CommetForExpertPublicCarousel",
                        data: {
                            infoId: val.article.infoId,
                            pageSize: parseInt(val.publicComment.publicNum),
                            flag: parseInt(val.publicComment.publicHotNew)
                        },
                        titleColor: val.publicComment.publicTitleColor,
                        contentColor: val.publicComment.publicContentColor,
                        height: val.publicComment.publicHeight / 100,
                        marginTop: marginTop / param.index,
                        name: val.publicComment.publicIndexName,
                        imgDom: imgDom,
                        backColor: val.publicComment.publicStartEndColor.split(",")
                    });
                }
            } else if (val.type == 4 && val.keyType == null) {
                let aDom = ``;
                style = "";
                JSON.parse(val.researchReport.reportInfo).forEach(function (v) {
                    if (v.valid == 1) {
                        aDom += `<p href="./../../views/pages/forecast_report.html?index=${paramObj.indexId}&report=${v.reportCategoryId}&topic=${val.topicId}" name="${v.reportCategoryId}" style="color:#${v.reportCategoryColor};">${v.reportCategoryName}</p>`;
                    } else {
                        aDom += `<p href="javascript:;" name="${v.reportCategoryId}" style="color:#${v.reportCategoryColor};">${v.reportCategoryName}</p>`;
                    }
                })
                href = "javascript:;";
                chartDom = `<div class="chart report">${aDom}</div>`;
            } else if (val.valid == 1 && val.type != 3 && val.type != 4 && (val.keyType == 6 || val.keyType == 5)) {
                if (val.keyType == 6) {
                    href = "./../../views/pages/forecast_index.html?index=" + val.indexId + "&topic=" + val.topicId + "&back=" + paramObj.indexId + "&flag=true";
                } else {
                    href = "./../../views/pages/forecast_index.html?index=" + val.indexId + "&topic=" + val.topicId + "&back=" + paramObj.indexId + "&flag=false";
                }
            } else {
                href = "javascript:;";
            }
            let dom = ``;
            if (val.keyType == 5 && param.dom == "right") {
                // 关键预测的描述效果
                dom = `<div class="indexHref" style="height:${val.indexTopicWidth / 100 }rem;margin-top: ${marginTop/param.index}rem;background: linear-gradient(to right bottom, #${val.indexTopicStartEndColor.split(",")[0]}, #${val.indexTopicStartEndColor.split(",")[1]});" href="${href}">
                    <div class="title" style="${style}display:none;">
                        <div>${imgDom}</div>
                        <span style="color:#${val.titleColor}">${val.indexTopicName}</span>
                    </div>
                    <div class="chartCopy describe" style="background: radial-gradient(rgba(${val.maskColor}, 1) 60%, rgba(${val.maskColor}, ${val.transparency}));">
                        <img src="./../../assets/images/forecast/lock.png">
                        登录后即可查看
                    </div>
                    <div class="chart describe">
                        <div class="con" style="color:#${val.titleColor}">
                            ${val.description}
                        </div>
                    </div>
                </div>`;
            } else if (val.keyType == 6 && param.dom == "right") {
                let col = "ffffff",
                    img = "",
                    show = "block";
                if (JSON.parse(val.highDataData).arrow == 1) {
                    col = "fca5a8";
                    img = "./../../assets/images/forecast/rise.png";
                } else if (JSON.parse(val.highDataData).arrow == -1) {
                    col = "6cfd70";
                    img = "./../../assets/images/forecast/drop.png";
                } else if (JSON.parse(val.highDataData).arrow == 0) {
                    col = "fff6ac";
                    img = "./../../assets/images/forecast/just.png";
                }else{
                    show = "none";
                }
                // 高频模拟的描述效果
                dom = `<div class="indexHref" style="height:${val.indexTopicWidth / 100 }rem;margin-top: ${marginTop/param.index}rem;background: linear-gradient(to right bottom, #${val.indexTopicStartEndColor.split(",")[0]}, #${val.indexTopicStartEndColor.split(",")[1]});" href="${href}">
                    <div class="title high">
                        <div>
                            <span style="color:#${val.titleColor};float: right;">${JSON.parse(val.highDataData).date}</span>
                        </div>
                        <span style="color:#${val.titleColor}">${val.indexTopicName}</span>
                    </div>
                    <div class="chartCopy high" style="background: radial-gradient(rgba(${val.maskColor}, 1) 60%, rgba(${val.maskColor}, ${val.transparency}));">
                        <img src="./../../assets/images/forecast/lock.png">
                        登录后即可查看
                    </div>
                    <div class="chart high">
                        <div class="con">
                            <img class="icon" src="./../../assets/images/forecast/bar.png" alt="">
                            <span class="data" style="color:#${col}">${JSON.parse(val.highDataData).value == null?"暂无":JSON.parse(val.highDataData).value.toFixed(2)}</span>
                            <img class="arrow" src="${img}" alt="" style="display:${show}">
                        </div>
                    </div>
                </div>`;
            } else {
                dom = `<div class="indexHref" style="height:${val.indexTopicWidth / 100 }rem;margin-top: ${marginTop/param.index}rem;background: linear-gradient(to right bottom, #${val.indexTopicStartEndColor.split(",")[0]}, #${val.indexTopicStartEndColor.split(",")[1]});" href="${href}">
                    <div class="title" style="${style}">
                        <div>${imgDom}</div>
                        <span style="color:#${val.titleColor}">${val.indexTopicName}</span>
                    </div>
                    ${chartDom}
                </div>`;
            }
            $("#" + param.dom).append(dom);
            if (commentDom != "") {
                $("#" + param.dom).append(commentDom);
            }
            if (val.type == 1 && val.lineData.length != 0) {
                let chart = new lineOption({
                    name: val.topicId,
                    data: val.lineData,
                    color: val.chartColor
                });
                chart.init();
            }
            if (val.children.length != 0) {
                setDom({
                    data: val.children,
                    dom: param.dom,
                    index: param.index + 1
                })
            }
        })
    }
    // 公众评论
    function getComment(params) {
        var liDom = ``;
        $.ajax({
            url: params.url,
            data: params.data,
            async: false,
            success: function (res) {
                if (res.resultCode == 200) {
                    res.resultBody.comments.forEach(function (v) {
                        liDom += `<p>${v.user.userNickName}：${v.comment.commentContent}</p>`;
                    })
                }
            },
            error: function (err) {
                console.log(err);
            }
        })
        var dom = `<div class="indexHref" style="height:${params.height}rem;margin-top: ${params.marginTop}rem;background: linear-gradient(to right bottom, #${params.backColor[0]}, #${params.backColor[1]});" href="./../../views/pages/forecast_comment.html?info=${params.data.infoId}&index=${paramObj.indexId}&flag=${params.data.flag}">
                    <div class="title">
                        <span style="color:#${params.titleColor}">${params.name}</span>
                        ${params.imgDom}
                    </div>
                    <div class="chart article" flag="article" style="overflow-y: scroll;margin-bottom: 0.2rem;">
                        <div class="loop comment" style="font-size:12px;color:#${params.contentColor}">
                            <div class="space"></div>
                            ${liDom}
                        </div>
                    </div>
                </div>`;
        return dom;
    }
    //获取钻石
    function getDiamond(id) {
        if (paramObj.diamond[id] == undefined) {
            $.ajax({
                url: paramObj.newCmsUrl + "diamond/findDiamondById",
                data: {
                    id: id
                },
                async: false,
                success: function (res) {
                    if (res.resultCode == 200) {
                        paramObj.diamond[id] = res.resultBody.picUrl;
                    }
                },
                error: function (err) {
                    console.log(err)
                }
            })
        }
        paramObj.diaUrl = paramObj.diamond[id];
    }
    //线图
    function lineOption(param) {
        this.line = null;
        this.id = param.name;
        if (!($.isEmptyObject(param.data))) {
            var data = [],
                value = [];
            param.data.forEach(function (a) {
                data.push(a.data);
                value.push(a.value);
            })
            this.option = {
                xAxis: {
                    show: false,
                    type: 'category',
                    data: data
                },
                yAxis: {
                    scale: true,
                    boundaryGap: false,
                    show: false,
                    type: 'value'
                },
                grid: {
                    height: '90%',
                    width: '92%',
                    left: '4%',
                    bottom: "6%",
                    containLabel: false
                },
                series: [{
                    data: value,
                    type: 'line',
                    smooth: true,
                    showSymbol: false,
                    lineStyle: {
                        color: "#" + param.color,
                        type: 'solid',
                        width: 3,
                    }
                }]
            };
        }
    }
    lineOption.prototype = {
        init: function () {
            this.line = echarts.init(document.getElementById(this.id));
            this.line.setOption(this.option, true);
        }
    }
    //返回
    $("header .back").click(function () {
        window.location.href = "./../forecast.html";
    })
})