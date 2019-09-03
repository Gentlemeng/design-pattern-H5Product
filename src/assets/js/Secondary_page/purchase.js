$(function () {
    //默认返回“我的页面”.
    var backUrl="./../myself.html";
    var sessionData = sessionStorage.getItem("Authentication");
    if (sessionData == null || JSON.parse(sessionData).data == undefined) {
        redirectUrl();
    } else {
        var paramObj = {
            // newCmsUrl: newCmsUrl,
            newCmsUrl:"http://192.168.1.113/h5/",
            token: sessionData ? JSON.parse(sessionData).data : "",
            body: "金币充值",
            goldCount: "",
            total_fee: "",
            goldCashRelationId: "",
        }
        //处理返回按钮url
        var productSource = sessionStorage.getItem("productSource");

        if (productSource) {
            backUrl = productSource;
        }
        initPage();
        function initPage() {
            $.ajax({
                url: paramObj.newCmsUrl + "gold/findGoldCoinToCashList",
                beforeSend: function (xhr) {
                    xhr.setRequestHeader("Authentication", paramObj.token);
                },
                success: function (res) {
                    if (res.resultCode == 200) {
                        $(".bigBox").remove();
                        $(".purchase_container .user span")[0].innerHTML = res.resultBody.userName;
                        let domString = "";
                        for (let i = 0; i < res.resultBody.list.length; i += 2) {
                            if (res.resultBody.list[i + 1] == undefined) {
                                domString += `<div class="bigBox">
                                                <div class="box" cash="${res.resultBody.list[i].cash}" goldCoin="${res.resultBody.list[i].goldCoin}" id="${res.resultBody.list[i].id}">
                                                    <p>${res.resultBody.list[i].goldCoin}金币</p>
                                                    <p>售价：${res.resultBody.list[i].cash}元</p>
                                                </div>
                                            </div>`;
                            } else {
                                domString += `<div class="bigBox">
                                                <div class="box" cash="${res.resultBody.list[i].cash}" goldCoin="${res.resultBody.list[i].goldCoin}" id="${res.resultBody.list[i].id}">
                                                    <p>${res.resultBody.list[i].goldCoin}金币</p>
                                                    <p>售价：${res.resultBody.list[i].cash}元</p>
                                                </div>
                                                <div class="box" cash="${res.resultBody.list[i+1].cash}" goldCoin="${res.resultBody.list[i+1].goldCoin}" id="${res.resultBody.list[i+1].id}">
                                                    <p>${res.resultBody.list[i+1].goldCoin}金币</p>
                                                    <p>售价：${res.resultBody.list[i+1].cash}元</p>
                                                </div>
                                                </div>`;
                            }
                        }
                        $(".mode").append(domString);
                        $(".box").click(function () {
                            paramObj.total_fee = parseFloat($(this).attr("cash"));
                            paramObj.goldCount = parseInt($(this).attr("goldCoin"));
                            paramObj.goldCashRelationId = parseInt($(this).attr("id"));
                            $(".box").removeClass("active");
                            $(this).addClass("active");
                        })
                    }else if(res.resultCode == 201){
                        $(".bigBox").remove();
                        $(".purchase_container .user span")[0].innerHTML = res.resultBody.userName;
                    }else if(res.resultCode == 401 || res.resultCode == 405 || res.resultCode == 402){
                        redirectUrl();
                    }
                },
                error: function (err) {
                    console.log(err);
                }
            })
        }
        $(".purchase_container .btn").click(function () {
            if ($(".mode .box.active").length != 0) {
                if (sessionStorage.getItem("deviceType") == "wechat") {
                    var userInfo = getUserInfo(paramObj.token);
                    payFun({
                        openId: userInfo.openId,
                        goldCount: paramObj.goldCount,
                        total_fee: paramObj.total_fee,
                        body: paramObj.body,
                        goldCashRelationId: paramObj.goldCashRelationId,
                        url: commonParamObj.payUrl,
                        token: paramObj.token
                    });
                } else if (sessionStorage.getItem("deviceType") == "other") {
                    h5PayFun({
                        url: commonParamObj.h5payUrl,
                        token: paramObj.token,
                        goldCount: paramObj.goldCount,
                        total_fee: paramObj.total_fee,
                        body: paramObj.body,
                        goldCashRelationId: paramObj.goldCashRelationId,
                    });
                }
            } else {
                $.dialog({
                    type: "alert",
                    onClickOk: function () {
                        return false;
                    },
                    autoClose: 0,
                    contentHtml: `<p style="text-align:center;">请选择充值金额。</p>`
                });
            }
        })
    }
    
    $(".purchase_header .back").click(function () {
        if(history.length>1&&document.referrer.indexOf("product_center.html")!=-1){
            window.history.go(-1);
            return false;
        }
        window.location.href = backUrl;
    })
    // 公众号支付
    function payFun(param) {
        $.ajax({
            type: "GET", //方法类型
            dataType: "json", //预期服务器返回的数据类型
            url: param.url, //url
            beforeSend: function (xhr) {
                xhr.setRequestHeader("Authentication", param.token);
            },
            data: {
                openId: param.openId,
                goldCount: param.goldCount,
                total_fee: param.total_fee,
                body: param.body,
                goldCashRelationId: param.goldCashRelationId,
            },
            success: function (result) {
                if (result.resultCode != "200") {
                    alert("下单失败");
                } else {
                    onBridgeReady(result.resultBody);
                }
            },
            error: function (err) {
                JSON.stringify(err);
                alert("商家支付系统异常,请稍后再试！");
            }
        });
    }

    function onBridgeReady(result) {
        WeixinJSBridge.invoke(
            "getBrandWCPayRequest", {
                //公众号名称，由商户传入
                "appId": result.appId,
                //时间戳，自1970年以来的秒数
                "timeStamp": result.timeStamp,
                //随机串  
                "nonceStr": result.nonceStr,
                "package": result.package,
                //微信签名方式： 
                "signType": result.signType,
                //微信签名
                "paySign": result.paySign
            },function(res){
                if(res.err_msg == "get_brand_wcpay_request:ok" ){
                    $(".box").removeClass("active");
                }
             });
    }
    // H5支付
    function h5PayFun(param) {
        $.ajax({
            type: "post", //方法类型
            dataType: "json", //预期服务器返回的数据类型
            url: param.url,
            beforeSend: function (xhr) {
                xhr.setRequestHeader("Authentication", param.token);
            },
            data: {
                goldCount: param.goldCount,
                total_fee: param.total_fee,
                body: param.body,
                goldCashRelationId: param.goldCashRelationId,
            },
            success: function (result) {
                if (result.resultCode != "200") {
                    alert("失败");
                } else {
                    window.location.href = result.resultBody+"&redirect_url="+encodeURIComponent(window.location.href+"?token="+param.token);
                }
            },
            error: function () {
                alert("系统异常,请稍后再试！");
            }
        });
    }
    // 获取用户信息
    function getUserInfo(token) {
        var userInfo = {};
        $.ajax({
            url: commonParamObj.openIdUrl,
            type: "post",
            async: false,
            data: {
                loginType: sessionStorage.getItem("deviceType")
            },
            beforeSend: function (xhr) {
                xhr.setRequestHeader("Authentication", token);
            },
            success: function (result) {
                if (result.status == "200") {
                    userInfo = result.body;
                } else if (result.status == "401") {
                    redirectUrl();
                }
            },
            error: function (err) {
                console.log(err);
            }
        });
        return userInfo;
    }
})