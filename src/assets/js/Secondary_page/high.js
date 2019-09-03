$(function () {
    var paramObj = {
        url: indexUrl,
        topicId: parseURL(window.location.href).topic,
        id: parseURL(window.location.href).id,
        flag: parseURL(window.location.href).flag
    }
    var data_chart = echarts.init(document.getElementById("chart"));
    // 获取line data
    function getData() {
        $.ajax({
            url: paramObj.url + "findHighDetail",
            data: {
                Id: paramObj.id,
                flag: paramObj.flag
            },
            type: "post",
            dataType: "json",
            success: function (res) {
                if (res.resultCode == "200") {
                    var seriesData = [],
                        option = lineOption(),
                        result = res.resultBody.data;
                    for (let i = 0; i < result.length; i++) {
                        $(".high_chart .title")[0].innerText = result[i].itemName;
                        var item, serieData = time2Datetime(result[i].children),
                            color = '#f24a69';
                        if (result[i].type == 14) {
                            color = '#fff';
                        }
                        item = {
                            name: result[i].itemname,
                            type: 'line',
                            showAllSymbol: false,
                            symbol: 'circle',
                            symbolSize: 2,
                            data: serieData,
                            yAxisIndex: 0,
                            smooth: true,
                            itemStyle: {
                                normal: {
                                    color: color,
                                    lineStyle: {
                                        width: 2,
                                        type: 'solid',
                                        color: color
                                    }
                                }
                            },
                            markLine: {},
                            markArea: {}
                        };
                        seriesData.push(item);
                    }
                    option.series = seriesData;
                    data_chart.setOption(option, true);
                }
            },
            error: function (err) {
                console.log(err);
            }
        })
    }
    getData();

    // 获取相关高频
    getHighInfo();

    function getHighInfo() {
        $.ajax({
            url: paramObj.url + "findIndexHighDetail",
            type: "post",
            data: {
                topicId: paramObj.topicId,
                Id: paramObj.id
            },
            dataType: "json",
            success: function (result) {
                if (result.resultCode == "200") {
                    var res = result.resultBody.high,
                        dom = "";
                    if (res.length != 0) {
                        for (var i = 0; i < res.length; i++) {
                            if (res[i].unit == "") {
                                dom += `<li><div><a href="./high.html?topic=${paramObj.topicId}&id=${res[i].id}&flag=${res[i].flag}">${res[i].freItemName}</a></div><div><p>${res[i].value.toFixed(2)}</p><p>${res[i].date}</p></div></li>`;
                            } else {
                                dom += `<li><div><a href="./high.html?topic=${paramObj.topicId}&id=${res[i].id}&flag=${res[i].flag}">${res[i].freItemName}</a></div><div><p>${res[i].value.toFixed(2)}${res[i].unit}</p><p>${res[i].date}</p></div></li>`;
                            }
                        }
                    } else {
                        dom = `<h3 class="tip">暂无更多数据</h3>`
                    }
                    $(".high_list .high_ul").append(dom);
                }
            },
            error: function (err) {
                console.log(err);
            }
        })
    }

    $(".header .back").click(function () {
        window.history.back();
    })
})