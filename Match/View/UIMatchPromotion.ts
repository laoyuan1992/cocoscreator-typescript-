//-------------------------------------------------------------------------------------------------
// 比赛晋级
//-------------------------------------------------------------------------------------------------
import EventName from "../../Common/Event/EventName"
import UIBase from "../../Common/UI/UIBase";

const {ccclass, property} = cc._decorator;

@ccclass
export default class NewClass extends UIBase 
{
    @property(cc.Label)
    Ranking: cc.Label = null;

    @property(cc.Label)
    Stage: cc.Label = null;

    onLoad() 
	{
        cc.systemEvent.on(EventName.EVENT_UI_MATCH_PROMOTION,       this.NotifyRefMatchPromotion,   this); // 刷新晋级信息
        cc.systemEvent.on(EventName.EVENT_UI_MATCH_STATIC_INFO,     this.NotifyRefMatchStage,       this); // 刷新晋级阶段
	}

    start() 
	{
    }

    update() 
	{
	}
	
	onDestroy()
    {
        cc.systemEvent.off(EventName.EVENT_UI_MATCH_PROMOTION,       this.NotifyRefMatchPromotion,   this); 
        cc.systemEvent.off(EventName.EVENT_UI_MATCH_STATIC_INFO,     this.NotifyRefMatchStage,       this); 
    }

    private NotifyRefMatchPromotion(e)
    {
        var eData = e.getUserData();
    }

    private NotifyRefMatchStage(e)
    {
        var eData = e.getUserData();
    }
}
