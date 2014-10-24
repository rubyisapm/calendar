/**
 * Created by ruby on 2014/10/19.
 */
function Calendar(input,ops){
    /*holiday:true or false 是否显示节日信息
    * partner:null or Calendar-obj 指定起始日期配对
    * limited:false or days[number] 是否限制日期范围
    * switch:false or true 是否可以下拉框切换年份及月份
    * fromToday:true or false 是否只能从今天开始选择（如果此选项和view冲突，那么依据此项）
    * input:true or false 是否允许手动输入日期
    * view:'now' or 具体日期如'2011-10-10' 当前显示的月份,当连续滑动时需要一个值记录当前的日期显示状态是哪个月
    * */
    var HOLIDAY={
        '1-1':'元旦',
        '':'',
        '':'',
        '':'',
        '':'',
        '':'',
        '':'',
        '':'',
        '':'',
        '':'',
        '':''
    }
    var defaults={
        holiday:true,
        partner:null,
        limited:false,
        switchYM:false,
        input:true,
        view:'now'
    };
    this.ops= $.extend(true,{},ops,defaults);
    this.input=$("#"+input);
    this.inputId=input;

}
Calendar.prototype={
    constructor:Calendar,
    NORMAL:{
        TOMONTH:[1,3,5,7,8,10,12],
        TZMONTH:[4,6,9,11]
    },
    init:function(){
        this.wrap();
        this.bindEvt();
        if(this.view='now'){
            var now=new Date(),
                year=now.getFullYear(),
                month=1*(now.getMonth())+1;
            this.view=year+'-'+month;
        }
    },
    bindEvt:function(){
        var _this=this;
        _this.wraper.on('click',function(e){
            e.stopPropagation();
            $('.calendar_box').hide();
            if(typeof _this.getDate()!='undefined'){
                var viewObj=_this.analysisDate(_this.getView()),
                    dateObj=_this.analysisDate(_this.getDate()),
                    same=viewObj.year==dateObj.year && viewObj.month==dateObj.month;
            }
            if($('#calendar_'+_this.inputId).length<=0 || !same){
                $('#calendar_'+_this.inputId).remove();
                $('body').append(_this.drawShell());
                _this.bindEvt_slideDate();
                _this.bindEvt_selectDate();
            }
            $('#calendar_'+_this.inputId).show();
            _this.howToDecorate();
            _this.bindEvt_chooseDate();
            _this.bindEvt_selectDate();
        })

        $(window).on('click',function(e){
            $('#calendar_'+_this.inputId).hide();
        })
    },
    bindEvt_chooseDate:function(){
        /*click:choose a date*/
        var _this=this;
        $('#calendar_'+_this.inputId+' td[class!="disabled"]').on('click',function(e){
            e.stopPropagation();
            _this.setDate($(this).attr('date'));
            _this.setView($(this).attr('date'));
            $('#calendar_'+_this.inputId).hide();
        })

        $('#calendar_'+_this.inputId).on('click',function(e){
            e.stopPropagation();
        })

        /*hover:choose a date when the partner's date is available*/
        if(_this.partner!=null){
            $('#calendar_'+_this.inputId+' td').hover(function(){
                var end=_this.partner.getDate(),
                    begin=$(this).attr('date');
                if(typeof end!='undefined' && typeof begin!='undefined'){
                    if(_this.begin){
                        _this.lightMiddleDates(begin,end,"during");
                    }else{
                        _this.lightMiddleDates(end,begin,"during");
                    }
                }
            },function(){
                $('#calendar_'+_this.inputId+' .during').removeClass('during');
            })
        }
    },
    bindEvt_slideDate:function(){
        var _this=this;
        /*click:prev or next month*/
        $('#calendar_'+_this.inputId+' .arrow_prev').on('click',function(){
            var date=_this.view,
                prevMonth=_this.lastMonth(date),
                gridHTML=_this.drawGrid(prevMonth);
            $('#calendar_'+_this.inputId+' tbody').html(gridHTML);
            _this.setView(prevMonth);
            _this.bindEvt_chooseDate();
            if(_this.switchYM){
                _this.selecteDate(prevMonth);
            }else{
                _this.writeDate(prevMonth);
            }

        })
        $('#calendar_'+_this.inputId+' .arrow_next').on('click',function(){
            var date=_this.view,
                nextMonth=_this.nextMonth(date),
                gridHTML=_this.drawGrid(nextMonth);
            $('#calendar_'+_this.inputId+' tbody').html(gridHTML);
            _this.setView(nextMonth);
            _this.bindEvt_chooseDate();
            if(_this.switchYM){
                _this.selecteDate(nextMonth);
            }else{
                _this.writeDate(nextMonth);
            }
        })
    },
    bindEvt_selectDate:function(){
        var _this=this;
        $('#calendar_'+this.inputId+' .date_box_year').on('change',function(){
            var date=$(this).val()+'-'+$(this).next().val();
            $('#calendar_'+_this.inputId+' tbody').html(_this.drawGrid(date));
            _this.setView(date);
            _this.bindEvt_chooseDate();
        })
        $('#calendar_'+this.inputId+' .date_box_month').on('change',function(){
            var date=$(this).prev().val()+'-'+$(this).val();
            $('#calendar_'+_this.inputId+' tbody').html(_this.drawGrid(date));
            _this.setView(date);
            _this.bindEvt_chooseDate();
        })

    },
    /*rendar*/
    wrap:function(){
        var iconHTML='';
        this.input.wrap('<div class="calendar_wrap"></div>');
        if(this.partner!=null && !(this.begin)){
            iconHTML='<span class="calendar_icon calendar_icon_end"></span>';
        }else{
            iconHTML='<span class="calendar_icon calendar_icon_begin"></span>';
        }
        this.input.before(iconHTML);
        this.wraper=this.input.parent();
    },
    drawShell:function(){
        var pos=this.positionShell(),
            HTMLs=this.howToDraw(),
            boxClass='';
        if(this.partner!=null && !this.begin){
            boxClass='calendar_box_end';
        }else{
            boxClass='calendar_box_begin';
        }
        var shellHTML='<div class="calendar_box '+boxClass+'" id="calendar_'+this.input.attr("id")+'" style="top:'+pos.top+';left:'+pos.left+'">'+
                        '<div class="calendar_btn">'+
                            '<span class="btn_close">关闭</span>'+
                            '<span class="arrow_prev">上月</span>'+
                            '<span class="arrow_next">下月</span>'+
                        '</div>'+
                        '<div class="date_box">'+
                            '<h2 class="date_box_title">'+HTMLs.titleHTML+'</h2>'+
                            '<table class="date_table">'+
                                '<thead>'+
                                    '<tr>'+
                                        '<td><b>日</b></td>'+
                                        '<td>一</td>'+
                                        '<td>二</td>'+
                                        '<td>三</td>'+
                                        '<td>四</td>'+
                                        '<td>五</td>'+
                                        '<td><b>六</b></td>'+
                                    '</tr>'+
                                '</thead>'+
                                '<tbody>'+
                                    HTMLs.gridHTML+
                                '</tbody>'+
                            '</table>'+
                        '</div>'+
                    '</div>';
        return shellHTML;
    },
    drawGrid:function(day){
        var crtDate=new Date(),
            year,
            month,
            days= 0,
            tableHTML='',
            firstDay=0;
        if(typeof day!='undefined'){
            var day=this.analysisDate(day);
            year=day.year;
            month=day.month;
        }else{
            year=crtDate.getFullYear();
            month=crtDate.getMonth()+ 1;
        }
        crtDate.setFullYear(year,month-1,1);
        firstDay=crtDate.getDay();

        /*how many days in this month*/
        if(month==2){
            if(this.isLeap(year)){
                days=29;
            }else{
                days=28;
            }
        }else{
            if(this.isTOMonth(month)){
                days=31;
            }else{
                if(this.isTZMonth(month)){
                    days=30;
                }
            }
        }
        /*draw*/

        var a=[];
        for(var j=0;j<firstDay;j++){
            a.push('<td></td>');
        }
        for(var i=1;i<=days;i++){
            a.push('<td date="'+year+'-'+month+'-'+i+'"><a>'+i+'</a></td>');
        }
        var l= a.length;
        if(l%7!=0){
            for(var k= 0;k<7- (l%7);k++){
                a.push('<td></td>');
            }
        }
        $.each(a,function(i){
            if(i%7==0){
                a[i]='<tr>'+a[i];
            }else if((i+1)%7==0){
                a[i]=a[i]+'</tr>';
            }
        })

        tableHTML= a.join('');
        return tableHTML;

    },
    drawSelect:function(day){
        console.log(day);
        var crtDate=new Date(),
            year,
            month,
            selectYearHTML='',
            selectMonthHTML='';
        if(typeof day!='undefined'){
            var day=this.analysisDate(day);
            year=day.year;
            month=day.month;
        }else{
            year=crtDate.getFullYear();
            month=crtDate.getMonth()+ 1;
        }
        selectYearHTML+='<select class="date_box_year">';
        for(var i=1970;i<=year+3;i++){
            if(year==i){
                selectYearHTML+='<option selected="selected" value="'+i+'">'+i+'</option>';
            }
            selectYearHTML+='<option value="'+i+'">'+i+'</option>';
        }
        selectYearHTML+='</select>';
        selectMonthHTML+='<select class="date_box_month">';
        for(var i=0;i<=12;i++){
            if(month==i){
                selectMonthHTML+='<option selected="selected" value="'+i+'">'+i+'</option>';
            }else{
                selectMonthHTML+='<option value="'+i+'">'+i+'</option>';
            }
        }
        selectMonthHTML+='</select>';
        return selectYearHTML+' 年 '+selectMonthHTML+' 月';
    },
    drawTitle:function(day){
        var crtDate=new Date(),
            year,
            month;
        if(typeof day!='undefined'){
            var day=this.analysisDate(day);
            year=day.year;
            month=day.month;
        }else{
            year=crtDate.getFullYear();
            month=crtDate.getMonth()+ 1;
        }
        return year+'年'+month+'月';

    },
    howToDraw:function(){
        if(typeof this.date !="undefined"){
            return {
                gridHTML:this.drawGrid(this.date),
                titleHTML:this.switchYM ? this.drawSelect(this.date) : this.drawTitle(this.date)
            }
        }else if(this.partner!=null && typeof this.partner.getDate()!='undefined'){
            var partnerDate=this.partner.getDate();
            return {
                gridHTML:this.drawGrid(partnerDate),
                titleHTML:this.switchYM ? this.drawSelect(partnerDate) : this.drawTitle(partnerDate)
            }
        }else{
            return {
                gridHTML:this.drawGrid(),
                titleHTML:this.switchYM ? this.drawSelect() : this.drawTitle()
            }
        }
    },
    howToDecorate:function(){
        if(this.partner!=null){
            var date=this.getDate(),
                partnerDate=this.partner.getDate();
            if(this.begin){
                if(typeof date!='undefined' && typeof partnerDate!='undefined'){
                    this.lightBlueDate(date);
                    this.lightYellowDate(partnerDate);
                    this.disabledDates(partnerDate,false);
                    this.lightMiddleDates(date,partnerDate,'between');
                }else if(typeof date!='undefined'){
                    this.lightBlueDate(date);
                }else if(typeof partnerDate!='undefined'){
                    this.lightYellowDate(partnerDate);
                    this.disabledDates(partnerDate,false);
                }

            }else{
                if(typeof date!='undefined' && typeof partnerDate!='undefined'){
                    this.lightYellowDate(date);
                    this.lightBlueDate(partnerDate);
                    this.disabledDates(partnerDate,true);
                    this.lightMiddleDates(partnerDate,date,'between');
                }else if(typeof date!='undefined'){
                    this.lightYellowDate(date);
                }else if(typeof partnerDate!='undefined'){
                    this.lightBlueDate(partnerDate);
                    this.disabledDates(partnerDate,true);
                }
            }
        }else{
            if(typeof date!='undefined'){
                this.lightBlueDate(date);
            }
        }
    },
    positionShell:function(){
        var x=this.input.offset().left,
            y=this.input.offset().top,
            h=parseInt(this.input.outerHeight());
        return {
            top:y+h+'px',
            left:x+'px'
        }
    },
    showShell:function(shell){
        shell.show();
    },
    lightYellowDate:function(date){
        $('#calendar_'+this.inputId+' .yellowDate').removeClass('yellowDate disabled');
        $('#calendar_'+this.inputId).find('td[date='+date+']').addClass('yellowDate');
    },
    lightBlueDate:function(date){
        $('#calendar_'+this.inputId+' .blueDate').removeClass('blueDate disabled');
        $('#calendar_'+this.inputId).find('td[date='+date+']').addClass('blueDate');
    },
    disabledDates:function(date,before){
        /*
        * date:某个时间点
        * before:Boolean
        * */
         if(before){
            $('#calendar_'+this.inputId+' td[date="'+date+'"]').prevAll().addClass('disabled');
            $('#calendar_'+this.inputId+' td[date="'+date+'"]').parent().prevAll().find('td').addClass('disabled');
        }else{
            $('#calendar_'+this.inputId+' td[date="'+date+'"]').nextAll().addClass('disabled');
            $('#calendar_'+this.inputId+' td[date="'+date+'"]').parent().nextAll().find('td').addClass('disabled');
        }

    },
    lightMiddleDates:function(begin,end,color){
        var _this=this;
        var beginObj=_this.analysisDate(begin),
            endObj=_this.analysisDate(end);
        if(beginObj.year<endObj.year || beginObj.month<endObj.month){
            $('#calendar_'+_this.inputId+' td[date="'+begin+'"]').nextAll().addClass(color);
            $('#calendar_'+_this.inputId+' td[date="'+begin+'"]').parent().nextAll().find('td').addClass(color);

            $('#calendar_'+_this.inputId+' td[date="'+end+'"]').prevAll().addClass(color);
            $('#calendar_'+_this.inputId+' td[date="'+end+'"]').parent().prevAll().find('td').addClass(color);
        }else{
            $('#calendar_'+_this.inputId+' td').filter(function(){
                if(typeof $(this).attr('date')!='undefined'){
                    var date=_this.analysisDate($(this).attr('date')).date;
                    return 1*date>1*beginObj.date && 1*date<1*endObj.date;
                }
            }).addClass(color);
        }
    },
    inputDate:function(){
        var date=this.date;
        this.input.val(date);
    },
    selecteDate:function(date){
        var date=this.analysisDate(date);
        $('#calendar_'+this.inputId+' .date_box_year').val(date.year);
        $('#calendar_'+this.inputId+' .date_box_month').val(date.month);
    },
    writeDate:function(date){
        var gridHTML=this.drawTitle(date);
        $('#calendar_'+this.inputId+' .date_box_title').html(gridHTML);
    },
    /*base*/
    isLeap:function(year){
        if(year%4==0 && year%100!=0 && year%400==0){
            return true;
        }else{
            return false;
        }
    },
    isTOMonth:function(month){
        if(this.NORMAL.TOMONTH.indexOf(month)){
            return true;
        }else{
            return false;
        }
    },
    isTZMonth:function(month){
        if(this.NORMAL.TZMONTH.indexOf(month)){
            return true;
        }else{
            return false;
        }
    },
    isFirstMonth:function(month){
        if(month==1){
            return true;
        }
        return false;
    },
    isLastMonth:function(month){
        if(month==12){
            return true;
        }
        return false;
    },
    isHoliday:function(date){
        if(date in this.holiday){
            return true;
        }else{
            return false;
        }
    },
    analysisDate:function(date){
        /*date:year-month or year-month-date*/
        var a=date.split('-');
        if(a.length==2){
            return {
                year:a[0],
                month:a[1]
            }
        }else{
            return {
                year:a[0],
                month:a[1],
                date:a[2]
            }
        }
    },
    lastMonth:function(date){
        /*date:year-month or year-month-date*/
        var date=this.analysisDate(date),
            resultY,
            resultM;
        if(this.isFirstMonth(date.month)){
            resultY=date.year-1;
            resultM=12;
        }else{
            resultY=date.year;
            resultM=date.month-1;
        }
        return resultY+'-'+resultM;
    },
    nextMonth:function(date){
        /*date:year-month or year-month-date*/
        var date=this.analysisDate(date),
            resultY,
            resultM;
        if(this.isLastMonth(date.month)){
            resultY=1*date.year+1;
            resultM=1;
        }else{
            resultY=date.year;
            resultM=1*date.month+1;
        }
        return resultY+'-'+resultM;
    },
    getDate:function(){
        return this.date;
    },
    setDate:function(date){
        /*date:year-month-date*/
        this.date=date;
        this.inputDate();
        this.howToDecorate();
    },
    setPartner:function(partner,first){
        /*
        * partner: Calendar object
        * first:boolean
        * */
        this.partner=partner;
        this.begin=first;
        if(partner.partner==null){
            partner.setPartner(this,!first);
        }
    },
    setView:function(date){
        /*date:year-month or year-month-date*/
        this.view=date;
    },
    getView:function(){
        return this.view;
    }

}