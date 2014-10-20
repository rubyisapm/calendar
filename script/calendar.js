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
        this.bindEvt();
    },
    bindEvt:function(){
        var _this=this;
        _this.input.on('click',function(e){
            e.stopPropagation();
            if($('#calendar_'+_this.inputId).length<=0){
                $('body').append(_this.drawShell());
            }
            if(_this.partner!=null){
                var partnerDate=_this.partner.getDate();
                $('#calendar_'+_this.inputId+' tbody').empty().append(_this.drawGrid(partnerDate));
                _this.related();
            }else{
                $('#calendar_'+_this.inputId+' tbody').empty().append(_this.drawGrid());
            }

            $('#calendar_'+_this.inputId).show();

            $('#calendar_'+$(this).attr('id')).delegate('td','click',function(e){
                e.stopPropagation();
                $(this).parents('tbody').find('td').removeClass('chosen');
                $(this).addClass('chosen');
                _this.setDate($(this).attr('date'));
            })
        })

        $(window).on('click',function(e){
            $('#calendar_'+_this.input.attr('id')).hide();
        })
    },
    /*rendar*/
    drawShell:function(){
        var shellHTML='<div class="calendar_box" id="calendar_'+this.input.attr("id")+'">'+
                        '<div class="calendar_btn">'+
                            '<span class="btn_close">关闭</span>'+
                            '<span class="arrow_prev">上月</span>'+
                            '<span class="arrow_next">下月</span>'+
                        '</div>'+
                        '<div class="date_box">'+
                            '<h2 class="date_box_title">2014年12月</h2>'+
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

        tableHTML= a.join(',');
        return tableHTML;

    },
    positionShell:function(shell){
        var x=this.input.offset().left,
            y=this.input.offset().top,
            h=this.input.height();
        shell.css({
            top:y+h,
            left:x
        })
    },
    showShell:function(shell){
        shell.show();
    },
    related:function(){
        var relatedDate=this.partner.getDate();
        this.lightDate(relatedDate);
    },
    lightDate:function(date){
        $('#calendar_'+_this.inputId).find('td[date='+date+']').addClass('partnerDate');
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
    getDate:function(){
        return this.date;
    },
    setDate:function(date){
        this.date=date;
    }

}