import Common from "./common.js"
import SignaturePad from "signature_pad"
class Diesel extends Common {
  constructor() {
    super();
    var CI = this;
    CI.ownership_year = []
    CI.sold_year = ''
    CI.result = 0
    this.fillform()
		this.getFormDetails("#car-emission-form")
		this.canvas = document.getElementById("signature-pad");
    this.signaturePad = new SignaturePad(this.canvas, {
      backgroundColor: 'rgb(250,250,250)'
    });
    $('.register-btn').click(function(){
      var reg_num = $('.reg-number').val()
      CI.getCarDetails(reg_num)
    })
    $('#reg-number').keypress(function(event) {
        if (event.which === 13) {
          event.preventDefault();
          var reg_num = $('.reg-number').val()
          CI.getCarDetails(reg_num)
        }
    });
    $( document ).ready(function() {
        window.addEventListener("resize", CI.resizeCanvas());
        CI.resizeCanvas();

        document.getElementById("clear").addEventListener('click', function(){
          CI.signaturePad.clear();
          $("#signatureInput").val("")
        })

        CI.signaturePad.addEventListener("endStroke", () => {
          $("#signatureInput").val(CI.signaturePad.toDataURL())
          $('#car-emission-form').parsley().validate({group: 'block-3'})
        });
    })

    $(".restart-btn").click(function(){
      let page = window.location.pathname
      var params = window.location.search
      if (page == '/diesel') {
        window.location = `${page}${params}`
      }else
      {
        window.location = `/${params}`
      }
    })

    $('#vehicle-purchase').on('change', function(){
      CI.sold_year = ''
      CI.result = 0
      CI.getSoldDate()
    })

    $( ".property" ).change(function() {
      $('.towncity').val($(this).find("option:selected").data("city"))
      $('.street1').val($(this).find("option:selected").data("street"))
      $('.county').val($(this).find("option:selected").data("province"))
      $('.houseNumber').val($(this).find("option:selected").data("house-number"))
      $('.street2').val($(this).find("option:selected").data("street2"))
      $('.building').val($(this).find("option:selected").data("building"))
      $('.address').val($(this).find("option:selected").data("address"))
    });

    $(".btn-next").click(function(){
      window.scrollTo({ top: 200, behavior: 'smooth' });
      CI.nextStep(1)
      if ($(".first_name").val() != '' && $(".last_name").val() != '') {
        var full_name = $(".first_name").val() + " " + $(".last_name").val()
        $('.full-name').text(full_name);
        $('.success-name').text($(".first_name").val())
      }
    }) 

    $(".btn-back").click(function(){
      window.scrollTo({ top: 200, behavior: 'smooth' });
      CI.backStep(-1)
    }) 
  }

  fillform(){
    $("input[name=title][value=" + this.getUrlParameter('title') + "]").prop('checked', true);
    $(".first_name").val(this.getUrlParameter("firstname") || "");
    $(".reg-number").val(this.getUrlParameter("reg_num") || "");
    $(".last_name").val(this.getUrlParameter("lastname")  || "");
    $(".postcode").val(this.getUrlParameter("postcode") || "");
    $(".email").val(this.getUrlParameter("email")  || "");
    $(".phone").val(this.getUrlParameter("phone1") || this.getUrlParameter("mobile") || "");
  }

  checkIfRejected(){
    var CI = this
    var purchaseDate = $( "#vehicle-purchase option:selected" ).val() || "";
    var mandatoryRectification = $('.mandatory').val()
    var voluntaryRectification = $('.voluntary').val()
    return ((mandatoryRectification == 'false' && voluntaryRectification == 'false') || (mandatoryRectification == '' && voluntaryRectification == '') || (purchaseDate > 2019 || purchaseDate.toLowerCase().replace(/\s/g, '') == 'dontremember'))
  }

  fixStepIndicator(num) {
    var progress = document.getElementById('progressBar');
    if(num > 0) {
      progress.style.width = ((num+1) *20)+"%";
      $('.progress-percent').text(((num+1)*20) + "%" + " Complete");
      $('.progress-steps').text("Step " + (num + 1) + "/5");
    }
  }

	getCarDetails(reg_num){
    var CI = this
    $.ajax({
      type: "GET",
      url: `/car_data?reg_num=${reg_num}`  ,
      success: function(data) {
        if (data.status == 400) {
          if (!$(".error-402").hasClass("d-none")) {
            $(".error-402").addClass("d-none");
          }
          $(".error-400").removeClass("d-none");
        }else if (data.status == 402) {
          if (!$(".error-400").hasClass("d-none")) {
            $(".error-400").addClass("d-none");
          }
          $(".error-402").removeClass("d-none");
        }else{
          $(".error-402").addClass("d-none");
          $(".error-400").addClass("d-none");
          $(".car-title").html(data.response.car_title);
          $(".voluntary").val(data.response.voluntaryRectification)
          $(".mandatory").val(data.response.mandatoryRectification)
          CI.nextStep(1)
          data.response.ownership_period.forEach(function(date){
            CI.ownership_year.push(date.split('-')[0])
          })
          CI.ownership_year.push(data.response.first_date.split('-')[0])
        }
      },
    })
  }

  getSoldDate(){
    var CI = this
    var purchase_date = $("#vehicle-purchase option:selected").val()
    if (purchase_date.toLowerCase().replace(/\s/g, '') != 'dontremember') {
      if (CI.ownership_year.includes(purchase_date.toString())) {
        CI.ownership_year.forEach(function(date, index){
          if (purchase_date.toString() == date) {
            if (index-1 >= 0) {
              CI.sold_year = CI.ownership_year[index-1]
            }
            else{
              CI.sold_year = new Date().getFullYear()
            }
          }
        })
      }else{
        var position = 0
        CI.ownership_year.forEach(function(date, index){
          var diff = purchase_date - parseInt(date)
          if (CI.result > Math.abs(diff) || CI.result == 0) {
            position = index
            CI.result = Math.abs(diff)
          }
        })
        if (position-1 >= 0){
          CI.sold_year = CI.ownership_year[position-1]
        }else{
          CI.sold_year = new Date().getFullYear()
        }
      }
    }else{
      CI.sold_year = 'dont remember'
    }
  }

  resizeCanvas() {
    const ratio =  Math.max(window.devicePixelRatio || 1, 1);
    this.canvas.width = this.canvas.offsetWidth * ratio;
    this.canvas.height = 175 * ratio;
    this.canvas.getContext("2d").scale(ratio, ratio);
    this.signaturePad.clear(); // otherwise isEmpty() might return incorrect value
  }
}                                                                                                 
export default new Diesel();
