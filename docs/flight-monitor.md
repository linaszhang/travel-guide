# 北欧机票每日监测

本页数据：`nordic-v2/flight-monitor.json`；网页入口：`nordic/#flights`。
每日北京时间10:00由当前聊天的Codex定时任务读取浏览器报价并更新JSON。此任务在本机执行，需要电脑开机、Codex运行和网络可用。不是GitHub Actions后台爬虫，访问网页不会发起抓价。

## 页面布局

所有航班卡片都不展示购买建议（monitor-strategy），包括“先确认托运行李”等提示。保留携程与Google信息行。

标题右侧固定显示“每天10:00检查”，不显示时区，不在手机换行；实际任务仍按Asia/Shanghai运行。汇总中的“与预算”差额放在原预算价格右侧同一行。

标题左侧只放返回箭头；不展示独立“← 预算单”、顶部年份副标题、行李口径介绍、汇总下方说明段落或航司来源大段文字。携程、Google与购买建议使用紧凑信息行，不恢复嵌套大卡片。来源和完整票档保留在折叠报价记录中；核实时间随记录显示。

## 携程手机跳转参数

国际搜索页interFirst的dcode/acode必须为携程城市代码，不能直接使用机场代码：PVG归属SHA（上海），KEF归属REK（雷克雅未克）。上海浦东出发额外使用dfilter=dport:PVG；该格式已通过携程官方手机搜索表单核实。显式传dcityName/acityName中文城市名，日期ddate和2成人nop=2-0-0保持原行程。App编码地址与H5回退地址共用同一生成器，避免两种地址参数不一致。

## 携程作为唯一主报价

主价格、汇总、预算差额、最低价、走势和折叠记录统一使用ctrip/ctripHistory的携程国内站含税报价。携程缺数据时显示待核实，不自动用Trip.com或航司价补位。其他来源保留原始JSON供核对，但不进入主展示。余票只能来自同条携程报价；官网余票不移植。托运未核实继续在携程信息行注明，不把起价当含托运价。strategy必须按携程主报价重新判断，不能继续引用其他渠道的价格差额或余票。

标题与主价格同一行垂直居中，不显示“含托运·参考折算”小字。标题链接手机尝试打开携程App里的同日期同机场H5搜索，无法唤起回退官方H5；桌面直接H5。此手机行为需要真实安装App的手机验证，Mac浏览器只能验证H5日期航线。历史来源/票档一行，不显示外币小字。

## 展示口径

用户要求看板中所有价格只展示每人价格，不标“单人”“每人”“／人”或“两人”。汇总、预算差额、原币、Google区间、历史表和图表全部统一。JSON仍保存2成人核实总价，前端按passengers换算，避免破坏历史和余票口径。每日任务继续核实2成人可订价格，不修改此展示规则。

## 固定口径

2成人，经济舱，含税，每人1件23kg托运。比较完全相同日期、机场、航班号及时间；TOS–KEF为WF621+FI335经BGO。不得替换为其他时刻或其他中转的最低起价。已过出发日期的航段不再询价，保留历史；2027-02-20之后暂停任务。

先查询携程国内站指定航线（浏览器公开搜索，可使用下列模式），核对2成人和日期，再展开对应航班票档及行李规则：
`https://flights.ctrip.com/online/list/oneway-pvg-hel?depdate=2027-02-06&cabin=y&adult=2&child=0&infant=0`
其余依次hel-tos/2027-02-07、tos-kef/2027-02-14、kef-cph/2027-02-19、cph-pvg/2027-02-20。列表的含税价通常为每人，只有确认后乘2。保留原币、单人或总价依据、票档、托运、更新时间、来源链接、明确余票。仅起价而未核实行李时写ctripStatus，须保存ctrip对象（checkedAt、baseCny两人、perPersonCny单人、url、note、seats）并追加ctripHistory（每日保留一条），不得当含托运报价。首次加载可能仅有页头页脚，须等结果渲染后再读；不要把加载中当作无票。

国内站无法取得完整票档时，允许查询Trip.com（携程国际版）或航司官网补充，必须注明真实来源，不能冒充国内站。已有latest.url为可用入口。进入票档选择属于只读询价，不创建订单、不付款、不提交乘客资料。登录/验证码或风控导致阻碍时记录失败，不绕过安全措施。

Google Flights的报价与高低判断独立采集，不能因缺少判断而遗漏已查到的同款报价。先看同款booking页的最低总价、来源与价格分析；若booking页无判断，返回同日期搜索页，展开“价格分析”读取通常区间。搜索页航线最低价判断使用judgmentScope=route，并保留insightUrl、注明含中转等范围；booking页明确针对所选票价时使用judgmentScope=flight。无法匹配原组合时尝试中转机场筛选；确认无结果后使用status=no_matching_itinerary并说明，不能笼统标“待核实”。成功采集用status=verified，保留checkedAt和provider。

Google Flights使用google.url进入，对同航班记录平台原始“低/正常/高”、baseCny和typicalRange（两人）、所依据行李与票档及checkedAt。Google航线总体判断只能标明航线总体，不写成单航班判断。未返回原组合时judgment=null。基础票不含托运的区间必须注明，不能直接套用含托运价格；不同路线不得混用。无法核实的字段设null并说明，不能把旧结果刷新为今天。

## 写入规则

- `latest`只收已核实含托运报价。优先携程国内同口径票档；否则明确补充来源。成功记录带checkedAt、amount、currency、cny、provider、fare、url、baggage、seats、seatsNote。
- `seats`只有平台明确显示对应票档余票才填整数；否则null。不能用座位图、搜索结果数或预订人数推测。不同渠道余票不可移植。例如吉祥官网Q舱4席不能写成携程剩4席或全机4席。
- 追加到`history`，同日同provider+fare成功记录以最新一次更新，其他日期/渠道保留。价格不变也保留每日记录。每条记录保留实际核实时间与汇率，走势包含汇率和渠道变化。
- 全部查询失败时保留latest、history、updatedAt；仅更新lastAttemptAt和该航段lastError。部分成功时updatedAt=max(实际成功checkedAt)，各航段日期独立显示。切勿把旧报价标为实时。
- 更新fx时用可靠来源，明确日期；CNY直价汇率为1；外币四舍五入至人民币整数，仅参考折算。
- 更新strategy.action/reason基于真实新结果、预算差额、历史走势、Google原始判断、衔接与退改；不得保证未来低价。不修改原budget.flights。
- 前端只读JSON；每日数据更新无需改缓存版本。运行`python3 scripts/check-flight-monitor.py`验证。

## 发布

只提交本次监测JSON变更，不提交无关文件。先确认当前分支及未提交改动，SSH拉取rebase后push到main：`git@github.com:linaszhang/travel-guide.git`。不要覆盖其他修改。验证公开JSON与网页已是本次记录；发布失败明确报告，不声称已上线。原始浏览器证据只保存在工作目录，公开JSON不得包含订单、账号、cookie、票务会话token或购物ID。
