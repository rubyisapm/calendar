/**
 * Created by rubyisapm on 15/9/22.
 */
function Calendar_datePicker(ops) {
  /*
   * calendar.ops:{
   *   switch:false or true 是否可以下拉框切换年份及月份
   *   view:'now' or 具体日期如'2011/10/10' 当前显示的月份,当连续滑动时需要一个值记录当前的日期显示状态是哪个月 //写入不可定制
   *   date:'' or 具体日期如'2011/10/10',
   *   clear: true or false 是否包含清空按钮,
   *   close: true or false 是否包含关闭按钮,
   *   callback: fn date属性改变后的回调函数（单双日历的操作完全不同）用于内部使用
   *   sure:function 日历改变日期时回调
   *
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
  this.partner=null;
  var _view='';
  var _date='';
  var _tempDate='';

  this.getDate=function () {
    return _date || '';
  };
  this.setDate= function (date) {
    /*date:year/month/date*/
    _date = date;

  };
  this.setView= function (date) {
    /*date:year/month or year/month/date*/
    var a=date.split('/');
    _view = a[0]+'/'+a[1];
  };
  this.getView= function () {
    return _view;
  },
  this.getTempDate=function () {
    return _tempDate || '';
  };
  this.setTempDate= function (date) {
    /*date:year/month/date*/
    _tempDate = date;

  };



  this.init();
}
Calendar_datePicker.prototype = {
  constructor: Calendar_datePicker,
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
      this.setView(this.ops.date);
    }else if (this.partner != null) {
      var date_partner = this.dateFormat(this.partner.getDate());
      if (date_partner != '') {
        this.setView(date_partner.replace(this.REG.date, '$1/$2'));
        this.partner.setView(date_partner.replace(this.REG.date, '$1/$2'));
      }
    }else if(this.getView()==''){
      var now = new Date(),
        year = now.getFullYear(),
        month = now.getMonth() + 1;
      this.setView(year + '/' + month);
    }
    if(this.ops.double){
      this.setTempDate('');
    }
    this.calendarBox();
    this.decorate();
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
      this.setView(date.replace(this.REG.date, '$1/$2'));
    }else if (this.partner != null) {
      var date_partner = this.dateFormat(this.partner.getDate() || this.partner.ops.defaultDate);
      if (date_partner != '') {
        this.setView(date_partner.replace(this.REG.date, '$1/$2'));
        this.partner.setView(date_partner.replace(this.REG.date, '$1/$2'));
      }
    }
    if(this.ops.double){
      this.setTempDate('');
    }
    this.calendarBox();
    this.decorate();
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
      $('.disabled').removeClass('disabled');
      _this.setDate('');
      var callback=_this.ops.callback;
      if(typeof callback=='function'){
        callback.call(_this);
      }
      if(typeof _this.ops.sure=='function'){
        _this.ops.sure('');
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

    $calendar_body.delegate('td[class!="disabled"][class!="space"]', 'click', function (e) {
      e.stopPropagation();
      if(_this.ops.double){
        _this.setTempDate($(this).attr('date'));
      }else{
        _this.setDate($(this).attr('date'));
        if(typeof _this.ops.sure=='function'){
          _this.ops.sure($(this).attr('date'));
        }
      }
      _this.decorate();
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
        if($(this).hasClass('disabled')) return;
        var thisDate=$(this).attr('date') || '',partnerDate;
        if(_this.ops.double){
          partnerDate=_this.partner.getTempDate() || _this.partner.getDate();
        }else{
          partnerDate=_this.partner.getDate();
        }

        if (thisDate != '' && partnerDate != '') {
          var between=$calendar.find('td[class="between"]'),
            firstDate,lastDate;
          if(between.length>0){
            if(_this.begin){
              var lastBetween=between.eq(between.length-1);
              firstDate=thisDate;
              lastDate=lastBetween.attr('date');
            }else{
              var firstBetween=between.eq(0);
              firstDate=firstBetween.attr('date');
              lastDate=thisDate;
            }

          }else{
            if(_this.begin && _this.hasPartnerDate() && _this.largerThanByYMD(partnerDate,thisDate)){
              firstDate=thisDate;
              var partnerTD=$calendar.find('td[date="'+partnerDate+'"]');
              if(partnerTD.length>0){
                lastDate=partnerTD.attr('date');
              }else{
                $(this).nextAll().addClass('during');
                $(this).parent().nextAll().addClass('during');
              }
            }else if(!_this.begin && _this.hasPartnerDate() && _this.largerThanByYMD(thisDate,partnerDate)){
              lastDate=thisDate;
              var partnerTD=$calendar.find('td[date="'+partnerDate+'"]');
              if(partnerTD.length>0){
                firstDate=partnerTD.attr('date');
              }else{
                $(this).prevAll().addClass('during');
                $(this).parent().prevAll().addClass('during');
              }
            }

          }
          if(typeof firstDate!='undefined' && typeof lastDate!='undefined'){
            var firstDateObj=_this.analysisDate(firstDate);
            var lastDateObj=_this.analysisDate(lastDate);
            for(var i=firstDateObj.date;i<=lastDateObj.date;i++){
              var td=$calendar.find('td[date="'+firstDateObj.year+'/'+firstDateObj.month+'/'+i+'"]');
              td.addClass('during');
            }
            if($calendar.find('td[date="'+firstDate+'"]').hasClass('blueDate')) {
              $calendar.find('td[date="' + firstDate + '"]').removeClass('during');
            }
            if($calendar.find('td[date="'+lastDate+'"]').hasClass('yellowDate')) {
              $calendar.find('td[date="' + lastDate + '"]').removeClass('during');
            }
          }
        }
      }, function () {
        var $calendar_during = $calendar.find('.during');
        $calendar_during.removeClass('during');
      })
    }

  },

  bindEvt_slideDate: function () {
    var _this = this,
      $calendar=_this.calendarBody;
    /*click:prev or next month*/
    var $calendar_body = $calendar.find('tbody');
    $calendar.delegate('.arrow_prev', 'click', function (e) {
      e.stopPropagation();
      var date = _this.getView(),
        prevMonth = _this.lastMonth(date),
        gridHTML = _this.calendarGrid(prevMonth);
      $calendar_body.html(gridHTML);
      _this.setView(prevMonth);
      _this.bindEvt_chooseDate();
      _this.decorate();

      //根据视图切换做调整
      if(_this.hasPartnerDate()){
        _this.decorate();
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
        date = _this.getView() || _this.partner != null ? _this.getView() || _this.partner.getView() : now.getFullYear() + '/' + (now.getMonth() + 1),
        nextMonth = _this.nextMonth(date),
        gridHTML = _this.calendarGrid(nextMonth);
      $calendar_body.html(gridHTML);
      _this.setView(nextMonth);
      _this.bindEvt_chooseDate();
      _this.decorate();

      //根据视图切换做调整
      if(_this.hasPartnerDate()){
        _this.decorate();
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
      _this.decorate();
      //根据视图切换做调整
      if(_this.hasPartnerDate()){
        _this.decorate();
      }

    })

    $calendar.delegate('.date_box_month','change', function (e) {
      e.stopPropagation();
      var date = $(this).prev().val() + '/' + $(this).val();
      $calendar_body.html(_this.calendarGrid(date));
      _this.setView(date);
      _this.bindEvt_chooseDate();
      _this.decorate();
      //根据视图切换做调整
      if(_this.hasPartnerDate()){
        _this.decorate();
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
      a.push('<td class="space"></td>');
    }

    for (var i = 1; i <= days; i++) {
      var date = i;

      a.push('<td date="' + year + '/' + month + '/' + date + '"><a>' + i + '</a></td>');
    }
    var l = a.length;
    if (l % 7 != 0) {
      for (var k = 0; k < 7 - (l % 7); k++) {
        a.push('<td class="space"></td>');
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
    for (var i = 1970; i <= new Date().getFullYear() + 3; i++) {
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
    } else if (this.hasPartnerDate()) {
      var partnerDate;

      if(this.ops.double){
        partnerDate=this.partner.getTempDate() || this.partner.getDate();
      }else{
        partnerDate = this.partner.getDate();
      }
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
  decorate: function () {
    // 任何时间修饰视图都使用该函数

    var $calendar=this.calendarBody,
      thisDate=this.ops.double ? this.getTempDate() || this.getDate() : this.getDate(),
      begin=this.begin,
      color='between',
      partnerDate;
    // 修饰年月
    if(this.getView()!=''){
      var year=this.analysisDate(this.getView()).year;
      var month=this.analysisDate(this.getView()).month;
      if(this.ops.switchYM){
        $calendar.find('.date_box_year').val(year);
        $calendar.find('.date_box_month').val(month);
      }else{
        $calendar.find('.date_box_title').html(year+'年'+month+'月');
      }
    }

    if(this.hasPartnerDate() && thisDate!=''){
      partnerDate=this.ops.double ? this.partner.getTempDate() || this.partner.getDate() : this.partner.getDate();
      var thisView=this.getView(),
        thisDateObj=this.analysisDate(thisDate),
        partnerDateObj=this.analysisDate(partnerDate),
        thisDateYM=thisDateObj.year+'/'+thisDateObj.month,
        partnerDateYM=partnerDateObj.year+'/'+partnerDateObj.month,
        firstTD,lastTD;

      //修饰table
      $calendar.find('.'+color).removeClass(color);
      if(thisView==thisDateYM && thisView==partnerDateYM){
        // 开始和结束日期在统一月，且视图在本月
        var firstDate,lastDate;
        if(begin){
          firstDate=$calendar.find('td[date="'+thisDate+'"]').attr('date');
          lastDate=$calendar.find('td[date="'+partnerDate+'"]').attr('date');
          this.disabledDates(lastDate,false);

        }else{
          firstDate=$calendar.find('td[date="'+partnerDate+'"]').attr('date');
          lastDate=$calendar.find('td[date="'+thisDate+'"]').attr('date');
          this.disabledDates(firstDate,true);
        }

        if(typeof firstDate!='undefined' && typeof lastDate!='undefined'){
          var firstDateObj=this.analysisDate(firstDate);
          var lastDateObj=this.analysisDate(lastDate);
          for(var i=firstDateObj.date;i<=lastDateObj.date;i++){
            var td=$calendar.find('td[date="'+firstDateObj.year+'/'+firstDateObj.month+'/'+i+'"]');
            td.removeClass('disabled blueDate yellowDate').addClass(color);
          }
        }
        this.lightBlueDate(firstDate);
        this.lightYellowDate(lastDate);

      }else{
        if(begin){

          if(this.largerThanByYM(partnerDateYM,thisView) && this.largerThanByYM(thisView,thisDateYM)){
            //结
            $calendar.find('tbody').find('td').removeClass('disabled blueDate yellowDate').addClass(color);
          }else if(this.largerThanByYM(thisView,partnerDateYM)){
            $calendar.find('td').addClass('disabled');
          }else{
            if(thisView==thisDateYM){
              this.lightBlueDate(thisDate);
              firstTD=$calendar.find('td[date="'+thisDate+'"]');
              firstTD.nextAll().removeClass('disabled blueDate yellowDate').addClass(color);
              firstTD.parent().nextAll().find('td').removeClass('disabled blueDate yellowDate').addClass(color);
            }
            if(thisView==partnerDateYM){
              this.lightYellowDate(partnerDate);
              lastTD=$calendar.find('td[date="'+partnerDate+'"]');
              lastTD.prevAll().removeClass('disabled blueDate yellowDate').addClass(color);
              lastTD.parent().prevAll().find('td').removeClass('disabled blueDate yellowDate').addClass(color);
              this.disabledDates(partnerDate,false);
            }

          }
        }else{
          if(this.largerThanByYM(partnerDate,thisView)){
            $calendar.find('tbody').find('td').addClass('disabled');
          }else if(this.largerThanByYM(thisView,partnerDateYM) && this.largerThanByYM(thisDateYM,thisView)){
            $calendar.find('tbody').find('td').removeClass('disabled blueDate yellowDate').addClass(color);
          }else{
            if(thisView==partnerDateYM){
              this.lightBlueDate(partnerDate);
              firstTD=$calendar.find('td[date="'+partnerDate+'"]');
              firstTD.nextAll().removeClass('disabled blueDate yellowDate').addClass(color);
              firstTD.parent().nextAll().find('td').removeClass('disabled blueDate yellowDate').addClass(color);
              this.disabledDates(partnerDate,true);
            }
            if(thisView==thisDateYM){
              this.lightYellowDate(thisDate);
              lastTD=$calendar.find('td[date="'+thisDate+'"]');
              lastTD.prevAll().removeClass('disabled blueDate yellowDate').addClass(color);
              lastTD.parent().prevAll().find('td').removeClass('disabled blueDate yellowDate').addClass(color);
            }
          }
        }
      }
    }else if(thisDate!=''){
      //没有partner的情况
      if(begin){
        this.lightBlueDate(thisDate);
      }else{
        this.lightYellowDate(thisDate);
      }
    }else if(this.hasPartnerDate()){
      partnerDate=this.ops.double ? this.partner.getTempDate() || this.partner.getDate() : this.partner.getDate();
      if(begin){
        this.lightYellowDate(partnerDate);
        this.disabledDates(partnerDate,false);
      }else{
        this.lightBlueDate(partnerDate);
        this.disabledDates(partnerDate,true);
      }
    }


  },

  lightYellowDate: function (date) {
    var $calendar = this.calendarBody,
      $calendar_yellowDate = $calendar.find('.yellowDate'),
      $calendar_date = $calendar.find('td[date="' + date + '"]');
    $calendar_yellowDate.removeClass('yellowDate');
    $calendar_date.removeClass('disabled between during').addClass('yellowDate');
  },
  lightBlueDate: function (date) {
    var $calendar=this.calendarBody,
      $calendar_blueDate = $calendar.find('.blueDate'),
      $calendar_date = $calendar.find('td[date="' + date + '"]');

    $calendar_blueDate.removeClass('blueDate');
    $calendar_date.removeClass('disabled between disabled').addClass('blueDate');
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
        // 将可用的日期重新去disabled化
        $calendar_date.nextAll().removeClass('disabled');
        $calendar_date.parent().nextAll().find('td').removeClass('disabled');
      } else {
        $calendar_date.nextAll().addClass('disabled');
        $calendar_date.parent().nextAll().find('td').addClass('disabled');
        // 将可用的日期重新去disabled化
        $calendar_date.prevAll().removeClass('disabled');
        $calendar_date.parent().prevAll().find('td').removeClass('disabled');
      }
    } else {
      var currentDate = this.getView(),
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
  largerThanByYMD:function(ymd1,ymd2){
    var first=ymd1.split('/'),
      y1=first[0]*1,
      m1=first[1]*1,
      d1=first[2]* 1,
      second=ymd2.split('/'),
      y2=second[0]*1,
      m2=second[1]* 1,
      d2=second[2]*1;
    if(y1>y2){
      return true;
    }else if(y1==y2 && m1>m2){
      return true;
    }else if(y1==y2 && m1==m2 && d1>d2){
      return true;
    }
    return false;
  },
  hasPartnerDate:function(){
    if(this.ops.double){
      return this.partner!=null && (this.partner.getTempDate() || this.partner.getDate())!='';
    }else{
      return this.partner!=null && this.partner.getDate()!='';
    }
  },
  /**/

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

  toTime: function (date) {
    /*将类似2014/01/01转换为毫秒*/
    return +new Date(date);
  },
  syncInput: function () {
    var date = this.getDate();
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


$.fn.extend({
  datePicker: function (ops) {

    /*
    * double: true or false 是否为双日历
    * date:具体日期如'2015/10/10'或具体阶段'2015/10/10-2016/1/1'，用于指定初始化日期
    * switchYM: true or false 是否可以进行年月的select选择
    * partner: 为一个input(jquery对象)
    * clear : true or false // 单日历
    * clear : function //双日历回调
    * beginDate:'',//double中的开始日期
    * endDate:''//double中的结束日期
    * limited:false or number+'y'/'m'/'d'  //指定时间跨度限制
    * */

    var helper={
      initInput:function($input){
        if($input.ops.double){
          if($input.ops.beginDate!='' && $input.ops.endDate!=''){
            $input.val($input.ops.beginDate+'-'+$input.ops.endDate);
          }
        }else{
          $input.val($input.ops.date);
        }
      },
      initShell:function($input){
        var shell='',
          close=$input.ops.necessary ? '' : '<span class="buttonIcon btn_close">关闭</span>';
        if($input.ops.double){
          shell=$('<div ' +
          'class="datePicker_shell datePicker_shell_double">' +
          '<div class="buttons">' +
          '<span class="clear">清 空</span>' +
          '<span class="sure">确 定</span>' +
          '</div>' +
           close+
          '</div>');
        }else{
          shell=$('<div ' +
          'class="datePicker_shell"></div>')
        }
        $('body').append(shell);
        $input.shell=shell;
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
      initCalendar:function($input){
        var ops=$input.ops;
        if($input.ops.double){
          //双日历的处理

          var ops_begin= $.extend({},ops,{clear:false}),
            ops_end= $.extend({},ops,{clear:false});
          ops_begin.date=ops_begin.beginDate || ops_begin.defaultBeginDate;
          ops_begin.close=false;
          delete ops_begin.beginDate;
          ops_end.date=ops_end.endDate || ops_end.defaultEndDate;
          ops_end.close=false;
          delete ops_end.endDate;
          ops_begin.callback=function(){
            this.partner.decorate();
          }
          ops_end.callback=function(){
            this.partner.decorate();
          }

          var beginCalendar=new Calendar_datePicker(ops_begin),
            endCalendar=new Calendar_datePicker(ops_end);
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
            ops.date=ops.date || ops.defaultDate;
          var calendar=new Calendar_datePicker(ops);
          calendar.input=$input;
          $input.calendar=calendar;

          var partner=$input.ops.partner;
          if(partner!=null){
            calendar.setPartner(partner,$input.ops.begin);
          }


        }
      },
      bindEvt_input:function($input){
        var _this=this;
        $input.on('click',function(e){
          //e.stopPropagation();
          //点击input后进行shell定位，防止初始化时input位置不准确引起的input和calendar错位
          var beginCalendar=$input.beginCalendar,
            endCalendar=$input.endCalendar,
            shell = $input.shell,
            $buttons = shell.find('.buttons');
          if($input.ops.double){
            if(shell.find('.calendar_box').length<1){
              beginCalendar.init();
              endCalendar.init();
            }else{
                if(beginCalendar.getDate()==''){
                    beginCalendar.setDate($input.ops.defaultBeginDate);
                }
                if(endCalendar.getDate()==''){
                    endCalendar.setDate($input.ops.defaultEndDate);
                }
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
                if(calendar.getDate()==''){
                    calendar.setDate($input.ops.defaultDate);
                }
              calendar.update();
            }
            shell.html(calendar.calendarBody);
            calendar.show();
            _this.positionShell($input);
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
      bindEvt_double_simple:function($input){
        var shell=$input.shell;
        shell.bind('click',function(e){
          e.stopPropagation();
        })
      },
      bindEvt_double_sure:function($input){
        var _this=this,
          shell=$input.shell,
          beginCalendar=$input.beginCalendar,
          endCalendar=$input.endCalendar;
        shell.delegate('.sure','click',function(e){
          e.stopPropagation();
          var beginDate=beginCalendar.getTempDate() || beginCalendar.getDate(),
            endDate=endCalendar.getTempDate() || endCalendar.getDate();
          if(beginDate!='' && endDate!=''){
            //verify dates
            var verify=true,
              limited = $input.ops.limited;
            if(limited){
              verify=_this.verify(beginDate,endDate,limited).pass;
            }
            if(verify) {
              $input.beginCalendar.setDate(beginDate);
              $input.endCalendar.setDate(endDate);
              $input.val(beginDate + '-' + endDate);
              shell.hide();
              if(typeof $input.ops.sure == 'function'){
                $input.ops.sure(beginDate + '-' + endDate);
              }
            }else{
              alert(_this.verify(beginDate,endDate,limited).msg)
            }
          }else if(beginDate=='' && endDate!=''){
            alert('请选择起始日期!');
          }else if(beginDate!='' && endDate==''){
            alert('请选择结束日期!');
          }else if($input.ops.necessary){
            alert('请选择相应的日期!');
          }else{
            shell.hide();
            $input.beginCalendar.hide();
            $input.endCalendar.hide();
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
      },
      verify:function(begin,end,limit){
        if(new Date(begin)>new Date(end)) return;
      //  解析limit
        var unit=limit.substr(-1,1),
          howmany=limit.substring(0,limit.length-1),
          bd=begin.split('/'),
          ed=end.split('/'),
          y1=bd[0],
          y2=ed[0],
          m1=bd[1],
          m2=ed[1]*1+12*(y2-y1),
          d1=bd[2],
          d2=ed[2];
        switch(unit){
          case 'd':
            return {
              pass:new Date(end)-new Date(begin)<=(howmany-1)*86400000,
              msg:'日期跨度不得超过'+howmany+'天!'
            };
          case 'm':
            return {
              pass:m2-m1+1<howmany || (m2-m1+1==howmany && d2-d1<=0),
              msg:'日期跨度不得超过'+howmany+'个月!'
            };
          case 'y':
            return {
              pass:m2-m1<howmany*12 || (m2-m1==howmany*12 && d2-d1<=0),
              msg:'日期跨度不得超过'+howmany+'年!'
            };
        }
        return {
          pass:true
        }
      }
    };

    var defaults = {
      partner: null,//仅用作传递给calendar对象
      switchYM: false,//仅用作传递给calendar对象
      double: false,
      clear:false,//单日历 仅用作传递给calendar对象  //double 清空后的回调
      date: '',//单日历中的日期
      beginDate:'',//double中的开始日期
      endDate:'',//double中的结束日期
      verify:false,//double 是否验证
      sure:'',//确定后的回调
      necessary:false, //double 日期是否必填

      defaultDate:'',// 单日历 当点击input时，如果日期为空，按该日期渲染
      defaultBeginDate:'',// 双日历 当点击input时，如果日期为空，按该起始日期渲染
      defaultEndDate:''// 双日历 当点击input时，如果日期为空，按该结束日期渲染
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