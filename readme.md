​

#### 快速开始

该组插件包含日历选择和月历选择两个独立部分，用于日常项目中的日期或月份选择。

该日历插件采用jquery插件的形式，易于使用。

对于区间选择，支持弱限制，前端需要在提交前进行进一步的验证。


示例：

* 单日历

```
$('#date').datePicker({
   clear:true,
   switchYM:true,
   partner:beginCalendar.calendar,
   begin:false,
   date:'2015/4/10'
});
```
图示
![单日历](/readmeImages/date_single.png "图示")



* 结合式双日历

```
$('#double').datePicker({
   double:true,
   switchYM:true,
   beginDate:'2015/1/3',
   endDate:'2015/9/10'
})
```
图示
![双日历](/readmeImages/date_double.png "图示")

* 分离式双日历

```
var m_beginCalendar=$('#m_begin').monthPicker();
$('#m_end').monthPicker({
   clear:true,
   partner:m_beginCalendar.calendar,
   begin:false,
   date:'2015/3'
})
```

#### 参数解析

参数名称 | 类型 | 格式 | 说明
----- | ---- | ---- | ----
double | boolean | true/false | 是否双日历
switchYM | boolean | true/false | 是否可以进行年月的select选择
partner | jquery对象 | jquery对象 | 该日历的对应的开始/结束日历对象
clear | boolean | true/false | 是否含有清空按钮（针对单日历）
date | string | 2015/10/10 | 单日历中的初始日期
beginDate | string | 2015/10/10 | 双日历中的初始开始日期
endDate | string | 2015/10/10 | 双日历中的初始结束日期


* 单月历

```
$('#month').monthPicker({
   clear:true,
   date:'2015/3'
})
```
图示
![单月历](/readmeImages/month_single.png "图示")



* 结合式双月历

```
$('#m_double').monthPicker({
   double:true,
   beginDate:'2015/3',
   endDate:'2016/6',
   limited:'3y'
})
```
图示
![双月历](/readmeImages/month_double.png "图示")

* 结合式双月历

```
$('#m_double').monthPicker({
   double:true,
   beginDate:'2015/3',
   endDate:'2016/6',
   limited:'3y'
})
```


* 月历参数解析

参数名称 | 类型 | 格式 | 说明
----- | ---- | ---- | ----
double | boolean | true/false | 是否双月历
partner | jquery对象 | jquery对象 | 该日历的对应的开始/结束日历对象
clear | boolean | true/false | 是否含有清空按钮（针对单月历）
date | string | 2015/10/10 | 单月历中的初始日期
beginDate | string | 2015/10/10 | 双月历中的初始开始日期
endDate | string | 2015/10/10 | 双月历中的初始结束日期














































