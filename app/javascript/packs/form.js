import Common from "./common.js"
import SignaturePad from "signature_pad"

class Form extends Common {
  constructor() {
    super();
    var CI = this;
    this.showTab(this.currentTab);
    this.getFormDetails("#car-emission-form")
    this.canvas = document.getElementById("signature-pad");
    this.signaturePad = new SignaturePad(this.canvas, {
      backgroundColor: 'rgb(250,250,250)'
    });

    window.Parsley.on('field:error', function() {
      $(".step").removeClass("in-progress")
    });

    $('.check-issue-date').click(function(){        
      CI.nextStep(1)
      if ($(".first_name").val() != '' && $(".last_name").val() != '') {
        var full_name = $(".first_name").val() + " " + $(".last_name").val()
        $('.full-name').text(full_name);
        $('.success-name').text($(".first_name").val())
      }
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
    
    $( document ).ready(function() {

        if($("input[name='owner-period']").is(':checked')){
          CI.setBoughtTime($("input[name='owner-period']:checked").attr("id"))
          CI.setSoldTime($("input[name='owner-period']:checked").attr("id"))
        }

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
      let page = CI.getUrlParameter("page_name")
      var params = '?'+window.location.search.split('&').slice(1).join('&')
      var urlParts = params.split('?');
      var params = new URLSearchParams(urlParts[1]);
      params.delete('page_name');
      params = urlParts[0] + '?' + params.toString()
      console.log(params);
      if (page == '/home') {
        window.location = `${page}${params}`
      } else
      {
        window.location = `/${params}`
      }
      
    })

    $(".btn-next").click(function(){
      CI.nextStep(1)
      if ($(".first_name").val() != '' && $(".last_name").val() != '') {
        var full_name = $(".first_name").val() + " " + $(".last_name").val()
        $('.full-name').text(full_name);
        $('.success-name').text($(".first_name").val())
      }
    }) 

    $('.owner-period').change(function(){
      CI.setBoughtTime(event.currentTarget.id)
      CI.setSoldTime(event.currentTarget.id)
    })

    $(".btn-back").click(function(){
      CI.backStep(-1)
    }) 
  }
  
  checkIssuanceDate(bought_year,sold_year){
    return (parseInt(bought_year) <= 2009 && parseInt(sold_year) >= 2009) || (parseInt(bought_year) >= 2009 && parseInt(bought_year) <= 2019 && parseInt(sold_year) >= 2009)
  }

  setBoughtTime(id){
    this.bought = $(`label[for=${id}]`).find('.to-date').text()
  }

  setSoldTime(id){
    this.sold = $(`label[for=${id}]`).find('.from-date').text()
  }

  resizeCanvas() {
    const ratio =  Math.max(window.devicePixelRatio || 1, 1);
    this.canvas.width = this.canvas.offsetWidth * ratio;
    this.canvas.height = 175 * ratio;
    this.canvas.getContext("2d").scale(ratio, ratio);
    this.signaturePad.clear(); // otherwise isEmpty() might return incorrect value
  }
}
export default new Form();
