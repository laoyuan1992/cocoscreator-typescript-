//-------------------------------------------------------------------------------------------------
// 比赛本局结算界面
//-------------------------------------------------------------------------------------------------
import UIBase from "../../Common/UI/UIBase"
import EventName from "../../Common/Event/EventName"

const {ccclass, property} = cc._decorator;

@ccclass
export default class UIMatchJuShowDown extends UIBase 
{
    @property(cc.Label)
    TextTimer: cc.Label = null;

    @property(cc.Node)
    CellGrid: cc.Node = null;

    @property(cc.Node)
    WaitObj: cc.Node = null;

    @property(cc.Node)
    FuInfoObj: cc.Node = null;

    @property(cc.Node)
    InfoObj: cc.Node = null;

    onLoad() 
	{
        cc.systemEvent.on(EventName.EVENT_UI_REF_MATCHJUSHOWDOWN,  	    this.NotifyMatchJuShowDown,         this);
        this.FuInfoObj.active = false;
        this.InfoObj.active = false;
	}

    start() 
	{
    }

    update() 
	{
	}
	
	onDestroy()
    {
        cc.systemEvent.off(EventName.EVENT_UI_REF_MATCHJUSHOWDOWN,  	    this.NotifyMatchJuShowDown,         this);
    }

    private NotifyMatchJuShowDown(e)
    {

    }
}
