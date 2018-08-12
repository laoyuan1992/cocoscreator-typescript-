//-------------------------------------------------------------------------------------------------
// 比赛界面
//-------------------------------------------------------------------------------------------------
import UIManager from "../../Common/UI/UIManager"
import * as UIDefines from "../../Common/UI/UIDefine" 
import EventName from "../../Common/Event/EventName"
import UIBase from "../../Common/UI/UIBase";
const {ccclass, property} = cc._decorator;

@ccclass
export default class UIMatch extends UIBase 
{
    @property(cc.Button)
    BtnClose: cc.Button = null;

    @property(cc.Button)
    BGClose: cc.Button = null;

    @property(cc.Node)
    MatchTagGrid: cc.Node = null;

    @property(cc.Node)
    MatchTypeGrid: cc.Node = null;

    onLoad() 
	{
        cc.systemEvent.on(EventName.EVENT_UI_REFRESH_MATCH,         this.NotifyRefreshMatchInfo,        this);  // 刷新比赛信息;
        cc.systemEvent.on(EventName.EVENT_UI_SINGLE_MATCH,          this.NotifyRefreshMatchSingle,      this);  // 刷新单条比赛信息;
	}

    start() 
	{
    }

    update() 
	{
	}
	
	onDestroy()
    {
        cc.systemEvent.off(EventName.EVENT_UI_REFRESH_MATCH,         this.NotifyRefreshMatchInfo,        this);  
        cc.systemEvent.off(EventName.EVENT_UI_SINGLE_MATCH,          this.NotifyRefreshMatchSingle,      this);  
    }

    private ClickClose()
    {
        this.PlayButtonAudio();
        UIManager.DestroyUI(UIDefines.UIType.UI_MATCH);
    }

    private NotifyRefreshMatchInfo(e)
    {

    }

    private NotifyRefreshMatchSingle(e)
    {
        var eData = e.getUserData();
    }
}
