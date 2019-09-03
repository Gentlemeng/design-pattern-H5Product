$(function(){
    var paramObj={
        url: indexUrl,
    }
    new Promise(function(resolve,reject){
        $.ajax({
            url:paramObj.url+"system/findSystemIntroduce",
            success:function(result){
                if(result.status=='200'){
                    resolve(result.body.data);                
                }else{
                    reject("返回错误")
                }
            },
            error:function(err){
                reject(err)
            }
        })
    }).then(function(result){
        var htmlStr = '';
        if(result.length){
            htmlStr = result[0].systemIntroduceUrl
        }
        $(".content").append(htmlStr)
    }).catch(function(err){
        throw new Error(err);
    })
})