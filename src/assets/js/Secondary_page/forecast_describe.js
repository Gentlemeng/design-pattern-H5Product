$(function () {
    var paramObj = {
        indexUrl: indexUrl,
        indexId: parseURL(window.location.href).index,
        backUrl: function(){
            var backUrl = sessionStorage.getItem("describeBackUrl");
            return backUrl?backUrl:"./forecast_detail.html"
        }()
    };
    $("header .title")[0].innerHTML = "指标说明";
    init();

    function init() {
        $.ajax({
            url: paramObj.indexUrl + "findModuleDescriptionInfoByIndexId",
            data: {
                indexId: paramObj.indexId
            },
            success: function (res) {
                if (res.status == 200) {
                    if (res.body.indexName == "宏观") {
                        $("header .title")[0].innerHTML = "指标和栏目说明";
                    }
                    $(".content").append(res.body.description);
                }
            },
            error: function (err) {
                console.log(err);
            }
        })
    }
    $("header .back").click(function () {
        // window.location.href = "./forecast_detail.html?indexId=" + paramObj.indexId;
        window.location.href = `${paramObj.backUrl}?indexId=${paramObj.indexId}`;
    })
})