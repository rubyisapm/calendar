/**
 * Created by rubyisapm on 15/10/16.
 */
function Calendar_monthPicker(ops) {
  /*
   * calendar.ops
   * date: '' or 具体年月份 '2015/02' 初始化时的日期
   * callback: fn date属性改变后的回调函数（单双日历的操作完全不同）
   *
   * */

  /* calendar
   * begin:true or false 指定是否为开始日历
   * partner: null or $对象 指定日历的配对日历
   * view: 'now' or 具体年份'2015' 日历的视图年份
   * date: '' or 具体日期'2015/02' 日历的年月
   * html: '',
   * syncInput: fn,
   * input:$对象 指定关联的input
   *
   * */
  var defaults = {
    date: ''
  };
  this.ops = $.extend(true, {}, defaults, ops);

  var _date='';
  var _view='';
  var _tempDate='';
  this.setDate=function(date){
    _date = date;
  }
  this.getDate=function(){
    //date '2015/02'
    return _date || '';
  }
  this.setView=function(year){
    //year '2015'
    _view = year;
  }
  this.getView=function(){
    return _view;
  }
  this.setTempDate=function(tempDate){
    _tempDate=tempDate;
  }
  this.getTempDate=function(){
    return _tempDate || '';
  }
  this.init();
}

Calendar_monthPicker.prototype = {
  constructor: Calendar_monthPicker,
  init: function () {
    var now = new Date();
    if (this.ops.date != '') {
      this.setDate(this.ops.date);
      this.setView(this.analysisDate(this.ops.date).year);
    } else if (this.partner != null && this.partner.getDate() != '') {
      this.setView(this.analysisDate(this.partner.getDate()).year);
    } else {
      this.setView(now.getFullYear());
    }
    this.calendarBox();
    this.decorate_current();
    this.bindEvt_chooseMonth();
    this.bindEvt_slideMonth();
    this.bindEvt_monthHover();
    if (this.ops.clear) {
      this.bindEvt_clear();
    }
    if (this.ops.close) {
      this.bindEvt_close();
    }
    if(this.ops.double){
      this.setTempDate('');
    }
  },
  update: function () {
    //根据partner来更新其日历展现

    if (this.getDate() != '') {

      this.setView(this.analysisDate(this.getDate()).year);
    } else if (this.partner!=null && this.partner.getDate()!='') {
      this.setView(this.analysisDate(this.partner.getDate()).year);
    } else {
      this.setView(new Date().getFullYear());
    }
    this.calendarBox();
    this.decorate_current();
    this.bindEvt_chooseMonth();
    this.bindEvt_slideMonth();
    this.bindEvt_monthHover();
    if (this.ops.clear) {
      this.bindEvt_clear();
    }
    if (this.ops.close) {
      this.bindEvt_close();
    }
    if(this.ops.double){
      this.setTempDate('');
    }
  },
  bindEvt_chooseMonth: function () {
    var _this = this,
      $calendarBody = this.calendarBody;
    $calendarBody.delegate('td', 'click', function (e) {
      e.stopPropagation();
      if ($(this).hasClass('disabled')) return;
      if (_this.partner != null && !_this.begin) {
        $('.yellowDate').removeClass('yellowDate');
        $(this).addClass('yellowDate');
      } else {
        $('.blueDate').removeClass('blueDate');
        $(this).addClass('blueDate');
      }


      if(_this.ops.double){
        _this.setTempDate($(this).attr('data-month'));
      }else{
        _this.setDate($(this).attr('data-month'));

      }

      if (_this.hasPartnerDate()) {
        var thisDate, partnerDate;
        if(_this.ops.double){
          thisDate=_this.getTempDate() || _this.getDate();
          partnerDate=_this.partner.getTempDate() || _this.partner.getDate();
        }else{
          thisDate=_this.getDate();
          partnerDate=_this.partner.getDate();
        }
        _this.lightMiddleDates(thisDate, _this.begin, partnerDate, 'between');
      }
      if (typeof _this.ops.callback == 'function') {
        _this.ops.callback.call(_this);
      }

      if(!_this.ops.double && typeof _this.ops.sure == 'function'){
        _this.ops.sure(_this.getDate());
      }


    })
  },
  bindEvt_slideMonth: function () {
    var _this = this,
      $calendarBody = _this.calendarBody;
    function slide(){
      //日历表格根据现有情况更新
      var thisView=_this.getView(),
        thisBegin = _this.begin,
        thisDate;
      if(_this.ops.double){
        thisDate = _this.getTempDate() || _this.getDate();
      }else{
        thisDate = _this.getDate();
      }

      if (_this.hasPartnerDate()) {
        _this.decorate_during_slide();
      } else if (thisView == thisDate) {
        if(thisBegin){
          _this.lightBlueDate(thisDate);
        }else{
          _this.lightYellowDate(thisDate);
        }
      }
    }

    $calendarBody.delegate('.arrow_prev', 'click', function (e) {
      e.stopPropagation();
      _this.setView(_this.getView()-1);
      _this.freshView();
      slide();
    })
    $calendarBody.delegate('.arrow_next', 'click', function (e) {
      e.stopPropagation();
      _this.setView(_this.getView()+1);
      _this.freshView();
      slide();
    })
  },
  freshView:function(){
    //根据现有的view进行日历的视图刷新
    var thisView = this.getView(),
      $calendarBody = this.calendarBody;
    $calendarBody.find('.year').html(thisView);
    $calendarBody.find('tbody').html(this.calendarGrid(thisView));
  },
  decorate_during_slide: function () {
    var thisView = this.getView(),
      begin = this.begin,
      thisDate;
    if(this.ops.double){
      thisDate=this.getTempDate() || this.getDate();

    }else{
      thisDate=this.getDate();
    }
    var thisYear = thisDate == '' ? thisView : this.analysisDate(thisDate).year;

    if (thisYear == thisView) {
      this.decorate_current();
    } else {
      if (this.hasPartnerDate()) {
        var partnerDate;
        if(this.ops.double){
          partnerDate=this.partner.getTempDate() || this.partner.getDate();
        }else{
          partnerDate = this.partner.getDate();
        }
        var partnerYear = this.analysisDate(partnerDate).year;
        if (begin) {
          if(thisView<thisYear) return;
          if (thisView > partnerYear) {
            this.disabledDates();
          }else{
            this.lightMiddleDates(thisDate, this.begin, partnerDate, 'between');
            if(thisView == partnerYear){
              this.lightYellowDate(partnerDate);
              this.disabledDates(partnerDate, false);
            }
          }
        } else {
          if(thisView > thisYear) return;
          if (thisView < partnerYear) {
            this.disabledDates();
          } else{
            if (thisView == partnerYear){
              this.lightBlueDate(partnerDate);
              this.disabledDates(partnerDate, true);
            }
            this.lightMiddleDates(thisDate, this.begin, partnerDate, 'between');
          }
        }
      }
    }


  },
  decorate_current: function () {
    var thisDate, thisYear, partnerDate, partnerYear, begin;
    begin = this.begin;

    if(this.ops.double){
      thisDate = this.getTempDate() || this.getDate();

    }else{
      thisDate = this.getDate();
    }
    if (this.partner == null){
      this.lightBlueDate(thisDate);
    } else{
      if(this.ops.double){
        partnerDate=this.partner.getTempDate() || this.partner.getDate();
      }else{
        partnerDate = this.partner.getDate();
      }
      if (partnerDate == ''){
        if (begin) {
          this.lightBlueDate(thisDate);
        } else {
          this.lightYellowDate(thisDate);
        }
      } else{
        partnerYear = this.analysisDate(partnerDate).year;
        if (thisDate != '') {
          thisYear = this.analysisDate(thisDate).year;
          // 点亮自身的日期
          if (begin) {
            this.lightBlueDate(thisDate);
          } else {
            this.lightYellowDate(thisDate);
          }

          //点亮partner的日期
          if (thisYear == partnerYear) {
            if (begin) {
              this.lightYellowDate(partnerDate);
              this.disabledDates(partnerDate, false);
            } else {
              this.lightBlueDate(partnerDate);
              this.disabledDates(partnerDate, true);
            }
          }

          //点亮中间的日期
          this.lightMiddleDates(thisDate, begin, partnerDate, 'between');

        } else if (this.getView() == partnerYear) {
          if (begin) {
            this.lightYellowDate(partnerDate);
            this.disabledDates(partnerDate,false);
          } else {
            this.lightBlueDate(partnerDate);
            this.disabledDates(partnerDate,true);
          }
        }
      }
    }
  },
  bindEvt_monthHover: function () {
    var partner = this.partner;
    if (partner != null) {
      var _this = this,
        $calendarBody = _this.calendarBody;
      $calendarBody.find('td').on('mouseenter',function(e){
        if (!$(this).hasClass('disabled')){
          var partnerDate;
          if(_this.ops.double){
            partnerDate=partner.getTempDate() || partner.getDate();
          }else{
            partnerDate = partner.getDate();
          }
          if (partnerDate != '') {
            var thisDate = $(this).attr('data-month');
            _this.lightMiddleDates(thisDate, _this.begin, partnerDate, 'during');
          }
        }

      })

      $calendarBody.find('td').on('mouseleave',function(e){
        $calendarBody.find('.during').removeClass('during');
      })
    }

  },
  bindEvt_clear: function () {
    var _this = this,
      $calendar = _this.calendarBody;
    $calendar.delegate('.clear', 'click', function (e) {
      e.stopPropagation();
      if (_this.begin) {
        $('.blueDate').removeClass('blueDate');
      } else {
        $('.yellowDate').removeClass('yellowDate');
      }
      $('.between').removeClass('between');
      $('.disabled').removeClass('disabled');
      _this.setDate('');
      var callback = _this.ops.callback,
        clearCB=_this.ops.clearCB;
      if (typeof callback == 'function') {
        callback.call(_this);
      }
      if(typeof clearCB=='function'){
        clearCB();
      }
    })
  },
  bindEvt_close: function () {
    this.hide();
  },
  calendarBox: function () {
    var year = this.getDate() != '' ? this.analysisDate(this.getDate()).year : this.getView(),
      calendarClass = '',
      grid = this.calendarGrid(year),
      clearButton = this.ops.clear ? '<span class="clear">清 空</span>' : '',
      closeButton = this.ops.clear ? '<span class="buttonIcon btn_close">关闭</span>' : '',
      html = '';
    if (this.partner != null && !this.begin) {
      calendarClass = 'calendar_box_end';
    } else {
      calendarClass = 'calendar_box_begin';
    }

    html = '<div class="calendar_box ' + calendarClass + '" style="display: block;">' +
    '<div class="date_box">' +
    closeButton +
    '<h2>' +
    '<span class="arrow_prev"><b></b></span>' +
    '<span class="year">' + year + '</span>年' +
    '<span class="arrow_next"><b></b></span>' +
    '</h2>' +
    '<table class="date_table">' +
    '<tbody>' +
    grid +
    '</tbody>' +
    '</table>' +
    '</div>' +
    clearButton +
    '</div>';
    this.calendarBody = $(html);
  },
  calendarGrid: function (year) {
    var tds = [];
    for (var i = 1; i < 13; i++) {
      if (i % 3 == 1) {
        tds.push('<tr><td data-month=' + year + '/' + i + '><a>' + i + '</a></td>');
      } else if (i % 3 == 0) {
        tds.push('<td data-month=' + year + '/' + i + '><a>' + i + '</a></td></tr>');
      } else {
        tds.push('<td data-month=' + year + '/' + i + '><a>' + i + '</a></td>');
      }
    }

    return tds.join('');
  },
  disabledDates: function (date, before) {
    // date '2015/02'
    // before true or false 表示是该日期前还是该日期后
    var $calendarBody = this.calendarBody;
    if (arguments.length<1) {
      $calendarBody.find('td').addClass('disabled');
    } else {
      var td = $calendarBody.find('td[data-month="' + date + '"]');
      if (before) {
        td.prevAll().removeClass().addClass('disabled');
        td.parent().prevAll().find('td').removeClass().addClass('disabled');
        td.nextAll().removeClass('disabled');
        td.parent().nextAll().find('td').removeClass('disabled');
      } else {
        td.nextAll().removeClass().addClass('disabled');
        td.parent().nextAll().find('td').removeClass().addClass('disabled');
        td.prevAll().removeClass('disabled');
        td.parent().prevAll().find('td').removeClass('disabled');
      }
    }

  },
  lightMiddleDates: function (thisDate, begin, partnerDate, color) {
    // 该函数作用在于不管多大的时间跨度，在任何视图情况下调用都可以根据相关的参数渲染出当前视图

    var beginDate, beginYear, beginMonth, endDate, endYear, endMonth, firstTD, lastTD, $calendarBody = this.calendarBody;
    $calendarBody.find('.' + color).removeClass(color);
    if (begin) {
      beginDate = this.analysisDate(thisDate);
      beginYear = beginDate.year;
      beginMonth = beginDate.month;
      endDate = this.analysisDate(partnerDate);
      endYear = endDate.year;
      endMonth = endDate.month;

      if (beginYear == endYear && beginMonth < endMonth) {
        for (var i = beginMonth + 1; i < endMonth; i++) {
          $calendarBody.find('td[data-month="' + beginYear + '/' + i + '"]').removeClass('disabled').addClass(color);
        }

      } else if (beginYear < endYear) {
        firstTD = $calendarBody.find('td[data-month="' + thisDate + '"]');
        lastTD = $calendarBody.find('td[data-month="' + partnerDate + '"]');

        if(firstTD.length>0){
          firstTD.nextAll().removeClass('disabled').addClass(color);
          firstTD.parent().nextAll().find('td').removeClass('disabled').addClass(color);
        } else if(lastTD.length>0){
          lastTD.prevAll().removeClass('disabled').addClass(color);
          lastTD.parent().prevAll().find('td').removeClass('disabled').addClass(color);
        }else{
          $calendarBody.find('td').removeClass('disabled').addClass(color);
        }
      }

    } else {
      beginDate = this.analysisDate(partnerDate),
        beginYear = beginDate.year,
        beginMonth = beginDate.month,
        endDate = this.analysisDate(thisDate),
        endYear = endDate.year,
        endMonth = endDate.month;
      if (beginYear == endYear && beginMonth < endMonth) {
        for (var i = beginMonth + 1; i < endMonth; i++) {
          $calendarBody.find('td[data-month="' + beginYear + '/' + i + '"]').removeClass('disabled').addClass(color);
        }
      } else if (beginYear < endYear) {
        firstTD = $calendarBody.find('td[data-month="' + partnerDate + '"]');
        lastTD = $calendarBody.find('td[data-month="' + thisDate + '"]');

        if(firstTD.length>0){
          firstTD.nextAll().removeClass('disabled').addClass(color);
          firstTD.parent().nextAll().find('td').removeClass('disabled').addClass(color);
        }else if(lastTD.length>0){
          lastTD.prevAll().removeClass('disabled').addClass(color);
          lastTD.parent().prevAll().find('td').removeClass('disabled').addClass(color);
        }else{
          $calendarBody.find('td').removeClass('disabled').addClass(color);
        }
      }
    }

  },
  lightBlueDate: function (month) {
    var $calendarBody = this.calendarBody;
    $calendarBody.find('.blueDate').removeClass('blueDate');
    $calendarBody.find('td[data-month="' + month + '"]').removeClass().addClass('blueDate');
  },
  lightYellowDate: function (month) {
    var $calendarBody = this.calendarBody;
    $calendarBody.find('.yellowDate').removeClass('yellowDate');
    $calendarBody.find('td[data-month="' + month + '"]').removeClass().addClass('yellowDate');
  },
  hasPartnerDate: function () {
    //  判断该calendar是否有partner且partner的date不为空
    if(this.ops.double){
      return this.partner!=null && (this.partner.getTempDate() || this.partner.getDate())!='';
    }else{
      return this.partner != null && this.partner.getDate() != '';
    }
  },
  analysisDate: function (date) {
    //  date '2015/02'
    var a = date.split('/');
    return {
      year: 1 * a[0],
      month: 1 * a[1]
    }
  },
  syncInput: function () {
    this.input.val(this.getDate());
  },
  show: function () {
    this.calendarBody.show();
  },
  hide: function () {
    this.calendarBody.hide();
    if(this.ops.double){
      this.setTempDate('');
      this.setTempDate('');
    }
  },
  setPartner: function (partner, begin) {
    /*
     * partner: Calendar object
     * begin:boolean
     * */

    this.partner = partner;
    this.begin = begin;
    if (partner.partner == null) {
      partner.setPartner(this, !begin);
    }
  }
}

$.fn.extend({
  monthPicker: function (ops) {

    /*
     * double: true or false 是否为双日历
     * date:具体日期如'2015/10/10'或具体阶段'2015/10/10-2016/1/1'，用于指定初始化日期
     * switchYM: true or false 是否可以进行年月的select选择
     * partner: 为一个input(jquery对象)
     * clear : true or false // 但日历中的清空按钮
     * clear:function //双日历中的清空日期回调,
     * beginDate:'',//double中的开始日期
     * endDate:''//double中的结束日期
     * verify:false or number+'y'/'m'  //指定时间跨度限制
     * */

    var helper = {
      initInput: function ($input) {
        if ($input.ops.double) {
          if ($input.ops.beginDate != '' && $input.ops.endDate != '') {
            $input.val($input.ops.beginDate + '-' + $input.ops.endDate);
          }
        } else {
          $input.val($input.ops.date);
        }
      },
      initShell: function ($input) {
        var shell = '';
        if ($input.ops.double) {
          shell = $('<div ' +
          'class="monthPicker_shell monthPicker_shell_double">' +
          '<div class="buttons">' +
          '<span class="clear">清 空</span>' +
          '<span class="sure">确 定</span>' +
          '</div>' +
          '<span class="buttonIcon btn_close">关闭</span>' +
          '</div>');
        } else {
          shell = $('<div ' +
          'class="monthPicker_shell">' +
          '</div>')
        }
        $('body').append(shell);
        $input.shell = shell;
      },
      positionShell: function ($input) {

        var x = $input.offset().left,
          y = $input.offset().top,
          h = parseInt($input.outerHeight()),
          bw=parseInt($(window).outerWidth()),
          bh=parseInt($(window).outerHeight()),
          sw=parseInt($input.shell.outerWidth())+5,
          sh=parseInt($input.shell.outerHeight())+5,
          pos={};
        if(bw-x>=sw){
          pos.left=x+'px';
        }else{
          pos.right='5px';
        }
        if(bh-y<sh && y>sh){
          pos.bottom=bh-y+'px';
        }else{
          pos.top=y+h+'px';
        }
        $input.shell.css(pos);
      },
      initCalendar: function ($input) {
        var ops = $input.ops;
        if ($input.ops.double) {
          //双日历的处理
          var ops_begin = $.extend({}, ops,{clear:false}),
            ops_end = $.extend({}, ops,{clear:false});
          ops_begin.date = ops_begin.beginDate;
          ops_begin.close = false;
          delete ops_begin.beginDate;
          ops_end.date = ops_end.endDate;
          ops_end.close = false;
          delete ops_end.endDate;

          ops_begin.callback = function () {
            this.partner.decorate_during_slide();
          }
          ops_end.callback = function () {
            this.partner.decorate_during_slide();
          }

          var beginCalendar = new Calendar_monthPicker(ops_begin),
            endCalendar = new Calendar_monthPicker(ops_end);
          endCalendar.setPartner(beginCalendar, false);
          $input.beginCalendar = beginCalendar;
          $input.endCalendar = endCalendar;
        } else {
          //单日历的处理

          ops.callback = function () {
            //后续通过call将this转换到相应的calendar
            this.hide();
            this.syncInput();
          }
          var calendar = new Calendar_monthPicker(ops);
          calendar.input = $input;
          $input.calendar = calendar;

          var partner = $input.ops.partner;
          if (partner != null) {
            calendar.setPartner(partner, $input.ops.begin);
          }


        }
      },
      bindEvt_input: function ($input) {
        var _this = this;
        $input.on('click', function (e) {

          var beginCalendar = $input.beginCalendar,
            endCalendar = $input.endCalendar,
            shell = $input.shell,
            $buttons = shell.find('.buttons');
          if ($input.ops.double) {
            if (shell.find('.calendar_box').length < 1) {
              beginCalendar.init();
              endCalendar.init();
            } else {
              beginCalendar.update();
              endCalendar.update();
              shell.find('.calendar_box').remove();
            }
            $buttons.before(beginCalendar.calendarBody);
            $buttons.before(endCalendar.calendarBody);
            beginCalendar.show();
            endCalendar.show();
            //避免不可见元素影响位置尺寸误判
            _this.positionShell($input);
            shell.show();

            var cb = function (e) {
              if (e.target != $input[0]) {
                beginCalendar.hide();
                endCalendar.hide();
                shell.hide();
                $(window).off('click', cb);
              }
            };
            $(window).bind('click', cb);
          } else {
            var calendar = $input.calendar;

            $('.calendar_box').hide();

            if (shell.html() == '') {
              calendar.init();

            } else {
              calendar.update();
            }
            shell.html(calendar.calendarBody);
            _this.positionShell($input);
            calendar.show();
            var cb = function (e) {
              if (e.target != $input[0]) {
                calendar.hide();
                $(window).off('click', cb);
              }
            };
            $(window).bind('click', cb);
          }

        })

      },
      bindEvt_double_clear: function ($input) {
        var shell = $input.shell,
          beginCalendar = $input.beginCalendar,
          endCalendar = $input.endCalendar;
        shell.delegate('.clear', 'click', function (e) {
          e.stopPropagation();
          beginCalendar.setDate('');
          beginCalendar.setTempDate('');
          endCalendar.setDate('');
          endCalendar.setTempDate('');
          $('.between').removeClass('between');
          $('.blueDate').removeClass('blueDate');
          $('.yellowDate').removeClass('yellowDate');
          $('.disabled').removeClass('disabled');
          $input.val('');
          if(typeof $input.ops.clear == 'function'){
            $input.ops.clear();
          }
        })
      },
      bindEvt_double_simple: function ($input) {
        var shell = $input.shell;
        shell.bind('click', function (e) {
          e.stopPropagation();
        })
      },
      bindEvt_double_sure: function ($input) {
        var _this = this,
          shell = $input.shell,
          beginCalendar = $input.beginCalendar,
          endCalendar = $input.endCalendar;
        shell.delegate('.sure', 'click', function (e) {
          e.stopPropagation();
          var beginDate = beginCalendar.getTempDate() || beginCalendar.getDate(),
            endDate = endCalendar.getTempDate() || endCalendar.getDate();
          if (beginDate != '' && endDate != '') {
            //verify dates
            var verify = true,
              limited = $input.ops.limited;
            if (limited) {
              verify = _this.verify(beginDate, endDate, limited).pass;
            }
            if (verify) {
              $input.beginCalendar.setDate(beginDate);
              $input.endCalendar.setDate(endDate);
              $input.val(beginDate + '-' + endDate);
              shell.hide();
              if (typeof $input.ops.sure == 'function') {
                $input.ops.sure(beginDate + '-' + endDate);
              }

            } else {
              alert(_this.verify(beginDate, endDate, limited).msg)
            }
          } else if($input.ops.necessary){
            alert('请选择相应的月份!');
          }else if(beginDate=='' && endDate!=''){
            alert('请选择起始月份!');
          }else if(beginDate!='' && endDate==''){
            alert('请选择结束月份!');
          }else{
            shell.hide();
            $input.beginCalendar.hide();
            $input.endCalendar.hide();
          }
        })
      },
      bindEvt_double_close: function ($input) {
        var shell = $input.shell;
        shell.delegate('.btn_close', 'click', function () {
          shell.hide();
          $input.beginCalendar.hide();
          $input.endCalendar.hide();
        })
      },

      verify: function (begin, end, limit) {
        // limit : num(y/m) 限制为几月或几年
        // 换算成月
        var beginDate = begin.split('/'),
          beginYear = beginDate[0],
          beginMonth = beginDate[1],
          endDate = end.split('/'),
          endYear = endDate[0],
          endMonth = endDate[1],
          duringMonths = (endYear - beginYear) * 12 + 1 * (endMonth - beginMonth),
          limitCopy = limit;
        switch (limit.substr(-1, 1)) {
          case 'y':
            limit = 12 * (limit.substring(0, limit.length - 1));
            break;
          case 'm':
            limit = limit.substring(0, limit.length - 1);
            break;
        }
        if (duringMonths > 0 && duringMonths < limit) {
          return {
            pass: true
          };
        } else {
          var o = {
            y: '年',
            m: '月'
          };
          var s = limitCopy.replace(/^(\d)([a-zA-Z]$)/, function ($0, $1, $2) {
            return $1 + o[$2] || '';
          });
          return {
            pass: false,
            msg: '时间跨度需限制在' + s + '内!'
          }
        }
      }
    };

    var defaults = {
      partner: null,//仅用作传递给calendar对象
      double: false,
      clear: false,//仅用作传递给calendar对象
      date: '',//单日历中的日期
      beginDate: '',//double中的开始日期
      endDate: '',//double中的结束日期
      verify: false,
      sure: ''
    };
    var $input = $(this);
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
    if ($input.ops.double) {
      helper.bindEvt_double_simple($input);
      helper.bindEvt_double_clear($input);
      helper.bindEvt_double_sure($input);
      helper.bindEvt_double_close($input);
    }

    return $input;
  }
})


