/**
 * Created by ruby on 2014/10/19.
 */
function Calendar(input,ops){
    /*holiday:true or false 是否显示节日信息
    * partner:null or Calendar-obj 指定起始日期配对
    * limited:false or days[number] 是否限制日期范围
    * switchY:false or true 是否可以一键切换年份
    * fromToday:true or false 是否只能从今天开始选择
    * input:true or false 是否允许手动输入日期
    *
    * */
    var defaults={
        holiday:true,
        partner:null,
        limited:false,
        switchY:false,
        fromToday:true,
        input:true
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
    },
    bindEvt:function(){
        var _this=this;
        _this.wraper.on('click',function(e){
            e.stopPropagation();
            $('.calendar_box').hide();
            if($('#calendar_'+_this.inputId).length<=0){
                $('body').append(_this.drawShell());
            }
            $('#calendar_'+_this.inputId).show();
            _this.howToDecorate();
            $('#calendar_'+_this.inputId+' td[class!="disabled"]').on('click',function(e){
                e.stopPropagation();
                _this.setDate($(this).attr('date'));
                $('#calendar_'+_this.inputId).hide();
            })
            $('#calendar_'+_this.inputId).on('click',function(e){
                e.stopPropagation();
            })

            if(_this.partner!=null){
                $('#calendar_'+_this.inputId+' td').hover(function(){
                    var end=_this.partner.getDate(),
                        begin=$(this).attr('date');
                    if(typeof end!='undefined' && typeof begin!='undefined'){
                        if(_this.begin){
                            _this.lightMiddleDates(begin,end);
                        }else{
                            _this.lightMiddleDates(end,begin);
                        }
                    }
                },function(){
                    $('#calendar_'+_this.inputId+' .during').removeClass('during');
                })
            }
        })

        $(window).on('click',function(e){
            $('#calendar_'+_this.inputId).hide();
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
        var pos=this.positionShell();
        var HTMLs=this.howToDraw();
        var shellHTML='<div class="calendar_box" id="calendar_'+this.input.attr("id")+'" style="top:'+pos.top+';left:'+pos.left+'">'+
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
            date,
            days= 0,
            tableHTML='',
            firstDay=0;
        if(typeof day!='undefined'){
            var day=this.analysisDate(day);
            year=day.year;
            month=day.month;
            date=day.date;
        }else{
            year=crtDate.getFullYear();
            month=crtDate.getMonth()+ 1;
            date=crtDate.getDate();
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
        for(var k= a.length;k<35;k++){
            a.push('<td></td>');
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
    howToDraw:function(){
        if(typeof this.date !="undefined"){
            return {
                gridHTML:this.drawGrid(this.date),
                titleHTML:this.drawTitle(this.date)
            }
            //this.lightSelfDate(this.date);
        }else if(this.partner!=null){
            var partnerDate=this.partner.getDate();
            return {
                gridHTML:this.drawGrid(partnerDate),
                titleHTML:this.drawTitle(partnerDate)
            }
            //this.related();
        }else{
            return {
                gridHTML:this.drawGrid(),
                titleHTML:this.drawTitle()
            }
        }
    },
    howToDecorate:function(){
        if(this.partner!=null){
            var date=this.getDate(),
                partnerDate=this.partner.getDate();
            if(this.begin){
                if(typeof date!='undefined'){
                    this.lightBlueDate(date);
                }
                if(typeof partnerDate!='undefined'){
                    this.lightYellowDate(partnerDate);
                    this.disabledDates(partnerDate,false);
                }
            }else{
                if(typeof date!='undefined'){
                    this.lightYellowDate(date);
                }
                if(typeof partnerDate!='undefined'){
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
    lightMiddleDates:function(begin,end){
        var _this=this;
        var begin=_this.analysisDate(begin),
            end=_this.analysisDate(end);
        if(begin.year>end.year || begin.month>end.month){
            $('#calendar_'+_this.inputId+' td[date="'+date+'"]').nextAll().addClass('during');
            $('#calendar_'+_this.inputId+' td[date="'+date+'"]').parent().nextAll().find('td').addClass('during');
        }else{
            $('#calendar_'+_this.inputId+' td').filter(function(){
                if(typeof $(this).attr('date')!='undefined'){
                    var date=_this.analysisDate($(this).attr('date')).date;
                    return 1*date>1*begin.date && 1*date<1*end.date;
                }
            }).addClass('during');
        }
    },
    inputDate:function(){
        var date=this.date;
        this.input.val(date);
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
    analysisDate:function(date){
        var a=date.split('-');
        return {
            year:a[0],
            month:a[1],
            date:a[2]
        }
    },
    getDate:function(){
        return this.date;
    },
    setDate:function(date){
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
    }

}