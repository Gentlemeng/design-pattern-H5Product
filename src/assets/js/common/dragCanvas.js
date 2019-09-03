var CanvasDrag = function(param){
    this.id = ''||param.canvasId;
    //jquery元素
    this.canvas = $(this.id);
    this.indexUl = null;
    this.valueDoms =[];
    this.ctx = this.canvas[0].getContext("2d");
    //偏移值
    this.axisDis = 40;
    this.axisXDis = 30;
    //坐标轴宽度
    this.axisLineWidth = param.axisLineWidth||1;
    this.canvasWidth = 0;
    this.canvasHeight = 0;
    this.axisXLen = 0;
    this.axisYLen = 0;
    this.dragRange = 20;
    this.step = 0;
    this.lastHistoryValue = param.lastHistoryValue||0;
    this.overdue = param.overdue;
    //上传数据使用的x轴日期
    this.xData = param.xData||[];//[2018-12,2019-01,2019-02,...]
    //展示使用的x轴日期
    this.xDataForShow = param.xDataForShow;
    //用户预测数据
    this.yData = param.yData;
    //图表显示范围
    this.rangeMax = param.rangeMax;
    this.rangeMin = param.rangeMin;
    //可拖拽到的最大、最小值
    this.yMaxData = param.yMaxData;
    this.yMinData = param.yMinData;
    // y轴坐标轴数据
    this.axisYData = [];
    this.rotateArrowAngle = 50;
    //标点的x坐标
    this.points = [];
    this.result = [];
    //是否预测,控制渲染时是否画线
    this.isPreview = param.isPreview;
    //被选中指标值索引
    this.activeIndex = 0;
    //指标最小变化单位
    this.valueRange = 0.1;
    //y轴step
    this.yStep=0;
};
CanvasDrag.prototype = {
    init:function(previewBtn,submitBtn){
        var _this =this;
        //初始化预测结果
        this.xData.forEach(function(month,index){
            _this.result.push({"month" :month,"value" :_this.yData[index]});
        })
        //生成y轴数据
        this.getAxisData();
        this.drawing();
        this.initEvent(previewBtn,submitBtn);
        //计算可拖拽最大值、最小值
        this.dragMaxValue = this.valueToPx(this.yMaxData);
        this.dragMinValue = this.valueToPx(this.yMinData);
    },
    getAxisData:function(){
        var yRange = this.rangeMax - this.rangeMin;
        // y轴元素字符长度集合
        var yDataStrArr = [];
        //y轴足以分成六份（最小单位0.1）
        if(yRange>0.5){
            this.yStep = Number((yRange/5).toFixed(1));
        }else{
            this.yStep = Number((yRange/5).toFixed(2));            
        }
        for(var i=0;i<5;i++){
            var value = (this.rangeMin + this.yStep*i).toFixed(2) + ''
            this.axisYData.push(value);
            yDataStrArr.push(value.length);
        }
        this.axisYData.push(this.rangeMax.toFixed(2)+'');
        yDataStrArr.push((this.rangeMax+'').length);
        this.yMax = this.axisYData[this.axisYData.length-1];
        //根据this.axisYData中元素的长度，动态赋值axisDis
        for(var i=0;i<yDataStrArr.length-1;i++){
            for(var j=0;j<yDataStrArr.length-1-i;j++){
                if(yDataStrArr[j]>yDataStrArr[j+1]){
                    var temp = yDataStrArr[j];
                    yDataStrArr[j] = yDataStrArr[j+1];
                    yDataStrArr[j+1] = temp;
                }
            }
        }
        var yDataMaxStr = yDataStrArr[yDataStrArr.length-1];
        //y值位数过长
        // var dynamicDis = yDataMaxStr>=5?yDataMaxStr*9:yDataMaxStr*10;
        var dynamicDis = yDataMaxStr*10;
        this.axisDis = dynamicDis<40?this.axisDis:dynamicDis;
    },
    createUlDom:function(){
        var _this = this;
        //动态创建加减按钮
        this.handleWrap = document.createElement("div");
        this.handleWrap.className = "handleWrap";
        this.addBtn = document.createElement("button");
        this.reduceBtn = document.createElement("button");
        this.addBtn.className = "index_btn add_value";
        this.reduceBtn.className = "index_btn reduce_value";
        this.addBtn.innerText = "+";
        this.reduceBtn.innerText = "-";
        $(this.addBtn).attr({"valueRange":this.valueRange})
        $(this.reduceBtn).attr({"valueRange":-this.valueRange})
        this.handleWrap.appendChild(this.reduceBtn);
        this.handleWrap.appendChild(this.addBtn);
        this.canvas.parent().before(this.handleWrap);
        //动态创建y值显示区域
        $(`${this.id} .index_value_ul`).remove();
        this.indexUl = document.createElement('ul');
        this.indexUl.className = 'index_value_ul';
        // var ulWidth = this.canvasWidth-this.axisDis;
        var ulMarginLeft = this.axisDis+this.step/2;
        $(this.indexUl).css({"width":this.axisXLen})
        $(this.indexUl).css({"margin-left":ulMarginLeft})
        //创建显示指标值dom(li)
        var listArr = this.yData||this.xDataForShow;//获取预测长度
        listArr.forEach((value,index)=>{
            var valueDom = document.createElement("p");
            var indexLi = document.createElement("li");
            valueDom.className = "index_value";
            valueDom.innerText = _this.yData[index];
            indexLi.className = "index_value_list";
            indexLi.appendChild(valueDom);
            this.indexUl.appendChild(indexLi);
            this.valueDoms.push(valueDom);
        })
        //默认第一个active
        $(this.indexUl).find(".index_value").eq(0).addClass("active");
        this.canvas.parent().before(this.indexUl);
        this.watchValueChange();
    },
    //监听用户点击操作
    watchValueChange:function(){
        var _this = this;
        var ctx =this.ctx;
        $(".index_value").on("click",function(){
            if(!$(this).hasClass("active")){
                _this.activeIndex = $(this).parent().index();
                $(this).parent().siblings().find("p").removeClass("active");
                $(this).addClass("active")
            }
        })
        $(_this.handleWrap).on("click",".index_btn",function(){
            if(_this.overdue!="Y"){
                dialogAlert(`当前该指标正处于上轮活动结算期，暂无法预测，请选择本轮活动期内指标进行预测。`,0)
                return false;
            }else{
                var activeDom = $(_this.indexUl).find(".index_value").eq(_this.activeIndex);
                var initValue = Number(activeDom.text());
                var newValue = initValue+Number($(this).attr("valueRange"));
                //判断是否超出最大值和最小值
                // if(newValue > _this.rangeMax + _this.yStep || newValue < _this.rangeMin){
                if(newValue > _this.yMaxData || newValue < _this.yMinData){
                    newValue = initValue;
                    dialogAlert(`已超出规定最大值或最小值`)        
                    return false;
                }
                _this.clear(ctx);
                //value转px
                var offsetY = _this.valueToPx(newValue);
                _this.points[_this.activeIndex]["y"] = offsetY;
                _this.drawAxisX(ctx);
                _this.drawAxisY(ctx);
                _this.drawXPoint();
                _this.result[_this.activeIndex]["value"]=Number((newValue).toFixed(1));
                //赋值
                activeDom.text(newValue.toFixed(1));
            }
        })
    },
    drawing:function(){
        let ctx = this.ctx;
        let _this = this;
        //设置宽高(为父元素chart的宽高)
        this.canvasWidth = Math.floor(this.canvas.parent().width()), 
        this.canvasHeight = Math.floor(this.canvas.parent().height());
        this.canvas.attr({"width":Math.floor(this.canvasWidth),"height":Math.floor(this.canvasHeight)});
        //处理y轴距离左侧过长

        // if(this.axisDis>40){
        //     this.axisXLen = this.canvasWidth*3.5/5

        // }else{
        //     this.axisXLen = this.canvasWidth*4/5;
        // }
        this.axisXLen = (this.canvasWidth-this.axisDis)*4.5/5
        this.axisYLen = this.canvasHeight*3.55/5;
        //重新为历史点赋值
        this.lastHistoryValue = this.valueToPx(this.lastHistoryValue);
        this.step = this.axisXLen/this.xDataForShow.length;
        this.dragRange = this.step/3;
        //坐标轴原点转换
        ctx.translate(this.axisDis, this.canvasHeight-this.axisXDis);//定位坐标轴圆点
        ctx.rotate(this.getRad(180))
        ctx.scale(-1, 1);
        ctx.save();
        // //画坐标轴
        this.drawAxisX();
        this.drawAxisY();
        //第一限象中的文字说明
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = this.lineWidth;
        ctx.beginPath();
        ctx.font = "12px SimSun";
        ctx.fillStyle = "#fff";
        //将yData中的值放入input输入框
        this.createUlDom();        
        //将yData中的值转化成y坐标轴的值
        if(this.yData){
            this.yData = this.yData.map(function(value){
                return _this.valueToPx(value);
            })
        }
         //初始化points坐标
         if(this.isPreview){
            for (var i = 0; i < _this.yData.length; i++) {
                this.points.push({
                    x: parseInt(this.step) * (i + 1),
                    y: this.yData[i]
                });
            }
            //禁止拖拽
            this.drawLine();
        }else{
            for (var i = 0; i < _this.yData.length; i++) {
                this.points.push({
                    x: parseInt(this.step) * (i + 1),
                    y: 0
                });
            }
        }
        this.drawXPoint();
    },
    drawXPoint:function(){
        let ctx = this.ctx;
        ctx.beginPath();
        ctx.fillStyle="#fff";
        ctx.arc(0, this.lastHistoryValue, 4, Math.PI * 2, 0, true);
        ctx.closePath();
        ctx.fill();
        this.points.forEach((point,index)=>{
            var radial = ctx.createRadialGradient(point.x,point.y,2,point.x,point.y,5); //重合的圆心坐标
            radial.addColorStop(0, 'rgba(255,255,255,1)');
            // radial.addColorStop(0.2, 'rgba(0,255,255,1)');
            radial.addColorStop(0.2, 'rgba(0,255,255,1)');
            radial.addColorStop(0.4, 'rgba(0,255,255,0.8)');
            // radial.addColorStop(0.8, 'rgba(0,255,255,0.4)');
            radial.addColorStop(1, 'rgba(0,255,255,0.2)');
            ctx.beginPath()

            ctx.fillStyle = radial;
            ctx.arc(point.x, point.y, 5, Math.PI * 2, 0, true);
            ctx.closePath();
            ctx.fill();
        })
    },
    drawAxisX: function () {
        var ctx = this.ctx;
        ctx.save();
        ctx.lineWidth = this.axisLineWidth;
        ctx.font = "10px SimSun";
        ctx.strokeStyle = '#fff';
        ctx.fillStyle = '#fff';
        // 画刻度
        var y = -5;
        var index = 0;
        ctx.scale(1, -1);
        //写文字
        for (var i = this.step; i <= this.axisXLen; i += this.step) {
            i = Math.floor(i);
            var xLable = this.xDataForShow[index];
            var xLableDis = Math.ceil(xLable.length/2)*8
            //参数一：显示的刻度值
            //参数二：显示水平位置,距离y轴的偏移量
            //参数三：显示的垂直位置，距离x轴的偏移量
            ctx.fillText(xLable, i-xLableDis, 20);
            index++;  
        }
        ctx.restore();
    },
    drawAxisY: function () {
        var ctx = this.ctx;
        ctx.save();
        ctx.lineWidth = this.axisLineWidth;
        ctx.font = "14px SimSun";
        ctx.strokeStyle = '#fff';
        ctx.fillStyle = '#fff';
        // 画轴
        ctx.beginPath();
        ctx.moveTo(-0.5, 0);
        ctx.lineTo(-0.5, this.axisYLen);
        ctx.stroke();
        ctx.closePath();
        ctx.scale(1, -1);
        var x = -30;
        // 画刻度、写文字
        this.axisYData.forEach((value, i) => {
            //刻度水平线
            ctx.beginPath();
            ctx.strokeStyle = 'rgba(255,255,255,0.3)';
            ctx.fillStyle = 'rgba(255,255,255,0.3)';
            var positionY = parseInt(-this.axisYLen / 5 * i)-0.5
            // console.log(positionY+'------'+this.axisYLen / 6 * i);
            ctx.moveTo(0, positionY);
            ctx.lineTo(this.axisXLen, -this.axisYLen / 5 * i);
            ctx.stroke();
            ctx.closePath();
            var valueLen = value.length;
            var disY;
            switch(valueLen)
            {
                case 1:
                    disY = -valueLen*12.5;    
                    break;
                case 2:
                    if(value.indexOf("-")===0){
                        disY = -valueLen*9.5
                    }else{
                        disY = -valueLen*9.8;
                    }
                    break;
                case 3:
                    if(value.indexOf("-")===0){
                        disY = -valueLen*8.8
                    }else{
                        disY = -valueLen*8.5;
                    }
                    break;
                case 4:
                    if(value.indexOf("-")===0){
                        disY = -valueLen*7.5
                    }else{
                        disY = -valueLen*8;
                    }
                    break;
                case 5:
                    if(value.indexOf("-")===0){
                        disY = -valueLen*7.2
                    }else{
                        disY = -valueLen*7.5;
                    }
                    break;
                case 6:
                    disY = -valueLen*7;
                    break;
                default:
                    disY = -valueLen*8;
            }
            // y轴值
            ctx.beginPath();
            ctx.strokeStyle = '#fff';
            ctx.fillStyle = '#fff';
            ctx.fillText(value, disY , -this.axisYLen / 5 *i);
            ctx.stroke();
            ctx.closePath();
        })
        //画单位
        ctx.beginPath();
        // ctx.lineTo(0, this.axisYLen / 2);
        ctx.fillText("%",-5,-this.axisYLen-10)
        ctx.stroke();
        ctx.closePath();
        ctx.restore();
    },
    initEvent:function(previewBtn,submitBtn){
        var _this = this;
        this.canvas[0].ontouchstart = function(e){
            _this.touchstart(e,_this);
        };
        this.canvas[0].ontouchend = function(e){
            _this.touchend(e,_this)
        };
        previewBtn.on("click",function(e){
            if(_this.overdue!="Y"){
                dialogAlert(`当前该指标正处于上轮活动结算期，暂无法预测，请选择本轮活动期内指标进行预测。`,0)
                return false;
            }else{
                _this.drawAxisX();
                _this.drawAxisY();
                _this.drawLine();
            }
            
        })
    },
    touchstart: function (e,_this) {
        // e.stopPropagation();
        var ctx = _this.ctx;
        //获取点击的位置距离canvas左下角位置
        var bbox = this.canvas[0].getBoundingClientRect();
        var offsetX = e.changedTouches[0].clientX - bbox.left - _this.axisDis,
            offsetY = _this.canvasHeight-(e.changedTouches[0].clientY - bbox.top)-_this.axisXDis;

        //判断选中的标点是否为图中的点
        var flag = {
            canimove: false
        };
        //touchstart的位置在任意小球上
        for (var i = 0; i < _this.points.length; i++) {
            //允许拖拽范围：水平方向左右为两点之间距离的1/3，垂直方向左右为两点之间距离的1/3
            if ((offsetX > _this.points[i].x - _this.dragRange && offsetX < _this.points[i].x + _this.dragRange) && (offsetY > _this.points[i].y - _this.dragRange && offsetY < _this.points[i].y + _this.dragRange)) {
                flag.canimove = true;
                flag.i = i;
                break;
            }
        };
        _this.canvas[0].ontouchmove=function(e){
            if (flag.canimove) {
                if(_this.overdue!="Y"){
                    dialogAlert(`当前该指标正处于上轮活动结算期，暂无法预测，请选择本轮活动期内指标进行预测。`,0)
                    return false;
                }
                //切换顶部值显示框
                $(_this.indexUl).find(".index_value").removeClass("active").eq(flag.i).addClass("active");
                _this.activeIndex = flag.i;
                // console.log(flag.i);
                //每次绘制前先清除之前绘制的图形
                _this.clear(ctx);
                //获取点击的位置距离canvas左下角位置
                var bbox = _this.canvas[0].getBoundingClientRect();
                // e.changedTouches[0].clientY/clientX  鼠标距离body的top/left
                // bbox.top  canvas距离body的top
                var offsetX = e.changedTouches[0].clientX - bbox.left - _this.axisDis,
                    offsetY = _this.canvasHeight-(e.changedTouches[0].clientY - bbox.top)-_this.axisXDis;
                
                if (offsetY <= _this.dragMinValue) {
                    offsetY = _this.dragMinValue;
                }
                if (offsetY >= _this.dragMaxValue) {
                    offsetY = _this.dragMaxValue;
                }

                //计算值：滑动距离*比率（需除100）px转value
                var value = _this.pxToValue(offsetY)

                _this.result[flag.i]["value"]=value;
                //换算后，赋值给input展示               
                $(_this.indexUl).find("li").eq(flag.i).find("p").text((value).toFixed(1));

                _this.points[flag.i].y = offsetY;
                _this.drawAxisX(ctx);
                _this.drawAxisY(ctx);
                _this.drawXPoint();
                return false;
            }
        }
    },
    touchend:function(e,_this){
        _this.canvas[0].ontouchmove = null;
    },
    drawLine:function() {
        var ctx = this.ctx;
        //清除画布
        this.clear(ctx);
        ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
        // console.log(clickPointPos);
        this.drawAxisX();
        this.drawAxisY();
        this.points.unshift({x:0,y:this.lastHistoryValue});
        for (var i = 0; i < this.points.length; i++) {
            if (i == 0) {
                ctx.moveTo(this.points[i].x, this.points[i].y);
            } else { //注意是从1开始
                //设置控制点
                var ctrlP = this.getCtrlPoint(this.points, i - 1);
                ctx.bezierCurveTo(ctrlP.pA.x, ctrlP.pA.y, ctrlP.pB.x, ctrlP.pB.y, this.points[i].x, this.points[i].y);
                //ctx.fillText("("+point[i].x+","+point[i].y+")",point[i].x,point[i].y);
            }
        }
        ctx.strokeStyle="#00ffff";
        //画线函数
        ctx.stroke();
        this.points.shift();
        this.drawXPoint();

    },
    //y坐标轴值转真实值
    pxToValue:function(offsetY){
        return parseFloat((offsetY*(this.rangeMax-this.rangeMin)/(this.axisYLen)+this.rangeMin).toFixed(1));
    },
    //真实值转化成y坐标轴值
    valueToPx:function(value){
        // return value*this.axisYLen/this.yMax;
        return (value-this.rangeMin)*(this.axisYLen)/(this.rangeMax-this.rangeMin);
    },
    clear:function(ctx) {
        //移到左上角清除画布
        ctx.clearRect(0 - this.axisDis, 0 - this.canvasHeight / 2, this.canvasWidth * 2, this.canvasHeight * 2);
    },
    /*
     *根据已知点获取第i个控制点的坐标
     *param ps	已知曲线将经过的坐标点
     *param i	第i个坐标点
     *param a,b	可以自定义的正数
     */
    getCtrlPoint:function(ps, i, a, b) {
        if (!a || !b) {
            a = 0.25;
            b = 0.25;
        }
        //处理两种极端情形
        if (i < 1) {
            var pAx = ps[0].x + (ps[1].x - ps[0].x) * a;
            var pAy = ps[0].y + (ps[1].y - ps[0].y) * a;
        } else {
            var pAx = ps[i].x + (ps[i + 1].x - ps[i - 1].x) * a;
            var pAy = ps[i].y + (ps[i + 1].y - ps[i - 1].y) * a;
        }
        if (i > ps.length - 3) {
            var last = ps.length - 1
            var pBx = ps[last].x - (ps[last].x - ps[last - 1].x) * b;
            var pBy = ps[last].y - (ps[last].y - ps[last - 1].y) * b;
        } else {
            var pBx = ps[i + 1].x - (ps[i + 2].x - ps[i].x) * b;
            var pBy = ps[i + 1].y - (ps[i + 2].y - ps[i].y) * b;
        }
        return {
            pA: {
                x: pAx,
                y: pAy
            },
            pB: {
                x: pBx,
                y: pBy
            }
        }
    },
    //角度转弧度 
    getRad:function(degree) {
        return degree / 180 * Math.PI;
    }
}