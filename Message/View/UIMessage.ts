//-------------------------------------------------------------------------------------------------
// 提示框
//-------------------------------------------------------------------------------------------------
import EventName from "../../Common/Event/EventName"
import MessageConfig from "../../Config/MessageConfig"
import UIManager from "../../Common/UI/UIManager"
import * as UIDefines from "../../Common/UI/UIDefine" 
import UIBase from "../../Common/UI/UIBase";

const {ccclass, property} = cc._decorator;

@ccclass
export default class UIMessage extends UIBase 
{
    @property(cc.Label)
    TextTips: cc.Label = null;

    private _GetCodeTime = 1.0;             // 时长
    private _TimerCallBack : any = null;    // 时间回调

    onLoad() 
	{
        cc.systemEvent.on(EventName.EVENT_UI_SHOW_MESSAGE_BY_ID, this.ShowMsgByID, this);
        cc.systemEvent.on(EventName.EVENT_UI_SHOW_MESSAGE_BY_STR, this.ShowMsgByStr, this);
	}

    start() 
	{
    }

    update() 
	{
	}
	
	onDestroy()
    {
        cc.systemEvent.off(EventName.EVENT_UI_SHOW_MESSAGE_BY_ID, this.ShowMsgByID, this);
        cc.systemEvent.off(EventName.EVENT_UI_SHOW_MESSAGE_BY_STR, this.ShowMsgByStr, this);
        this.StopTimer();       // 这一句一定要带上
    }

    private ShowMsgByID( Message )
    {
        let MsgID = Message.detail;        
        var MsgStr = MessageConfig.GetMessage(MsgID);
        if (MsgStr.length == 0)
            return;
        this.TextTips.string = MsgStr;
        this.CreateTimer();
    }

    private ShowMsgByStr( Message )
    {
        let MsgStr = Message.detail; 
        if (MsgStr.length == 0)
            return;
        this.TextTips.string = MsgStr;
        this.CreateTimer();
    }

    // 创建显示计时器
    private CreateTimer()
    {
        this.StopTimer();
        this._TimerCallBack = this.TimerCallBack.bind(this);
        this.schedule( this._TimerCallBack, this._GetCodeTime );
    }

    // 计时器回调
    private TimerCallBack()
    {
        this.StopTimer();
        UIManager.DestroyUI(UIDefines.UIType.UI_MESSAGE);
    }

    // 停止计时器
    private StopTimer()
    {
        if (this._TimerCallBack != null)
        {
            this.unschedule(this._TimerCallBack);
            this._TimerCallBack = null;
        }
    }
}
