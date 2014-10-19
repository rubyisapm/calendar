/**
 * Created by ruby on 2014/10/19.
 */
function Calender(ops){
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
    this.ops= $.extends(true,{},ops,defaults);

}
Calendar.prototype={
    constructor:Calendar,
    NORMAL:{
        TOMONTH:[1,3,5,7,8,10,12],
        TZMONTH:[4,6,9,11]
    },
    init:function(){

    },
    render:{
        drawGrid:function(day){
            var crtDate=new Date(),
                year=day.year||crtDate.getFullYear(),
                month=day.month||crtDate.getMonth()+ 1,
                date=day.date||crtDate.getDate(),
                days= 0,
                html='';
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
                    this.isTZMonth(month){
                        days=30;
                    }
                }
            }

        },
        related:function(){
            var relatedDate=this.partner.getDate();
            this.lightDate(relatedDate);
        },
        lightDate:function(date){
            /*light this day*/
        }
    },
    base:{
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
        }
    },
    getDate:function(){
        return this.date;
    },
    setDate:function(date){
        this.date=date;
    },

}