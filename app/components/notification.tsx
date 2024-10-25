import { showModal } from "@/app/components/ui-lib";
import mjsample from "@/app/images/mjsample.png";
import styles from "@/app/components/home.module.scss";
import wxcode from "@/app/images/wxcode.png";
import chat from "@/app/images/chat.jpg";
import qrcode from "@/app/images/qrcode128.png";
import plus1 from "@/app/images/240301a.png";
import plus2 from "@/app/images/240301b.png";

export function showNotification() {
  showModal({
    title: "阿兹海默 - GPT中转站",
    children: (
      <div className={"notification"}>
        <div style={{ float: "right" }}>
          <img src={wxcode.src} style={{ margin: "0 10px" }} alt="" />
        </div>
        <p>
          24/09/13：第一时间开通o1-preview，o1-mini OpenAI
          9月份发布模型。思考能力增强。科学、工程、数学领域适用
          <br />
          24/06/21：第一时间开启claude 3.5
          sonnet支持。1/5价格，双倍速度，成绩超过上版大杯opus。
          <br />
          24/05/14：第一时间开启gpt-4o支持，逻辑推理和情感识别强大，价格只有gpt-4-turbo的一半。
          <br />
          24/04/25：claude-3-opus价格下调40%。
          <br />
          新增bing-Balance：联网支持好，可搜索，可读取指定地址。价格是gpt-4-plus的1/3。
        </p>
        <h2>模型说明</h2>
        一个帐号，支持以下所有模型。
        <ul>
          <li>
            o1-preview，o1-mini：OpenAI
            9月份发布模型。思考能力增强。科学、工程、数学领域适用
          </li>
          <li>
            gpt-4o：逻辑推理和情感识别强大，价格只有gpt-4-turbo的一半。支持文档/图片识别、Dall-E3图片生成、支持联网搜索。
          </li>
          <li>
            gpt-4-plus：支持文档/图片识别、Dall-E3图片生成、支持联网搜索（用英文搜索效果更好，注意额度消耗）。
          </li>
          <li>
            gpt-4-turbo：知识截止23年12月，支持128k
            token长度，减少“变懒”症状。价格相当于gpt-4的1/3
          </li>
          <li>
            bing-Balance：联网支持好，可搜索，可读取指定地址。价格是gpt-4-plus的1/3。逻辑推理水平接近3.5
          </li>
          <li>gpt-4-vision：支持“视觉”功能，可分析图片内容</li>
          <li>
            claude-3.5-sonnet：24年6月21日发布。1/5价格，双倍速度，成绩超过上版大杯opus。
          </li>
          <li>
            claude-3-opus：超大杯的Claude 3模型。文字功底，情感表达超过gpt-4。
          </li>
          <li>
            claude-3-sonnet：支持联网，直接输入URL网址抓取内容（注意额度消耗）。
          </li>
          <li>claude-3-haiku：价格低至opus的1/30，反应速度飞快。</li>
          <li>suno-v3：根据提示要求，创作歌曲、音乐。</li>
          <li>gpt-3-turbo：便宜，输出速度快</li>
        </ul>
        <p>目前整体费率，大约是官网的84%。详细价格见下表。</p>
        <h2>购买</h2>
        <p>
          一次购买，支持所有模型。自行在设置中选择使用
          <ul>
            <div style={{ float: "right" }}>
              <img src={wxcode.src} style={{ margin: "0 10px" }} alt="" />
            </div>
            <li>15元，购买5USD额度，有效期2个月</li>
            <li>30元，购买10USD额度，有效期4个月</li>
            <li>计费透明：每一条问答的费用消耗，在设置里都精确可查</li>
            <li>超过有效期，余额不作废。续费后，原有额度可以累积使用。</li>
            <li>购买请加微信：alz-ai</li>
          </ul>
        </p>
        <h2>费用计算</h2>
        <table>
          <thead>
            <tr>
              <th>模型</th>
              <th>1K token</th>
              <th>官方价格</th>
              <th>官方折合RMB</th>
              <th>本站价格</th>
              <th>折扣比例</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td rowSpan={2}>gpt-4 / gpt-4-plus</td>
              <td>input</td>
              <td>$0.0300</td>
              <td>￥0.2250</td>
              <td>￥0.1890</td>
              <td>84%</td>
            </tr>
            <tr>
              <td>output</td>
              <td>$0.0600</td>
              <td>￥0.4500</td>
              <td>￥0.3780</td>
              <td>84%</td>
            </tr>

            <tr>
              <td rowSpan={2}>o1-preview</td>
              <td>input</td>
              <td>$0.0150</td>
              <td>￥0.1125</td>
              <td>￥0.1080</td>
              <td>96%</td>
            </tr>
            <tr>
              <td>output</td>
              <td>$0.0600</td>
              <td>￥0.4500</td>
              <td>￥0.4320</td>
              <td>96%</td>
            </tr>

            <tr>
              <td rowSpan={2}>o1-mini</td>
              <td>input</td>
              <td>$0.0030</td>
              <td>￥0.0225</td>
              <td>￥0.0216</td>
              <td>96%</td>
            </tr>
            <tr>
              <td>output</td>
              <td>$0.0120</td>
              <td>￥0.0900</td>
              <td>￥0.0864</td>
              <td>96%</td>
            </tr>

            <tr>
              <td rowSpan={2}>
                gpt-4-turbo, <br />
                bing-Balance
              </td>
              <td>input</td>
              <td>$0.0100</td>
              <td>￥0.0750</td>
              <td>￥0.0630</td>
              <td>84%</td>
            </tr>
            <tr>
              <td>output</td>
              <td>$0.0300</td>
              <td>￥0.2250</td>
              <td>￥0.1890</td>
              <td>84%</td>
            </tr>

            <tr>
              <td rowSpan={2}>claude-3-opus</td>
              <td>input</td>
              <td>$0.0150</td>
              <td>￥0.1125</td>
              <td>￥0.1080</td>
              <td>96%</td>
            </tr>
            <tr>
              <td>output</td>
              <td>$0.0750</td>
              <td>￥0.5625</td>
              <td>￥0.5400</td>
              <td>96%</td>
            </tr>

            <tr>
              <td rowSpan={2}>claude-3-sonnet</td>
              <td>input</td>
              <td>$0.0030</td>
              <td>￥0.0225</td>
              <td>￥0.0216</td>
              <td>96%</td>
            </tr>
            <tr>
              <td>output</td>
              <td>$0.0150</td>
              <td>￥0.1125</td>
              <td>￥0.1080</td>
              <td>96%</td>
            </tr>

            <tr>
              <td rowSpan={2}>gpt-3.5-turbo</td>
              <td>input</td>
              <td>$0.0005</td>
              <td>￥0.0038</td>
              <td>￥0.0032</td>
              <td>85%</td>
            </tr>
            <tr>
              <td>output</td>
              <td>$0.0015</td>
              <td>￥0.0113</td>
              <td>￥0.0064</td>
              <td>57%</td>
            </tr>
          </tbody>
        </table>
        suno-v3：$0.35/2首歌。suno-v2：0.175/2首歌。
        <br />
        目前成本较高，请注意额度消耗。可考虑自行注册官网每日5次免费。
        可以直接输入中文指令，例如：“快节奏，摇滚RAP”
        、“中国古典风格，古筝，琵琶，舒缓悠扬”。 目前中转站还不支持中文歌词
        <p>
          计费规则与OpenAI官网规则一致。
          <br />
          后台计费 = 输入token数 * 输入单价 + 输出token数 *
          输出单价（这个就是设置里面查到的每条消耗金额）
          <br />
          本站价格 = 后台计费 * 3
          （购买比率是1:3，即：15元购买5USD额度，就是实际支付RMB的价格）
          <br />
          不同模型的单价不同，见上表。
          <br />
        </p>
        <h2>开发计划</h2>
        <p>后面准备陆续上线的功能：</p>
        <ul>
          <li>
            开发中：midjourney调用，按次付费。适合用量少的朋友，不必付昂贵月租，按需付费。
            <br />
            用量大的可以用包月，90-200元/月，直接微信联系。
          </li>
          <li>
            计划中：gpts调用。官网36万+定制应用直接调用。参见https://www.gptshunter.com/
          </li>
        </ul>
        <p>
          微信ID：alz-ai
          <br />
          <img src={wxcode.src} alt="" />
        </p>
        <br />
        <br />
        <h2>使用实例演示</h2>
        <h3>1. 文档、照片识别：</h3>
        <p>应用场景非常广泛。</p>
        <p>
          比如我拍了验血化验报告的照片，请GPT4分析，再一步一步深入提问，得到的答复远比医生的三言两语要详细的多。（
          * 专业问题请通过第三方权威信息验证，AI有可能提供不准确信息）
        </p>
        <p>
          再比如我上传一本书的PDF文件。然后请AI根据书中的知识进行推理，并且给出信息来源出处。效果也很好。
        </p>
        <img src={plus1.src} style={{ width: "90%" }} alt="" />
        <h3>2. 图片生成</h3>
        <p>
          目前已经支持Dall-E，优点是对指令执行准确，缺点是艺术性不如MJ。已经做了自动翻译，可以直接用中文指令。
        </p>
        <p>为防止封号，不适宜的内容已经做了过滤，就不要尝试了。</p>
        <img src={plus2.src} style={{ width: "90%" }} alt="" />
        <p>
          微信ID：alz-ai
          <br />
          <img src={wxcode.src} alt="" />
        </p>
        <hr />
        <p>23/10/25</p>
        <p>抽空把Midjourney平台准备好了。付费包月。全程直连</p>
        <p>
          - 独享10美金，基础会员99元/月 限200张
          <br />
          - 独享30美金，标准会员279元/月 不限量
          <br />
          <br />
          <img
            src={mjsample.src}
            className={styles["mjsample"]}
            width={"90%"}
            alt=""
          />
          <br />
        </p>
        <hr />
        <p>--- 以往的通知，不用浪费时间看了 ---</p>
        <hr />
        <p>09/30</p>
        <p>扣费倍率下调，目前相关于官方的90%</p>
        <p>费率如有变化，我会随时在公告里注明。</p>
        <hr />
        <p>09/26</p>
        <h1>通知</h1>
        <p>免费站最后开放几天，十一之后准备关了。献礼国庆。</p>
        <p>
          以前看动物世界，羚羊敢于在狮子旁边漫步。旁白解释说，这是因为它们知道这时候狮子已经吃饱了。
        </p>
        <p>
          最近发生了两件事，羚羊应该警觉。毕竟上有老下有小，浑身软肋，需要每天自我审查一下比较好。
        </p>
        <p>
          一件事离我比较远，菜农卖了10几块蔬菜，被指农药超标，罚款几万。另一件事河北程序员使用GitHub和zoom工作，被认定所有收入违法，罚款100万。过去20年，狮子是饱的。最近两年，狮子饿了。
        </p>
        <p>
          一直觉得大城市的底线和宽容度高一些，但是第二件事离我很近。我需要坦白，我的职业技能全部都是来自于google里查到的知识。毕竟学校讲授的内容太过时。外面在用oracle的时候，学校里只讲foxbase。很多实用的技术，我在学校里连名字都没有听过。这样看来，脑子里的知识来源已经违法了。不知道会不会枪毙。
        </p>
        <h1>初衷</h1>
        <p>
          做免费站的想法，来源于ChatGPT横空出世时的惊艳。如同20多年前，从DOS命令行时代，看到Photoshop里那只翠绿红眼的青蛙图片。所有人都知道，又一项改变未来，也会影响很多人就业的技术革新出现了。地球上，大部分的人都可以免费使用。但有极少数地方的人，需要大量技能，才能有这个机会。我希望能分享这样的机会，不成为少数人的特权，也希望借这个热度尝试一下自媒体运营。
        </p>
        <p>
          开始给自己定了一个小目标，公众号关注1000人就不做了。没想到在风口，这个目标太小了，瞬间达成。在我犹豫关闭时，一位学生朋友的打赏，让我决心继续走下去。
        </p>
        <p>
          <img src={chat.src} width="30%" alt="" />
        </p>
        <h1>结语</h1>
        <p>
          我知道用户里有不少大学生。当年美国恶法《禁酒令》实行的时候，酒精饮料从来没有消亡，我这小破站关闭之后，相信你们不难找到其他替代。
        </p>
        <p>
          还有一些老骨灰的繁絮唠叨：在AI造成变革的时代中，保持对新事物的兴趣，对抗自己的惰性，多读一些好书，学好英文。
        </p>
        <p>
          后面我准备回到最初的想法，在条件允许范围内，授人以渔，分享一些自己感兴趣的内容。
        </p>
        <p>
          “阿兹海默”，在公众号和小红书中继续分享，有缘再会！
          <br />
          <img src={qrcode.src} width="100px" alt="" />
        </p>
        <p>
          <i>
            ** GPT 4和3.5
            16K的付费用户不用担心，除非遇到不可抗力。我会负责支持维护到底。
          </i>
        </p>
        <hr />
        <p>08/04</p>
        <p>
          本月初免费站恢复试运行，看看新买的key能存活多久。
          <br />
          <br />
          如需独享付费账号请私信。GPT 4账号，15元起
          <br />
          <br />
          微信ID：alz-ai
          <br />
          <img src={wxcode.src} alt="" />
        </p>
        <hr />
        <p>7/22</p>
        <p>
          当前因打赏款项耗尽，免费站暂停。7月1日 - 21日
          有打赏过的朋友请私信联系。
          <br />
          无论金额多少，赠送3.5免费账号一枚
          <br />
          <br />
        </p>
        <hr />
        <p>7/18</p>
        <p>
          支持GPT 4灵活购买，15元起。收入80%继续投入免费站运营
          <br />
          详询微信：alz-ai
        </p>
        <hr />
        <p>7/17</p>
        <p>找到一个比之前更廉价、灵活、而且稳定的GPT 4的渠道。🎈🎉🎊</p>
        <hr />
        <p>7/12</p>
        <p>
          从7月4号官方新一轮风控，尝试了很多新的渠道。大部分都只能存活几小时，就又被封掉了。这周有了新的解决方案，成本也比之前急剧上涨。从后台看，项目的使用人数不少。建议经常使用，又有些余力的朋友，考虑每月固定打赏个几块钱。能有一定比例的固定打赏，是这个平台能持续下去先决条件。打赏金额，至少80%会投入API购买。
        </p>
        <p>
          今天项目恢复，多亏“支柱”的大额打赏。感谢他凭一己之力，支持众多用户接下来几天的运营开销。🍻🍻🍻
        </p>
      </div>
    ),
  });
}
