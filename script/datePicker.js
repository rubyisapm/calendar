/**
 * Created by rubyisapm on 15/9/22.
 */


$.fn.extend({
  datePicker: function (ops) {

    /*
    * double: true or false 是否为双日历
    * date:具体日期如'2015/10/10'或具体阶段'2015/10/10-2016/1/1'，用于指定初始化日期
    * switchYM: true or false 是否可以进行年月的select选择
    * partner: 为一个input(jquery对象)
    * clear : true or false
    * beginDate:'',//double中的开始日期
    * endDate:''//double中的结束日期
    * */

    var helper={
      initInput:function($input){
        if($input.ops.double){
          $input.val($input.ops.beginDate+'-'+$input.ops.endDate);
        }else{
          $input.val($input.ops.date);
        }
      },
      initShell:function($input){
        var pos = this.positionShell($input),
          shell='';
        if($input.ops.double){
          shell=$('<div ' +
          'class="shell double" ' +
          'style="top:' + pos.top + ';left:' + pos.left + '">' +
          '<div class="buttons">' +
          '<span class="clear">清 空</span>' +
          '<span class="sure">确 定</span>' +
          '</div>' +
          '<span class="buttonIcon btn_close">关闭</span>' +
          '</div>');
        }else{
          shell=$('<div ' +
          'class="shell" ' +
          'style="top:' + pos.top + ';left:' + pos.left + '">' +
          '</div>')
        }
        $('body').append(shell);
        $input.shell=shell;
      },
      positionShell: function ($input) {
        var x = $input.offset().left,
          y = $input.offset().top,
          h = parseInt($input.outerHeight());
        return {
          top: y + h + 'px',
          left: x + 'px'
        }
      },
      initCalendar:function($input){
        var ops=$input.ops;
        if($input.ops.double){
          //双日历的处理

          var ops_begin= $.extend({},ops),
            ops_end= $.extend({},ops);
          ops_begin.date=ops_begin.beginDate;
          ops_begin.close=false;
          delete ops_begin.beginDate;
          ops_end.date=ops_end.endDate;
          ops_end.close=false;
          delete ops_end.endDate;

          ops_begin.callback=function(){
            this.partner.decorateCurrentMonth();
          }
          ops_end.callback=function(){
            this.partner.decorateCurrentMonth();
          }

          var beginCalendar=new Calendar(ops_begin),
            endCalendar=new Calendar(ops_end);
          endCalendar.setPartner(beginCalendar,false);
          $input.beginCalendar=beginCalendar;
          $input.endCalendar=endCalendar;

        }else{
          //单日历的处理

          ops.callback=function(){
            //后续通过call将this转换到相应的calendar
            this.hide();
            this.syncInput();
          }
          var calendar=new Calendar(ops);
          calendar.input=$input;
          $input.calendar=calendar;

          var partner=$input.ops.partner;
          if(partner!=null){
            calendar.setPartner(partner,$input.ops.begin);
          }


        }
      },
      bindEvt_input:function($input){
        $input.on('click',function(e){
          //e.stopPropagation();
          var beginCalendar=$input.beginCalendar,
            endCalendar=$input.endCalendar,
            shell = $input.shell,
            $buttons = shell.find('.buttons');
          if($input.ops.double){
            if(shell.find('.calendar_box').length<1){
              beginCalendar.init();
              endCalendar.init();
            }else{
              beginCalendar.update();
              endCalendar.update();
              shell.find('.calendar_box').remove();
            }
            $buttons.before(beginCalendar.calendarBody);
            $buttons.before(endCalendar.calendarBody);
            beginCalendar.show();
            endCalendar.show();
            shell.show();

            var cb=function(e){
              if(e.target!=$input[0]){
                beginCalendar.hide();
                endCalendar.hide();
                shell.hide();
                $(window).off('click',cb);
              }
            };
            $(window).bind('click',cb);
          }else{
            var calendar=$input.calendar;

            $('.calendar_box').hide();

            if(shell.html()==''){
              calendar.init();
            }else{
              calendar.update();
            }
            shell.html(calendar.calendarBody);
            calendar.show();
            var cb=function(e){
              if(e.target!=$input[0]){
                calendar.hide();
                $(window).off('click',cb);
              }
            };
            $(window).bind('click',cb);
          }

        })

      },
      bindEvt_double_clear:function($input){
        var shell=$input.shell,
          beginCalendar=$input.beginCalendar,
          endCalendar=$input.endCalendar;
        shell.delegate('.clear','click',function(e){
          e.stopPropagation();
          beginCalendar.setDate('');
          endCalendar.setDate('');
          $('.between').removeClass('between');
          $('.blueDate').removeClass('blueDate');
          $('.yellowDate').removeClass('yellowDate');
          $input.val('');
        })
      },
      bindEvt_double_simple:function($input){
        var shell=$input.shell;
        shell.bind('click',function(e){
          e.stopPropagation();
        })
      },
      bindEvt_double_sure:function($input){
        var shell=$input.shell,
          beginCalendar=$input.beginCalendar,
          endCalendar=$input.endCalendar;
        shell.delegate('.sure','click',function(e){
          e.stopPropagation();
            var beginDate=beginCalendar.getDate(),
            endDate=endCalendar.getDate();
          if(beginDate!='' && endDate!=''){
            $input.val(beginDate+'-'+endDate);
            shell.hide();
          }else{
            alert('请选择相应的日期!');
          }
        })
      },
      bindEvt_double_close:function($input){
        var shell = $input.shell;
        shell.delegate('.btn_close','click',function(){
          shell.hide();
          $input.beginCalendar.hide();
          $input.endCalendar.hide();
        })
      }
    };

    var defaults = {
      partner: null,//仅用作传递给calendar对象
      switchYM: false,//仅用作传递给calendar对象
      double: false,
      clear:false,//仅用作传递给calendar对象
      date: '',//单日历中的日期
      beginDate:'',//double中的开始日期
      endDate:''//double中的结束日期
    };
    var $input=$(this);
    $input.ops = $.extend(true, {}, defaults, ops);
    /*
     * $input:{
     *   calendar: Calendar实例 单日历中对应的日历对象
     *   beginCalendar: Calendar实例 双日历中对应的开始日历
     *   endCalendar: Calendar实例 双日历中对应的结束日历
     * }
     * */
    helper.initInput($input);
    helper.initShell($input);
    helper.initCalendar($input);
    helper.bindEvt_input($input);
    if($input.ops.double){
      helper.bindEvt_double_simple($input);
      helper.bindEvt_double_clear($input);
      helper.bindEvt_double_sure($input);
      helper.bindEvt_double_close($input);
    }

    return $input;





  }
})