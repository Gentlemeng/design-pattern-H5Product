$(function () {
    let paramObj = {
        newCmsUrl: newCmsUrl,
        url:indexUrl,
        // url:"http://192.168.2.110:8700/",
        token:"",
        colors: ["#c89fec", "#81a6ec", "#a3ea8b", "#eac774", "#ea7274"],
        params:parseURL(window.location.href)?parseURL(window.location.href):null,
        radarBox :null,
        //用户点击添加日期计数器，控制雷达图颜色
        addTimePickNum:0,
        //堆积图行业id
        itemIds:'',
        //堆积图时间刻度 值为月数
        recentTime:"12",
        //水平柱状图70个行业数据
        horBarAllData:[],
        //行业数（一般为70个）
        industryLen:0,
        //70个行业中已选择的5个行业
        selectedIndusArr:[],
        energySource:function(){
            var energySource = sessionStorage.getItem("energySource")
            return energySource?energySource:'./energy_home.html'
        }(),
    }
    //获取token
    var sessionData = sessionStorage.getItem("Authentication");
    if (sessionData != null && JSON.parse(sessionData).data != undefined) {
        paramObj.token = JSON.parse(sessionData).data;
    }else{
        dialogConfirm();
    }
    var globalParams = paramObj.params;
    //"1" 需求  "2" 供给
    var energyType = globalParams.type ? globalParams.type:"1";
    var indexId = globalParams.indexId ? globalParams.indexId:"";
    var itemDate = globalParams.itemDate ? globalParams.itemDate:"";
    var collectionName = globalParams.itemName ? globalParams.itemName:"";
    var energyId = globalParams.energyId ? globalParams.energyId:"";
    // console.log(paramObj.energyType);
    //初始化堆积状图
    paramObj.stackBarChart = SingleStackBar.getInstance({
        chartDom:document.querySelector("#stack_bar")
    });
    $(".back_wrap").on("click",".back",function(){
        let url = paramObj.energySource+'?indexId='+energyId;
        // if(energyId){//返回动能二级页面  需传递indexId
        //     url = paramObj.energySource+'?indexId='+energyId
        // }else{//返回收藏页
        //     url = paramObj.energySource
        // }
        $(this).attr({"href":url})
    }) 
    if(energyType==="1"){
        $(".supply_chart_wrap").hide();
        //请求雷达图数据
        reqRadarBarData({
            itemDate,
            indexId,
            energyType,
            callback:function(result){
                paramObj.firstHorBarBox = new HorBarChart({
                    chartDom:document.querySelector(".hor_bar_1"),
                    title:result.name,
                    legend:result.indicator,
                    seriesData:result.value,
                })
                paramObj.radarBox = new RadarChart({
                    chartDom:document.querySelector(".radar_box"),
                    title:'VAD组成成分贡献率（%）',
                    name:result.name,
                    indicator:result.indicator,
                    seriesData:result.value
                })
            }
        })
        
        //请求五大行业 并放入多选框中
        let radarItemIds = reqItemsIds().then(function(result){
            // console.log(result)
            let htmlStr = '',
            itemIds = '';
            result.forEach(item=>{
                htmlStr += `<li><input type="checkbox" class="input_item_checkbox" itemId="${item.itemId}" checked />${item.itemName}</li>`
                itemIds += `${item.itemId},`
            })
            $(".item_filter_content ul").html(htmlStr);
            
            paramObj.itemIds = itemIds.substr(0,itemIds.length-1);

            //根据itemIds请求所有数据的日期，需求侧-当月动能结构时间选择器
            reqAllDataDate({
                itemId:itemIds.split(",")[0],
                saveCallback:function(date){//时间变化时回调函数
                    //更新雷达图和单条柱状图
                    reqRadarBarData({
                        itemDate:date,
                        indexId,
                        energyType,
                        callback:function(result){
                            //雷达图
                            let option = paramObj.radarBox.option;
                            option.legend.data[0] = result.name;
                            option.series[0].data[0].name = result.name;
                            option.series[0].data[0].value = result.value;
                            paramObj.radarBox.init();

                            //条形柱状图
                            new HorBarChart({
                                chartDom:document.querySelector(".hor_bar_1"),
                                title:result.name,
                                legend:result.indicator,
                                seriesData:result.value,
                            })
                        }
                    })
                }
            })
        }).catch(function(err){
            throw new Error(err);
        })
        radarItemIds.then(function(){
            handleStackBar();
        })
        //多选五大行业
        $(".item_filter_content").on("change",".input_item_checkbox",function(){
            // console.log($(this).prop("checked"));//false /true\
            if(!$(this).prop("checked")){ //取消选中
                $("#selAll").prop({"checked":false})
            }else{
                //判断是否为全选
                if($(".input_item_checkbox:checked").length>=5){
                    $("#selAll").prop({"checked":true})
                }
            }
        })
        //全选五大行业
        $("#selAll").on("change",function(){
            if(!$(this).prop("checked")){//取消全选
                $(".input_item_checkbox").prop({"checked":false})
            }else{
                $(".input_item_checkbox").prop({"checked":true})
            }
        })
        $(".item_filter_bottom").on("click","button",function(){
            if($(this).hasClass("confirm")){
                let checkedNum = $(".input_item_checkbox:checked").length;
                if(checkedNum<=0){
                    dialogAlert("请至少选择一项")
                    return false
                }
                let itemIds = '';
                for(var i=0;i<checkedNum;i++){
                    let itemId = $($(".input_item_checkbox:checked")[i]).attr("itemid")
                    itemIds += `${itemId},`
                }
                paramObj.itemIds = itemIds.substr(0,itemIds.length-1);
                let recentTime = $(".stack_bar_tabs_ul .time_split_list.active").attr("recentTime");
                //请求堆积柱状图
                handleStackBar(recentTime);
            }
            //隐藏五大行业
            $(".item_filter_title span").removeClass("active");
            $(".item_filter_content").hide();
        })

    }else{
        $(".demand_chart_wrap").hide();
        $(".time_picker_add").hide();
        //请求柱状图数据
        reqRadarBarData({
            itemDate,
            indexId,
            energyType,
            callback:function(result){
                
                let tempData = [];
                for(var i = 0;i<result.value.length;i++){
                    tempData.push({
                        indusName:result.indicator[i],
                        value:result.value[i]
                    })
                }
                paramObj.horBarAllData = tempData;
                let index = Number($(".hor_bar_tabs_ul .time_split_list:first-child").attr("recentTime"));
                let endIndex = isNaN(index)?undefined:index;
                let initHorBarData = paramObj.horBarAllData.slice(0,endIndex);
                paramObj.horBarChartTitle = result.name;
                paramObj.horBarChart = SingleHorBars.getInstance({
                    chartDom:document.querySelector(".hor_bars"),
                    title:result.name,
                })
                paramObj.horBarChart.resjson = initHorBarData;
                paramObj.horBarChart.init();
                paramObj.horBarChart.setOption();
            }
        })
        //tab选项卡逻辑操作
        new TabsComponent({
            $parent:$(".hor_bar_tabs_ul"),
            $targetClass:".time_split_list",
            callback:function(recentTime){
                paramObj.horBarChart.dispose();

                let endIndex = Number(recentTime);
                let horBarData;
                if(isNaN(endIndex)){
                    horBarData = paramObj.horBarAllData.slice();
                }else{
                    horBarData = paramObj.horBarAllData.slice(0,endIndex);
                }
                //判断是升序还是降序
                if(!$(".sort_by").hasClass("sort_by_up")){//降序
                    horBarData.reverse();
                }
                

                endIndex = isNaN(endIndex) ? 70 : endIndex;
                let height = (140+endIndex*50)/100;
                // if(endIndex>20){
                    $(".hor_bars").css({"height":height+"rem"})
                    
                // }

                paramObj.horBarChart = SingleHorBars.getInstance({
                    chartDom:document.querySelector(".hor_bars"),
                    // title:result.name,
                    title:paramObj.horBarChartTitle,
                })
               
                paramObj.horBarChart.resjson = horBarData;
                paramObj.horBarChart.init();
                // endIndex>20?paramObj.horBarChart.option.baseOption.series[0].barWidth = 20:null;
                paramObj.horBarChart.setOption();
            }
        })
        //排序方式
        $(".sort_by").on("click",function(){
            $(this).toggleClass("sort_by_up").toggleClass("sort_by_drop")
            let option  = echarts.getInstanceByDom(document.querySelector(".hor_bars")).getOption();
            let dataLen = option.series[0].data.length;
            let previousData = paramObj.horBarChart.resjson.slice(0,dataLen);
            let data = previousData.reverse();
            paramObj.horBarChart.resjson = data;
            paramObj.horBarChart.init();
            paramObj.horBarChart.setOption();
        })
        //请求70个行业
        new Promise(function(resolve,reject){
            $.ajax({
                url:paramObj.url+'energy/industrySelector',
                beforeSend: function (xhr) {
                    xhr.setRequestHeader("Authentication", paramObj.token);
                },
                data:{
                    indexId,
                },
                success:function(result){
                    let resultCode = result.resultCode
                    if(resultCode==="200"){
                        resolve(result.resultBody);
                    }else{
                        reject("请求行业分类出错")
                    }
                },
                error:function(err){
                    reject(err);
                }
            })
        }).then(function(result){
            // var selectedIndusArr;
            Object.defineProperty(paramObj, 'selectedIndusArr', {
                get: function () {
                    // return selectedIndusArr;
                },
                set: function (newArr) {
                    // selectedIndusArr = newArr
                    //渲染已选择的5个行业
                    let selectedStr = '';
                     $(".index_category_list").removeClass("active");//先清除选中的行业
                    newArr.forEach(industry=>{
                        // 处理底部已选择行业dom字符串
                        selectedStr += `<li class="index_selected_list" indusId="${industry.indusId}">${industry.indusName}</li>`

                        // 行业分类处选中处理
                        for(var i=0;i<paramObj.industryLen;i++){
                            let thisIndustry = $(".index_category_list").eq(i)
                            let indusId = thisIndustry.attr("indusid");
                            if(indusId === industry.indusId){
                                thisIndustry.addClass("active");
                            }
                        }
                    })
                    $("#index_selected_ul").html(selectedStr);
                }
            });
            drawIndusCategory(result)
            
            // paramObj.selectedIndusArr = paramObj.aaa;
        }).catch(function(err){
            throw new Error(err);
        })
        //展开收缩行业分类
        $("#index_select_middle").on("click",".index_category_top",function(){
            $(this).find(".index_category_info").toggleClass("active")
            $(this).next().toggle();
        })
        //选择/取消选择行业
        $("#index_select_middle").on("click",".index_category_list",function(){

            let selectedNum = paramObj.aaa.length;
            
            if($(this).hasClass("active")){
                // $(this).removeClass("active")
                if(selectedNum<=1){
                    dialogAlert("至少选择一项")
                    return false
                }
                paramObj.aaa.forEach((industry,index)=>{
                    if($(this).attr("indusId")===industry.indusId){
                        paramObj.aaa.splice(index,1)
                    }
                })
                paramObj.selectedIndusArr = paramObj.aaa;
            }else{
                if(selectedNum<5){
                    // $(this).toggleClass("active");
                    paramObj.aaa.push({
                        indusId:$(this).attr("indusid"),
                        indusName:$(this).text(),
                    })
                    paramObj.selectedIndusArr = paramObj.aaa;
                    //底部展示区域
                }else{
                    dialogAlert("最多选择5项")
                    return false
                }
            }
            let activeNum = $(this).parent().find("li.active").length;
            $(this).parents(".index_category_wrap").find(".index_category_num").text(activeNum)
        })
        //删除底部行业
        $("#index_selected_ul").on("click",".index_selected_list",function(){
            if(paramObj.aaa.length>1){
                let index = $(this).index();
                let indusId = $(this).attr("indusId")
                paramObj.aaa.splice(index,1);
                paramObj.selectedIndusArr = paramObj.aaa

                //70个行业处联动
                // $(".index_category_list[indusid="+indusId+"]").removeClass("active");
                let badgeDom = $(".index_category_list[indusid="+indusId+"]").parents(".index_category_wrap").find(".index_category_num")
                let num = Number(badgeDom.text())
                badgeDom.text(--num);
            }else{
                dialogAlert("至少选择一项")
                return false
            }
        })
        //行业确定/取消
        $("#index_selected_bottom").on("click","button",function(){
            // console.log(paramObj.aaa);
            if($(this).attr("id")==="confirm_select"){
                let itemIds = '';
                for(var i=0;i<paramObj.aaa.length;i++){
                    let itemId = paramObj.aaa[i].indusId;
                    itemIds += `${itemId},`
                }
                paramObj.itemIds = itemIds.substr(0,itemIds.length-1);
                let recentTime = $(".stack_bar_tabs_ul .time_split_list.active").attr("recentTime");
                //请求堆积柱状图
                handleStackBar(recentTime);
                $(".index_select_layer").hide();
            }
            $(".index_select_layer").hide();            
        })
        //堆积柱状图
        let radarItemIds = reqItemsIds().then(function(result){
            let itemIds = '';
            result.forEach(item=>{
                itemIds += `${item.itemId},`
            })
            paramObj.itemIds = itemIds.substr(0,itemIds.length-1);

            //根据itemIds请求所有数据的日期，供给侧-当月动能结构时间选择器
            reqAllDataDate({
                itemId:itemIds.split(",")[0],
                saveCallback:function(date){
                    //更新多条水平柱状图
                    reqRadarBarData({
                        itemDate:date,
                        indexId,
                        energyType,
                        callback:function(result){
                            let tempData = [];
                            for(var i = 0;i<result.value.length;i++){
                                tempData.push({
                                    indusName:result.indicator[i],
                                    value:result.value[i]
                                })
                            }
                            paramObj.horBarAllData = tempData;
                            let index = Number($(".hor_bar_tabs_ul .time_split_list.active").attr("recentTime"));
                            let endIndex = isNaN(index)?undefined:index;
                            let initHorBarData = paramObj.horBarAllData.slice(0,endIndex);
                            // paramObj.horBarChart = SingleHorBars.getInstance({
                            //     chartDom:document.querySelector(".hor_bars"),
                            //     title:result.name,
                            // })
                            paramObj.horBarChart.option.baseOption.title.text = result.name;
                            paramObj.horBarChart.resjson = initHorBarData;
                            paramObj.horBarChart.init();
                            paramObj.horBarChart.setOption();
                        }
                    })
                }
            })
        })
        radarItemIds.then(function(){
            handleStackBar();
        }).catch(function(err){
            throw new Error(err);
        })
    }
    //tab选项卡逻辑操作
    new TabsComponent({
        $parent:$(".stack_bar_tabs_ul"),
        $targetClass:".time_split_list",
        callback:function(recentTime){
            // paramObj.recentTime = $(this).attr("recentTime")
            //请求堆积柱状图
            handleStackBar(recentTime)
        }
    })
    new Swiper('.energy_container', {
        pagination: '.energy_tab_ul',
        paginationClickable: true,
        initialSlide: 0,
        effect: 'fade',
        // initialSlide: paramObj.particiTabIndex,
        paginationBulletRender: function (swiper, index, className) {
            var name = '';
            switch (index) {
                case 0:
                    name = '当月动能结构';
                    break;
                case 1:
                    name = '历史动能变迁';
                    break;
            }
            return `<li class="${className}"><p class="swiper_energy_p">${name}</p></li>`
        }
    })
    //收藏相关
    handleFollow({
        token:paramObj.token,
        data: {
            collectionId:indexId, // id
            indexId:energyType+','+energyId,//(1 需求；2 供给)+energyId
            collectionName:collectionName
        },
        url: paramObj.newCmsUrl + 'indexCollention/findIndexCollectionByUserAndId',
        target:$(".title_info")
    });
    $(".title_info").on("click",function(){
        handleFollow({
            token:paramObj.token,
            data: {
                collectionId:indexId, // id
                indexId:energyType+','+energyId, //(1 需求；2 供给)+energyId
                collectionName:collectionName,
            },
            url: paramObj.newCmsUrl + 'indexCollention/insertIndexCollection',
            target:$(".title_info")
        });
        // $(this).toggleClass("unFollow").toggleClass("followed")
    })
    //当月动能结构
    function reqAllDataDate(param){
        new Promise(function(resolve,reject){
            $.ajax({
                //这里使用的是请求堆积柱状图的数据接口，返回结果中只取时间序列，用于时间选择器
                url:paramObj.url+'energy/itemDataByItems',
                beforeSend: function (xhr) {
                    xhr.setRequestHeader("Authentication", paramObj.token);
                },
                data:{
                    itemIds:param.itemId,
                    indexId,
                    recentTime:"all",
                    blockId:energyId
                },
                success:function(result){
                    let resultCode = result.resultCode
                    if(resultCode==="200"&&result.resultBody){
                        resolve(result.resultBody.date);
                    }
                },
                error:function(err){
                    reject(err);
                }
            })
        }).then(function(result){
            // let dateData = result.map(date=>{
            //     return date
            // });
            // let selected = dateData[dateData.length-1].value;
            paramObj.timeData = result
            // console.log(dateData);
            $(".time_picker").text(itemDate);
            //时间选择器
            new MobileSelect({
                trigger: '.time_picker',
                wheels: [
                    {data:result}
                ],
                position:[result.length-1],
                callback:function(position,data){
                    // debugger;
                    let date = data[0]
                    param.saveCallback(date)
                }
            });
            // console.log(datePicker)
            // datePicker.Scroll.prototype.scrollTo("2018-01",0)
            // console.log(dateData);
        }).catch(function(err){
    
        })
    }
    //添加日期
    $(".time_picker_add").on("click", function () {
        var num = ++paramObj.addTimePickNum
        let timePickerNum = $(".time_picker_box").length;
        if(timePickerNum>=1){
            $(this).hide();
        }
        let horBarDomClass = "hor_bar_"+new Date().getTime();

        $(this).before(`<div class="time_picker_box">
                            <div class="time_picker_main">
                                
                                <div class="time_picker_01">${itemDate}</div>
                                
                            </div>
                            <img class="time_picker_destory" src="./../../assets/images/energy/delete_btn.png"/>
                        </div>`)
        //初始化时间
        // let timePickDom = $(".time_picker")[$(".time_picker").length-1];
        // timePicker(timePickDom)
        //创建水平柱状图 
        $(".demand_chart_wrap").append(`<div class="hor_bar_wrap">
                                            <div class="hor_bar ${horBarDomClass}"></div>
                                        </div>`)
        //创建雷达图
        reqRadarBarData({
            itemDate,
            indexId,
            energyType,
            callback:function(result){
                //水平柱状图
                paramObj.secondHorBarBox = new HorBarChart({
                    chartDom:document.querySelector(`.${horBarDomClass}`),
                    title:result.name,
                    legend:result.indicator,
                    seriesData:result.value,
                })
                //雷达图
                let option = paramObj.radarBox.option
                option.legend.data.push(result.name);
                option.series[0].data.push({
                    name: result.name,//数据名称
                    value: result.value,
                    areaStyle: {
                        normal: { // 单项区域填充样式
                            color: {
                                x: 0, //右
                                y: 0, //下
                                x2: 1, //左
                                y2: 1, //上
                                colorStops: [{
                                    offset: 0,
                                    color: 'rgba(240,97,97,0.2)'
                                }, {
                                    offset: 0,
                                    color: 'rgba(240,97,97,0.2)'
                                }, {
                                    offset: 0,
                                    color: 'rgba(240,97,97,0.2)'
                                }],
                            },
                            opacity: 1 // 区域透明度
                        }
                    },
                    symbolSize: 0.2, // 单个数据标记的大小，可以设置成诸如 10 这样单一的数字，也可以用数组分开表示宽和高，例如 [20, 10] 表示标记宽为20，高为10。
                    label: { // 单个拐点文本的样式设置                            
                        normal: { // 单个拐点文本的样式设置。[ default: false ]
                            position: 'top', // 标签的位置。[ default: top ]
                            distance: 4, // 距离图形元素的距离。当 position 为字符描述值（如 'top'、'insideRight'）时候有效。[ default: 5 ]
                            color: '#ccc', // 文字的颜色。如果设置为 'auto'，则为视觉映射得到的颜色，如系列色。[ default: "#fff" ]
                            fontSize: 12, // 文字的字体大小
                        },
                    },
                    lineStyle: {
                        color:"#f06161"
                    },
                    itemStyle: {
                        normal: { //图形悬浮效果
                            borderColor: '#ccc',//单个数据标记描边的颜色
                            borderWidth: 2.5//单个数据标记描边的大小
                        }
                    },
                });
                paramObj.radarBox.init()

                //时间选择器
                new MobileSelect({
                    trigger: '.time_picker_01',
                    wheels: [
                        {data:paramObj.timeData}
                    ],
                    position:[paramObj.timeData.length-1],
                    callback:function(position,data){
                        let date = data[0]
                        // param.saveCallback(date)
                        //更新雷达图和单条柱状图
                        reqRadarBarData({
                            itemDate:date,
                            indexId,
                            energyType,
                            callback:function(result){
                                //雷达图
                                let option = paramObj.radarBox.option;
                                option.legend.data[1] = result.name;
                                option.series[0].data[1].name = result.name;
                                option.series[0].data[1].value = result.value;
                                paramObj.radarBox.init();

                                //条形柱状图
                                new HorBarChart({
                                    chartDom:document.querySelector(`.${horBarDomClass}`),
                                    title:result.name,
                                    legend:result.indicator,
                                    seriesData:result.value,
                                })
                                // let firstHorBarOption = paramObj.firstHorBarBox;
                                // firstHorBarOption.seriesData = result.value;
                                // firstHorBarOption.option.legend.data = result.indicator
                                // firstHorBarOption.init();
                            }
                        })
                    }
                });
            }
        })
    })
    //删除日期
    $(".time_picker_wrap").on("click", ".time_picker_destory", function () {
        // if($(".time_picker_destory").length<=1){
            // return false
        // }else{
            // var index =$(".time_picker_destory").index(this);
            $(this).parent().remove();
            $(".time_picker_add").show();
            //删除水平柱状图
            var horEchartDom = $(".hor_bar")[1]
            echarts.getInstanceByDom(horEchartDom).dispose();
            $(horEchartDom).parent().remove();
            //删除雷达图
            let option = paramObj.radarBox.option
            option.legend.data.splice(1,1)
            option.series[0].data.splice(1,1);
            paramObj.radarBox.init()
        // }
    })

    //历史动能变迁
    $(".item_filter_title").on("click", "span", function () {

        if ($(this).hasClass("active")) {
            if(energyType==="1"){
                $(this).parent().next().hide()
                $(this).removeClass("active");
            }else{

            }
            
        } else {
            if(energyType==="1"){
                $(this).addClass("active");
                $(this).parent().next().show();
            }else{
                $(".index_select_layer").show();
            }
            
        }
    })

    //请求(雷达图，单条水平柱状图，多条水平柱状图)数据
    function reqRadarBarData(params){
        let {itemDate,indexId,energyType,callback} = params;
        new Promise(function(resolve,reject){
            $.ajax({
                url:paramObj.url+'energy/currentMonthEnergy',
                beforeSend: function (xhr) {
                    xhr.setRequestHeader("Authentication", paramObj.token);
                },
                data:{
                    itemDate,
                    indexId,
                    type:energyType,
                    blockId:energyId,
                },
                success:function(result){
                    let resultCode = result.resultCode
                    if(resultCode==="202"||resultCode==="401"){//token 检验失败
                        // dialogConfirm();
                        $.dialog({
                            type: "confirm",
                            onClickOk: function () {
                                //跳转到登录页
                                window.location.href = commonParamObj.redirectUrl;
                            },
                            onClickCancel:function(){
                                window.location.href = `./energy_home.html?indexId=${energyId}`;
                            },
                            autoClose: 0,
                            contentHtml: `<p style="text-align:center;">未登录或登录信息失效，请点击“确定”重新登录</p>`
                        });
                    }else if(resultCode==="200"||resultCode==="201"){ //已购买
                        resolve(result.resultBody);
                    }else if(resultCode==="203"||resultCode==="222"){//未购买
                        $.dialog({
                            type: "confirm",
                            onClickOk: function () {
                                sessionStorage.setItem("product_center_backUrl",`./energy_home.html?indexId=${energyId}`);
                                //跳转到购买页
                                window.location.href = './product_center.html';
                            },
                            onClickCancel:function(){
                                window.location.href = `./energy_home.html?indexId=${energyId}`;
                            },
                            autoClose: 0,
                            contentHtml: `<p style="text-align:center;">您的免费体验期已过，欢迎订阅本版块。</p>`
                        })
                        // return false;
                    }
                },
                error:function(err){
                    reject(err);
                }
            })
        }).then(function(result){
            // console.log(result)
            //数据处理：创建图表/更新图表等
            
            callback(result);
        }).catch(function(err){
            throw new Error(err);
        })
    }
    //请求堆积图数据
    function reqStackBarData(recentTime=paramObj.recentTime){

        return new Promise(function(resolve,reject){
            $.ajax({
                url:paramObj.url+'energy/itemDataByItems',
                beforeSend: function (xhr) {
                    xhr.setRequestHeader("Authentication", paramObj.token);
                },
                data:{
                    itemIds:paramObj.itemIds,
                    indexId,
                    recentTime:recentTime,
                    blockId:energyId
                },
                success:function(result){
                    let resultCode = result.resultCode
                    if(resultCode==="200"&&result.resultBody){
                        resolve(result.resultBody);
                    }
                },
                error:function(err){
                    reject(err);
                }
            })
        })
    }
    function drawIndusCategory(result){
        let htmlStr = '';
        let selectedIndusArr = [];
        let industryLen = 0;
        for(var k in result){
            let selectedNum = 0;
            let industryArr = result[k];
            industryLen += industryArr.length;
            let listStr = '';
            for(var i=0;i<industryArr.length;i++){
                // ${industryArr[i].show?'active':''}
                listStr += `<li class="index_category_list" indusId="${industryArr[i].itemId}">${industryArr[i].itemName}</li>`
                if(industryArr[i].show){
                    selectedIndusArr.push({
                        indusId:industryArr[i].itemId,
                        indusName:industryArr[i].itemName
                    })
                    selectedNum++;
                }
            } 
            // let index_category_num = `<span class="index_category_num">${selectedNum}</span>`
            htmlStr += `<div class="index_category_wrap">
                            <div class="index_category_top">
                                <p class="index_category_title">${k}</p>
                                <div class="index_category_info active">
                                    <span class="index_category_num">${selectedNum}</span>
                                </div>
                            </div>
                            <div class="index_category_bottom">
                                <ul class="index_category_ul">`
                               
            htmlStr += listStr+`</ul>
                    </div>
                </div>`
        }
        $("#index_select_middle").html(htmlStr);
        paramObj.industryLen = industryLen

        paramObj.selectedIndusArr = paramObj.aaa = selectedIndusArr;
        // paramObj.selectedIndusArr  = selectedIndusArr;
    }
    //请求五大行业
    function reqItemsIds(){
        return new Promise(function(resolve,reject){
            $.ajax({
                url:paramObj.url+'energy/itemListByParentItem',
                beforeSend: function (xhr) {
                    xhr.setRequestHeader("Authentication", paramObj.token);
                },
                async:false,
                data:{
                    indexId
                },
                success:function(result){
                    let resultCode = result.resultCode
                    if(resultCode==="200"){
                        resolve(result.resultBody);
                    }else if(resultCode==="201"){
                        dialogAlert("暂无数据")
                    }
                },
                error:function(err){
                    reject(err);
                }
            })
        })
    }
    function handleStackBar(recentTime){
        
        //请求堆积柱状图
        reqStackBarData(recentTime)
        .then(function(result){
            let option = paramObj.stackBarChart.option;
            option.legend.data = result.indicator
            option.xAxis.data = result.date;
            option.series = [];
            result.data.forEach((value,index)=>{
                let json = {
                    name: result.indicator[index],
                    type: 'bar',
                    stack: 'sum',
                    // barWidth: '20px',
                    data: value
                }
                option.series.push(json);
            })
            paramObj.stackBarChart.init();
        }).catch(function(err){
            throw new Error(err);
        })
    }
})