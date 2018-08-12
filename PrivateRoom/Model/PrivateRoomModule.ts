import Singleton from "../../Common/Function/Singleton";
import NetManager from "../../Common/Net/NetManager";
import RoomCostConfig from "../../Config/RoomCostConfig";
import EventName from "../../Common/Event/EventName";
import UIManager from "../../Common/UI/UIManager";
import { UIType } from "../../Common/UI/UIDefine";
import MessageModule from "../../Message/Model/MessageModule";
import Util from "../../Utility/Util";
import PlayerDataModule from "../../Player/Model/PlayerDataModule";
import GuanDanModule from "../../GD_XJ/Module/GuanDanModule";
import ChrysanthemumModule from "../../Chrysanthemum/Model/ChrysanthemumModule";
//-------------------------------------------------------------------------------------------------
// 私房基类
//-------------------------------------------------------------------------------------------------

class PrivateRoomModule extends Singleton
{
    public ConsumeID   : number = 0;                   // 消耗ID
    public SpecialKind : number = 0;                   // 特殊玩法
    public RoomType    : string = "";                  // 房间类型
    public PlayerCount : number = 4;                   // 玩家人数
    public PayMode     : number = 0;                   // 付费方式

    private CurGameModule : any = null;                //当前游戏module

    public Init()
    {
        cc.systemEvent.on(EventName.NET_DO_JOINTROOM,this.DoRevcJoinRoom,this);
        cc.systemEvent.on(EventName.EVENT_DO_AUTO_ROOM,this.AutoJoinRoom,this);
    }


    //设置消耗ID
    public SetConsumeID( ID : number )
    {
        this.ConsumeID = ID;
        this.RefreshConsumeCount();
    }

    //获取消耗ID
    public GetConsumeID() : number
    {
        return this.ConsumeID;
    }

    //设置房间类型
    public SetRoomType( RoomType : string )
    {
        this.RoomType = RoomType;
    }

    //获取房间类型
    public GetRoomType()
    {
        return this.RoomType;
    }

    //设置玩家数量
    public SetRoomPlayerCount( num : number )
    {
        this.PlayerCount = num;
        this.RefreshConsumeCount();
    }

    //设置付费方式
    public SetPayMode( Mode : number)
    {
        this.PayMode = Mode;
        this.RefreshConsumeCount();
    }

    //获取付费方式
    public GetPayMode() : number
    {
        return this.PayMode;
    }

    //设置游戏玩法
    public SetRoomSpecialKind( IsAdd , BitMark )
    {
        if(IsAdd)
        {
            BitMark = 1 << BitMark;
            this.SpecialKind |= BitMark
        }
        else
        {
            let Mask = 0;
            BitMark = 1 << BitMark;
            Mask = (~Mask)^BitMark;
            this.SpecialKind &= Mask;
        }
    }

    //获取游戏玩法
    public GetRoomSpecialKind( BitMark ) : boolean
    {
        BitMark = 1 << BitMark ;
        if( this.SpecialKind & BitMark )
            return true;
        else
            return false;
    }

    public GetSpecialKind() : number
    {
        return this.SpecialKind;
    }

    //重置游戏玩法
    public ResetRoomSpecialKind()
    {
        this.SpecialKind = 0;
    }

    //判断身上的钻石是否足够
    public CreateRoomCheck() :boolean
    {
        return true;
    }

    //计算钻石消耗
    private RefreshConsumeCount()
    {
        let CostNum  = RoomCostConfig.GetGameCost(this.ConsumeID);
        let ProtoBuf = NetManager.GetProtobuf();

        if(this.PayMode == ProtoBuf.TPaymentMechanism.AA_SYSTEM_OPTION)
        {
            CostNum = Math.ceil( CostNum / this.PlayerCount );
        }
        CostNum = CostNum.toString();
        cc.systemEvent.emit(EventName.EVENT_UI_CONSUME_REFRESH , CostNum);
    }

    //获取消耗数量
    public GetGlodConsumeCount() : number
    {
        let ConsumeTable : any = RoomCostConfig.GetCostTable( this.ConsumeID );
        if( ConsumeTable == null)
        {
            return 0;
        } 
        
        let ConsumeCount = ConsumeTable.consume_item_num;
        let ProtoBuf = NetManager.GetProtobuf();
        // 房主付费
        if ( this.PayMode== ProtoBuf.TPaymentMechanism.ROOM_OWNER_OPTION ) 
        {
            return ConsumeCount;
        }
        // AA制付费
        if ( this.PayMode == ProtoBuf.TPaymentMechanism.AA_SYSTEM_OPTION )
            return Math.ceil( ConsumeCount / this.PlayerCount );
        // 大赢家付费
        if ( this.PayMode == ProtoBuf.TPaymentMechanism.BIG_OWNER_OPTION ){
            return ConsumeCount;
        }
        return ConsumeCount;
    }

    //创建房间
    public CreateRoom()
    {
        ChrysanthemumModule.ShowChrysanthemum(99);
        let ProtoBuf = NetManager.GetProtobuf();
        let msg = new ProtoBuf.MsgCreatePrivateRoom();
        msg.room_type		= this.RoomType;
        msg.consume_id		= this.ConsumeID;
        msg.special_kind	= this.SpecialKind;
        msg.pay_ment		= this.PayMode;
        msg.player_number	= this.PlayerCount;   
        let a = this.GetRoomSpecialKind(ProtoBuf.TGameGuanDanSpecial.TGDSK_GDZW);
        let b = this.GetRoomSpecialKind(ProtoBuf.TGameGuanDanSpecial.TGDSK_DL3J);
        let c = this.GetRoomSpecialKind(ProtoBuf.TGameGuanDanSpecial.TGDSK_DL4J);
        this.InitGameModule( this.RoomType );
        NetManager.SendMessage( EventName.NET_DO_CREATE_PRIVATE_ROOM , msg );
        UIManager.DestroyUI(UIType.UI_CREATE_ROOM);
    }

    //查找房间号
    public SendJoinRoom( RoomNumber : number )
    {
        ChrysanthemumModule.ShowChrysanthemum(99);
        if( RoomNumber <= 0 )
        {
            MessageModule.ShowMessage(10);
            ChrysanthemumModule.CloseChrysanthemum();
            return;
        }
        let ProtoBuf : any = NetManager.GetProtobuf();
        let MsgSend : any = new ProtoBuf.MsgEnterPrivateRoom();
        MsgSend.room_id  		= RoomNumber;
        MsgSend.app_name 		= Util.GetAppName();
        NetManager.SendMessage( EventName.NET_DO_JOINTROOM , MsgSend );
    }

    //初始化游戏Module
    private InitGameModule( RoomType )
    {
        this.ReleaseGameModule();

        if(RoomType == "GD_XJ")
        {
            this.CurGameModule = GuanDanModule;
        }
        else
        {}
        this.CurGameModule.Init();
    }
    
    //移除游戏Module
    public ReleaseGameModule()
    {
        if(this.CurGameModule != null)
        {
            this.CurGameModule.OnRelease();
            this.CurGameModule = null;
        }
    }

    //加入房间
    public DoRevcJoinRoom( Stream )
    {
        ChrysanthemumModule.ShowChrysanthemum(99);
        let ProtoBuf = NetManager.GetProtobuf();
        let msg = Stream.detail.msg.ReadProtoBuf( ProtoBuf.MsgUpdateValue );
        let MsgSend 			= new ProtoBuf.MsgEnterPrivateRoom();
		MsgSend.room_id  		= msg.ext64_0;
        MsgSend.app_name 		= Util.GetAppName();

        // MsgSend.game_versione 	= NativeUtil.GetGameVersion();
        this.InitGameModule( msg.str_0 );
		NetManager.SendMessage( EventName.NET_DO_C_ENTER_ROOM , MsgSend );
    }

    //加入比赛房间
    public MatchJoinRoom()
    {
        let key : string = ("GD_Match").toLocaleLowerCase();
        NetManager.SendMessage( EventName.NET_DO_MATCH_JOIN_ROOM );
    }

    //自动进入房间
    public AutoJoinRoom()
    {
        if( PlayerDataModule.IsGameIn() ) return;
        this.SendJoinRoom( parseInt( PlayerDataModule.GetRoomID() ) );
    }

    //回到游戏
    public GoBackGame( RoomName )
    {  
        if(  null == RoomName ) return;
        this.InitGameModule( RoomName );
        this.SetRoomType( RoomName );
        NetManager.SendMessage( EventName.NET_DO_GOBACK_GAME );
    }
}

export default PrivateRoomModule.GetInstance();