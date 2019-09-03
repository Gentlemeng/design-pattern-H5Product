$(function(){
    let paramObj={
        url: newCmsUrl,
        basicClassName:'.basic_product_ul',
        groupClassName:'.group_product_ul',
        userBalance:0,
        //所选基础模块个数
        selectBasicLen:0,
        //所选优惠组合的list
        selectGroupDom:[],
        //满足打折的所选基础
        discountNum:3,
        //打几折
        discountCost:7,
        // 总计多少金币
        totalPrice:0,
        // 优惠了多少金币
        totalSave:0,
        orderData:[],
        productType:'',
        mescroll:{
            historyMeScroll:null,
        },
        historyPage:0,
        historySize:4,
        productIcon:"./../../assets/images/product_center/macro_icon.png",
        productImg:"",
        bannerImg:"./../../assets/images/product_center/banner.png",
        //金币购买页url purchase.html
        purchaseUrl:createThirdUrl('purchase.html'),
        //金币兑换页url  exchange.html
        exchangeUrl:createThirdUrl('exchange.html'),
        //返回url地址
        backUrl:function(){
            var backUrl = sessionStorage.getItem("product_center_backUrl")
            return backUrl?backUrl:'./../myself.html'
        }(),
    }
    var sessionData = sessionStorage.getItem("Authentication");
    if (sessionData != null && JSON.parse(sessionData).data != undefined) {
        paramObj.token = JSON.parse(sessionData).data;
    }
    $(".back_wrap .back").attr({"href":paramObj.backUrl})
    
    var infoSwiper = new Swiper('.product_swiper', {
        // initialSlide: 1,
        pagination: '.product_tab_ul',
        paginationClickable: true,
        onlyExternal: true,
        paginationBulletRender: function (swiper, index, className) {
            var name = '';
            switch (index) {
                case 0:
                    name = '我要订阅';
                    break;
                case 1:
                    name = '订阅记录';
                    break;
            }
            // return '<li class="'+commonClassName +' '+ className + '">' + name + '</li>';
            return `<li class="${className}">${name}</li>`
        }
    })
    var bannerSwiper = new Swiper('.banner_swiper', {
        // initialSlide: 1,
        pagination: '.banner_tab_ul',
        paginationClickable: true,
        onlyExternal: true,
        // autoplay:1000,
        // loop:true,
        paginationBulletRender: function (swiper, index, className) {
            var name = '';
            switch (index) {
                case 0:
                    name = '1';
                    break;
                case 1:
                    name = '2';
                    break;
            }
            // return '<li class="'+commonClassName +' '+ className + '">' + name + '</li>';
            return `<li class="${className}">${name}</li>`
        }
    })
    // function reqBannerUrl ()
    initPage()
    reqBannerData()
    // 点击模块操作
    $(".product_wrap").on("click",".product_list",function(){
        // 可点击
        if(!$(this).hasClass("unclickable")){
            paramObj.totalPrice = 0
            paramObj.totalSave = 0
            //点击的是“优惠组合”
            if($(this).hasClass("group_product_list")){
                paramObj.selectBasicLen = 0
                paramObj.productType = 'group'
            
                $(".basic_product_list").removeClass("active")

                $(this).toggleClass("active");
                paramObj.selectGroupDom = $(".group_product_list.active")
            }
            // 点击的是“基础模块” 
            else if($(this).hasClass("basic_product_list")){

                paramObj.selectGroupDom.length = 0
                paramObj.productType = 'block'                
                if(!$(this).hasClass("active")){
                    $(this).addClass("active")
                    //"优惠组合"取消选择
                    $(".group_product_list").removeClass("active")
                }else{
                    $(this).removeClass("active")
                }
                //判断是否大于折扣条件
                paramObj.selectBasicLen = $(".basic_product_list.active").length
                if(paramObj.selectBasicLen>=paramObj.discountNum){
                    $(".discount_flag").show()
                }else{
                    $(".discount_flag").hide()
                }
            }
            
            //计算总价
            $(".product_list.active").each(function(index,dom){
                // console.log(dom);
                paramObj.totalPrice+=Number($(dom).attr("price"));
            })
            // 计算优惠了多少
            if(paramObj.selectBasicLen>=paramObj.discountNum){ //满三件基础模块
                paramObj.totalSave = paramObj.totalPrice - paramObj.totalPrice * paramObj.discountCost/10
                paramObj.totalPrice = paramObj.totalPrice - paramObj.totalSave
                // console.log(paramObj.totalSave,paramObj.totalPrice)
            } else if(paramObj.selectGroupDom.length>0){
                paramObj.selectGroupDom.each(function(index,dom){
                    paramObj.totalSave+=Number($(dom).attr("save"))
                })
            }
            //底部价格联动
            $(".total_price").text(paramObj.totalPrice)
            if(paramObj.totalSave>0){
                $(".total_save").show()
                $(".total_save_price").text(paramObj.totalSave)
            }else{
                $(".total_save").hide()
            }
        }
        
    })

    //点击结算
    $(".btn_settlement").on("click",function(){
        if($(".product_list.active").length==0){
            dialogAlert("请至少选择一个模块或组合")
            return false
        }else {
            let userBalance = Number($(".balance_num").text())
            let totalPrice = Number($(".total_price").text())

            if(userBalance>=totalPrice){
                
                $.dialog({
                    type: "confirm",
                    onClickOk: function () {
                        //防止重复点击
                        $(this).attr({ "disabled": true })
                        paramObj.orderData.length = 0
                        $(".product_list.active").each(function (index, dom) {
                            let orderJson = {}
                            // paramObj.totalPrice+=Number($(dom).attr("price"));
                            let type = $(dom).attr("type"),
                                id = $(dom).attr("indexId"),
                                unitId = $(dom).attr("unitId"),
                                unitPrice = ''
                            if ($(dom).hasClass("group_product_list")) {
                                unitPrice = $(dom).attr("originPrice")
                            } else {
                                unitPrice = $(dom).attr("price")
                            }
                            // unitId = "1",
                            orderJson.type = type
                            orderJson.id = id
                            orderJson.cycleId = unitId
                            orderJson.unitPrice = unitPrice
                            paramObj.orderData.push(orderJson)
                        })
                        paramObj.orderData.forEach(data => {
                            data.price = paramObj.totalPrice + paramObj.totalSave
                            data.discountPrice = paramObj.totalPrice
                        })
                        // console.log(paramObj.orderData);
                        new Promise((resolve, reject) => {
                            $.ajax({
                                url: paramObj.url + 'commodity/insertBuyInfo',
                                beforeSend: function (xhr) {
                                    xhr.setRequestHeader("Authentication", paramObj.token);
                                },
                                contentType:'application/json',
                                data: JSON.stringify(paramObj.orderData),
                                type: 'post',
                                success: function (result) {
                                    // debugger;
                                    if (result.resultCode == "200") {
                                        resolve(true)
                                    } else if (result.resultCode == "402") {//登录失效
                                        dialogConfirm()
                                        resolve(false)
                                    } else if (result.resultCode == "701") {
                                        blanceDialogAlert()
                                    }
                                },
                                err: function (err) {
                                    reject(err)
                                }
                            })
                        }).then(res => {
                            if (res) {
                                dialogAlert('恭喜您，订阅成功！')
                                $(".product_list").removeClass("active")
                                //重置页面
                                initPage()
                                $(".total_price").text('0')
                                //刷新订阅记录页
                                // paramObj.mescroll.historyMeScroll.destory()
                                if (paramObj.mescroll.historyMeScroll) {
                                    paramObj.mescroll.historyMeScroll.resetUpScroll(false);
                                }
                            }
                            $(".btn_settlement").attr({ "disabled": false })
                        }).catch(res => {
                            dialogAlert('结算失败，请稍后重试。')
                            console.log(res)
                            $(".btn_settlement").attr({ "disabled": false })
                        })
                    },
                    autoClose: 0,
                    contentHtml: `<p style="text-align:center;">确定订阅吗？</p>`
                });
                    
            }else{
                blanceDialogAlert()
            }
        }    
    })
    $("body").on("click",".dialog_close",function(){
        $.dialog.close();
    })
    // 订阅记录页面
    // reqHistoryData()
    paramObj.mescroll.historyMeScroll = new MeScroll("history_mescroll", {
        up: {
            callback: historyUpCallback,
            page: {
                num:0,
                size: paramObj.historySize,
                url: paramObj.url + "commodity/findCommodityByUser",
                className: ".history_wrap_ul",
            },
            clearEmptyId: "history_ul",
            htmlNodata: '<p class="upwarp-nodata">无更多记录</p>',
            empty: {
                tip: "无更多记录" //提示
            },
            noMoreSize: 1,
            lazyLoad: {
                use: true
            }
        }
    })
    function historyUpCallback(page){
        reqHistoryData({
            url:page.url,
            className:page.className,
            pageSize: page.size,
            pageNum: page.num,
            successCallback:function(historyData){
                paramObj.mescroll.historyMeScroll.endSuccess(historyData.length);
                //渲染订阅记录dom
                drawHistoryList(historyData)

            },
            errorCallback:function(){
                paramObj.mescroll.historyMeScroll.endErr();
            }
        })
    }

    function initPage (){
        reqBlance()
        // 请求产品数据
        reqProductData()
        //请求基础模块折扣数据
        reqDiscountData()
    }
    //请求顶部轮播图
    function reqBannerData(){
        new Promise((resolve,reject)=>{
            $.ajax({
                url:paramObj.url+'commodity/findAdvertisePic',
                // type:'post',
                success:function(result){
                    if(result.resultCode=="200"){
                        resolve(result.resultBody)
                    }else if(result.resultCode =="402"){//登录失效
                        dialogConfirm()
                        resolve([])
                    }else if(result.resultCode == "201"){
                        // dialogAlert("轮播图数据为空")
                        resolve([])
                    }
                },
                error:function(err){
                    // debugger;
                    reject(err)
                }
            })
        }).then((res)=>{
            // $(".balance_num").text(res);
            let htmlStr = ''
            res.forEach(data => {
                htmlStr += `<div class="swiper-slide">
                                <img class="banner_img" src="${data.advUrl}"/>
                            </div>`
            });
            $(".banner_slide_wrapper").append(htmlStr)
            resetImg(".banner_slide_wrapper img",paramObj.bannerImg)
            // console.log(res)
        }).catch((res)=>{
            dialogAlert('请求轮播图数据失败')
            console.log(res)
        })
    }
    // 请求金币余额
    function reqBlance(){
        new Promise((resolve,reject)=>{
            $.ajax({
                url:paramObj.url+'gold/findUserTotalGold',
                beforeSend: function (xhr) {
                    xhr.setRequestHeader("Authentication", paramObj.token);
                },
                type:'post',
                success:function(result){
                    if(result.resultCode=="200"){
                        paramObj.userBalance = result.resultBody.goldTotal
                        resolve(paramObj.userBalance)
                    }else if(result.resultCode =="402"){//登录失效
                        dialogConfirm()
                        resolve(0)
                    }else if(result.resultCode == "201"){
                        resolve(0)
                    }
                },
                error:function(err){
                    // debugger;
                    reject(err)
                }
            })
        }).then((res)=>{
            $(".balance_num").text(res);
        }).catch((res)=>{
            dialogAlert('请求金币余额失败')
            console.log(res)
        })
    }
    function reqDiscountData(){
        new Promise((resolve,reject)=>{
            $.ajax({
                url:paramObj.url+'commodity/findLastModuleDisCountInfo',
                type:'get',
                success:function(result){
                    if(result.resultCode=="200"&&result.resultBody.length){
                        resolve(result.resultBody[0])
                    }else{
                        resolve()
                    }
                },
                error:function(err){
                    reject(err)
                }
            })
        }).then(res=>{
            if(res){
                $(".discount_info").show()
                paramObj.discountCost = res.discountCost
                paramObj.discountNum = res.discountNum
                $(".discount_icon").text(paramObj.discountCost+'折')
                $(".discount_condition").text(`任选${paramObj.discountNum}件打${paramObj.discountCost}折`)
                $(".discount_flag").text(`已满足`)
            }else{
                paramObj.discountNum = 1000
                // $(".discount_info").hide()
            }
        }).catch(res=>{
            dialogAlert('请求折扣数据失败')
        })
    }
    function reqProductData(param){
        new Promise((resolve,reject)=>{
            $.ajax({
                url:paramObj.url+'commodity/findUserCommodityInfo',
                beforeSend:function (xhr) {
                    xhr.setRequestHeader("Authentication", paramObj.token);
                },
                type:'post',
                success:function(result){
                    if(result.resultCode=="200"){
                        // debugger;
                        resolve(result.resultBody)
                    }else if(result.resultCode =="402"){//登录失效
                        dialogConfirm()
                        resolve([])
                    }else if(result.resultCode == "201"){
                        resolve([])
                    }
                },
                error:function(err){
                    reject(err)
                }
            })
        }).then(res=>{
            //渲染list
            if(res){
                if(res.blockList){
                    drawProductList('basic',res.blockList)
                }
                if(res.groupList){
                    drawProductList('group',res.groupList)
                }
            }
        }).catch(res=>{
            dialogAlert('产品处理失败')
            console.log(res)
        })
    }
    //渲染基础模块
    function drawProductList(flag,domArr){
        let htmlStr = ''
        if(flag=='basic'){
            
            domArr.forEach(data => {
                // to left top, #2c6b38, #47a29a
                let price = data.indexGoldCoinAttribute,
                    unit = data.typeUnitNames||'金币/年',
                    startColor = '#'+data.indexStartColor,
                    endColor = '#'+data.indexEndColor,
                    linearColor = `-webkit-linear-gradient(to left top, ${startColor}, ${endColor});
                    background: -moz-linear-gradient(to left top, ${startColor}, ${endColor});
                    background: -o-linear-gradient(to left top, ${startColor}, ${endColor});
                    background: -ms-linear-gradient(to left top, ${startColor}, ${endColor});
                    background: linear-gradient(to left top, ${startColor}, ${endColor});
                    background-color: ${startColor}`

                htmlStr += `<li class="basic_product_list product_list ${data.isBuy=='Y'?'unclickable':''}" indexId="${data.indexId}" type="block" price="${price}" 
                            unitId="${data.typeUnitId}">
                                <div class="product_top" style="${linearColor}">
                                    <div class="product_select_wrap">
                                        <div class="product_select"></div>
                                    </div>
                                    <div class="product_info">
                                        <img class="product_icon" src="${data.indexImageUrl}"/>
                                        <div class="product_name">${data.name}</div>
                                    </div>
                                </div>
                                <div class="basic_price">
                                    ${price+'金币'+unit}
                                </div>
                                <div class="product_layer" style="display:${data.isBuy=='N'?'none':'block'}"></div>
                            </li>`
            })
            //处理最后一行有两个li的情况
            if(domArr.length % 3 == 2){
                htmlStr+="<li class='basic_product_list' style='height:0;border:none;'></li>"
            }
            $(paramObj.basicClassName).empty().append(htmlStr)  
            resetImg(".product_info img",paramObj.productIcon)
            return   
        }else if(flag=='group'){
            domArr.forEach(data => {
                let price = data.totalPrice||100,
                    unit = data.typeUnitNames||'金币/年',
                    save = data.freePrice || 0
                htmlStr += `<li class="group_product_list product_list ${data.isBuy=='Y'?'unclickable':''}" type="group" indexId="${data.moduleCombineId}" 
                price="${price}" save="${save}" unitId="${data.unitId}" originPrice="${data.originTotalPrice}">
                                <div class="product_select_wrap">
                                    <div class="product_select"></div>
                                    <div class="group_img" style="background:url('${data.picUrl}') no-repeat center left/contain">
                                        <div class="product_layer"></div>
                                    </div>
                                </div>
                                <div class="group_info">
                                    <div class="group_name">${data.name}</div>
                                    <div class="group_price">${price+'金币'+unit}</div>
                                    <div class="group_save">(可节省${save}金币)</div>
                                </div>
                            </li>`
            })
            $(paramObj.groupClassName).empty().append(htmlStr)    
            return 
        }
    }
    //请求历史记录
    function reqHistoryData(param){
        new Promise((resolve,reject)=>{
            $.ajax({
                url:param.url,
                beforeSend:function (xhr) {
                    xhr.setRequestHeader("Authentication", paramObj.token);
                },
                data:{
                    page:param.pageNum,
                    size:param.pageSize
                },
                type:'post',
                success:function(result){
                    if(result.resultCode=="200"){
                        // debugger;
                        // if($.isEmptyObject(result.resultBody)){
                        //     resolve({})
                        // }else{
                        let historyData = []
                        for(var k in result.resultBody){
                            historyData.push(result.resultBody[k])
                        }
                        resolve(historyData)
                        // }
                    }else if(result.resultCode =="402"){//登录失效
                        dialogConfirm()
                        resolve([])
                    }else if(result.resultCode == "201"){
                        resolve([])
                    }
                },
                err:function(err){
                    reject(err)
                }
            })
        }).then(res=>{
            //渲染list
            param.successCallback(res);
        }).catch(res=>{
            dialogAlert('请求订阅记录失败')
            console.log(res)
        })
    }
    // background:url(${productIcon}) no-repeat center/cover
    function drawHistoryList (historyData){

        let htmlStr = ''
        historyData.forEach((data)=>{
            //  data = historyData[k],
            htmlStr+=`<li class="history_list">
                        <div class="history_time">${data[0].createTime}</div>
                        <ul class="history_info_ul">`

            data.forEach((list)=>{
                let startColor = '#'+list.beginColour,
                endColor = '#'+list.endColour,
                linearColor = `background:-webkit-linear-gradient(to left top, ${startColor}, ${endColor});
                background: -moz-linear-gradient(to left top, ${startColor}, ${endColor});
                background: -o-linear-gradient(to left top, ${startColor}, ${endColor});
                background: -ms-linear-gradient(to left top, ${startColor}, ${endColor});
                background: linear-gradient(to left top, ${startColor}, ${endColor});
                background-color: ${startColor};`,
                productIcon = list.picUrl
                htmlStr+=`<li class="history_info_list">
                            <div class="history_info_top">
                                <div class="${list.type=='block'?'history_icon':'history_img'}" style="${linearColor}">
                                    <img class="block_img" style="display:${list.type=='block'?'block':'none'}" src="${productIcon}"/>
                                    <div class="group_img" style="display:${list.type=='block'?'none':'block'};background:url('${productIcon}') no-repeat center left/contain"></div>
                                </div>
                                <div class="history_info">
                                    <p class="history_name">${list.name}</p>
                                    <p class="history_price">${list.unitPrice}金币${list.unitName}</p>
                                </div>
                            </div>
                            <div class="history_info_bottom">
                                <div class="history_deadtime_wrap">有效期至：<span class="history_deadtime">${list.endTime}</span></div>
                            </div>
                            
                        </li>`
            })
            htmlStr+=`</ul>
                    <div class="history_bottom">
                        <div class="history_settlement">
                            <div class="history_total_num">
                                <span>共计${data.length}件产品&nbsp;&nbsp;</span>
                            </div>
                            <div class="history_total_price">
                                <div class="history_total_price_top">
                                    <span class="history_total_text">合计：<i>${data[0].discountPrice}金币</i><br /><b>优惠：${data[0].price-data[0].discountPrice}金币</b></span>
                                    
                                </div>
                            </div>
                        </div>
                    </div>
                </li>`
        })
        $('.history_wrap_ul').append(htmlStr);
        resetImg(".history_info_top img",paramObj.productIcon)
        // $(".")
        
    }
    function resetImg(selector,imgUrl){
        $(selector).bind("error",function(){   
            $(this).attr({"src":imgUrl})   
        });
    }
    function blanceDialogAlert() {
        $.dialog({
            type: "confirm",
            closeBtnShow: true,
            buttonText:{
                ok:"金币购买",
                cancel:"金币兑换"
            },
            buttonClass:{ok:"gold_exchange_btn"},
            onClickOk: function () {
                sessionStorage.setItem("productSource", `./../pages/product_center.html`)
                window.location.href = paramObj.purchaseUrl
            },
            onClickCancel: function () {
                sessionStorage.setItem("productSource", `./../pages/product_center.html`)
                window.location.href = paramObj.exchangeUrl;
            },
            autoClose: 0,
            contentHtml: `<p style="text-align:center;">您的余额不足</p><a href="javascript:;" class="dialog_close">×</a>`
        });
    }

    function createThirdUrl(targetUrl) {
        var origin = window.location.origin;
        var pathname = window.location.pathname;
        var tempPathname = pathname.split('/');
        tempPathname[tempPathname.length - 1] = targetUrl;
        var filterPathname = tempPathname.join('/');
        return origin + filterPathname;
    }
    
})