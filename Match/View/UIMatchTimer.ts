//-------------------------------------------------------------------------------------------------
// 比赛倒计时界面
//-------------------------------------------------------------------------------------------------
import EventName from "../../Common/Event/EventName"
import UIBase from "../../Common/UI/UIBase";

const {ccclass, property} = cc._decorator;

@ccclass
export default class UIMatchTimer extends UIBase 
{
    @property(cc.Label)
    TextDis: cc.Label = null;

    @property(cc.Label)
    TextTimer: cc.Label = null;

    @property(cc.Label)
    TextRemain: cc.Label = null;

    private _TimerCallBack : any = null;        // 回调函数

    onLoad() 
	{
        cc.systemEvent.on(EventName.EVENT_UI_MATCH_PULL,        this.NotifyPullMatch,           this);
        cc.systemEvent.on(EventName.EVENT_UI_MATCH_BYE,   	    this.NotifyByeMatch,            this);
        cc.systemEvent.on(EventName.EVENT_UI_MATCH_COMPLETE, 	this.NotifyCompleteMatch,       this);
        cc.systemEvent.on(EventName.EVENT_UI_REF_MATCHREMAIN,   this.NotifyMatchRemaining,      this);
        cc.systemEvent.on(EventName.EVENT_UI_MATCH_INMATCH,     this.NotifyInMatch,             this);
	}

    start() 
	{
    }

    update() 
	{
	}
	
	onDestroy()
    {
        this.StopTimer();
        cc.systemEvent.off(EventName.EVENT_UI_MATCH_PULL,        this.NotifyPullMatch,           this);
        cc.systemEvent.off(EventName.EVENT_UI_MATCH_BYE,   	     this.NotifyByeMatch,            this);
        cc.systemEvent.off(EventName.EVENT_UI_MATCH_COMPLETE, 	 this.NotifyCompleteMatch,       this);
        cc.systemEvent.off(EventName.EVENT_UI_REF_MATCHREMAIN,   this.NotifyMatchRemaining,      this);
        cc.systemEvent.off(EventName.EVENT_UI_MATCH_INMATCH,     this.NotifyInMatch,             this);
    }


    private NotifyPullMatch()
    {

    }

    private NotifyByeMatch()
    {

    }

    private NotifyCompleteMatch()
    {

    }

    private NotifyMatchRemaining()
    {

    }

    private NotifyInMatch()
    {

    }

    // 停止计时
    private StopTimer()
    {
        if (null != this._TimerCallBack)
        {
            this.unschedule(this._TimerCallBack);
            this._TimerCallBack = null;
        }
    }

    // 计时回调
    private TimerCallBack()
    {
        var TimerStr = this.TextTimer.string;
        switch (TimerStr) {
            case "":
                this.TextTimer.string = ".";
                break;
            case ".":
                this.TextTimer.string = "..";
                break;
            case "..":
                this.TextTimer.string = "...";
                break;
            case "...":
                this.TextTimer.string = "";
                break;
            default:
                break;
        }
    }

    // 开始计时
    private StartTimer()
    {
        this.StopTimer();
        this._TimerCallBack = this.TimerCallBack.bind(this);
        this.schedule( this._TimerCallBack, 1.0);
    }
}
