$(function () {
    var sessionData = sessionStorage.getItem("Authentication");
    if (sessionData == null || JSON.parse(sessionData).data == undefined) {
        redirectUrl();
    } else {
        var paramObj = {
            url: newCmsUrl + "IntegrateUserDetail/",
            token: JSON.parse(sessionData).data,
            mSelect: {},
            formData: {
                userId: "",
                userAge: null,
                userGender: null,
                userProvince: null,
                userCity: null,
                userEducation: null,
                userIndustry: null,
                userHeadImage: "",
                userNickName: "",
                userEmail:""
            }
        };

        initPage();
        var selectArr = ["userAge", "userGender", "userEducation", "userIndustry"];
        for (var i = 0; i < selectArr.length; i++) {
            paramObj[selectArr[i]] = new MobileSelect({
                trigger: '.' + selectArr[i],
                wheels: [{
                    data: getData({
                        name: selectArr[i]
                    })
                }],
                keyMap: {
                    id: 'vid',
                    value: 'value',
                    childs: 'childs'
                },
                callback: function (indexArr, data) {
                    paramObj.formData[this.trigger.classList[1]] = data[0].vid;
                },
                onShow: function (e) {
                    if(e.trigger.innerText.indexOf("请选择") < 0){
                        var arrIndex;
                        e.wheelsData[0].data.forEach(function (v, index) {
                            if (v.value == e.trigger.innerText) {
                                arrIndex = index
                            }
                        })
                        paramObj[e.trigger.className.split(" ")[1]].locatePosition(0, arrIndex);
                    }
                }
            });
        }
        var cityData, allData = getData({
            name: "city"
        });

        function initPage() {
            $.ajax({
                url: paramObj.url + "UserDetail",
                beforeSend: function (xhr) {
                    xhr.setRequestHeader("Authentication", paramObj.token);
                },
                success: function (result) {
                    if (result.status == 200) {
                        paramObj.formData.userId = result.body.userId;
                        $(".userPic").css("background-image", "url(" + result.body.userHeadImage + ")");
                        $(".userNickName")[0].innerHTML = result.body.userNickName ? result.body.userNickName : "点击修改昵称";
                        $(".userEmail")[0].innerHTML = result.body.userEmail ? result.body.userEmail : "点击修改邮箱";
                        $(".userAge")[0].innerHTML = result.body.userAgeString ? result.body.userAgeString : "请选择年龄";
                        $(".userGender")[0].innerHTML = result.body.userGenderString ? result.body.userGenderString : "请选择性别";
                        $(".city")[0].innerHTML = result.body.userCityString ? result.body.userProvinceString + " " + result.body.userCityString : "请选择城市";
                        $(".userEducation")[0].innerHTML = result.body.userEducationString ? result.body.userEducationString : "请选择学历";
                        $(".userIndustry")[0].innerHTML = result.body.userIndustryString ? result.body.userIndustryString : "请选择行业";
                        var areaCode, provIndex;
                        if(result.body.userProvinceString == null){
                            cityData = getCityData({
                                code: allData[0].areaCode,
                                data: allData,
                                index: 0
                            });
                        }else{
                            allData.forEach(function (v, index) {
                                if (v.prov == result.body.userProvinceString) {
                                    areaCode = v.areaCode;
                                    provIndex = index;
                                }
                            })
                            cityData = getCityData({
                                code: areaCode,
                                data: allData,
                                index: provIndex
                            });
                        }
                        paramObj.mSelect = new MobileSelect({
                            trigger: '.city',
                            wheels: [{
                                data: cityData
                            }],
                            keyMap: {
                                id: 'vid',
                                value: 'value',
                                childs: 'childs'
                            },
                            transitionEnd: function (indexArr, data) {
                                var data = getCityData({
                                    code: allData[indexArr[0]].areaCode,
                                    data: allData,
                                    index: indexArr[0]
                                });
                                paramObj.mSelect.updateWheels(data);
                                paramObj.mSelect.locatePosition(0, indexArr[0]);
                                paramObj.mSelect.locatePosition(1, indexArr[1]);
                            },
                            callback: function (indexArr, data) {
                                paramObj.formData.userProvince = data[0].vid;
                                paramObj.formData.userCity = data[1].vid;
                            },
                            onShow: function (e) {
                                if(provIndex != undefined){
                                    var cityIndex;
                                    e.wheelsData[0].data[provIndex].childs.forEach(function (v, index) {
                                        if (v.value == e.trigger.innerText.split(" ")[1]) {
                                            cityIndex = index
                                        }
                                    })
                                    paramObj.mSelect.locatePosition(0, provIndex);
                                    paramObj.mSelect.locatePosition(1, cityIndex);
                                }
                            }
                        });
                    } else if (result.status == 401) {
                        redirectUrl();
                    }
                },
                error: function (err) {
                    console.log(err);
                }
            })
        }

        function getData(params) {
            var res = [],
                url = "";
            switch (params.name) {
                case "userAge":
                    url = paramObj.url + "UserAges"
                    break;
                case "userGender":
                    url = paramObj.url + "UserGenders"
                    break;
                case "city":
                    url = paramObj.url + "Provs"
                    break;
                case "userEducation":
                    url = paramObj.url + "UserEducations"
                    break;
                case "userIndustry":
                    url = paramObj.url + "UserIndustris"
                    break;
            }
            $.ajax({
                async: false,
                url: url,
                success: function (result) {
                    if (result.status == 200) {
                        res = result.body;
                    }
                },
                error: function (err) {
                    console.log(err);
                }
            })
            return res;
        }

        function getCityData(params) {
            var res;
            $.ajax({
                async: false,
                url: paramObj.url + "Cities",
                data: {
                    areaCode: params.code
                },
                success: function (result) {
                    if (result.status == 200) {
                        params.data[params.index]["childs"] = result.body;
                    }
                },
                error: function (err) {
                    console.log(err);
                }
            })
            res = params.data;
            return res;
        }

        $(".userNickName").click(function () {
            $.dialog({
                type: "confirm",
                onClickOk: function () {
                    if ($(".userName").val() != "") {
                        $(".userNickName").text($(".userName").val());
                        paramObj.formData.userNickName = $(".userName").val();
                    }
                },
                onClickCancel: function () {
                    return false;
                },
                contentHtml: `<span>新昵称</span><input type="text" class="userName" placeholder="请输入..."/>`
            });
        })

        $(".userEmail").click(function () {
            $.dialog({
                type: "confirm",
                onClickOk: function () {
                    if ($(".email").val() != "") {
                        $(".userEmail").text($(".email").val());
                        paramObj.formData.userEmail = $(".email").val();
                    }
                },
                onClickCancel: function () {
                    return false;
                },
                contentHtml: `<span>邮箱</span><input type="text" class="email" placeholder="请输入..."/>`
            });
        })
        var canvas = document.createElement("canvas"),
            ctx = canvas.getContext('2d'),
            //瓦片canvas
            tCanvas = document.createElement("canvas"),
            tctx = tCanvas.getContext("2d"),
            maxsize = 100 * 1024;

        $("#imgFile").change(function () {
            var formData = new FormData(),
                file = $('#imgFile')[0].files[0];
            formData.append("userHeadImage", file);
            var reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = function () {
                var result = this.result;
                var img = new Image();
                img.src = result;
                //如果图片大小小于100kb，则直接上传
                if (result.length <= maxsize) {
                    img = null;
                    uploadImg(formData);
                    return;
                }
                if (img.complete) {
                    callback();
                } else {
                    img.onload = callback;
                }

                function callback() {
                    var data = compress(img);
                    var blob = dataURLtoFile(data, file.name);
                    var formdata = new FormData();
                    formdata.append('userHeadImage', blob);
                    uploadImg(formdata);
                    img = null;
                }
            };
            reader.onloadend = (e) => {}
        });

        function uploadImg(formData) {
            $.ajax({
                type: "POST",
                url: paramObj.url + "UserImage",
                data: formData,
                dataType: "json",
                contentType: false,
                processData: false,
                success: function (result) {
                    // console.log(JSON.stringify(result));
                    if (result.status == 200) {
                        $(".userPic").css("background-image", "url(" + result.body + ")");
                        paramObj.formData.userHeadImage = result.body;
                    }
                },
                error: function (err) {
                    // console.log(JSON.stringify(result));
                    console.log(err);
                }
            })
        }

        function compress(img) {
            var width = img.width;
            var height = img.height;
            //如果图片大于四百万像素，计算压缩比并将大小压至400万以下
            var ratio;
            if ((ratio = width * height / 4000000) > 1) {
                ratio = Math.sqrt(ratio);
                width /= ratio;
                height /= ratio;
            } else {
                ratio = 1;
            }
            canvas.width = width;
            canvas.height = height;
            ctx.fillStyle = "#fff";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            //如果图片像素大于100万则使用瓦片绘制
            var count;
            if ((count = width * height / 1000000) > 1) {
                count = ~~(Math.sqrt(count) + 1); //计算要分成多少块瓦片
                // 计算每块瓦片的宽和高
                var nw = ~~(width / count);
                var nh = ~~(height / count);
                tCanvas.width = nw;
                tCanvas.height = nh;
                for (var i = 0; i < count; i++) {
                    for (var j = 0; j < count; j++) {
                        tctx.drawImage(img, i * nw * ratio, j * nh * ratio, nw * ratio, nh * ratio, 0, 0, nw, nh);
                        ctx.drawImage(tCanvas, i * nw, j * nh, nw, nh);
                    }
                }
            } else {
                ctx.drawImage(img, 0, 0, width, height);
            }
            //进行最小压缩
            var ndata = canvas.toDataURL('image/jpeg', 0.1);
            tCanvas.width = tCanvas.height = canvas.width = canvas.height = 0;
            return ndata;
        }

        function dataURLtoFile(dataurl, filename) { //将base64转换为文件
            var arr = dataurl.split(','),
                mime = arr[0].match(/:(.*?);/)[1],
                bstr = atob(arr[1]),
                n = bstr.length,
                u8arr = new Uint8Array(n);
            while (n--) {
                u8arr[n] = bstr.charCodeAt(n);
            }
            return new File([u8arr], filename, {
                type: mime
            });
        }

        $(".commit").click(function () {
            let paramData = {}
            for (let i in paramObj.formData) {
                if (paramObj.formData[i]) {
                    paramData[i] = paramObj.formData[i];
                }
            }
            if (Object.keys(paramData).length == 1) {
                $.dialog({
                    type: "alert",
                    onClickOk: function () {
                        return false;
                    },
                    autoClose: 0,
                    contentHtml: `<p style="text-align:center;">未修改任何信息，请修改后在保存。</p>`
                });
            } else {
                $.ajax({
                    type: "post",
                    url: paramObj.url + "UserDetail",
                    contentType: "application/json",
                    beforeSend: function (xhr) {
                        xhr.setRequestHeader("Authentication", paramObj.token);
                    },
                    data: JSON.stringify(paramData),
                    success: function (result) {
                        if (result.status == 200) {
                            $.dialog({
                                type: "alert",
                                onClickOk: function () {
                                    return false;
                                },
                                autoClose: 0,
                                contentHtml: `<p style="text-align:center;">修改成功</p>`
                            });
                            $(".commit").disabled = true;
                        } else if (result.status == 400) {
                            $.dialog({
                                type: "alert",
                                onClickOk: function () {
                                    return false;
                                },
                                autoClose: 0,
                                contentHtml: `<p style="text-align:center;">修改失败</p>`
                            });
                        } else if (result.status == 401) {
                            redirectUrl();
                        }
                    },
                    error: function (err) {
                        console.log(err);
                    }
                })
            }
        })
    }
    $(".banner .back").click(function () {
        window.location.href = "./../myself.html";
    })
});