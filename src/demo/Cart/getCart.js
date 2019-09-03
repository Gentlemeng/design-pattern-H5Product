import $ from "jquery"
import { GET_USERBALANCE } from "../config/config";

class Cart{
    constructor(){
        this.$el = $(`<div class="settlement_wrap"></div>`)
        this.balance;
        this.amount;
        this.init();
    }
    init(){
        this.loadBalance().then(data=>{
            // console.log(data);
            this.balance = data.goldTotal;
        }).then(()=>{
            this.initContent()
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
                                <div class="total_text">共计：<span class="total_price">0</span><span class="product_unit">金币</span></div>
                                <div class="total_save">已优惠<span class="total_save_price"></span><span>金币</span></div>
                            </div>`)
        let settlement = $(`<div class="settlement">
                                <button class="btn_settlement">结算</button>
                            </div>`)
        this.$el.append(balanceWrap);
        this.$el.append(totalWrap);
        this.$el.append(settlement);
    }
    initBtn(){

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