import Singleton from "../../Common/Function/Singleton";
import EventName from "../../Common/Event/EventName"

//-------------------------------------------------------------------------------------------------
// 主玩家数据模块
//-------------------------------------------------------------------------------------------------
class PlayerData
{
    public PID         : number    = 0; //角色id
    public Coupon      : number    = 0; //券
    public UserName    : string    =""; //UserName
    public RoomName    : string    =""; //RoomName
    public IP          : number    = 0; //ip地址

    public FillPlayerData( MsgPlayerInfo : any )
    {
        this.PID        = MsgPlayerInfo.pid;
        this.Coupon     = MsgPlayerInfo.coupon;
        this.UserName   = MsgPlayerInfo.username;
        this.RoomName   = MsgPlayerInfo.room_name;
        this.IP         = MsgPlayerInfo.last_ip;
    }
}

class PlayerDataModule extends Singleton
{
    private PlayerData : PlayerData = new PlayerData();
    private RealName   : string     = "";
    private LookID     : number     = 0;

    public Init()
    {
        cc.systemEvent.on( EventName.EVENT_DO_FOCUS_STATE             , this.FocusState             , this  );
    }

    // 刷新玩家数据
    public RefreshData( MsgPlayerInfo : any )
    {
        this.PlayerData.FillPlayerData(MsgPlayerInfo);
    }

    // 获得角色ID
    public GetPID()
    {
        return this.PlayerData.PID;
    }

    // 获得IP地址
    public GetIP()
    {
        return this.PlayerData.IP;
    }

    // 获取券
    public GetCoupon()
    {
        return this.PlayerData.Coupon;
    }

    // 设置券
    public SetCoupon( CouponNum : number )
    {
        this.PlayerData.Coupon = CouponNum;
    }
    // 获得房间Name
    public GetRoomName()
    {
        return this.PlayerData.RoomName;
    }

    private IsGameIn() : boolean
    {
        let Bool = this.PlayerData.RoomName != "" && this.PlayerData.RoomName != null;
        return Bool;
    }

    // 获得UserName
    public GetUserName()
    {
        return this.PlayerData.UserName;
    }

    // 游戏焦点状态 
    private FocusState( State : boolean )
    {
        this.SendRoleState( State );
    }

    // 发送玩家在线状态
    private SendRoleState( State : boolean )
    {
        if ( this.IsGameIn() == false )
        {
            return;
        }
        if (State)
        {
            cc.systemEvent.emit( EventName.NET_DO_GAME_ONLINE );
        }else
        {
            cc.systemEvent.emit( EventName.NET_DO_GAME_OFFLINE );
        }
    }

    //获取查看ID
    public GetLookID()
    {
        return this.LookID;
    }

    //设置查看ID
    public SetLookID( RoleID )
    {
        this.LookID = RoleID;
    }

    //获取代理ID
    public GetProxyID()
    {
        return 0;
    }

    //获取渠道ID
    public GetChannelID()
    {
        return 0;
    }
}
export default PlayerDataModule.GetInstance();
