import $ from "jquery"
import { GET_USERBALANCE } from "../config/config";

class Cart{
    constructor(){
        this.$el = $(`<div class="settlement_wrap"></div>`)
        this.list = [];
        this.balance;
        this.amount = 0;
        this.save = 0;
        this.init();
    }
    init(){
        this.loadBalance().then(data=>{
            // console.log(data);
            this.balance = data.goldTotal;
        }).then(()=>{
            this.initContent()
            this.initBtn();
        })
    }
    loadBalance(){
        return fetch(GET_USERBALANCE).then(data=>{
            if(data.ok){
                return data.json();
            }
        })
    }
    initContent(){
        let balanceWrap = $(`<div class="balance_wrap">
                                金币余额：<span class="balance_num">${this.balance}</span><span class="product_unit">金币</span>
                            </div>`)
        let totalWrap = $(`<div class="total_wrap">
                                <div class="total_text">共计：<span class="total_price">${this.amount||0}</span><span class="product_unit">金币</span></div>
                                <div class="total_save">已优惠<span class="total_save_price"></span><span>金币</span></div>
                            </div>`)
        
        this.$el.append(balanceWrap);
        this.$el.append(totalWrap);
    }
    initBtn(){
        let _this = this;
        let settlement = $(`<div class="settlement">
                                <button class="btn_settlement">结算</button>
                            </div>`)
        settlement.click(function(){
            confirm(`需支付${_this.amount}金币，点击确定前往支付。`)
        })
        this.$el.append(settlement);
    }
    add(data){
        this.list.push(data);
        // console.log(this.list);
        this.computeAmount()
        
    }
    del(id){
        this.list = this.list.filter((data)=>{
            if(id==data.indexId||id==data.moduleCombineId){
                return false
            }else{
                return true;
            }
        })
        this.computeAmount();
    }
    computeAmount(){
        let amount = 0,save = 0;
        this.list.forEach((productData)=>{
            amount += productData.indexGoldCoinAttribute||productData.totalPrice;
            save += productData.freePrice||0;
        })
        this.amount = amount;
        this.save = save;
        $(".total_price").text(this.amount)
        $(".total_save_price").text(this.save);
    }
    render(){

    }
}

let getCart = (function(){
    let cart;
    return function(){
        if(!cart){
            cart = new Cart();
        }
        return cart;
    }
})()
export default getCart;