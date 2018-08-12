//-------------------------------------------------------------------------------------------------
// 比赛排名Cell
//-------------------------------------------------------------------------------------------------
const {ccclass, property} = cc._decorator;

@ccclass
export default class UIMatchRankingRFCell extends cc.Component 
{
    @property(cc.Label)
    Num: cc.Label = null;

    @property(cc.Label)
    SCore: cc.Label = null;

    @property(cc.Label)
    Time: cc.Label = null;

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

    public RefreshRankingInfo( CellInfo : any)
    {
        
    }
}
