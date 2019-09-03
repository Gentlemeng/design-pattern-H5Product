$(function () {
    var sessionData = sessionStorage.getItem("Authentication");
    $(".header .date")[0].innerText = parseURL(window.location.href).date;
    $(".header .title")[0].innerText = parseURL(window.location.href).name;
    if (sessionData == null || JSON.parse(sessionData).data == undefined) {
        redirectUrl();
    } else {
        var paramObj = {
            url: newCmsUrl + "guess/findGuessIndexHisForMonthDetail",
            id: parseURL(window.location.href).id,
            token: JSON.parse(sessionData).data
        };
        var data_chart = echarts.init(document.getElementById("chart"));
        getData();
        function getData() {
            $.ajax({
                url: paramObj.url,
                beforeSend: function (xhr) {
                    xhr.setRequestHeader("Authentication", paramObj.token);
                },
                data: {
                    id: parseInt(paramObj.id)
                },
                success: function (res) {
                    if (res.resultCode == 200) {
                        var seriesData = [],
                            xData = [],
                            result = JSON.parse(res.resultBody.guessResult),
                            option = {
                                grid: {
                                    containLabel: true,
                                    top: '7%',
                                    left: '4%',
                                    width: '90%',
                                    height: '92%'
                                },
                                xAxis: [{
                                    type: 'category',
                                    boundaryGap: false,
                                    data: [],
                                    axisLabel: {
                                        margin: 10,
                                        textStyle: {
                                            color: '#fff',
                                            fontSize: 10,
                                        },
                                        rotate: 50
                                    },
                                    axisLine: {
                                        lineStyle: {
                                            color: '#463a6a',
                                            width: 1,
                                            type: 'solid'
                                        }
                                    },
                                    axisTick: {
                                        show: false,
                                        alignWithLabel: true,
                                        inside: true
                                    },
                                    splitLine: {
                                        show: false,
                                    },
                                    splitArea: {
                                        show: false,
                                    }
                                }, {
                                    ype: 'category',
                                    boundaryGap: false,
                                    data: [],
                                    axisLabel: {
                                        margin: 20,
                                        textStyle: {
                                            color: '#fff',
                                            fontSize: 12,
                                        }
                                    },
                                    axisLine: {
                                        lineStyle: {
                                            color: '#463a6a',
                                            width: 1,
                                            type: 'solid'
                                        }
                                    },
                                    axisTick: {
                                        show: false,
                                        alignWithLabel: true,
                                        inside: true
                                    },
                                    splitLine: {
                                        show: false,
                                    },
                                    splitArea: {
                                        show: false,
                                    }
                                }],
                                yAxis: {
                                    type: 'value',
                                    scale: true, //脱离0值比例
                                    splitNumber: 4,
                                    boundaryGap: false,
                                    axisLabel: {
                                        margin: 12,
                                        color: '#fff',
                                        fontFamily: 'arial',
                                        fontSize: 10,
                                    },
                                    axisLine: {
                                        show: true,
                                        lineStyle: {
                                            color: '#fff', //y轴
                                            width: 1,
                                            type: 'solid'
                                        }
                                    },
                                    axisTick: {
                                        onGap: false,
                                        show: false,
                                    },
                                    splitArea: {
                                        show: false
                                    },
                                    splitLine: {
                                        show: true,
                                        lineStyle: {
                                            color: '#463a6a'
                                        }
                                    },
                                    axisPointer: {
                                        show: false,
                                    }
                                },
                                series: [{
                                    data: [],
                                    type: 'line',
                                    smooth: true,
                                    symbolSize: 6,
                                    lineStyle: {
                                        color: "#00fff6"
                                    },
                                    itemStyle: {
                                        color: "#00fff6"
                                    }
                                }]
                            };
                        result.forEach(v => {
                            seriesData.push(v.value.toFixed(1));
                            xData.push(v.month.split("-").join("."));
                        });
                        option.series[0].data = seriesData;
                        option.xAxis[0].data = xData;
                        option.xAxis[1].data = seriesData;
                        data_chart.setOption(option, true);
                    }
                },
                error: function (err) {
                    console.log(err);
                }
            })
        }
    }
    $(".header .back").click(function () {
        window.location.href = "./relevant.html";
    })
})