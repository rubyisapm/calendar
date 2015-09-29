

#### 快速开始
该日历插件采用jquery插件的形式，易于使用。

示例：

* 单日历

```
$('#end').datePicker({
   clear:true,
   switchYM:true,
   partner:beginCalendar.calendar,
   begin:false,
   date:'2015/4/10'
});
```
图示
![单日历](/readmeImage/single.jpg "图示")


* 双日历

```
$('#double').datePicker({
   double:true,
   switchYM:true,
   beginDate:'2015/1/3',
   endDate:'2015/9/10'
})
```
图示
![双日历](/readmeImage/double.jpg "图示")

#### 参数解析
* double: [boolean] true or false


参数名称 | 类型 | 格式 | 说明
----- | ---- | ---- | ----
double | boolean | true/false | 是否双日历
switchYM | boolean | true/false | 是否可以进行年月的select选择
partner | jquery对象 | jquery对象 | 该日历的对应的开始/结束日历
clear | boolean | true/false | 是否含有清空按钮
date | string | 2015/10/10 | 初始日期
beginDate | string | 2015/10/10 | 双日历中的初始开始日期
endDate | string | 2015/10/10 | 双日历中的初始结束日期
