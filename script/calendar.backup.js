/**
 * Created by ruby on 2014/10/19.
 */
function Calendar(input, ops) {
  /*
  * switch:false or true 是否可以下拉框切换年份及月份
  * view:'now' or 具体日期如'2011-10-10' 当前显示的月份,当连续滑动时需要一个值记录当前的日期显示状态是哪个月 //写入不可定制
  * */
  var defaults = {
    partner: null, // 不可传入!需通过setPartner设置
    switchYM: false,
    date: ''
  };
  this.ops = $.extend(true, {}, defaults, ops);
  this.view = ''; // 实际执行中为具体的日期如'2014-10-10';不可定制！只用于程序渲染
  this.input = $("#" + input);
  this.inputId = input;

}
Calendar.prototype = {
  constructor: Calendar,
  NORMAL: {
    TOMONTH: [1, 3, 5, 7, 8, 10, 12],
    TZMONTH: [4, 6, 9, 11]
  },
  init: function () {
    this.wrap();
    this.bindEvt();
    if (this.ops.date != '') {
      this.setDate(this.ops.date);
      this.view=this.ops.date;
    }
    if(this.view==''){
      var now = new Date(),
        year = now.getFullYear(),
        month = 1 * (now.getMonth()) + 1;
      this.view = year + '-' + month;
    }
  },
  updateView:function(){
    if ((date = this.getDate()) != '') {
      this.view = date.replace(/^(\d{4})-(\d{1,})-(\d{1,})$/, '$1-$2');
    }else if (this.partner != null) {
      var date_partner = this.dateFormat(this.partner.input.val());
      if (date_partner != '') {
        this.partner.date = date_partner;
        this.view=this.partner.view = date_partner.replace(/^(\d{4})-(\d{1,})-(\d{1,})$/, '$1-$2');
      }
    }
  },
  bindEvt: function () {
    var _this = this;
    _this.wraper.on('click', function (e) {
      e.stopPropagation();
      _this.updateView();
      var $shell = $('#shell_' + _this.inputId);
      $('.shell').hide();
      if (_this.getDate() != '') {
        var viewObj = _this.analysisDate(_this.getView()),
          dateObj = _this.analysisDate(_this.getDate()),
          viewEqualDate = viewObj.year == dateObj.year && viewObj.month == dateObj.month;
      }

      if ($shell.length <= 0 || !viewEqualDate) {
        $shell.remove();
        $('body').append(_this.calendarBox());
        var $newShell=$('#shell_' + _this.inputId);
        $newShell.show();
        _this.decorate();
        _this.bindEvt_closeDate();
        _this.bindEvt_chooseDate();
        _this.bindEvt_slideDate();
        _this.bindEvt_selectDate();
        _this.bindEvt_clear();
      }else{
        $shell.show();
        _this.decorate();
      }

    })

    $(window).on('click', function () {
      var $shell = $('#shell_' + _this.inputId);
      $shell.hide();
    })


  },
  bindEvt_clear:function(){
    var _this=this,
      $shell = $('#shell_' + _this.inputId),
      $calendar=$shell.find('.calendar_box');
    $calendar.each(function(i,calendar){
      calendar=$(calendar);
      calendar.delegate('.clear','click',function(e){
        e.stopPropagation();
        _this.input.val('');
        $('.yellowDate').removeClass('yellowDate');
        $('.blueDate').removeClass('blueDate');
        delete _this.date;
        $shell.hide();
      })
    })

  },
  bindEvt_closeDate: function () {
    var _this = this,
      $shell = $('#shell_' + _this.inputId);
    $shell.delegate('.btn_close', 'click', function (e) {
      e.stopPropagation();
      $shell.hide();
    })
  },
  bindEvt_chooseDate: function () {
    /*click:choose a date*/
    var _this = this,
      $shell = $('#shell_' + _this.inputId),
      $calendar=$shell.find('.calendar_box');
    $calendar.each(function(i,calendar){
      calendar=$(calendar);
      $calendar_body = calendar.find('tbody'),
        $calendar_td = calendar.find('td'),
        $calendar_during = calendar.find('.during');

      $calendar_body.delegate('td[class!="disabled"]', 'click', function (e) {
        e.stopPropagation();
        _this.setDate($(this).attr('date'));
        _this.setView($(this).attr('date'));
        $shell.hide();
      })

      calendar.on('click', function (e) {
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
          $calendar_during.removeClass('during');
        })
      }
    })

  },
  bindEvt_slideDate: function () {
    var _this = this,
      $shell = $('#shell_' + _this.inputId),
      $calendar=$shell.find('.calendar_box');
    $calendar.each(function(i,calendar){
      /*click:prev or next month*/
      calendar=$(calendar);
      var $calendar_body = calendar.find('tbody');
      calendar.delegate('.arrow_prev', 'click', function (e) {
        e.stopPropagation();
        var date = _this.view,
          prevMonth = _this.lastMonth(date),
          gridHTML = _this.calendarGrid(prevMonth);
        $calendar_body.html(gridHTML);
        _this.setView(prevMonth);
        _this.bindEvt_chooseDate();
        _this.decorate();
        if (_this.ops.switchYM) {
          _this.selecteDate(prevMonth);
        } else {
          _this.writeDate(prevMonth);
        }

      })
      calendar.delegate('.arrow_next', 'click', function (e) {
        e.stopPropagation();
        var now = new Date(),
          date = _this.view || _this.partner != null ? _this.view || _this.partner.view : now.getFullYear() + '-' + (now.getMonth() + 1),
          nextMonth = _this.nextMonth(date),
          gridHTML = _this.calendarGrid(nextMonth);
        $calendar_body.html(gridHTML);
        _this.setView(nextMonth);
        _this.bindEvt_chooseDate();
        _this.decorate();
        if (_this.ops.switchYM) {
          _this.selecteDate(nextMonth);
        } else {
          _this.writeDate(nextMonth);
        }
      })
    })

  },
  bindEvt_selectDate: function () {
    var _this = this,
      $shell=$('#shell_'+_this.inputId),
      $calendar=$shell.find('.calendar_box');
    $calendar.each(function(i,calendar){
      calendar=$(calendar);
      $calendar_body = calendar.find('tbody'),
        $calendar_date_box_year = calendar.find('.date_box_year'),
        $calendar_date_box_month = calendar.find('.date_box_month');
      $calendar_date_box_year.on('change', function (e) {
        e.stopPropagation();
        var date = $(this).val() + '-' + $(this).next().val();
        $calendar_body.html(_this.calendarGrid(date));
        _this.setView(date);
        _this.bindEvt_chooseDate();
      })

      $calendar_date_box_month.on('change', function (e) {
        e.stopPropagation();
        var date = $(this).prev().val() + '-' + $(this).val();
        $calendar_body.html(_this.calendarGrid(date));
        _this.setView(date);
        _this.bindEvt_chooseDate();
      })
    })


  },
  /*render*/
  wrap: function () {
    var iconHTML = '';
    this.input.wrap('<div class="calendar_wrap"></div>');
    if (this.partner != null && !(this.begin)) {
      iconHTML = '<span class="calendar_icon calendar_icon_end"></span>';
    } else {
      iconHTML = '<span class="calendar_icon calendar_icon_begin"></span>';
    }
    this.input.before(iconHTML);
    this.wraper = this.input.parent();
  },
  calendarBox: function () {
    var pos = this.positionShell(),
      calendarHTML=this.calendarBox();
      var shellHTML='<div ' +
        'class="shell" ' +
        'id="shell_' + this.input.attr("id") + '" ' +
        'style="top:' + pos.top + ';left:' + pos.left + '">' +
        calendarHTML+
        '</div>';

    return shellHTML;

  },
  calendarBox:function(){
    var HTMLs = this.render(),
      boxClass = '';
    if (this.partner != null && !this.begin) {
     boxClass = 'calendar_box_end';
     } else {
     boxClass = 'calendar_box_begin';
     }
    var calendarHTML = '<div class="calendar_box ' + boxClass + '">' +
     '<div class="calendar_btn">' +
     '<span class="btn_close">关闭</span>' +
     '<span class="arrow_prev">上月</span>' +
     '<span class="arrow_next">下月</span>' +
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
     '<span class="clear">清 空</span>'+
     '</div>';
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

      a.push('<td date="' + year + '-' + month + '-' + date + '"><a>' + i + '</a></td>');
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
    var date = this.date;
    if (typeof  date != "undefined") {
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
  decorate: function () {
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
  positionShell: function () {
    var x = this.input.offset().left,
      y = this.input.offset().top,
      h = parseInt(this.input.outerHeight());
    return {
      top: y + h + 'px',
      left: x + 'px'
    }
  },
  lightYellowDate: function (date) {
    var $calendar_yellowDate = $('#shell_' + this.inputId + ' .yellowDate'),
      $calendar_date = $('#shell_' + this.inputId + ' td[date=' + date + ']');
    $calendar_yellowDate.removeClass('yellowDate disabled');
    $calendar_date.addClass('yellowDate');
  },
  lightBlueDate: function (date) {
    var $calendar_blueDate = $('#shell_' + this.inputId + ' .blueDate'),
      $calendar_date = $('#shell_' + this.inputId + ' td[date=' + date + ']');

    $calendar_blueDate.removeClass('blueDate disabled');
    $calendar_date.addClass('blueDate');
  },
  disabledDates: function (date, before) {
    /*
     * date:某个时间点
     * before:Boolean 决定将之前还是之后的日期设置为不可选
     * */
    var $calendar_date = $('#shell_' + this.inputId + ' td[date="' + date + '"]');
    if ($calendar_date.length > 0) {
      if (before) {
        $calendar_date.prevAll().addClass('disabled');
        $calendar_date.parent().prevAll().find('td').addClass('disabled');
      } else {
        $calendar_date.nextAll().addClass('disabled');
        $calendar_date.parent().nextAll().find('td').addClass('disabled');
      }
    } else {
      var currentDate = this.view.split('-').join('/'),
        date = date.split('-').slice(0, 2).join('/');

      if ((before && new Date(currentDate) < new Date(date)) || (!before && new Date(currentDate) > new Date(date))) {
        var $calendar_td = $('#shell_' + this.inputId + ' td');
        $calendar_td.addClass('disabled');
      }else{
        var allTds=$('#shell_'+this.inputId+' td');
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
      $calendar=$('#shell_' + _this.inputId);
    if (_this.toTime(begin) < _this.toTime(end)) {
      if (beginObj.year == endObj.year && beginObj.month == endObj.month) {
        var middleArr = [],
          i = 0,
          b = beginObj.date,
          e = endObj.date,
          len = e - b + 1,
          prefix = beginObj.year + '-' + beginObj.month + '-';
        while (i < len - 2) {
          middleArr.push(prefix + (++b));
          i++;
        }
        $('#shell_' + _this.inputId + ' td').removeClass(color);
        middleArr.map(function (date) {
          var middleTd=$('#shell_' + _this.inputId + ' td[date="' + date + '"]');
          middleTd.addClass(color);
        })
      } else if (beginObj.year < endObj.year || (beginObj.year == endObj.year && beginObj.month < endObj.month)) {
        if (isBegin) {
          var $beginDate = $('#shell_' + _this.inputId + ' td[date="' + begin + '"]');
          $calendar.find('td').removeClass(color);
          $beginDate.nextAll().addClass(color);
          $beginDate.parent().nextAll().find('td').addClass(color);
        } else {
          var $endDate = $('#shell_' + _this.inputId + ' td[date="' + end + '"]');
          $calendar.find('td').removeClass(color);
          $endDate.prevAll().addClass(color);
          $endDate.parent().prevAll().find('td').addClass(color);
        }
      }
    }
  },
  syncInput: function () {
    var date = this.date;
    this.input.val(date);
  },
  selecteDate: function (date) {
    var date = this.analysisDate(date),
      $calendar_date_box_year = $('#shell_' + this.inputId + ' .date_box_year'),
      $calendar_date_box_month = $('#shell_' + this.inputId + ' .date_box_month');
    $calendar_date_box_year.val(date.year);
    $calendar_date_box_month.val(date.month);
  },
  writeDate: function (date) {
    var gridHTML = this.calendarTitle(date),
      $calendar_date_box_title = $('#shell_' + this.inputId + ' .date_box_title');
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
    /*date:year-month or year-month-date*/
    var a = date.split('-');
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
    if (/^\d{4}-\d{1,}-\d{1,}$/.test(date)) {
      var arr = date.split('-');
      arr = arr.map(function (v) {
        return parseInt(v);
      })
      return arr.join('-');
    } else {
      return '';
    }

  },
  lastMonth: function (date) {
    /*date:year-month or year-month-date*/
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
    return resultY + '-' + resultM;
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
    return resultY + '-' + resultM;
  },
  getDate: function () {
    return this.date || '';
  },
  setDate: function (date) {
    /*date:year-month-date*/
    this.date = date;
    this.syncInput();
    this.decorate();
  },
  setPartner: function (partner, first) {
    /*
     * partner: Calendar object
     * first:boolean
     * */

    this.partner = partner;
    this.begin = first;
    if (partner.partner == null) {
      partner.setPartner(this, !first);
    }
  },
  setView: function (date) {
    /*date:year-month or year-month-date*/
    this.view = date;
  },
  getView: function () {
    return this.view;
  },
  toTime: function (date) {
    /*将类似2014-01-01转换为毫秒*/
    return +new Date(date.split('-').join('/'));
  }

}