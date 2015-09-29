/**
 * Created by ruby on 2014/10/19.
 */



function Calendar(ops) {
  /*
  * calendar.ops:{
  *   switch:false or true 是否可以下拉框切换年份及月份
  *   view:'now' or 具体日期如'2011/10/10' 当前显示的月份,当连续滑动时需要一个值记录当前的日期显示状态是哪个月 //写入不可定制
  *   date:'' or 具体日期如'2011/10/10',
  *   clear: true or false 是否包含清空按钮,
  *   close: true or false 是否包含关闭按钮,
  *   callback: fn date属性改变后的回调函数（单双日历的操作完全不同）
  * }
  *
  * */
  /*
  * calendar:{
  *   partner:null,
  *   begin: true or false, //在有partner的情况下，指定该日历是否是开始的一个
  *   view: '',
  *   date: '2015/10/10' or '',
  *   getView: fn,
  *   setView: fn,
  *   getDate: fn,
  *   setDate: fn,
  *   html: '',
  *   syncInput: fn,
  *   input:$对象 指定关联的input
  *
  *
  * }
  * */


  var defaults = {
    switchYM: false,
    date: ''
  };
  this.ops = $.extend(true, {}, defaults, ops);
  this.view = ''; // 实际执行中为具体的日期如'2014-10-10';不可定制！只用于程序渲染
  this.partner=null;
  this.init();
}
Calendar.prototype = {
  constructor: Calendar,
  NORMAL: {
    TOMONTH: [1, 3, 5, 7, 8, 10, 12],
    TZMONTH: [4, 6, 9, 11]
  },
  REG:{
    date:/^(\d{4})\/(\d{1,})\/(\d{1,})$/
  },
  init: function () {
    /*init calendar*/
    if (this.ops.date != '') {
      this.setDate(this.ops.date);
      this.view=this.ops.date;
    }else if (this.partner != null) {
      var date_partner = this.dateFormat(this.partner.getDate());
      if (date_partner != '') {
        this.view=this.partner.view = date_partner.replace(this.REG.date, '$1/$2');
      }
    }else if(this.view==''){
      var now = new Date(),
        year = now.getFullYear(),
        month = 1 * (now.getMonth()) + 1;
      this.view = year + '/' + month;
    }
    this.calendarBox();
    this.decorateCurrentMonth();
    if(this.ops.clear){
      this.bindEvt_clear();
    }
    if(this.ops.close){
      this.bindEvt_closeDate();
    }
    this.bindEvt_chooseDate();
    this.bindEvt_slideDate();
    this.bindEvt_selectDate();
  },
  update:function(){
    /*update calendar*/
    var date = this.getDate();
    if (date != '') {
      this.view = date.replace(this.REG.date, '$1/$2');
    }else if (this.partner != null) {
      var date_partner = this.dateFormat(this.partner.getDate());
      if (date_partner != '') {
        this.view=this.partner.view = date_partner.replace(this.REG.date, '$1/$2');
      }
    }
    this.calendarBox();
    this.decorateCurrentMonth();
    if(this.ops.clear){
      this.bindEvt_clear();
    }
    if(this.ops.close){
      this.bindEvt_closeDate();
    }
    this.bindEvt_chooseDate();
    this.bindEvt_slideDate();
    this.bindEvt_selectDate();
  },
  bindEvt_clear:function(){
    var _this=this,
      $calendar=_this.calendarBody;
      $calendar.delegate('.clear','click',function(e){
        e.stopPropagation();
        if(this.begin){
          $('.blueDate').removeClass('blueDate');
        }else{
          $('.yellowDate').removeClass('yellowDate');
        }
        $('.between').removeClass('between');
        _this.date='';
        var callback=_this.ops.callback;
        if(typeof callback=='function'){
          callback.call(_this);
        }
      })
  },
  bindEvt_closeDate: function () {
    var $calendar=this.calendarBody;
    $calendar.delegate('.btn_close', 'click', function (e) {
      e.stopPropagation();
      $calendar.hide();
    })
  },
  bindEvt_chooseDate: function () {
    /*click:choose a date*/
    var _this=this,
      $calendar=_this.calendarBody,
      $calendar_body = $calendar.find('tbody'),
        $calendar_td = $calendar.find('td');

      $calendar_body.delegate('td[class!="disabled"]', 'click', function (e) {
        e.stopPropagation();
        _this.setDate($(this).attr('date'));
        _this.decorateCurrentMonth();
        _this.setView($(this).attr('date'));
        var callback=_this.ops.callback;
        if(typeof callback=='function'){
          callback.call(_this);
        }

      })

      $calendar.on('click', function (e) {
        e.stopPropagation();
      })

      /*hover:choose a date when the partner's date is available*/
      if (_this.partner != null) {
        $calendar_td.hover(function () {
          if (_this.begin) {
            var end = _this.partner.getDate(),
              begin = $(this).attr('date') || '';
          } else {
            var begin = _this.partner.getDate(),
              end = $(this).attr('date') || '';
          }
          if (end != '' && begin != '') {
            _this.lightMiddleDates(begin, end, "during", _this.begin);
          }
        }, function () {
          var $calendar_during = $calendar.find('.during');
          $calendar_during.removeClass('during');
        })
      }

  },
  decorateDuringSwitch:function(){
    //月份切换过程中的渲染
    /*
    * currentDate:正在进行切换动作的日历的date，格式为'2015/9/9'
    * currentView:正在进行切换动作的日历的view，格式为'2015/9'
    * partnerDate:正在进行切换动作的日历的partner的date，格式为'2015/9/9'
    * begin:当前日历是不是'开始日历'
    * */
    var currentDate=this.getDate(),
      currentView=this.getView(),
      begin=this.begin,
      calendarDate=this.analysisDate(currentDate),
      calendarMonth=calendarDate.year+'/'+calendarDate.month,
      partnerDate=this.analysisDate(this.partner.getDate()),
      partnerMonth=partnerDate.year+'/'+partnerDate.month,
      $calendar=this.calendarBody;
    if(currentDate!=''){
      if(begin){
        if(currentView!=calendarMonth && currentView!=partnerMonth){
          if(this.largerThanByYM(currentView,calendarMonth) && this.largerThanByYM(partnerMonth,currentView)){
            $calendar.find('td').addClass('between');
          }
        }else if(currentView==partnerMonth){
          $('.yellowDate').prevAll().addClass('between');
          $('.yellowDate').parent().prevAll().find('td[class!="disabled"]').addClass('between');
        }

      }else{
        if(currentView!=calendarMonth && currentView!=partnerMonth){
          if(this.largerThanByYM(calendarMonth,currentView) && this.largerThanByYM(currentView,partnerMonth)){
            $calendar.find('td').addClass('between');
          }
        }else if(currentView==partnerMonth){
          $('.blueDate').nextAll().addClass('between');
          $('.blueDate').parent().nextAll().find('td[class!="disabled"]').addClass('between');
        }

      }
    }

  },
  bindEvt_slideDate: function () {
    var _this = this,
      $calendar=_this.calendarBody;
      /*click:prev or next month*/
      var $calendar_body = $calendar.find('tbody');
      $calendar.delegate('.arrow_prev', 'click', function (e) {
        e.stopPropagation();
        var date = _this.view,
          prevMonth = _this.lastMonth(date),
          gridHTML = _this.calendarGrid(prevMonth);
        $calendar_body.html(gridHTML);
        _this.setView(prevMonth);
        _this.bindEvt_chooseDate();
        _this.decorateCurrentMonth();

        //根据视图切换做调整
        var partner=_this.partner,
          partnerDate=_this.partner.getDate();
        if(partner!=null && partnerDate!=''){
          _this.decorateDuringSwitch();
        }


        if (_this.ops.switchYM) {
          _this.selecteDate(prevMonth);
        } else {
          _this.writeDate(prevMonth);
        }

      })
      $calendar.delegate('.arrow_next', 'click', function (e) {
        e.stopPropagation();
        var now = new Date(),
          date = _this.view || _this.partner != null ? _this.view || _this.partner.view : now.getFullYear() + '/' + (now.getMonth() + 1),
          nextMonth = _this.nextMonth(date),
          gridHTML = _this.calendarGrid(nextMonth);
        $calendar_body.html(gridHTML);
        _this.setView(nextMonth);
        _this.bindEvt_chooseDate();
        _this.decorateCurrentMonth();

        //根据视图切换做调整
        var partner=_this.partner,
          partnerDate=partnerDate=_this.partner.getDate();

        if(partner!=null && partnerDate!=''){
          _this.decorateDuringSwitch();
        }

        if (_this.ops.switchYM) {
          _this.selecteDate(nextMonth);
        } else {
          _this.writeDate(nextMonth);
        }
      })

  },
  bindEvt_selectDate: function () {
    var _this = this,
      $calendar=_this.calendarBody,
      $calendar_body = $calendar.find('tbody');
      $calendar.delegate('.date_box_year','change', function (e) {
        e.stopPropagation();
        var date = $(this).val() + '/' + $(this).next().val();
        $calendar_body.html(_this.calendarGrid(date));
        _this.setView(date);
        _this.bindEvt_chooseDate();
        //根据视图切换做调整
        var partner=_this.partner,
          partnerDate=partnerDate=_this.partner.getDate();

        if(partner!=null && partnerDate!=''){
          _this.decorateDuringSwitch();
        }

      })

      $calendar.delegate('.date_box_month','change', function (e) {
        e.stopPropagation();
        var date = $(this).prev().val() + '/' + $(this).val();
        $calendar_body.html(_this.calendarGrid(date));
        _this.setView(date);
        _this.bindEvt_chooseDate();
        //根据视图切换做调整
        var partner=_this.partner,
          partnerDate=partnerDate=_this.partner.getDate();

        if(partner!=null && partnerDate!=''){
          _this.decorateDuringSwitch();
        }
      })


  },
  /*render*/
  calendarBox:function(){
    var HTMLs = this.render(),
      boxClass = '',
      clearButton=this.ops.clear ? '<span class="clear">清 空</span>' : '',
      closeButton=this.ops.clear ? '<span class="buttonIcon btn_close">关闭</span>' : '';

    if (this.partner != null && !this.begin) {
     boxClass = 'calendar_box_end';
     } else {
     boxClass = 'calendar_box_begin';
     }

    var calendarHTML = '<div class="calendar_box ' + boxClass + '">' +
     '<div class="calendar_btn">' +
     closeButton +
     '<span class="buttonIcon arrow_prev">上月</span>' +
     '<span class="buttonIcon arrow_next">下月</span>' +
     '</div>' +
     '<div class="date_box">' +
     '<h2 class="date_box_title">' + HTMLs.titleHTML + '</h2>' +
     '<table class="date_table">' +
     '<thead>' +
     '<tr>' +
     '<td><b>日</b></td>' +
     '<td>一</td>' +
     '<td>二</td>' +
     '<td>三</td>' +
     '<td>四</td>' +
     '<td>五</td>' +
     '<td><b>六</b></td>' +
     '</tr>' +
     '</thead>' +
     '<tbody>' +
     HTMLs.gridHTML +
     '</tbody>' +
     '</table>' +
     '</div>' +
     clearButton+
     '</div>';
    this.calendarBody=$(calendarHTML);
    return calendarHTML;
  },
  calendarGrid: function (day) {
    var crtDate = new Date(),
      year,
      month,
      days = 0,
      tableHTML = '',
      firstDay = 0;
    if (typeof day != 'undefined') {
      var day = this.analysisDate(day);
      year = day.year;
      month = day.month;
    } else {
      year = crtDate.getFullYear();
      month = crtDate.getMonth() + 1;
    }
    crtDate.setFullYear(year, month - 1, 1);
    firstDay = crtDate.getDay();

    /*how many days in this month*/
    if (month == 2) {
      if (this.isLeap(year)) {
        days = 29;
      } else {
        days = 28;
      }
    } else {
      if (this.isTOMonth(month)) {
        days = 31;
      } else {
        if (this.isTZMonth(month)) {
          days = 30;
        }
      }
    }
    /*draw*/
    var a = [];
    for (var j = 0; j < firstDay; j++) {
      a.push('<td class="disabled"></td>');
    }

    for (var i = 1; i <= days; i++) {
      var date = i;

      a.push('<td date="' + year + '/' + month + '/' + date + '"><a>' + i + '</a></td>');
    }
    var l = a.length;
    if (l % 7 != 0) {
      for (var k = 0; k < 7 - (l % 7); k++) {
        a.push('<td class="disabled"></td>');
      }
    }
    $.each(a, function (i) {
      if (i % 7 == 0) {
        a[i] = '<tr>' + a[i];
      } else if ((i + 1) % 7 == 0) {
        a[i] = a[i] + '</tr>';
      }
    })

    tableHTML = a.join('');
    return tableHTML;

  },
  calendarSelect: function (day) {
    var crtDate = new Date(),
      year,
      month,
      selectYearHTML = '',
      selectMonthHTML = '';
    if (typeof day != 'undefined') {
      var day = this.analysisDate(day);
      year = day.year;
      month = day.month;
    } else {
      year = crtDate.getFullYear();
      month = crtDate.getMonth() + 1;
    }
    selectYearHTML += '<select class="date_box_year">';
    for (var i = 1970; i <= 1 * year + 3; i++) {
      if (year == i) {
        selectYearHTML += '<option selected="selected" value="' + i + '">' + i + '</option>';
      } else {
        selectYearHTML += '<option value="' + i + '">' + i + '</option>';
      }
    }
    selectYearHTML += '</select>';
    selectMonthHTML += '<select class="date_box_month">';
    for (var i = 1; i <= 12; i++) {
      if (month == i) {
        selectMonthHTML += '<option selected="selected" value="' + i + '">' + i + '</option>';
      } else {
        selectMonthHTML += '<option value="' + i + '">' + i + '</option>';
      }
    }
    selectMonthHTML += '</select>';
    return selectYearHTML + ' 年 ' + selectMonthHTML + ' 月';
  },
  calendarTitle: function (day) {
    var crtDate = new Date(),
      year,
      month;
    if (typeof day != 'undefined') {
      var day = this.analysisDate(day);
      year = day.year;
      month = day.month;
    } else {
      year = crtDate.getFullYear();
      month = crtDate.getMonth() + 1;
    }
    return year + '年' + month + '月';

  },
  render: function () {
    var date = this.getDate();
    if (date != '') {
      return {
        gridHTML: this.calendarGrid(date),
        titleHTML: this.ops.switchYM ? this.calendarSelect(date) : this.calendarTitle(date)
      }
    } else if (this.partner != null && this.partner.getDate() != '') {
      var partnerDate = this.partner.getDate();
      return {
        gridHTML: this.calendarGrid(partnerDate),
        titleHTML: this.ops.switchYM ? this.calendarSelect(partnerDate) : this.calendarTitle(partnerDate)
      }
    } else {
      return {
        gridHTML: this.calendarGrid(),
        titleHTML: this.ops.switchYM ? this.calendarSelect() : this.calendarTitle()
      }
    }
  },
  decorateCurrentMonth: function () {
    /*
    * ！！负责日历当前月份的渲染
    * */
    var date = this.getDate(),
      partner = this.partner;
    if (partner != null) {
      var partnerDate = partner.getDate();
      if (this.begin) {
        if (date != '' && partnerDate != '') {
          this.lightBlueDate(date);
          this.lightYellowDate(partnerDate);
          this.disabledDates(partnerDate, false);
          this.lightMiddleDates(date, partnerDate, 'between', true);
        } else if (date != '') {
          this.lightBlueDate(date);
        } else if (partnerDate != '') {
          this.lightYellowDate(partnerDate);
          this.disabledDates(partnerDate, false);
        }

      } else {
        if (date != '' && partnerDate != '') {
          this.lightYellowDate(date);
          this.lightBlueDate(partnerDate);
          this.disabledDates(partnerDate, true);
          this.lightMiddleDates(partnerDate, date, 'between', false);
        } else if (date != '') {
          this.lightYellowDate(date);
        } else if (partnerDate != '') {
          this.lightBlueDate(partnerDate);
          this.disabledDates(partnerDate, true);
        }
      }
    } else {
      if (date != '') {
        this.lightBlueDate(date);
      }
    }
  },

  lightYellowDate: function (date) {
    var $calendar = this.calendarBody,
      $calendar_yellowDate = $calendar.find('.yellowDate'),
      $calendar_date = $calendar.find('td[date="' + date + '"]');
    $calendar_yellowDate.removeClass('yellowDate disabled');
    $calendar_date.removeClass('disabled').addClass('yellowDate');
  },
  lightBlueDate: function (date) {
    var $calendar=this.calendarBody,
      $calendar_blueDate = $calendar.find('.blueDate'),
      $calendar_date = $calendar.find('td[date="' + date + '"]');

    $calendar_blueDate.removeClass('blueDate disabled');
    $calendar_date.removeClass('disabled').addClass('blueDate');
  },
  disabledDates: function (date, before) {
    /*
     * date:某个时间点
     * before:Boolean 决定将之前还是之后的日期设置为不可选
     * */
    var $calendar=this.calendarBody,
      $calendar_date = $calendar.find('td[date="' + date + '"]');
    if ($calendar_date.length > 0) {
      if (before) {
        $calendar_date.prevAll().addClass('disabled');
        $calendar_date.parent().prevAll().find('td').addClass('disabled');
      } else {
        $calendar_date.nextAll().addClass('disabled');
        $calendar_date.parent().nextAll().find('td').addClass('disabled');
      }
    } else {
      var currentDate = this.view,
        date = date.split('/').slice(0, 2).join('/');

      if ((before && new Date(currentDate) < new Date(date)) || (!before && new Date(currentDate) > new Date(date))) {
        var $calendar_td = $calendar.find('td');
        $calendar_td.addClass('disabled');
      }else{
        var allTds=$calendar.find('td');
        allTds.removeClass('disabled');
      }
    }
  },
  lightMiddleDates: function (begin, end, color, isBegin) {
    /*
     * begin: 开始时间
     * end: 结束时间
     * color: 是during还是between
     * isBegin: 是否为"开始时间"对象的调用
     * */
    var _this = this;
    var beginObj = _this.analysisDate(begin),
      endObj = _this.analysisDate(end),
      $calendar=_this.calendarBody;
    if (_this.toTime(begin) < _this.toTime(end)) {
      if (beginObj.year == endObj.year && beginObj.month == endObj.month) {
        var middleArr = [],
          i = 0,
          b = beginObj.date,
          e = endObj.date,
          len = e - b + 1,
          prefix = beginObj.year + '/' + beginObj.month + '/';
        while (i < len - 2) {
          middleArr.push(prefix + (++b));
          i++;
        }
        $calendar.find('td').removeClass(color);
        middleArr.map(function (date) {
          var middleTd=$calendar.find('td[date="' + date + '"]');
          middleTd.removeClass('disabled').addClass(color);
        })
      } else if (beginObj.year < endObj.year || (beginObj.year == endObj.year && beginObj.month < endObj.month)) {
        if (isBegin) {
          var $beginDate = $calendar.find('td[date="' + begin + '"]');
          $calendar.find('td').removeClass(color);
          $beginDate.nextAll().removeClass('disabled').addClass(color);
          $beginDate.parent().nextAll().find('td').removeClass('disabled').addClass(color);
        } else {
          var $endDate = $calendar.find('td[date="' + end + '"]');
          $calendar.find('td').removeClass(color);
          $endDate.prevAll().removeClass('disabled').addClass(color);
          $endDate.parent().prevAll().find('td').removeClass('disabled').addClass(color);
        }
      }
    }
  },
  selecteDate: function (date) {
    var date = this.analysisDate(date),
      $calendar=this.calendarBody,
      $calendar_date_box_year = $calendar.find('.date_box_year'),
      $calendar_date_box_month = $calendar.find('.date_box_month');
    $calendar_date_box_year.val(date.year);
    $calendar_date_box_month.val(date.month);
  },
  writeDate: function (date) {
    var gridHTML = this.calendarTitle(date),
      $calendar=this.calendarBody,
      $calendar_date_box_title = $calendar.find('.date_box_title');
    $calendar_date_box_title.html(gridHTML);
  },
  /*base*/
  isLeap: function (year) {
    if ((year % 4 == 0 && year % 100 != 0) || year % 400 == 0) {
      return true;
    } else {
      return false;
    }
  },
  isTOMonth: function (month) {
    if (this.NORMAL.TOMONTH.indexOf(1 * month) > -1) {
      return true;
    } else {
      return false;
    }
  },
  isTZMonth: function (month) {
    if (this.NORMAL.TZMONTH.indexOf(1 * month) > -1) {
      return true;
    } else {
      return false;
    }
  },
  isFirstMonth: function (month) {
    if (month == 1) {
      return true;
    }
    return false;
  },
  isLastMonth: function (month) {
    if (month == 12) {
      return true;
    }
    return false;
  },
  analysisDate: function (date) {
    /*date:year/month or year/month/date*/
    var a = date.split('/');
    if (a.length == 2) {
      return {
        year: a[0]*1,
        month: a[1]*1
      }
    } else {
      return {
        year: a[0]*1,
        month: a[1]*1,
        date: a[2]*1
      }
    }
  },
  dateFormat: function (date) {
    if (this.REG.date.test(date)) {
      var arr = date.split('/');
      arr = arr.map(function (v) {
        return parseInt(v);
      })
      return arr.join('/');
    } else {
      return '';
    }

  },
  lastMonth: function (date) {
    /*date:year/month or year/month/date*/
    var date = this.analysisDate(date),
      resultY,
      resultM;
    if (this.isFirstMonth(date.month)) {
      resultY = date.year - 1;
      resultM = 12;
    } else {
      resultY = date.year;
      resultM = date.month - 1;
    }
    return resultY + '/' + resultM;
  },
  nextMonth: function (date) {
    /*date:year-month or year-month-date*/
    var date = this.analysisDate(date),
      resultY,
      resultM;
    if (this.isLastMonth(date.month)) {
      resultY = 1 * date.year + 1;
      resultM = 1;
    } else {
      resultY = date.year;
      resultM = 1 * date.month + 1;
    }
    return resultY + '/' + resultM;
  },
  largerThanByYM:function(ym1,ym2){
    var first=ym1.split('/'),
      y1=first[0]*1,
      m1=first[1]*1,
      second=ym2.split('/'),
      y2=second[0]*1,
      m2=second[1]*1;
    if(y1>y2){
      return true;
    }else if(y1==y2 && m1>m2){
      return true;
    }
    return false;
  },

  /**/
  getDate: function () {
    return this.date || '';
  },
  setDate: function (date) {
    /*date:year/month/date*/
    this.date = date;

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
  },
  setView: function (date) {
    /*date:year/month or year/month/date*/
    this.view = date;
  },
  getView: function () {
    return this.view;
  },
  toTime: function (date) {
    /*将类似2014/01/01转换为毫秒*/
    return +new Date(date);
  },
  syncInput: function () {
    var date = this.date;
    this.input.val(date);
  },
  hide:function(){
    this.calendarBody.hide();
  },
  show:function(){
    this.calendarBody.show();
  },
  isHidden:function(){
    if(this.calendarBody.is(':hidden')){
      return true;
    }else{
      return false;
    }
  }




}



