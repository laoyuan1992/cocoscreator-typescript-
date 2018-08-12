import Singleton from "../../Common/Function/Singleton";
import EventName from "../../Common/Event/EventName";
import NetManager from "../../Common/Net/NetManager";
//=========================================================
// 统计信息
//=========================================================

class StatisticsGameInfo
{
    private mTotalGame  : number    = 0;
    private mWinGame    : number    = 0;
    private mScore      : number    = 0;
    private mTimeOut    : number    = 0;
    private mCoupon     : number    = 0;

    public FillStatisticsData( Data )
    {
        if( Data == null )return;
        if( Data.ext32_0 != null ) { this.mTotalGame = Data.ext32_0 }; 
        if( Data.ext32_1 != null ) { this.mWinGame = Data.ext32_1 }; 
        if( Data.ext64_0 != null ) { this.mScore = Data.ext64_0 }; 
        if( Data.ext64_1 != null ) { this.mCoupon = Data.ext64_1 }; 
        this.mTimeOut = Date.now();
    }

    public get TotalGame()  : number { return this.mTotalGame   };
    public get WinGame()    : number { return this.mWinGame     };
    public get Score()      : number { return this.mScore       };
    public get TimeOut()    : number { return this.mTimeOut     };
    public get Coupon()     : number { return this.mCoupon      };

}

class StatisticsModule extends Singleton 
{
    private statisticsInfo = new StatisticsGameInfo()

    public Init()
    {
        cc.systemEvent.on( EventName.NET_DO_STATISTICS_GAME_INFO , this.RevcStatisticsGameData , this );
    }

    //请求游戏统计数据
    public SendStatisticsGameData()
    {
        NetManager.SendMessage( EventName.NET_DO_STATISTICS_GAME_INFO );
    }

    //接受玩家统计信息
    private RevcStatisticsGameData( Message )
    {
        let ProtoBuf = NetManager.GetProtobuf();
        let msg = Message.detail.msg.ReadProtoBuf( ProtoBuf.MsgUpdateValue );
        this.statisticsInfo.FillStatisticsData( msg );
        cc.systemEvent.emit( EventName.EVENT_UI_REFRESH_STATISTICS_GAME_INFO );
    }

    //获取总局数
    public GetTotalGame()
    {
        return this.statisticsInfo.TotalGame;
    }

    //获取胜利局数
    public GetWinGame()
    {
        return this.statisticsInfo.WinGame;
    }

    //获取分数
    public GetScore()
    {
        return this.statisticsInfo.Score;
    }

}
export default StatisticsModule.GetInstance();
