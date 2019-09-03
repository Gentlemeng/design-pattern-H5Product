$(function () {
    var paramObj = {
        url: newCmsUrl,
        type: parseURL(window.location.href).type,
        id: parseURL(window.location.href).id,
        redirectUrl: ""
    };
    let sessionData = sessionStorage.getItem("Authentication");
    $("." + paramObj.type).css("display", "block");

    if (is_phone() && is_weixin()) {
        $(".logo1").show();
        $(".wx").show();
        $(".logo2").hide();
        $(".nowx").hide();
        paramObj.redirectUrl = "https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx1f8aa745e4ae3904&redirect_uri=" + encodeURIComponent(authUrl + "/callback/public?redirect_uri=" + encodeURIComponent(window.location.href)) + "&response_type=code&scope=snsapi_userinfo&state=1#wechat_redirect";
        initPage();
    } else if (is_phone() && !is_weixin()) {
        $(".logo2").show();
        $(".nowx").show();
        $(".logo1").hide();
        $(".wx").hide();
    }
    window.addEventListener("onorientationchange" in window ? "orientationchange" : "resize", function () {
        window.location.reload();
    }, false);

    $("#cancel").click(function () {
        WeixinJSBridge.call('closeWindow');
        document.addEventListener('WeixinJSBridgeReady', function () {
            WeixinJSBridge.call('closeWindow');
        }, false)
    })
    $("#activate").click(function () {
        if (sessionData == null || JSON.parse(sessionData).data == undefined) {
            redirectUrl();
        } else {
            $.ajax({
                url: paramObj.url + "enroll/check",
                beforeSend: function (xhr) {
                    xhr.setRequestHeader("Authentication", JSON.parse(sessionData).data);
                },
                data: {
                    type: paramObj.type,
                    enrollId: paramObj.id
                },
                success: function (res) {
                    if (res.status == 200) {
                        $.dialog({
                            type: "alert",
                            onClickOk: function () {
                                window.location.href = "./../forecast.html";
                            },
                            contentHtml: `<p style="text-align:center;">激活成功！</p>`
                        });
                    } else if (res.status == 400) {
                        redirectUrl();
                    } else {
                        $.dialog({
                            type: "alert",
                            onClickOk: function () {
                                return false;
                            },
                            contentHtml: `<p style="text-align:center;">${res.msg}</p>`
                        });
                    }
                },
                error: function (err) {
                    console.log(err);
                }
            })
        }
    })

    function initPage() {
        $.ajax({
            url: paramObj.url + "enroll/search",
            data: {
                type: paramObj.type,
                enrollId: paramObj.id
            },
            success: function (res) {
                if (res.status == 200) {
                    $("." + paramObj.type + " .name")[0].innerHTML = res.body.text;
                    $("." + paramObj.type + " .con")[0].innerHTML = res.body.desc;
                }
            },
            error: function (err) {
                console.log(err);
            }
        })
    }
    // 登录页面
    function redirectUrl() {
        sessionStorage.removeItem("Authentication");
        $.dialog({
            type: "confirm",
            onClickOk: function () {
                window.location.href = paramObj.redirectUrl;
            },
            contentHtml: `<p style="text-align:left;">未登录或登录信息失效，请点击“确定”重新登录</p>`
        });
    }
})