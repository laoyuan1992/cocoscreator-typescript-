//-------------------------------------------------------------------------------------------------
// 登陆界面
//-------------------------------------------------------------------------------------------------
import UIBase from "../../Common/UI/UIBase"
import EventName from "../../Common/Event/EventName"
import BoxDBManager from "../../Framework/BoxDBManager";
import GameDefine from "../../GD_XJ/Module/GameDefine"
import NetManager from "../../Common/Net/NetManager";
import LinkedList from "../../Common/DataStruct/LinkedList";
import Util from "../../Utility/Util";

const {ccclass, property} = cc._decorator;


@ccclass
export default class UILogin extends UIBase 
{
    // 使用@property的可以在cocoscreator编辑器中查看编辑
    // 账号登录按钮
    @property(cc.Button)
    BtnAGLogin: cc.Button = null;

    // 游客登陆按钮
    @property(cc.Button)
    BtnGuestLogin : cc.Button = null;

    // 使用上次缓存直接登陆按钮
    @property(cc.Button)
    BtnCacheLogin : cc.Button = null;

    // 登陆步骤信息
    @property(cc.Label)
    LblLoginStepDesc : cc.Label = null;

    @property(sp.Skeleton)
    SpineTest : sp.Skeleton = null;


    // 测试计时器
    private _Count = 100;
    private _TimerCallBack = null;
    onLoad() 
    {        
        cc.systemEvent.on(EventName.EVENT_UI_REFRESH_LOGIN_PLAN, this.RefreshLoginStepDesc, this);
        cc.systemEvent.emit(EventName.EVENT_DO_LOGIN,  {msg : "AuthAccount"});
    }

  public hello(calss , param )
  {
    cc.log(param._Count);
  }

    start() 
    {
        //this.TestSpine();
        //this.TestTimer();
    }

    update(dt)
    {
    }

    onDestroy()
    {
        //this.DestroyTimer();
        cc.systemEvent.off(EventName.EVENT_UI_REFRESH_LOGIN_PLAN, this.RefreshLoginStepDesc, this);
    }

    // 刷新登陆步骤
    private RefreshLoginStepDesc(e)
    {
        var Desc = e.detail.msg;
        this.LblLoginStepDesc.string = Desc;
    }

    // 测试骨胳动画函数
    // 以后有类似需求可以参考此方法
    private TestSpine()
    {
        if (this.SpineTest == null)
            return;
        // 测试下spine骨胳动画
        cc.loader.loadRes("Spine/caofeng/caofeng", sp.SkeletonData, (err, spData) => {
            if (err)
            {
                cc.log("---->>>>Test spine loadRes失败了！" + err.message);
            }
            else
            {
                cc.log("---->>>>Test spine loadRes成功了！");
                this.SpineTest.skeletonData = spData;
                this.SpineTest.setAnimation(0, "animation", true);
            }
        });
    }

    // 测试发送事件
    private TestEvent(e)
    {
        cc.log(e.detail.msg);
    }

    // 测试计时器
    private TestTimer()
    {   
        this._TimerCallBack = this.TimerCallBack.bind(this);
        this.schedule( this._TimerCallBack, 5);
    }

    private TimerCallBack()
    {
        this._Count++;

        var _CallBack = this.TestSpine.bind(this);
        cc.log("每五秒执行一次的计时器:" + this._Count.toString());

        cc.log("CallBack Is:" + _CallBack);
        cc.log(_CallBack.toString());
    }

    // 销毁计时器，如果一个脚本中有计时器，一定要在onDestroy中去销毁
    private DestroyTimer()
    {
        if (this._TimerCallBack != null)
            this.unschedule(this._TimerCallBack);
    }
}
