import Singleton from "../../Common/Function/Singleton";
import EventName from "../../Common/Event/EventName"
import NetManager from "../../Common/Net/NetManager";
import LinkedList from "../../Common/DataStruct/LinkedList";

//-------------------------------------------------------------------------------------------------
// 玩家数据模块
//-------------------------------------------------------------------------------------------------
class OtherPlayerData
{
    public CurTime     : number    = 0; 
    public OtherData   : any       = null; 
}

class OtherPlayerModule extends Singleton
{
    private OtherPlayer = new Array();

    public Init()
    {
        cc.systemEvent.on( EventName.NET_DO_RECEVESEVEROPI             , this.DoRevcAskOtherData             , this  );
    }

    //暴露玩家信息;
    private DoRevcAskOtherData( Stream )
    {
        let ProtoBuf = NetManager.GetProtobuf();
        let msg = Stream.detail.msg.ReadProtoBuf( ProtoBuf.MsgPlayerInfo );
        let Other = null;
        if( this.OtherPlayer[msg.pid] == null )
        {
            Other = new OtherPlayerData();
            Other.CurTime   = Date.now();
            Other.OtherData = msg; 
            this.OtherPlayer[msg.pid] = Other;
        }
        else
        {
            Other = this.OtherPlayer[msg.pid];
            Other.CurTime   = Date.now();
            Other.OtherData = msg; 
        }
        cc.systemEvent.emit( EventName.EVENT_UI_UIROPI , Other );
    }

    //获取玩家信息
    public GetOtherPlayerData( PID )
    {
        if( PID == 0 ) return;
        if(this.OtherPlayer[PID] == null)
        {
            this.SendAskOtherPlayerData( PID );
            return null;
        }
        return this.OtherPlayer[PID];
    }

    //请求玩家信息
    public SendAskOtherPlayerData( PID )
    {
        let ProtoBuf = NetManager.GetProtobuf();
        let msg = new ProtoBuf.MsgInt();
        msg.value =  PID ;
        NetManager.SendMessage( EventName.NET_DO_RECEVESEVEROPI , msg );
    }
}
export default OtherPlayerModule.GetInstance();
