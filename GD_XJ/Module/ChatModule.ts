import Singleton from "../../Common/Function/Singleton";
import NetManager from "../../Common/Net/NetManager";
import EventName from "../../Common/Event/EventName";

//-------------------------------------------------------------------------------------------------
// 聊天
//-------------------------------------------------------------------------------------------------

class ChatModule extends Singleton
{
    Init()
    {
        cc.systemEvent.on( EventName.NET_DO_SENDCHAT , this.RecvChatData , this )
    }

    //发送表情
    public SendChatText( ChatString :string , unType)
    {
        let ProtoBuf = NetManager.GetProtobuf();
        let msg = new ProtoBuf.MsgChat();
        msg.text 		= "" + ChatString;
        msg.channel_id 	= unType;
        NetManager.SendMessage( EventName.NET_DO_SENDCHAT , msg );
    }

    // 接收聊天信息
    public RecvChatData( Message )
    {
        let ProtoBuf = NetManager.GetProtobuf();
        let msg = Message.detail.msg.ReadProtoBuf( ProtoBuf.MsgChat );
        if( msg.channel_id == 0 )
        {
            cc.systemEvent.emit( "GD_CHAT_FACE",msg );
        }
        else if( msg.channel_id == 1 )
        {
            cc.systemEvent.emit( "GD_CHAT_TEXT",msg );
        }
    }
}

export default ChatModule.GetInstance();
