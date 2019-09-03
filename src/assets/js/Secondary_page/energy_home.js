$(function(){
    var paramObj={
        url:indexUrl,
        token:"",
        indexId:parseURL(window.location.href).indexId,
    }
    //获取token
    var sessionData = sessionStorage.getItem("Authentication");
    if (sessionData != null && JSON.parse(sessionData).data != undefined) {
        $(".no_sign_in_layer").css({"display":"none"})
        paramObj.token = JSON.parse(sessionData).data;
        $(".energy_box").on("click",".energy_info_link",function(){
            sessionStorage.setItem("energySource","./energy_home.html")
        })
    }else{
        $(".no_sign_in_layer").css({"display":"flex"})
    }

    //请求金币数
    new Promise(function(resolve,reject){
        $.ajax({
            url:paramObj.url+'index/gold',
            beforeSend: function (xhr) {
                xhr.setRequestHeader("Authentication", paramObj.token);
            },
            data:{
                indexId:paramObj.indexId
            },
            success:function(result){
                if(result.status==="200"){
                    resolve(result.body);
                }else{
                    reject("请求错误")
                }
            },
            error:function(err){
                reject(err);
            }
        })
    }).then(function(result){
        $(".energy_price").text(result)
    }).catch(function(err){
        throw new Error(err);
    })

    //请求列表数据
    new Promise(function(resolve,reject){
        $.ajax({
            url:paramObj.url+'energy/itemList',
            beforeSend: function (xhr) {
                xhr.setRequestHeader("Authentication", paramObj.token);
            },
            success:function(result){
                if(result.resultCode==="200"){
                    resolve(result.resultBody);
                }else{
                    reject("请求错误")
                }
            },
            error:function(err){
                reject(err);
            }
        })
        // resolve(true);
    }).then(function(result){
        let {demand,supply} = result;
        drawEnergyList(demand,".energy_demand");
        drawEnergyList(supply,".energy_supply");
        if(!paramObj.token)$(".no_sign_in_layer").css({"display":"flex"})
        // $(".no_sign_in_layer").css({"display":"flex"})
    }).catch(function(err){
        throw new Error(err);
    })
    $(".energy_box").on("click",".no_sign_in_layer",function(){
        dialogConfirm();
    })
    $(".title_info").on("click",function(){
        sessionStorage.setItem("describeBackUrl",'./energy_home.html')
        window.location.href = `./forecast_describe.html?index=${paramObj.indexId}`
    })
    //渲染动能list(需求、供给 )
    function drawEnergyList(result,ul){
        // console.log(demand);
        if(result.length){
            let htmlStr = '';
            result.forEach(list => {
                let industryStr = '';
                let industryArr = list.industry
                htmlStr+=`<li class="energy_box_list">
                        <div class="no_sign_in_layer">
                            <span>登录后即可查看</span>
                        </div>
                        <a href="./energy_radarPage.html?type=${list.type}&indexId=${list.itemId}&itemDate=${list.maxDate}&itemName=${list.itemName}&energyId=${paramObj.indexId}" class="energy_info_link">
                            <div class="energy_list_title">
                                <span class="energy_list_source">${list.itemName}</span>
                                <span class="energy_list_time">${list.maxDate}</span>
                            </div>
                            <ul class="energy_list_ul">`
                if(industryArr.length){
                    industryArr.forEach(industry=>{
                        industryStr += `<li class="energy_industry_list"><b>${industry.itemName}</b></li>`
                    })
                }
                htmlStr += industryStr+"</ul></a></li>"
            });
            $(ul).append(htmlStr)
        }
    }
})