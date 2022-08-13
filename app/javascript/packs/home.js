import Common from "./common.js"

class Home extends Common {
  constructor() {
    super();
    var CI = this;
    $('.register-btn').click(function(){
      var reg_num = $('.reg-number').val()
      CI.getCarData(reg_num)
    })
    $('#reg-number').keypress(function(event) {
        if (event.which === 13) {
          event.preventDefault();
          var reg_num = $('.reg-number').val()
          CI.getCarData(reg_num)
        }
    });
  }
}
export default new Home();
