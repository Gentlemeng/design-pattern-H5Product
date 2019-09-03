import "./../assets/css/common/reset.css"
import "./../assets/css/common/base.css"
import "./../assets/css/dist/dialog.css"
import "./../assets/css/Secondary_page/product_center.css"

import App from "./api/App";
let app = new App("product_slide")
app.init();
document.getElementsByTagName("title")[0].innerHTML = "腾景经济预测",
function () {
    var e = document.documentElement.clientWidth / 750;
    document.documentElement.style.fontSize = 100 * e + "px";
}();