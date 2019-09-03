$(function () {
    var paramObj = {
        url: newCmsUrl,
        token: "",
        mescroll: {},
        pageSize: 10,
        inforTabIndex: function () {
            var inforTabIndex = sessionStorage.getItem("inforTabIndex");
            return inforTabIndex ? Number(inforTabIndex) : 0;
        }(),
        essayTabTimes: true,
        hotTabTimes: true,
        calendarIndex: function () {
            var calendarIndex = sessionStorage.getItem("calendarIndex");
            return calendarIndex ? Number(calendarIndex) : '';
        }(),
        // week: ["一", "二", "三", "四", "五", "六", "日"],
        calendarData: [],
        foolindex: 0,
        infoId:null,
        starHandleType:"essay",
        starBullText:"利好",
        starBearText:"利空",
        starSupportText:"喜欢",
        starOpposeText:"不喜欢",
        //利空利好颜色
        starColorArr:["#f21c1c","#ff5e19","#ff9c17","#ffce16","#cdd919","#7dd91d","#22d922"],
        middle_index:null,
        star_comment_result:null,
        // 资讯列表缓存
        useStorage:false,
        essayList:JSON.parse(sessionStorage.getItem("essayList"))||[],
        hotList:JSON.parse(sessionStorage.getItem("hotList"))||[],
        essayScrollTop:sessionStorage.getItem("essayScrollTop")||0,
        hotScrollTop:sessionStorage.getItem("hotScrollTop")||0,
        essayListPage:function(){
            var essayListPage = sessionStorage.getItem('essayListPage')
            if(essayListPage&&Number(essayListPage)>0){
                return Number(essayListPage)-1
            }else{
                return 0
            }
        }(),
        hotListPage:function(){
            var hotListPage = sessionStorage.getItem('hotListPage')
            if(hotListPage&&Number(hotListPage)>0){
                return Number(hotListPage)-1
            }else{
                return 0
            }
        }(),
    };
    paramObj.middle_index = Math.floor(paramObj.starColorArr.length/2)
    //获取token

    var sessionData = sessionStorage.getItem("Authentication");
    if (sessionData != null && JSON.parse(sessionData).data != undefined) {
        paramObj.token = JSON.parse(sessionData).data;
    }
    var infoSwiper = new Swiper('.info_swiper', {
        initialSlide: paramObj.inforTabIndex,
        pagination: '.info_tab_ul',
        paginationClickable: true,
        onlyExternal: true,
        paginationBulletRender: function (swiper, index, className) {
            var name = '';
            switch (index) {
                case 0:
                    name = '每日十条';
                    break;
                case 1:
                    name = '热点好文';
                    break;
            }
            // return '<li class="'+commonClassName +' '+ className + '">' + name + '</li>';
            return `<li class="${className}">${name}</li>`
        }
    })
    //初始化规则
    let informationRule = SingleRule.getInstance()
    //每日十条相关
    if (paramObj.inforTabIndex) { //1
        drawHot();
    } else { //0
        drawEssay();
    }

    //切换tab栏 请求热点好文数据
    $('.swiper-pagination-bullet').on("click", function () {
        if (!$(this).hasClass("swiper-pagination-bullet-active")) {
            if ($(this).index() === 1) {
                if (paramObj.hotTabTimes) { //第一次切换到热点好文
                    drawHot();
                }
                sessionStorage.setItem("inforTabIndex", 1)
            } else {
                if (paramObj.essayTabTimes) {
                    drawEssay();
                }
                sessionStorage.setItem("inforTabIndex", 0)
            }
        }
    })
    $(".info_swiper_wrapper").on("click", ".essay_link", function () {
        sessionStorage.setItem("inforSource", `./../information.html`)
        //show iframe
        // var iframeSrc = $(this).attr("iframe_href"); 
        // $("#essay_detail_iframe").css({"zIndex":1,"display":"inline"}).attr({"src":iframeSrc});
    })
    //关闭利空利好layer
    $(".star_layer").on("click",function(){
        $(this).hide();
    })
    $(".essay_list_ul").on("click",".star_ul",function(e){
        //判断是否登录
        if (sessionData == null || JSON.parse(sessionData).data == undefined) {
            dialogConfirm("请登录后进行操作");
            return false
        }

        var isClick = $(this).attr("isClick");
        //未评价
        if(isClick === "false"){
            //判断点击的是每日十条还是热点好文
            if($(this).parents(".essay_list_ul").hasClass("essay_ul")){
                $(".star_choose_wrap .bull").text(paramObj.starBullText)
                $(".star_choose_wrap .bear").text(paramObj.starBearText)
                paramObj.starHandleType = "essay"
            }else{
                $(".star_choose_wrap .bull").text(paramObj.starSupportText)
                $(".star_choose_wrap .bear").text(paramObj.starOpposeText)
                paramObj.starHandleType = "hot"
            }
            paramObj.infoId = $(this).parents(".essay_info").attr("infoId")
            paramObj.star_comment_result = null;
            //置灰评分样式
            $(".star_choose_wrap .star_ul .star").css({"color":"#a0a0a0"});
            $(".star_choose_wrap .star_text").css({"color":"#a0a0a0"});
            $(".star_layer").show();
            // $(this).attr({"isClick":"true"})
        }else{
            // console.log("已经点击过了")
        }
    })
    $(".star_confirm").on("click",function(){
        $(".star_layer").hide();
    })
    $(".star_choose_wrap").on("click",function(){
        return false;
    })
    //评分点击
    $(".star_choose_wrap .star_ul").on("click",".star",function(){
        var star_index = $(this).index();
        paramObj.star_comment_result=showStarInfo($(".star_choose_wrap"),(star_index - Math.floor(starInfo.starColorArr.length/2))*-1)
        return false 
    })
    //用户确定评分
    $(".star_confirm").on("click",function(){
        if(typeof(paramObj.star_comment_result)=="number"){
            $.ajax({
                url:paramObj.url+'starScore/save',
                beforeSend: function (xhr) {
                    xhr.setRequestHeader("Authentication", paramObj.token);
                },
                data:{
                    infoId:paramObj.infoId,
                    starCount:paramObj.star_comment_result
                },
                success:function(result){
                    // console.log(result)
                    if(result.success){
                        dialogAlert(`评分成功`);
                        //展示到列表上
                        var star_index = result.currentStarCount;
                        var starWrpaDom = $(`.essay_info[infoId=${paramObj.infoId}]`)
                        showStarInfo(starWrpaDom,star_index);
                        $(".star_layer").hide();
                        //将评分操作同步到sessionStorage中
                        if(paramObj.starHandleType==="essay"){
                            updateStorage({
                                listData:paramObj.essayList,
                                listId:paramObj.infoId,
                                listIndex:paramObj.star_comment_result,
                                storageKey:"essayList"
                            })
                        }else if(paramObj.starHandleType==="hot"){
                            updateStorage({
                                listData:paramObj.hotList,
                                listId:paramObj.infoId,
                                listIndex:paramObj.star_comment_result,
                                storageKey:"hotList"
                            })
                        }
                    }else{
                        if(result.msg==="USERERROR"){
                            dialogConfirm();
                        }else{
                            dialogAlert("评分失败，请稍后重试。")
                        }
                    }
                    paramObj.star_comment_result = null;
                },
                error:function(error){
                    console.log(error);
                }
            })
        };        
    })
    new Promise((resolve,reject)=>{
        $.ajax({
            url:paramObj.url +'rule/findRuleById',
            data:{
                typeId:"3"
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
        informationRule.customRultBtnClick(".information_rule_btn",res)
    }).catch((err)=>{
        console.log(err)
    })

    // toSkip(".essay_ul", ".essay_link");
    // toSkip(".hot_ul", ".essay_link");

    function essayCallback(page) {
        getInfoData({
            url: page.url,
            flag: page.flag,
            className: page.className,
            pageSize: page.size,
            pageNum: page.num,
            infoType: page.infoType,
            successCallback: function (curPageData) {
                    paramObj.mescroll.hotMeScroll.endSuccess(curPageData.length);

                addEssayData(curPageData, page.flag, page.className);
            },
            errorCallback: function () {
                if (page.flag === "hot") {
                    paramObj.mescroll.hotMeScroll.endErr();
                } else {
                    paramObj.mescroll.essayMeScroll.endErr();
                }
                //联网失败的回调,隐藏下拉刷新和上拉加载的状态;
                paramObj.mescroll.hotMeScroll.endErr();
                // paramObj.mescroll.essayMeScroll.endErr();
            }
        });
    }
    //每日十条-数据请求
    function essayUpCallback(page) {
        getInfoData({
            url: page.url,
            flag: page.flag,
            className: page.className,
            pageSize: page.size,
            pageNum: page.num,
            infoType: page.infoType,
            successCallback: function (curPageData) {
                paramObj.mescroll.essayMeScroll.endSuccess(curPageData.length);
                addEssayData(curPageData, page.flag, page.className);               
                $("#essayMain").scroll(function () {
                    var links=$(".essay_ul").find(".essay_link");
                    links.each(function (list) {
                        for (var i = 0; i < links.length; i++) {
                            // console.log(i);
                            var offsetTop = $(links[i]).offset().top;
                            // console.log(offsetTop);
                            if (offsetTop > 70 && offsetTop < 100) {
                                paramObj.foolindex=i;
                                // console.log(i);
                                break;
                            }
                        }                        
                    })
                });
            },
            errorCallback: function () {
                //联网失败的回调,隐藏下拉刷新和上拉加载的状态;
                // paramObj.mescroll.hotMeScroll.endErr();
                paramObj.mescroll.essayMeScroll.endErr();
            }
        });
    }
    //热点好文
    function getInfoData(param) {
        //缓存列表有数据，并且未渲染过
        if((paramObj.essayList.length||paramObj.hotList.length)&&!paramObj.useStorage){
            paramObj.useStorage = true;

            if (param.flag === "essay") {
                paramObj.mescroll.essayMeScroll.endSuccess();
                param.successCallback(paramObj.essayList);
                // paramObj.essayList = [];
                $("#essayMain").scrollTop(paramObj.essayScrollTop);
                //初始化热点好文页数并删除缓存
                paramObj.hotListPage = 0;
                sessionStorage.removeItem("hotList")
                // foolindex
            } else if(param.flag === "hot"){
                paramObj.mescroll.hotMeScroll.endSuccess();
                param.successCallback(paramObj.hotList);
                // paramObj.hotList = [];
                $("#hotMain").scrollTop(paramObj.hotScrollTop);
                //初始化每日十条页数并删除缓存
                paramObj.essayListPage = 0;
                sessionStorage.removeItem("essayList")

            }

        }else {
            paramObj.useStorage = true;
            var url = param.url,
            flag = param.flag,
            className = param.className,
            pageNum = param.pageNum,
            pageSize = param.pageSize;
            $.ajax({
                url: url,
                beforeSend: function (xhr) {
                    xhr.setRequestHeader("Authentication", paramObj.token);
                },
                data: {
                    infoType: param.infoType,
                    pageNo: pageNum,
                    pageSize: pageSize,
                },
                success: function (result) {
                    var listData = result.news;
                    if (listData.length) {
                        if (flag === "essay") {
                            paramObj.mescroll.essayMeScroll.endSuccess();
                            param.successCallback(listData);
                            if(paramObj.token){
                                //将列表数据添加到本地缓存
                                listData.forEach(data => {
                                    paramObj.essayList.push(data);
                                });
                                sessionStorage.setItem("essayList",JSON.stringify(paramObj.essayList));
                                //将本次请求页码存起来
                                sessionStorage.setItem("essayListPage",pageNum)
                            }
                        } else {
                            paramObj.mescroll.hotMeScroll.endSuccess();
                            param.successCallback(listData);
                            if(paramObj.token){
                                //将列表数据添加到本地缓存
                                listData.forEach(data => {
                                    paramObj.hotList.push(data);
                                });
                                sessionStorage.setItem("hotList",JSON.stringify(paramObj.hotList));
                                //将本次请求页码存起来
                                sessionStorage.setItem("hotListPage",pageNum)
                            }   
                        }
                        
                    } else { //上拉无数据时 
                        if (flag === "essay") {
                            paramObj.mescroll.essayMeScroll.endSuccess();
                            param.successCallback([]);
                            //将本次请求页码存起来
                            sessionStorage.setItem("essayListPage",pageNum-1)
                        } else {
                            paramObj.mescroll.hotMeScroll.endSuccess();
                            param.successCallback([]);
                            //将本次请求页码存起来
                            sessionStorage.setItem("hotListPage",pageNum-1)
                        }
                        
                    }
                },
                error: function (err) {
                    if (flag === "essay") {
                        paramObj.mescroll.essayMeScroll.endSuccess();
                    } else {
                        paramObj.mescroll.hotMeScroll.endSuccess();
                    }
                    param.successCallback([]);
                    dialogAlert(`请求资讯数据失败，请稍后重试。`)

                }
            })
        }
        
    }
    //列表
    function addEssayData(listData, flag, className) {
        var starLeftText,starRightText;
        if(flag == "essay"){
            starLeftText = paramObj.starBullText;
            starRightText = paramObj.starBearText;
        }else{
            starLeftText = paramObj.starSupportText;
            starRightText = paramObj.starOpposeText;
        }
        var widthStr = "width:100%;",
            display = "display:none;";
        for (let i = 0; i < listData.length; i++) {
            var htmlStr = '',
            firstStr = '';
            var marginStr = '';
            if (!listData[i].titleImg) {
                listData[i].titleImg = '';
                widthStr = "width:100%;";
                display = "display:none;";
                marginStr = "margin-bottom:0.2rem;";
            }
            //如果有图片
            else {
                widthStr = "width:4.12rem;";
                display = "inline-block;";
            }
            var listTime = (listData[i].infoPublishDate).substr(0, 10),
                now = new Date(),
                time = now.getFullYear() + "-" + ((now.getMonth() + 1) < 10 ? "0" : "") + (now.getMonth() + 1) + "-" + (now.getDate() < 10 ? "0" : "") + now.getDate(),
                starCount = listData[i].currentStarCount;
            var nowTime = time.substr(0, 10);
            if (listTime == nowTime) {
                var publishTime = getDateDiff(listData[i].infoPublishDate);
            } else {
                var publishTime = (listData[i].infoPublishDate).substr(0, 16);
            }

            if (listData[i].top == 1) {
                firstStr = ` 
                    <div class="firstEssay essay_info" infoId="${listData[i].infoId}">
                        <div class="star_wrap">
                            <p class="bull star_text">${starLeftText}</p>
                            <div class="star_content">
                                <ul class="star_ul" isClick=${starCount===null?"false":"true"}>
                                    <li class='star'>R</li>
                                    <li class='star'>R</li>
                                    <li class='star'>R</li>
                                    <li class='star'>R</li>
                                    <li class='star'>R</li>
                                    <li class='star'>R</li>
                                    <li class='star'>R</li>
                                </ul>
                            </div>
                            <p class="bear star_text">${starRightText}</p>
                        </div>
                        <a class="essay_link firstBox" href="./pages/essay_detail.html?fInfoId=${listData[i].infoId}&essayType=${flag}">
                            <div class="firstTitle col_2_hide">${listData[i].infoTitle}</div>
                            <div class="imgbox">
                                <img src="${listData[i].titleImg}" alt="" class="firstImg">
                            </div>
                            <div class="firstAuthor">
                                <span class="firstAuth">${listData[i].author}</span>
                                <span class="hot_publish_time firstTime" times="${listData[i].infoPublishDate}">${publishTime}</span>
                            </div>  
                        </a>           
                    </div>`
            } else {
                htmlStr = `
                    <li class="essay_list essay_info" infoId="${listData[i].infoId}">
                        <div class="star_wrap">
                            <p class="bull star_text">${starLeftText}</p>
                            <div class="star_content">
                                <ul class="star_ul" isClick=${starCount===null?"false":"true"}>
                                    <li class='star'>R</li>
                                    <li class='star'>R</li>
                                    <li class='star'>R</li>
                                    <li class='star'>R</li>
                                    <li class='star'>R</li>
                                    <li class='star'>R</li>
                                    <li class='star'>R</li>
                                </ul>
                            </div>
                            <p class="bear star_text">${starRightText}</p>
                        </div>
                        <a class="essay_link" href="./pages/essay_detail.html?fInfoId=${listData[i].infoId}&essayType=${flag}">

                            <div class="hot_img_wrap" style="${display}">
                                <img class="hot_img" src="${listData[i].titleImg}">
                            </div>
                            <div class="hot_txt" style="${widthStr}">
                                
                                    <div class="title hot_title justify col_3_hide" style="${marginStr}">${listData[i].infoTitle}</div>
                                <div class="hot_author">
                                    <span class="hot_auth">${listData[i].author}</span>
                                    <span class="hot_publish_time" times="${listData[i].infoPublishDate}">${publishTime}</span>
                                </div>
                            </div>
                        </a>
                    </li>`
            }

            $(className).append(firstStr, htmlStr);
            if(listData[i].currentStarCount!=null){
                var star_index = listData[i].currentStarCount;
                showStarInfo($(`.essay_info[infoId=${listData[i].infoId}]`),star_index);
            }
        }
        

    }
    //渲染每日十条
    function drawEssay() {
        paramObj.mescroll.essayMeScroll = new MeScroll("essayMain", {
            down:{
                beforeLoading:function(){
                    paramObj.essayList = []
                }
            },
            up: {
                callback: essayUpCallback,
                page: {
                    num: paramObj.essayListPage,
                    size: paramObj.pageSize,
                    url: paramObj.url + "news/info",
                    flag: "essay",
                    className: ".essay_ul",
                    infoType: "news_top_ten",
                },
                clearEmptyId: "essayUl",
                htmlNodata: '<p class="upwarp-nodata">无更多资讯</p>',
                empty: {
                    tip: "无更多资讯" //提示
                },
                // noMoreSize: 1,
                lazyLoad: {
                    use: true
                }
            }
        })

        paramObj.essayTabTimes = false;
    }

    //渲染热点好文
    function drawHot() {
        paramObj.mescroll.hotMeScroll = new MeScroll("hotMain", {
            down:{
                beforeLoading:function(){
                    paramObj.hotList = []
                }
            },
            up: {
                callback: essayCallback, //上拉加载的回调
                // isBounce: false, //此处禁止ios回弹,解析(务必认真阅读,特别是最后一点): http://www.mescroll.com/qa.html#q10
                page: {
                    num: paramObj.hotListPage,                    
                    size: paramObj.pageSize,
                    url: paramObj.url + "news/info",
                    flag: "hot",
                    className: ".hot_ul",
                    infoType: "hot_news",
                },
                clearEmptyId: "hotUl",
                htmlNodata: '<p class="upwarp-nodata">无更多资讯</p>',
                empty: {
                    tip: "无更多资讯" //提示
                },
                // noMoreSize: 1,
                lazyLoad: {
                    use: true
                }
            }
        })
        paramObj.hotTabTimes = false;
    }
    //记录滚动距离
    $("#essayMain").on("scroll",function(){
        sessionStorage.setItem("essayScrollTop",$(this).scrollTop())
    })
    $("#hotMain").on("scroll",function(){
        sessionStorage.setItem("hotScrollTop",$(this).scrollTop())
    })
    //时间戳
    var timer = null //定义定时器
    $("#essayMain").on("scroll", huadong);

    function huadong() {

        $("#hotTime").css("display", "block")
        clearTimeout(timer);
        timer = setTimeout(function () {
            // console.log('停止了')
            $("#hotTime").css("display", "none")
        }, 1000)
    }
    
    $("#essayMain").on("scroll", scrollMove);
    function scrollMove() {
        var timebox=$(".essay_ul").find(".hot_publish_time"); 
        var timeDay = ($(timebox[paramObj.foolindex]).attr("times")).substr(8, 2),
            timeMon = ($(timebox[paramObj.foolindex]).attr("times")).substr(5, 2) + "月";
        $("#time_day").text(timeDay);
        $("#time_mon").text(timeMon);
    }
})