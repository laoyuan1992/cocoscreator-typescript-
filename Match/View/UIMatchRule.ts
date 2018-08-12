//-------------------------------------------------------------------------------------------------
// 比赛规则界面
//-------------------------------------------------------------------------------------------------
import UIManager from "../../Common/UI/UIManager"
import * as UIDefines from "../../Common/UI/UIDefine" 
import EventName from "../../Common/Event/EventName"
import UIBase from "../../Common/UI/UIBase";

const {ccclass, property} = cc._decorator;

@ccclass
export default class UIMatchRule extends UIBase 
{
    @property(cc.Label)
    MathTitle: cc.Label = null;

    @property(cc.Label)
    MatchContent: cc.Label = null;

    @property(cc.Button)
    BGClose: cc.Button = null;

    @property(cc.Button)
    BtnClose: cc.Button = null;

    onLoad() 
	{
        cc.systemEvent.on(EventName.EVENT_UI_REF_MATCHRULE, 	    this.NotifyMatchRuleInfo,               this);
        cc.systemEvent.on(EventName.EVENT_UI_REF_MATCHRULEBYID, 	this.NotifyMatchRuleInfoByID,           this);
	}

    start() 
	{
    }

    update() 
	{
	}
	
	onDestroy()
    {
        cc.systemEvent.off(EventName.EVENT_UI_REF_MATCHRULE, 	    this.NotifyMatchRuleInfo,               this);
        cc.systemEvent.off(EventName.EVENT_UI_REF_MATCHRULEBYID, 	this.NotifyMatchRuleInfoByID,           this);
    }

    private ClickClose()
    {
        UIManager.DestroyUI(UIDefines.UIType.UI_MATCH_RULE);
    }

    private NotifyMatchRuleInfo(e)
    {
        var eData = e.getUserData();
    }
    
    private NotifyMatchRuleInfoByID(e)
    {
        var eData = e.getUserData();
    }
}
