//-------------------------------------------------------------------------------------------------
// 比赛排名
//-------------------------------------------------------------------------------------------------
import EventName from "../../Common/Event/EventName"
import UIManager from "../../Common/UI/UIManager"
import * as UIDefines from "../../Common/UI/UIDefine" 
import UIBase from "../../Common/UI/UIBase";

const {ccclass, property} = cc._decorator;

@ccclass
export default class UIMatchRanking extends UIBase 
{
    @property(cc.Button)
    ButtonLeave: cc.Button = null;

    @property(cc.Node)
    CellGrid: cc.Node = null;

    @property(cc.Button)
    BtnRank: cc.Button = null;

    @property(cc.Label)
    TextMatchName: cc.Label = null;

    @property(cc.Label)
    TextRanking: cc.Label = null;

    @property(cc.Sprite)
    IconOne: cc.Sprite = null;

    @property(cc.Sprite)
    IconTwo: cc.Sprite = null;

    @property(cc.Label)
    RewardOne: cc.Label = null;

    @property(cc.Label)
    RewardTwo: cc.Label = null;

    @property(cc.Label)
    RewardDis: cc.Label = null;

    @property(cc.Node)
    FuInfoNode: cc.Node = null;

    @property(cc.Node)
    InfoNode: cc.Node = null;

    onLoad() 
	{
        cc.systemEvent.on(EventName.EVENT_UI_MATCH_RANKING, 	    this.RecvMatchRanking,      this); 
        cc.systemEvent.on(EventName.EVENT_UI_MATCH_STATIC_INFO,     this.RefreshMatchInfo,      this);
        this.FuInfoNode.active = false;
        this.InfoNode.active = false;
        this.BtnRank.node.active = false;
	}

    start() 
	{
    }

    update() 
	{
	}
	
	onDestroy()
    {
        cc.systemEvent.off(EventName.EVENT_UI_MATCH_RANKING, 	    this.RecvMatchRanking,      this); 
        cc.systemEvent.off(EventName.EVENT_UI_MATCH_STATIC_INFO,    this.RefreshMatchInfo,      this);
    }

    private ClickClose()
    {
        this.BtnRank.node.active = false;
    }

    private ClickLeave()
    {
        //.....
        UIManager.DestroyUI(UIDefines.UIType.UI_MATCH_RANKING);
    }

    private RecvMatchRanking(e)
    {
        var eData = e.getUserData();
    }

    private RefreshMatchInfo(e)
    {
        var eData = e.getUserData();
    }
}
