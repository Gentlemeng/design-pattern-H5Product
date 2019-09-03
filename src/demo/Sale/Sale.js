import $ from "jquery"
import { BaseList, CompositeList } from "../ProductList/ProductList";

export default class Sale{
    constructor(id){
        this.$el = $("#"+id);
    }
    init(){
        this.initBaseList();
    }
    initBaseList(){
        let baseList = new BaseList(this,"basic_module","基础版块");
        baseList.init();
    }
    initCompositeList(){
        let compositeList = new CompositeList(this,"group_module","更多优惠组合");
        compositeList.init();
    }
}