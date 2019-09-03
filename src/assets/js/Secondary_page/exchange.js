$(function () {
    window.alert = function(name){
        var iframe = document.createElement("IFRAME");
        iframe.style.display="none";
        iframe.setAttribute("src", 'data:text/plain,');
        document.documentElement.appendChild(iframe);
        window.frames[0].window.alert(name);
        iframe.parentNode.removeChild(iframe);
    }
    var paramObj = {
        token: "",
        newCmsUrl: newCmsUrl,
        mescroll: {},
        rate: 0
    }
    var sessionData = sessionStorage.getItem("Authentication");
    if (sessionData != null && JSON.parse(sessionData).data != undefined) {
        paramObj.token = JSON.parse(sessionData).data;
        var productSource = sessionStorage.getItem("productSource");
        if (productSource) {
            $(".backbtn").attr({
                "href": productSource
            });
        }
        $(".head_top .backbtn").on("click",function(){
            if(history.length>1&&document.referrer.indexOf("product_center.html")!=-1){
                window.history.go(-1);
                return false;
            }
        })
        
    }

    getCredits();

    //获取用户当前积分
    function getCredits() {
        $.ajax({
            url: paramObj.newCmsUrl + "score/findUserTotalScore",
            beforeSend: function (xhr) {
                xhr.setRequestHeader("Authentication", paramObj.token);
            },
            success: function (res) {
                if (res.resultCode == 200) {
                    var crd = res.resultBody.score;
                    $(".credits_numble").html(crd);
                    getRate();
                } else if (res.resultCode == 402) {
                    dialogConfirm(`未登录或登录信息失效，请点击“确定”重新登录后进行操作`);
                }
            },
            error: function (err) {
                console.log(err);
            }
        })
    }
    //获取兑换率
    function getRate() {
        $.ajax({
            url: paramObj.newCmsUrl + "exchangeRate/findExchangeRateByNew",
            type: "post",
            dataType: "json",
            success: function (res) {
                if (res.status == 200) {
                    paramObj.rate = res.body.exchangeRate;
                    $(".rate_numble").html(res.body.exchangeRate);
                } else if (res.resultCode == 402) {
                    dialogConfirm(`未登录或登录信息失效，请点击“确定”重新登录后进行操作`);
                }
                golds();
            },
            error: function (err) {
                console.log(err);
            }
        })
    }
    //换算金币
    function golds() {
        if (parseInt($(".credits_numble").html()) / (paramObj.rate) >= 1) {
            var goldNumbel = parseInt($(".credits_numble").html()) / (paramObj.rate);
            $(".golds_numble").html(Math.floor(goldNumbel));
        } else {
            $(".golds_numble").html(0);
        }

    }
    getData();
    //加载记录数据
    function getData() {
        paramObj.mescroll = new MeScroll("mescroll", {
            up: {
                callback: upCallback,
                page: {
                    num: 0, //当前页 默认0,回调之前会加1; 即callback(page)会从1开始
                    size: 10 //每页数据条数,默认10
                },
                clearEmptyId: "mescroll",
                empty: {
                    tip: "当前无兑换记录", //提示
                },
                lazyLoad: {
                    use: true
                },
                htmlNodata: '<p class="upwarp-nodata">无更多兑换记录</p>',
            }
        })
    }


    function upCallback(page) {
        $.ajax({
            url: paramObj.newCmsUrl + 'gold/findUserGoldCoinExchange',
            beforeSend: function (xhr) {
                xhr.setRequestHeader("Authentication", paramObj.token);
            },
            type: 'GET',
            data: {
                page: page.num,
                size: page.size
            },
            success: function (curPageData) {
                if (curPageData.resultCode == 200) {
                    paramObj.mescroll.endSuccess(curPageData.resultBody.length);
                    setListData(curPageData.resultBody);
                } else if (curPageData.resultCode == 201) {
                    setListData(curPageData.resultBody);
                } else if (curPageData.resultCode == 402) {
                    dialogConfirm(`未登录或登录信息失效，请点击“确定”重新登录后进行操作`);
                }

            },
            error: function (e) {
                //联网失败的回调,隐藏下拉刷新和上拉加载的状态
                paramObj.mescroll.endErr();
            }
        })
    }
    //渲染记录
    function setListData(curPageData) {
        if (!($.isEmptyObject(curPageData))) {
            var liStr = "";
            var result = curPageData;
            result.forEach(function (item) {
                liStr = `
                <li>
                <span class="day">${item.yearMonthDay}</span> 
                <span class="time">${item.hourMinute}</span>
                <span class="credits">${item.score}积分</span>
                <span class="golds">${item.goldCoin}金币</span>
                </li>
                `
                $(".mescroll").append(liStr);
            })
            $(".mescroll-hardware").hide();
        }else{
            var liStr = "";
            liStr=`<div class="nomore">当前没有兑换记录！</div>`;
            $(".mescroll").append(liStr);
            $(".mescroll-hardware").hide();
        }

    }
    //兑换输入框
    $('input').on('keyup', function () {
        var maxGolds = parseInt($(".golds_numble").html());
        $(".numble").html(Math.ceil($(this).val() * (paramObj.rate)));
        var val = parseInt($(this).val());
        if (val > maxGolds) {            
            $(this).val("");
            $(".numble").html(0);
            $(this).attr("disabled","disabled");
            $.dialog({
                type: "alert",
                onClickOk: function () {
                    $('input').removeAttr("disabled");
                },
                // autoClose: function(){
                //     // 只有传过来的closeTime值为undefined时，才设置默认的2000关闭时间
                //     return closeTime=closeTime==undefined?2000:closeTime;
                // }(),
                autoClose: 0,
                contentHtml: `<p style="text-align:center;">您的积分不足无法兑换该金币数</p>`
            });
            // dialogAlert("您的积分不足无法兑换该金币数");
                        
        }
    });
    $("button").on("click", function () {
        if (parseInt($(".numble").html()) > parseInt($(".credits_numble").html())) {
            dialogAlert("您的积分不足");
        } else if ($(".numble").html() == 0) {
            dialogAlert("请输入兑换个数");
        } else if ($(".numble").html() != 0) {
            var scores = parseInt($(".numble").html()),
                golds = parseInt($('input').val());
            $.dialog({
                type: "confirm",
                onClickOk: function () {
                    exchange(scores, golds);
                },
                contentHtml: `<p style="text-align:center;">您将消耗 ${scores} 积分兑换 ${golds} 金币</p>`
            });
        }
    })

    function exchange(scores, golds) {
        $.ajax({
            type: 'POST',
            url: paramObj.newCmsUrl + "gold/insertUserGoldCoinExchange",
            beforeSend: function (xhr) {
                xhr.setRequestHeader("Authentication", paramObj.token);
            },
            data: {
                score: scores,
                goldCoin: golds
            },
            success: function (res) {
                if (res.resultCode == 200) {
                    alert("兑换成功");
                    location.reload();
                    // selfAlert();
                } else if (res.resultCode == 402) {
                    dialogConfirm(`未登录或登录信息失效，请点击“确定”重新登录后进行操作`);
                }
            },
            error: function (err) {
                console.log(err);
            }
        })

    }

    // function selfAlert() {
    //     $(".cover").show();
    //     $(".alertBox").show();       
    //     $(".alertBox").find(".buttom").on('click', function () {
    //         $(".cover").hide();
    //         $(".alertBox").hide();
    //         location.reload();
    //         getCredits();
    //     })
    // }

})