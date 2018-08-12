//-------------------------------------------------------------------------------------------------
// 比赛排名
//-------------------------------------------------------------------------------------------------
import EventName from "../../Common/Event/EventName"
import UIBase from "../../Common/UI/UIBase";

const {ccclass, property} = cc._decorator;

@ccclass
export default class UIMatchRankings extends UIBase 
{
    @property(cc.Label)
    TextRanking: cc.Label = null;

    onLoad() 
	{
        cc.systemEvent.on(EventName.EVENT_UI_MATCH_RANKINGS, this.RecvMatchRanking, this);
	}

    start() 
	{
    }

    update() 
	{
	}
	
	onDestroy()
    {
        cc.systemEvent.off(EventName.EVENT_UI_MATCH_RANKINGS, this.RecvMatchRanking, this);
    }

    private RecvMatchRanking(e)
    {
        var eData = e.getUserData();
    }
}
