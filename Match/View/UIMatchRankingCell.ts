//-------------------------------------------------------------------------------------------------
// 比赛排名Cell
//-------------------------------------------------------------------------------------------------
const {ccclass, property} = cc._decorator;

@ccclass
export default class UIMatchRankingCell extends cc.Component 
{
    @property(cc.Label)
    Num: cc.Label = null;

    @property(cc.Label)
    Score: cc.Label = null;

    @property(cc.Label)
    Time: cc.Label = null;

    @property(cc.Label)
    CurRanking: cc.Label = null;

    @property(cc.Label)
    GreatName: cc.Label = null;

    onLoad() 
	{
	}

    start() 
	{
    }

    update() 
	{
	}
	
	onDestroy()
    {
    }

    public RefreshRankingInfo(CellInfo)
    {
        
    }
}
