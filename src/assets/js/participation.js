$(function() {
    var paramObj = {
        url: newCmsUrl,
        token: '',
        mescroll: {},
        pageSize: 8,
        particiTabIndex: "0",
        // 用户历史竞猜线条颜色
        indexLinesColor:["#00ffff","#dd3eff","#f0ff00","#00ff36","#529fff","#ff0000"],
        historyGuessData:null,
        questionCategory: function() {
            return JSON.parse(sessionStorage.getItem("questionCategory"));
        }(),
        questionListUrl: "",
        questionCategoryName: "",
        questionCategoryActive: 0,
        //竞猜消耗积分
        credit:200,
        att:"",
        infoTitle:"",
        guessRuleData:[],
        viewRuleData:[],
        questionRuleData:[]
    };
    
    paramObj.questionListUrl = paramObj.questionCategory ? paramObj.questionCategory.url : "question";
    paramObj.questionCategoryName = paramObj.questionCategory ? paramObj.questionCategory.category : "人气排名";
    paramObj.questionCategoryActive = paramObj.questionCategory ? paramObj.questionCategory.index : 0;
    paramObj.particiTabIndex = sessionStorage.getItem("particiTabIndex") || "0";
    //获取token
    var sessionData = sessionStorage.getItem("Authentication");
    if (sessionData != null && JSON.parse(sessionData).data != undefined) {
        paramObj.token = JSON.parse(sessionData).data;
    }
    //顶部三个tab的calssName
    var commonClassName = "partici_tab_list",
        //竞猜页中指标tab的className
        commonGuessTabClassName = "canvasTab";
    //竞猜相关
    var guess = {
        guessIndexData:[],
        drawTimes: 0,
        indexSwiper: null
    }
    var particiSwiper = new Swiper('.partici_swiper', {
        pagination: '.partici_tab_ul',
        paginationClickable: true,
        initialSlide: paramObj.particiTabIndex,
        paginationBulletRender: function(swiper, index, className) {
            var name = '';
            switch (index) {
                case 0:
                    name = '竞猜大擂台';
                    break;
                case 1:
                    name = '观点拉锯战';
                    break;
                case 2:
                    name = '我要提问';
                    break;
            }
            return '<li class="' + commonClassName + ' ' + className + '">' + name + '</li>';
        }
    })
    let participationRule = SingleRule.getInstance()
    $("." + commonClassName).eq(Number(paramObj.particiTabIndex)).attr("isclicked", true);
    //点击头部tab栏
    $('.' + commonClassName).on("click", function(e) {
        //是否为高亮
        if (!$(this).hasClass("swiper-pagination-bullet-active")) {
            sessionStorage.setItem("particiTabIndex", $(this).index())
                //是否为第一次点击
            if ($(this).attr("isclicked")) {
                return
            } else {
                $(this).attr("isclicked", true);
                if ($(this).text() === "我要提问") {

                    drawQuestion();

                } else if ($(this).text() === "观点拉锯战") {

                    drawView();

                } else if ($(this).text() === "竞猜大擂台") {
                    drawGuess();
                }
            }
        }
    })
    if (paramObj.particiTabIndex === "0") {

        drawGuess();

    } else if (paramObj.particiTabIndex === "1") {

        drawView();

    } else {
        drawQuestion();
    }
    //展开/收缩竞猜指标选择器
    $(".index_selected_text").on("click",function(){
        $('.guess_tab').toggle();
        return false
    })
    $(".guess").on("click",function(){
        if($(".guess_tab").is(':visible')){
            $(".guess_tab").hide();
        }
    })
    //查看历史数据、历史竞猜   
    $(".guess_chart_wrap").on("click", ".check_history", function() {
        if (sessionData == null || JSON.parse(sessionData).data == undefined) {
            dialogConfirm("请登录后查看历史数据");
            return false
        }
        var historyWrap = $(this).parents(".guess_chart_slide").find(".guess_chart_history_wrap")
        // if (historyWrap.is(":visible")) {
        if ($(this).hasClass("active")) { //点击“返回预测”
            historyWrap.hide();
            $(this).removeClass("active");
            //点击的是“查看历史竞猜”
            if($(this).hasClass("history_truth")){
                $(this).text("历史数据")
            }else{
                $(this).text("历史竞猜")
            }
        } else { //点击“历史预测”或“历史竞猜”
            $(this).siblings().removeClass("active"); 
            if($(this).hasClass("history_truth")){
                $(this).siblings().text("历史竞猜") //兄弟元素变成历史竞猜
            }else{
                $(this).siblings().text("历史数据") //兄弟元素变成历史数据
            }
            $(this).addClass("active");
            var index;
            
            if($(this).hasClass("history_truth")){  //查看历史数据
                index = $(".history_truth").index(this);
                var itemId = $(`.${commonGuessTabClassName}`).eq(index).attr("itemId");
                var indexName = $(`.${commonGuessTabClassName}`).eq(index).attr("indexName");
                reqHistoryData(itemId, indexName,historyWrap);
                var xData = guess[indexName]["historyData"]["xData"];
                var seriesData = guess[indexName]["historyData"]["seriesData"];
                // console.log(JSON.stringify(seriesData));
                var historyLineChart = new LinesCompareChart({
                    id: `history_${indexName}`,
                    indexName: indexName,
                    grid:{
                        left: 'center',
                        width: '86%',
                        height: '70%',
                        bottom: '5%',
                        containLabel: true
                    },
                    xData: xData,
                    seriesData: seriesData
                }).init();
            }else{ //查看历史竞猜
                index = $(".history_guess").index(this);
                var itemId = $(`.${commonGuessTabClassName}`).eq(index).attr("itemId");
                var indexName = $(`.${commonGuessTabClassName}`).eq(index).attr("indexName");
                reqHistoryGuessData(itemId,indexName,historyWrap)
                var series = [];
                var legendNames =paramObj.historyGuessData.indexs,
                legendLen;
                var xData = paramObj.historyGuessData.months;
                paramObj.historyGuessData.values.forEach(function(data,index){
                    var seriesConfig={
                        type: 'line',
                        name: legendNames[index],
                        smooth: true,
                        symbol:"circle",
                        showSymbol:false,
                        symbolSize: 4,
                        itemStyle: {
                            normal: {
                                // color: 'red'
                            }
                        },
                        lineStyle: {
                            normal: {
                                width: 2,
                                // color:paramObj.lineColors[i]
                            }
                        },
                        data: data
                    }
                    series.push(seriesConfig)

                })
                legendLen = legendNames.length;
                var historyGuessLineChart = new LinesCompareChart({
                    id: `history_${indexName}`,
                    indexName: indexName,
                    color:paramObj.indexLinesColor,
                    grid:{
                        left: 'center',
                        width: '86%',
                        height: '63%',
                        bottom: '5%',
                        containLabel: true
                    },
                    legend:[{
                        top: "15%",
                        left:"center",
                        // itemGap:50,
                        data: legendNames.slice(0,Math.ceil(legendLen/2)),//截取前一半
                        textStyle: {
                            color: '#fff',
                            fontSize:12
                        }
                    },{
                        top: "23%",
                        left:"center",
                        // itemGap:50,
                        data: legendNames.slice(Math.ceil(legendLen/2)),//截取后一半
                        textStyle: {
                            color: '#fff',
                            fontSize:12
                        }
                    }],
                    xData:xData,
                    // seriesData:series
                })
                // historyGuessLineChart.option.xAxis.type = "time";
                // historyGuessLineChart.option.xAxis.splitNumber = 3;
                historyGuessLineChart.option.series= series;
                historyGuessLineChart.init();
            }
            if(historyWrap.is(":visible")){
                $(this).text("返回预测");
            }
        }
        // 用户点击确定才将historyWrap显示出来
        // historyWrap.toggle();
    })
    // 关闭历史数据弹出层
    $(".guess_chart_wrap").on("click", ".history_close_wrap", function() {
        $(this).parent().hide();
        $(".history_truth").text("历史数据").removeClass("active");
        $(".history_guess").text("历史竞猜").removeClass("active");
    })

    //拖拽前验证
    // $(".guess_chart_wrap").on("touchmove",function(){
    //     if (sessionData == null || JSON.parse(sessionData).data == undefined) {
    //         dialogConfirm("请先登录再进行预测");
    //         return false
    //     }
    // })

    //观点拉锯战留言
    var interval;
    $("#txt").on("focus", function() {
            clearTimeout(interval);
            if (sessionData == null || JSON.parse(sessionData).data == undefined) {
                interval = setTimeout(function() {
                    document.body.scrollTop = document.body.scrollHeight
                }, 0)
                $("#txt").blur();
                dialogConfirm("请先登录再评论或回复");
            }
        })
        //键盘回弹
    $('#txt').on('blur', function() {
        window.scroll(0, 0);
    });
    //"竞猜大擂台"-渲染竞猜大擂台
    function drawGuess() {

        reqGuessIndex();
        
        //渲染竞猜页中指标canvas结构
        if (guess.guessIndexData.length) { //有数据时才去渲染可拖拽区域的html、创建可拖拽canvas图表类
            var indexId = guess.guessIndexData[0].id;
            // var participateId = guess.guessIndexData[0].participateId;
            requestGuessData(indexId);
            drawSwiperHtml(guess.guessIndexData);
            var text = $.trim($("." + commonGuessTabClassName).eq(0).text());
            //处理提示和按钮样式
            btnStatus(text, 0);
            //创建拖拽实例
            var firstCanvasId = "#" + $(".guess_canvas:first").attr("id");
            creatCanvasDrag(firstCanvasId)
        } else { //没有可预测指标时，只保留背景图和相关提示
            $(".guess").css({
                "height": "100%"
            }).html(`<div class="no_partici_data">暂无活动可参与</div>`)
        }
        //“竞猜大擂台”切换指标时
        $('.' + commonGuessTabClassName).on("click", function() {
                if (!$(this).hasClass("swiper-pagination-bullet-active")) {
                    //获取指标名并显示
                    var text = $.trim($(this).text());
                    $(".index_selected_text").text(text);
                    $(".guess_tab").hide();

                    if ($(this).attr("clicked")) {
                        paramObj.guessRuleData = guess[text]["rule"]
                        return;
                    } else {
                        var indexId = $(this).attr("indexId");
                        // var participateId = $(this).attr("participateId");        
                        //请求点击的指标数据
                        requestGuessData(indexId);
                        $(this).attr({ "clicked": true });
                        var index = $(this).index();
                        //处理提示和按钮样式
                        btnStatus(text, index);
                        //创建拖拽实例
                        var canvasId = "#" + $(".guess_canvas").eq(index).attr("id");
                        creatCanvasDrag(canvasId);
                    }

                } else {
                    return false;
                }
        })
            //阻止拖动canvas时的默认事件（整个页面滑动）
        // $(".guess_chart").on("touchmove", function() {
        //     // e.preventDefault();
        //     return false;
        // })
    }
    //"竞猜大擂台"-请求竞猜指标
    function reqGuessIndex(){
        $.ajax({
            url: paramObj.url + "guess/findGuessList",
            beforeSend: function(xhr) {
                xhr.setRequestHeader("Authentication", paramObj.token);
            },
            async: false,
            success: function(result) {
                // console.log(JSON.stringify(result));
                if (result.resultBody) {
                    var bg_url = result.resultBody.IMAGES;
                        guess.guessIndexData = result.resultBody.RESULT;
                        $(".index_selected_text").text(guess.guessIndexData[0].indusName)
                        //只有页面初次传染时才 渲染图片背景，赋值指标名称和id
                    if (!guess.drawTimes) {
                        //渲染图片背景
                        if (bg_url) {
                            $(".guess").css({ "background": `url("${bg_url}") no-repeat center/cover` });
                        } else {
                            //无图片时，默认添加静态图片
                            $(".guess").css({ "background": `url("./../assets/images/participation/guess_bg.jpg") no-repeat center/cover` });
                        }
                    }
                    guess.drawTimes++;
                }
                //暂无参与活动
                else if(result.resultCode==="201"){ //没有竞猜指标时
                    $(".guess").css({ "background": `url("./../assets/images/participation/guess_bg.jpg") no-repeat center/cover` });
                }
            },
            error: function() {
                dialogAlert("请求竞猜活动数据失败，请稍后重试。");
                //无图片时，默认添加静态图片
                $(".guess").css({ "background": `url("./../assets/images/participation/guess_bg.jpg") no-repeat center/cover` });
            }
        })
    }
    //"竞猜大擂台"-请求指标详情数据
    function requestGuessData(indexId) {
        // sessionStorage.setItem("particiTabIndex",0)
        $.ajax({
            url: paramObj.url + "guess/findGuessDetail",
            // url: "http://192.168.1.155:8767/dataProcess/indexGuess/findGuessIndexByIndex",
            beforeSend: function(xhr) {
                xhr.setRequestHeader("Authentication", paramObj.token);
            },
            data: {
                id: indexId
            },
            async: false,
            success: function(result) {
                // console.log(JSON.stringify(result));
                if (result.resultBody) {
                    var indexData = result.resultBody.baseGuess,
                        ruleData = JSON.parse( indexData["rule"]);
                        paramObj.guessRuleData = ruleData;
                    participationRule.customRultBtnClick(".guess_rule_btn",ruleData)
                    var yData = result.resultBody.yData
                    guess[indexData.indusName] = {};
                    guess[indexData.indusName]["yData"] = yData;
                    guess[indexData.indusName]["freq"] = indexData.freq;
                    guess[indexData.indusName]["rule"] = ruleData;
                    guess[indexData.indusName]["lastHistoryValue"] = indexData.fvalue;
                    guess[indexData.indusName]["xData"] = result.resultBody.xData;
                    guess[indexData.indusName]["yMaxData"] = Number((indexData.max * 100).toFixed(2));
                    guess[indexData.indusName]["yMinData"] = Number((indexData.min * 100).toFixed(2));
                    guess[indexData.indusName]["rangeMax"] = Number((indexData.preMax * 100).toFixed(2));
                    guess[indexData.indusName]["rangeMin"] = Number((indexData.preMin * 100).toFixed(2));                    
                    guess[indexData.indusName]["isUpdate"] = result.resultBody.yData?"Y":"N";
                    guess.drawTimes++;
                }
                else { //没有竞猜指标时
                    console.log("请求指标详情失败");
                }
            },
            error: function() {
                dialogAlert("请求竞猜活动数据失败，请稍后重试。");
                //无图片时，默认赋值纯色
                $(".guess").css({ "background-color": "#1a0a49" })
            }
        })
    }
    //"竞猜大擂台"-渲染拖拽区域的html
    function drawSwiperHtml(guessIndexData) {
        var htmlStr = '';
        guessIndexData.forEach(function(data, i) {
            htmlStr += `<div class="swiper-slide guess_chart_slide">
                <div class="guess_chart_top">
                    <div class="guess_chart">
                        <canvas id="canvas_${data.id}" class="guess_canvas"></canvas>
                    </div>
                    <div class="guess_chart_history_wrap">
                        <div class="guess_chart_history" id="history_${data.indusName}"></div>
                        <div class="history_close_wrap">
                            <div class="history_close"></div>
                        </div>
                    </div>
                </div>
                <div class="guess_chart_bottom">
                    <div class="guess_check">
                        <a href="javascript:;" class="check_history history_truth">历史数据</a>
                        <a href="javascript:;" class="check_history history_guess">历史竞猜</a>
                    </div>
                    <div class="guess_btn" style="display:flex">
                        <div class="preview">预览</div>
                        <div class="submit">提交</div>
                    </div>
                </div>
            </div>`
        })
        $(".guess_chart_wrap").html(htmlStr);
        //
        var historyChartWidth = $(".guess_chart_top").width();
        var historyChartHeight = $(".guess_chart_top").height();
        $(".guess_chart_history").width(historyChartWidth).height(historyChartHeight);
        guess.indexSwiper = new Swiper('.guess_swiper', {
                pagination: '.guess_tab_ul',
                paginationClickable: true,
                paginationBulletRender: function(swiper, index, className) {
                    if (guess.guessIndexData.length) {
                        return `<li class="${commonGuessTabClassName}${' '}${className}"
                            indexId="${guess.guessIndexData[index].id}" 
                            itemId = "${guess.guessIndexData[index].windItemId}"
                            indexName="${guess.guessIndexData[index].indusName}"
                            participateId="${guess.guessIndexData[index].participateId}"
                            overdue="${guess.guessIndexData[index].overdue}">
                                <div class="guess_index_name">${guess.guessIndexData[index].indusName}</div>
                        </li>`;
                    } else {
                        return false
                    }
                }
        })
        //默认第一个指标竞猜的clicked为true
        $('.' + commonGuessTabClassName).eq(0).attr({ "clicked": true })
        //处理指标过多 超出my-pagination宽度时 
        // var tabs = $(`.${commonGuessTabClassName}`).length;
        // var ulWidth = tabs > 2 ? tabs * 40 + '%' : "100%";
        // $(".guess_tab_ul").css({ "width": ulWidth });
    }
    //"竞猜大擂台"-创建拖拽类
    function creatCanvasDrag(canvasId) {
        var canvasParent = $(canvasId).parents(".guess_chart_slide"),
            canvasIndex = canvasParent.index();
        var currentTab = $('.' + commonGuessTabClassName).eq(canvasIndex)
        var currentIndexName = currentTab.attr("indexName");
        var currentIndexId = currentTab.attr("indexId");
        //当前期数
        var currentIndexParticiId = currentTab.attr("participateId");
        //当前点击的指标是否可以进行修改 'Y'可以修改 'N'不可修改
        var currentIndexOverdue = currentTab.attr("overdue")||"Y"
        var lastHistoryValue = guess[currentIndexName].lastHistoryValue;
        var xData = guess[currentIndexName].xData;
        var yData = guess[currentIndexName].yData;
        var freq = guess[currentIndexName].freq;
        var yMaxData = guess[currentIndexName].yMaxData; //300
        var yMinData = guess[currentIndexName].yMinData;
        var rangeMax = guess[currentIndexName].rangeMax;
        var rangeMin = guess[currentIndexName].rangeMin;
        var isPreview = false;
        var xDataForShow;
        // var step = (yMaxData / 3).toFixed(0);
        // var rangeY = [step + '', step * 2 + '', yMaxData + ''];

        //格式化yData
        if (yData) {
            isPreview = true;
            yData = yData.map(function(value) {
                return parseFloat((value).toFixed(1));
            })
        }else{
            yData = [];
            xData.forEach( () => {
                yData.push(rangeMin);
            });
        }
        //格式化freq
        if(freq ==="M"){
            xDataForShow = xData.map(date=>{
                var index = date.indexOf("-")
                var newDateArr = date.split("");
                if(newDateArr[5]=="0"){
                    newDateArr.splice(index,2)
                }else{
                    newDateArr.splice(index,1)
                }
                newDateArr.splice(index,0,".")

                // newDateArr.splice(newDateArr.length-1,1);
                return newDateArr.join("");
            })
        }else{
            xDataForShow = xData.map(date=>{
                var index = date.indexOf("-")
                var newDateArr = date.split("");
                if(newDateArr[5]=="0"){
                    newDateArr.splice(index,2)
                }else{
                    newDateArr.splice(index,1)
                }
                newDateArr.splice(index,0,".")
                var tempStr = newDateArr.join("")+"季度"
                return tempStr;
            })
        }
        // var rangeMax = yMaxData+(yMaxData-yMinData)/5*10;
        // var rangeMin = yMinData-(yMaxData-yMinData)/5*10;
        //渲染第一个canvasDrag
        guess[currentIndexName]["dragCanvas"] = new CanvasDrag({
            canvasId: canvasId,
            axisLineWidth: 1,
            lastHistoryValue: lastHistoryValue,
            overdue:currentIndexOverdue,
            xData: xData,
            xDataForShow:xDataForShow,
            yData: yData,
            freq:freq,
            yMaxData: yMaxData,
            yMinData:yMinData,
            rangeMax:rangeMax,
            rangeMin:rangeMin,
            isPreview:isPreview
        })
        var previewBtn = canvasParent.find(".preview");
        var submitBtn = canvasParent.find(".submit");
        guess[currentIndexName]["dragCanvas"].init(previewBtn, submitBtn);

        //点击提交按钮时
        submitBtn.on("click", function(e) {
            var _this = this;
            //只有当然指标为非往期指标时，才允许提交
            if(currentIndexOverdue=="Y"){
                if (sessionData == null || JSON.parse(sessionData).data == undefined) {
                    dialogConfirm("请先登录再预测。");
                } else {
                    // var tipStr = guess[currentIndexName]['isUpdate']==='Y'?`此次修改需消耗${paramObj.credit}积分，确定提交吗？`:`确定提交吗？`;
                    var tipStr = `确定提交吗？`;
                    $.dialog({
                        type: "confirm",
                        onClickOk: function() {
                            
                            var result = JSON.stringify(guess[currentIndexName]["dragCanvas"].result)
                            $.ajax({
                                url: paramObj.url + "guess/insertUserGuess",
                                type: "post",
                                beforeSend: function(xhr) {
                                    xhr.setRequestHeader("Authentication", paramObj.token);
                                },
                                data: {
                                    indexId: currentIndexId,
                                    indexName: currentIndexName,
                                    indexCycle: currentIndexParticiId,
                                    guessResult: result,
                                    isUpdate:guess[currentIndexName]["isUpdate"]
                                },
                                success: function(result) {
                                    // console.log(JSON.stringify(result));
                                    var resCode = result.resultCode;
                                    if (result && (resCode === "200" || resCode === "210")) {
                                        setTimeout(() => {
                                            dialogAlert(`恭喜您预测成功！`)
                                        }, 200)
                                        guess[currentIndexName]['isUpdate'] = "Y";
                                    } else if (resCode === "401" || resCode === "402" || resCode === "405") {
                                        setTimeout(() => {
                                            dialogConfirm();
                                        }, 200)
                                    }else if(resCode ==="603"){
                                        setTimeout(function(){
                                            dialogAlert(`当前该指标正处于上轮活动结算期，暂无法预测，请选择本轮活动期内指标进行预测。`,0)
                                        },200)
                                    }
                                    // 取消修改结果扣积分
                                    // else if(resCode === "601"){
                                    //     setTimeout(() => {
                                    //         dialogAlert(`积分不足！`)
                                    //     }, 200)
                                    // }
                                },
                                error:function(err){
                                    setTimeout(() => {
                                        dialogAlert(`预测失败，请稍后重试`)
                                    }, 200)
                                }
                            })
                        },
                        autoClose: 0,
                        contentHtml: `<p style="text-align:center;">${tipStr}</p>`
                    });
                }
            }else{
                dialogAlert(`当前该指标正处于上轮活动结算期，暂无法预测，请选择本轮活动期内指标进行预测。`,0)
            }
            
        })
    }
    // 处理提示和按钮样式
    function btnStatus(indexName, index) {
        var tipStr = "";
        // debugger;
        if (guess[indexName]["yData"]) {
            tipStr = `<div class="use_tip">预测结果</div>`;
            // $(".guess_btn").eq(index).css({ "display": "none" })
        } else {
            tipStr = `<div class="use_tip">滑动圆点或点击显示框进行预测</div>`;
        }
        $(".guess_chart").eq(index).before(tipStr);
    }
    // "竞猜大擂台"-请求历史数据
    function reqHistoryData(itemId, indexName,layerDom) {
        $.ajax({
            url: paramObj.url + "guess/findGuessIndexHis",
            beforeSend: function(xhr) {
                xhr.setRequestHeader("Authentication", paramObj.token);
            },
            async: false,
            data: {
                itemId: itemId
            },
            success: function(result) {
                // console.log(result);
                if (result.resultCode === "200" && result.resultBody) {
                    var historyBody = result.resultBody;
                    if(historyBody["fdateList"].length&&historyBody["fvalueList"].length){
                        guess[indexName]["historyData"] = {};
                        guess[indexName]["historyData"]["xData"] = historyBody.fdateList;
                        guess[indexName]["historyData"]["seriesData"] = historyBody.fvalueList;
                    }else{
                        guess[indexName]["historyData"] = {};
                        guess[indexName]["historyData"]["xData"] = [];
                        guess[indexName]["historyData"]["seriesData"] = [];
                    }
                    layerDom.show();
                } else if (result.resultCode === "401"||result.resultCode === "402"||result.resultCode === "405") {
                    dialogConfirm("登录信息失效，请点击“确定”重新登录");
                } else if (result.resultCode === "201") {
                    dialogAlert("暂无数据")
                    layerDom.hide();
                }
                else{
                    
                }
            },
            error:function(err){
                console.log(err);
            }
        })
    }
    //“竞猜大擂台”-请求历史预测
    function reqHistoryGuessData(itemId, indexName,layerDom) {
        $.ajax({
            url: paramObj.url + "guess/findGuessIndexHisForMonthSixLine",
            beforeSend: function(xhr) {
                xhr.setRequestHeader("Authentication", paramObj.token);
            },
            async: false,
            data: {
                itemId: itemId
            },
            success: function(result) {
                // console.log(result);
                if (result.resultCode === "200" && result.resultBody) {
                    paramObj.historyGuessData = result.resultBody;
                    // paramObj.historyGuessData = {
                    //     indexs: ["2019-01","2019-02","2019-03"],
                    //     months: ["2019-01","2019-02","2019-03"],
                    //     values: [
                    //         ["5.6", "1.5",null,null],
                    //         [null,"5.9","6.7",null],
                    //         [null,null,"5.0","6.0"]
                    //     ]
                    // };
                    layerDom.show();
                } else if (result.resultCode === "401"||result.resultCode === "402"||result.resultCode === "405") {
                    dialogConfirm("登录信息失效，请点击“确定”重新登录");                    
                } else if(result.resultCode === "201"){
                    dialogAlert("暂无数据")
                    layerDom.hide();
                    // guess[indexName]["historyData"] = {};
                    // guess[indexName]["historyData"]["xData"] = [];
                    // guess[indexName]["historyData"]["seriesData"] = [];
                }
            },
            error:function(err){
                dialogAlert('请求历史竞猜失败，请稍后重试')
            }
        })
    }
    //"观点拉锯战"-渲染观点拉锯战
    function drawView() {
        // sessionStorage.setItem("particiTabIndex", 1)
        // if (sessionData == null || JSON.parse(sessionData).data == undefined) {
        //     dialogConfirm("请登录后查看历史数据");
        // }
        requestViewData();
        //只有有观点数据时才继续请求用户留言数据
        if (paramObj.viewId) {
            if(paramObj.token){
                $(".no_sign_in").hide();
                paramObj.mescroll.viewMescroll = new MeScroll("viewPoint", {
                    down: {
                        use: false
                    },
                    up: {
                        callback: viewCallback, //上拉加载的回调
                        // isBounce: false, //此处禁止ios回弹,解析(务必认真阅读,特别是最后一点): http://www.mescroll.com/qa.html#q10
                        page: {
                            num: 0,
                            size: paramObj.pageSize
                        },
                        clearEmptyId: "answerUl",
                        htmlNodata: '<p class="upwarp-nodata">无更多留言</p>',
                        noMoreSize:1,
                        empty: {
                            tip: "无更多留言" //提示
                        },
                        lazyLoad: {
                            use: true
                        }
                    }
                })
            }else{
                $(".no_sign_in").show();
            }
            
        }
        //没有数据时,清空 viewpoint_slide中的内容
        else {
            $(".viewpoint_slide").html(`<div class="no_partici_data">暂无活动可参与</div>`).css({ "background": `url("./../assets/images/participation/view_bg.jpg") no-repeat center/cover` });;
        }
        //查看往期观点
        $(".view_history a").on("click",function(){
            if(!paramObj.token){
                dialogConfirm();
                return false
            }
        })
        // 用户表明观点
        $(".essay_handle").find(".opinion_btn").unbind('click').click(function() {
                if (sessionData == null || JSON.parse(sessionData).data == undefined) {
                    dialogConfirm();
                    
                } else {
                    if ($(this).hasClass("support_btn")) { //用户点击了支持按钮
                        submitOpinion("like", "支持");
                    } else if ($(this).hasClass("neutral_btn")) { //用户点击了"保持中立"按钮
                        submitOpinion("neutral", "保持中立");
                    } else { //点击了反对按钮
                        submitOpinion("against", "反对");
                    }
                }
            })
            //用户点击登录按钮
        // $(".answer_ul").on("click", ".mescroll-empty", function() {
        //         dialogConfirm("点击“确定”按钮进行登录");
        //     })
            // 用户发表留言
        $(".publish .send").click(function() {
            if (sessionData == null || JSON.parse(sessionData).data == undefined) {
                dialogConfirm();
                return
            }
            var value = $.trim($("#txt").val());
            if (value === "") {
                dialogAlert(`内容不能为空。`) 
            } else {
                commentInsert(value);
            }
        })
    }
    // 上拉加载入口
    function viewCallback(page) {
        //联网加载数据
        getViewComment({
            // url:paramObj.questionListUrl,
            pageNum: page.num,
            pageSize: page.size,
            successCallback: function(curPageData) {
                //联网成功的回调,隐藏下拉刷新和上拉加载的状态;
                //mescroll会根据传的参数,自动判断列表如果无任何数据,则提示空;列表无下一页数据,则提示无更多数据;
                // console.log("page.num="+page.num+", page.size="+page.size+", curPageData.length="+curPageData.length);
                //方法四 (不推荐),会存在一个小问题:比如列表共有20条数据,每页加载10条,共2页.如果只根据当前页的数据个数判断,则需翻到第三页才会知道无更多数据,如果传了hasNext,则翻到第二页即可显示无更多数据.
                paramObj.mescroll.viewMescroll.endSuccess(curPageData.length);

                //设置列表数据,因为配置了emptyClearId,第一页会清空dataList的数据,所以setListData应该写在最后;
                addViewCommentData(curPageData, page.num);
            },
            errorCallback: function() {
                //联网失败的回调,隐藏下拉刷新和上拉加载的状态;
                paramObj.mescroll.viewMescroll.endErr();
            }
        });
    }
    //"观点拉锯战"-请求数据
    function requestViewData() {
        $.ajax({
            url: paramObj.url + 'view/currentViewNoToken',   
            async: false,            
            success: function(result) {             
                // console.log(JSON.stringify(result.resultBody));
                if(result.success){
                    if (result.view) {                    
                        var viewData = result.view,
                            viewBgImage = viewData.image_url,
                            viewId = viewData.viewId;
                        if (viewBgImage) {
                            $(".view_main").css({ "background": `url("${viewBgImage}") no-repeat center/cover` });

                        } else {
                            //无图片时，显示静态图片
                            $(".view_main").css({ "background": `url("./../assets/images/participation/view_bg.jpg") no-repeat center/cover` });
                        }
                        let viewRuleData = JSON.parse(viewData.rule);
                        paramObj.viewRuleData=JSON.parse(viewData.rule);
                        // new RuleLayer({
                        //     data:rules,
                        //     ruleBtn:$(".view_rule_btn"),
                        //     ruleLayerDom:$(".view_rule_layer")
                        // }).init()
                        participationRule.customRultBtnClick(".view_rule_btn",viewRuleData)

                        $(".expert_view_txt").attr({ "id": viewId }).html(viewData.content);
                        paramObj.infoTitle = viewData.content;
                        paramObj.viewId = viewId;  
                        viewAttitudeState(paramObj.viewId);                   
                    }
                }else{
                    dialogAlert(`请求观点拉锯战数据失败,${result.msg}`);                
                }
                
            },
            error: function(err) {
                dialogAlert(`请求观点拉锯战数据失败，请稍后重试。`);
            }
        })
    }
    //"观点拉锯战"-用户对专家观点的“态度”
    function viewAttitudeState(id) {
        $.ajax({
            url: paramObj.url + 'view/currentView',
            async: false, 
                   
            beforeSend: function(xhr) {
                xhr.setRequestHeader("Authentication", paramObj.token);
            },            
            success: function(result) {          
                if (result.success) {
                    var viewAttitude = result.view.attitude;
                    //用户之前操作过
                    if (viewAttitude.hasOption==1) {
                        $(".essay_handle").hide();
                        $(".essay_opinion").show();
                        //计算各观点的百分比并展现在页面中
                        showViewOpinion(viewAttitude);
                    }
                    //用户没有操作过 result.body
                    else {
                        return false
                    }
                }
            },
            error: function(err) {
                dialogAlert(`请求观点attitude失败，请稍后重试。`)
            }
        })
    }
    //"观点拉锯战"-用户对专家观点点击"支持""反对""中立"
    function submitOpinion(flag, text) {
        // var _this =this;
        $.dialog({
            type: "confirm",
            onClickOk: function() {                
                $.ajax({
                    url: paramObj.url + "view/attitude",
                    beforeSend: function(xhr) {
                        xhr.setRequestHeader("Authentication", paramObj.token);
                    },
                    data: {
                        viewId: paramObj.viewId,                        
                        att: flag,                        
                    },
                    success: function(result) {                        
                        // console.log(JSON.stringify(result));
                        if (result.success) {
                            showViewOpinion(result.attitude);
                        } else {
                            setTimeout(() => {
                                dialogConfirm();
                            }, 200)
                        }
                    },
                    error: function(err) {
                        dialogAlert(`操作失败，请稍后重试。`);
                    }

                })
            },
            autoClose: 0,
            contentHtml: `<p style="text-align:center;">确定${text}吗？</p>`
        });

    }
    
    //"观点拉锯战"-请求用户留言列表
    function getViewComment(param) {
        $.ajax({
            url: paramObj.url + "comment/onlyComment",
            beforeSend: function(xhr) {
                // if(paramObj.token){
                    xhr.setRequestHeader("Authentication", paramObj.token);
                // }else{
                //     paramObj.mescroll.viewMescroll.endSuccess();
                //     param.successCallback([]);
                //     return false;
                // }
            },
            type: "get",
            data: {
                infoId: paramObj.viewId,
                pageNo: param.pageNum,
                pageSize: param.pageSize
            },
            success: function(result) {              
                if (result.success) {
                    paramObj.mescroll.viewMescroll.endSuccess();
                    var questionInfo = result.comment;
                    param.successCallback(questionInfo);
                }
                // token检验失败
                else if (result.msg == "ARGSERROR"||result.msg == "USERERROR") {
                    $(".no_sign_in").show();
                    paramObj.mescroll.viewMescroll.destroy();
                }
            },
            error: function(err) {
                param.errorCallback();
                dialogAlert(`请求用户留言数据失败，请稍后重试。`);
            }
        })
    };

    function addViewCommentData(listData) {
        var answerStr = '';
        // <img class="user_status" style="display:${list.userCardUrl?'inline-block':'none'}" src="${list.userCardUrl?list.userCardUrl:''}"/>
        // <img class="user_status" src="./../assets/images/user_status.gif"/>
        // <img class="user_avatar" src="${list.user.userHeadImage}"/>
        // var commentIds = [];
        listData.forEach(function(list) {   
            var userCardUrl = list.userCardUrl;
            answerStr += `<li class="answer_list comment_list" id="${list.comment.commentId}">
                            <div class="answer_user comment_handle_wrap">
                                <div class="comment_user">
                                    <div class="user_avatar" style="background:url(${list.user.userHeadImage}) no-repeat center/contain"></div>
                                    <div class="user_name_wrap">
                                        <span class="user_name col_1_hide">${list.user.userNickName}</span>
                                        <img class="user_status" style="display:${userCardUrl?'inline-block':'none'}" src="${userCardUrl?userCardUrl:''}"/>
                                    </div>
                                </div>
                            </div>
                            <div class="answer_con">
                                <p class="answer_txt justify">${list.comment.commentContent}</p>
                            </div>
                            <div class="answer_handle">
                                <div class="answer_attitude" parent_id="${list.comment.commentId}">
                                    <span class="hand like" parent_id="${list.comment.commentId}"></span>
                                    <i class="like_num">${list.comment.likeCount||0}</i>
                                    <span class="hand dislike" parent_id="${list.comment.commentId}"></span>
                                    <i class="dislike_num">${list.comment.againstCount||0}</i>
                                </div>
                            </div>
                            <div class="answer_response">
                                <ul class="answer_response_ul">
                                </ul>
                            </div>
                        </li>`
        })
        $(".viewpoint .answer_ul").append(answerStr);
        //判断是否可以进行点赞或踩操作
        listData.forEach(function(list, index) {
            //之前已经没有进行操作
            if (list.attitude == null) {
                praiseOneClick({
                    id: list.comment.commentId, //留言id
                    periodId: paramObj.viewId,
                    index: index, //问题回复索引
                    className: ".answer_attitude", //点赞\踩的直接父级className
                    url: paramObj.url + "support/save", //url
                    token: paramObj.token
                });
            }
            //用户之前点击了赞
            else if (list.attitude == "like") {
                $(`.answer_attitude[parent_id=${list.comment.commentId}]`).find(".like").toggleClass("like").toggleClass("like_active")
            }
            //用户之前点击了踩
            else if (list.attitude == "against") {
                $(`.answer_attitude[parent_id=${list.comment.commentId}]`).find(".dislike").toggleClass("dislike").toggleClass("dislike_active")
            }
        })
    }
    //"观点拉锯战"-添加用户留言
    function commentInsert(value) {
        $.ajax({
            url: paramObj.url + "comment/save",
            beforeSend: function(xhr) {
                xhr.setRequestHeader("Authentication", paramObj.token);
            },
            data: {
                periodId: paramObj.viewId,
                commentContent: value,
                infoId: paramObj.viewId,
                infoTitle: paramObj.infoTitle,
                infoType: "view_war",
                type: "comment"
            },
            success: function(result) {
                if (result.success) {
                    dialogAlert(`留言已提交，待系统审核。`);
                    $("#txt").val("");
                } else if (result.msg == "ARGSERROR") {
                    dialogConfirm("留言失败，请重新登录留言");
                }
            },
            error: function(err) {
                dialogAlert(`留言失败，请稍后重试。`);
            }
        })
    }
    //"我的提问"-渲染我的提问页面
    function drawQuestion() {
        // var questionScrollDom = $(".questionListWrap")[0]
        paramObj.mescroll.questionMescroll = new MeScroll("questionListWrap", {
                up: {
                    callback: questionCallback, //上拉加载的回调
                    // isBounce: false, //此处禁止ios回弹,解析(务必认真阅读,特别是最后一点): http://www.mescroll.com/qa.html#q10
                    page: {
                        num: 0,
                        size: paramObj.pageSize
                    },
                    // noMoreSize:1,
                    clearEmptyId: "questionListUl",
                    htmlNodata: '<p class="upwarp-nodata">无更多提问</p>',
                    empty: {
                        tip: "无更多提问" //提示
                    },
                    lazyLoad: {
                        use: true
                    }
                }
        })
        //规则
        new Promise((resolve,reject)=>{
            $.ajax({
                url:paramObj.url +'rule/findRuleById',
                data:{
                    typeId:"2"
                },
                success:function(res){
                    // console.log(res)
                    if(res.resultCode == "200"){
                        // console.log(res.resultBody.ruleInfo)
                        resolve(res.resultBody.ruleInfo);
                    }else if(res.resultCode=="201"){
                        resolve([{value:"无"}])
                    }else{
                        reject('请求规则失败')
                    }
                },
                error:function(err){
                    reject(err)
                }
            })
        }).then((res)=>{
            paramObj.questionRuleData = res
            // new RuleLayer({
            //     data:res,
            //     ruleBtn:$(".question_rule_btn"),
            //     ruleLayerDom:$(".question_rule_layer")
            // }).init()
            participationRule.customRultBtnClick(".question_rule_btn",res)
        }).catch((err)=>{
            console.log(err)
        })
        //显示问题列表的分类
        $(".question_tab_active").text(paramObj.questionCategoryName);
        //高亮之前选中的指标
        $(".question_tab_list").eq(paramObj.questionCategoryActive).addClass("active")
            // $(".question").eq(paramObj.questionCategoryActive).show();

        //固定question_wrap的高度
        var scrollHeight = $(".question_slide_scroll").height();
        var askHeight = $(".ask_question_body").height() + $(".question_tab_wrap").height();
        var questionWrapHeight = scrollHeight - askHeight;
        $(".question_wrap").height(questionWrapHeight);
        //初始化问题分类tab
        $(".question_tab_title").on("click", function() {
                //layer当前为显示
                if ($(".question_tab_main").is(":visible")) {
                    $(".ask_question_wrap").css({ "height": "auto" })

                    $(".question_tab_main").css({ "display": "none" })
                    $(this).find(".arrow_icon").removeClass("arrow_down").addClass("arrow_up")
                }
                //layer当前为隐藏
                else {
                    $(".ask_question_wrap").css({ "height": "100%" })

                    $(".question_tab_main").show();
                    $(".question_tab_main").css({ "display": "flex" })

                    $(this).find(".arrow_icon").removeClass("arrow_up").addClass("arrow_down")
                }
            })
            //切换问题分类
        $(".question_tab_list").on("click", function() {
                if (!$(this).hasClass("active")) {
                    var questionCategory = $(this).attr("question_category");
                    var questionListUrl = paramObj.questionListUrl;
                    if (questionCategory === "hot") {
                        questionListUrl = "question";
                    } else if (questionCategory === "new") {
                        questionListUrl = "question/new";
                    } else if (questionCategory === "oneself") {
                        if (sessionData == null || JSON.parse(sessionData).data == undefined) {
                            dialogConfirm("请登录后查看“我的提问”");
                            return false
                        } else {
                            questionListUrl = "myQuestion/findMyQuestions";
                        }
                    }
                    paramObj.questionListUrl = questionListUrl;
                    var selectedName = $(this).text();
                    var index = $(this).index();
                    $(this).siblings().removeClass("active");
                    $(this).addClass("active");
                    $(".question_tab_active").text(selectedName);

                    //存储用户点击的问题分类
                    sessionStorage.setItem("questionCategory", JSON.stringify({ url: questionListUrl, category: selectedName, index: index }))
                        //先销毁，再新建
                    paramObj.mescroll.questionMescroll.destroy();

                    // paramObj.mescroll.questionMescroll.resetUpScroll(false);
                    paramObj.mescroll.questionMescroll = new MeScroll("questionListWrap", {
                        up: {
                            callback: questionCallback, //上拉加载的回调
                            // isBounce: false, //此处禁止ios回弹,解析(务必认真阅读,特别是最后一点): http://www.mescroll.com/qa.html#q10
                            page: {
                                num: 0,
                                size: paramObj.pageSize
                            },
                            // noMoreSize:1,
                            clearEmptyId: "questionListUl",
                            htmlNodata: '<p class="upwarp-nodata">无更多提问</p>',
                            empty: {
                                tip: "无更多提问" //提示
                            },
                            lazyLoad: {
                                use: true
                            }
                        }
                    })
                    paramObj.mescroll.questionMescroll.scrollTo(0, 0);

                    // $(".question").hide().eq(index).show();
                }
                $(".ask_question_wrap").css({ "height": "auto" })

                $(".question_tab_main").css({ "display": "none" })
                $(this).find(".arrow_icon").removeClass("arrow_down").addClass("arrow_up")
            })
            // //点击是否跳转详情
            // toSkip(".question_list_ul",".question_link")
            // 提问问题
        $(".question_submit").click(function() {
                if (sessionData == null || JSON.parse(sessionData).data == undefined) {
                    dialogConfirm();
                    return
                } else {
                    var answerVal = $.trim($(".question_field").val());
                    if (answerVal === "") {
                        dialogAlert(`提问内容不能为空。`);
                    } else {
                        submitQuestion(answerVal)
                    }
                }
            })
            //进入我要提问详情页
        $(".question_list_ul").on("click", ".question_list", function(e) {
                var questionId = $(this).attr("question_id");
                // console.log(questionId);
                // console.log(e);
                if ($(e.target).hasClass("hand")) {
                    return false;
                }
                //存储从哪个页面进入的提问详情页
                sessionStorage.setItem("questionSource", "./../participation.html")
            })
            //阻止在question_tab_wrap上的滑动
        $(".ask_question_wrap").on("touchmove", function() {
            return false;
        })
    }
    // 请求问题列表 page = {num:1, size:10}; num:当前页 从1开始, size:每页数据条数
    function questionCallback(page) {
        //联网加载数据
        requestQuestionList({
            url: paramObj.questionListUrl,
            pageNum: page.num,
            pageSize: page.size,
            successCallback: function(curPageData) {
                //联网成功的回调,隐藏下拉刷新和上拉加载的状态;
                //mescroll会根据传的参数,自动判断列表如果无任何数据,则提示空;列表无下一页数据,则提示无更多数据;
                // console.log("page.num="+page.num+", page.size="+page.size+", curPageData.length="+curPageData.length);
                //方法四 (不推荐),会存在一个小问题:比如列表共有20条数据,每页加载10条,共2页.如果只根据当前页的数据个数判断,则需翻到第三页才会知道无更多数据,如果传了hasNext,则翻到第二页即可显示无更多数据.
                paramObj.mescroll.questionMescroll.endSuccess(curPageData.length);

                //设置列表数据,因为配置了emptyClearId,第一页会清空dataList的数据,所以setListData应该写在最后;
                setListData(curPageData, page.num);
            },
            errorCallback: function() {
                //联网失败的回调,隐藏下拉刷新和上拉加载的状态;
                paramObj.mescroll.questionMescroll.endErr();
            }
        });
    }
    //"我的提问"-请求问题列表
    function requestQuestionList(param) {
        //请求问题列表数据
        $.ajax({
            // url: paramObj.url+param.url,
            url: paramObj.url + param.url,
            // async:false,
            beforeSend: function(xhr) {
                xhr.setRequestHeader("Authentication", paramObj.token);
            },
            data: {
                page: param.pageNum,
                size: param.pageSize
            },
            success: function(result) {
                if (result.status === "200" || result.resultCode === "200") {

                    paramObj.mescroll.questionMescroll.endSuccess();
                    var listData = result.body || result.resultBody;
                    param.successCallback(listData);

                } else if (result.status === "401"|| result.resultCode === "402"||result.resultCode === "405") {
                    dialogConfirm("请登录后查看“我的提问”")
                    paramObj.mescroll.questionMescroll.endSuccess();
                    param.successCallback([]);

                } else {
                    paramObj.mescroll.questionMescroll.endSuccess();
                    param.successCallback([]);
                }
            },
            error: function() {
                dialogAlert(`请求问题列表数据失败，请稍后重试。`);
                param.errorCallback()
            }

        })
    };
    function setListData(listData, pageNum) {

        var htmlStr = '';
        var widthStr = "width:100%;",
            display = "display:none;"
        listData.forEach(function(list) {
            //如果问答没有图片
            if (!list.ques_img) {
                list.ques_img = '';
                widthStr = "width:100%;"
                display = "display:none;"
            }
            //如果有图片
            else {
                widthStr = "width:5.1rem;"
                display = "inline-block;"
            }
            var publishTime = list.publishTime;
            var timeTempArr = publishTime.split(":")
                timeTempArr.pop()
                publishTime = timeTempArr.join(":")
                // console.log(publishTime);
            htmlStr += `<a class="question_link" href="./pages/question_detail.html?fInfoId=${list.fInfoId}">
                <li class="question_list" question_id="${list.fInfoId}">
                    <div class="question_top clear">
                        <p class="question_title left justify col_3_hide" style="${widthStr}">${list.fTitle}</p>
                        <img class="question_img right" src="${list.ques_img}" style="${display}"/>
                    </div>
                    <div class="question_bottom">
                        <div class="question_asker_wrap">
                            <p class="question_asker col_1_hide">${list.asker}</p>
                            <p>提问</p>
                        </div>
                        <div class="question_handle">
                            <button class="go_to_answer">回答</button>
                            <div class="question_attitude" parent_id="${list.fInfoId}">
                                <span class="hand like"></span>
                                <i class="like_num">${list.support}</i>
                                <span class="hand dislike"></span>
                                <i class="dislike_num">${list.against}</i>
                            </div>
                        </div>
                        <div class="question_reply">
                            <em class="reply_num">${list.count}</em>
                            <span class="reply_text">个回答</span>
                        </div>
                    </div>
                    <div class="question_time">${publishTime}</div>
                </li>
            </a>`
        })
        $(".question").find(".question_list_ul").append(htmlStr);
        //判断是否可以进行点赞或踩操作
        listData.forEach(function(list, index) {
            //之前已经没有进行操作
            if (list.choice === undefined) { //针对"我的提问"，不做点赞和踩操作处理

            } else if (!list.choice) { //用户没有点击过
                // bindOneClick(list["fInfoId"],index);
                bindOneClick({
                    id: list["fInfoId"], //问题id
                    index: index, //问题索引
                    className: ".question_attitude", //点赞\踩的直接父级className
                    url: paramObj.url + "question/PraiseTrample", //url
                    token: paramObj.token
                });
            } else if (list.choice === 1) { //用户之前点击了赞
                $(`.question_attitude[parent_id=${list.fInfoId}]`).find(".like").toggleClass("like").toggleClass("like_active")
            } else if (list.choice === -1) { //用户之前点击了踩
                $(`.question_attitude[parent_id=${list.fInfoId}]`).find(".dislike").toggleClass("dislike").toggleClass("dislike_active")
            }
        })
    }
    //提问问题
    function submitQuestion(answerVal) {
        $.ajax({
            url: paramObj.url + "question/ask",
            beforeSend: function(xhr) {
                xhr.setRequestHeader("Authentication", paramObj.token);
            },
            data: {
                fTitle: answerVal,
                fMetaDescription: '',
                fValue: ''
            },
            success: function(result) {
                if (result.status == "200") {
                    dialogAlert(`问题已提交，待系统审核。`)
                    $(".question_field").val("");
                } else if (result.status === "401") {
                    dialogConfirm();
                }
            },
            error: function(err) {
                dialogAlert(`问题提交失败，请稍后重试。`)
            }
        })
    }
})




