//-------------------------------------------------------------------------------------------------
// 比赛Item
//-------------------------------------------------------------------------------------------------
import EventName from "../../Common/Event/EventName"
const {ccclass, property} = cc._decorator;

@ccclass
export default class UIMatchItemCell extends cc.Component 
{
    @property(cc.Sprite)
    RewardIcon: cc.Sprite = null;

    @property(cc.Label)
    RewardDis: cc.Label = null;

    @property(cc.Label)
    MatchName: cc.Label = null;

    @property(cc.Label)
    MinPlayer: cc.Label = null;

    @property(cc.Label)
    CurPlayer: cc.Label = null;

    @property(cc.Label)
    StartTime: cc.Label = null;

    @property(cc.Sprite)
    BtnImage: cc.Sprite = null;

    @property(cc.Label)
    BtnText: cc.Label = null;

    @property(cc.Sprite)
    IconOne: cc.Sprite = null;

    @property(cc.Sprite)
    IconTwo: cc.Sprite = null;

    @property(cc.Label)
    CostNumOne: cc.Label = null;

    @property(cc.Label)
    CostNumTwo: cc.Label = null;

    @property(cc.Node)
    LevelNode: cc.Node = null;

    @property(cc.Node)
    FireNode: cc.Node = null;

    @property(cc.Node)
    LableNode: cc.Node = null;

    @property(cc.Node)
    ConFreeNode: cc.Node = null;

    @property(cc.Node)
    BtnNode: cc.Node = null;

    onLoad() 
	{
        cc.systemEvent.on(EventName.EVENT_UI_REF_MATCHCURPLAYER,    this.RefreshCurrPlayer,     this); 
	}

    start() 
	{
    }

    update() 
	{
	}
	
	onDestroy()
    {
        cc.systemEvent.off(EventName.EVENT_UI_REF_MATCHCURPLAYER,    this.RefreshCurrPlayer,     this); 
    }

    private ClickBtn()
    {

    }

    private ClickRule()
    {

    }

    private RefreshCurrPlayer(e)
    {

    }
}
