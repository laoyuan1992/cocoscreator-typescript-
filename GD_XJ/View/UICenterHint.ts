import GameDefine from "../Module/GameDefine";
import UIBase from "../../Common/UI/UIBase";

const {ccclass, property} = cc._decorator;

@ccclass
export default class UICenterHint extends UIBase
{
    @property(cc.Sprite)
    ImageLeft: cc.Sprite        = null;

    @property(cc.Sprite)
    ImageTop: cc.Sprite         = null;

    @property(cc.Sprite)
    ImageRight: cc.Sprite       = null;

    @property(cc.Sprite)
    ImageBottom: cc.Sprite      = null;

    @property(cc.Label)
    TextTime: cc.Label          = null;

    private mTimeTotal  : number   =  0;
    private mGameSeats  : number   = GameDefine.GameSeats[1];

    start () 
    {
        this.ResetState();
    }

    onDestroy()
    {
        this.StopTimer();
    }

    private StopTimer()
    {
        if (this.TimerCallBack != null)
        this.unschedule( this.TimerCallBack );   
    }

    public EndFalsh()
    {
        this.ImageBottom.node.active = false;
        this.ImageRight.node.active  = false;
        this.ImageTop.node.active    = false;
        this.ImageLeft.node.active   = false;
    }

    private TimerCallBack()
    {
        this.mTimeTotal--;
        if ( this.mTimeTotal < 0 )
        {
            this.mTimeTotal = 0;
        }
        this.TextTime.string = this.mTimeTotal.toString();
    }

    // 刷新时间;
    public RefreshTime( InTime : number )
    {
        this.mTimeTotal = 10;
        if ( InTime != null ) 
        { 
            this.mTimeTotal = InTime;
        }
        this.TextTime.string = this.mTimeTotal.toString();
        this.TimerCallBack = this.TimerCallBack.bind(this);
        this.StopTimer();
        this.schedule( this.TimerCallBack , this.mTimeTotal, 1 );
    }

    // 显示关闭;
    public RefreshShowState( State : boolean )
    {
        this.node.active = State;
    }

    // 开始闪;
    public BeginFlash( Seats : number )
    {
        this.EndFalsh();
        this.ShowSeatImage( Seats );
    }

    private ShowSeatImage( Seats : number )
    {
        if ( Seats == GameDefine.GameSeats[1] )
        {
            this.ImageBottom.node.active = true;
        }else  if ( Seats == GameDefine.GameSeats[2] )
        {
            this.ImageRight.node.active = true;
        }
        else  if ( Seats == GameDefine.GameSeats[3] )
        {
            this.ImageTop.node.active = true;
        }
        else  if ( Seats == GameDefine.GameSeats[4] )
        {
            this.ImageLeft.node.active = true;
        }
    }

    //显示多个(最多两个，进还贡的时候用)
    public BeginMutilFlash( SeatList )
    {
        this.EndFalsh();
        for ( let i = 0; i < SeatList.length; i++ )
        {
            this.ShowSeatImage( SeatList[i] );
        }
    }

    public ResetState()
    {
        this.TextTime.string = "00";
        this.EndFalsh();
    }

}
