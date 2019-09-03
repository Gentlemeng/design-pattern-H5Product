import $ from "jquery"
import Sale from "../Sale/Sale";
import getCart from "../Cart/getCart";

export default class App{
    constructor(id){
        this.$el = $("#"+id)
    }
    init(){
        this.initSale();
        this.initCart();
    }
    initSale(){
        let sale = new Sale("product_wrap")
        sale.init();
    }
    initCart(){
        let cart = getCart();
        this.$el.append(cart.$el);
    }
}