import Singleton  from "../../Common/Function/Singleton";
import EventName from "../../Common/Event/EventName"
import Dictionary from "../../Common/DataStruct/Dictionary";
import LinkedList from "../../Common/DataStruct/LinkedList"; 
import NetManager from "../../Common/Net/NetManager";
import Mail from "./Mail";
import ItemModule from "../../Item/Model/ItemModule";
//-------------------------------------------------------------------------------------------------
// 邮件模块
//-------------------------------------------------------------------------------------------------

class MailModule extends Singleton
{
    private mMailTable = new Dictionary();
    private mMailList  = new LinkedList();
    
    // 初始化
    public Init()
    {
        cc.systemEvent.on(EventName.NET_DO_MAIL_SYSTEM_REQUESTMAIL,     this.RecvRequestMail,       this); 
        cc.systemEvent.on(EventName.NET_DO_MAIL_SYSTEM_REWARD,          this.RecvSystemReward,      this);
        cc.systemEvent.on(EventName.NET_DO_MAIL_COMMON_REWARD,          this.RecvCommonReward,      this); 
        cc.systemEvent.on(EventName.NET_DO_MAIL_CHECK,                  this.RecvMailCheck,         this); 
        cc.systemEvent.on(EventName.NET_DO_MAIL_DELETECMAIL,            this.RecvDeleteCMail,       this); 
        cc.systemEvent.on(EventName.NET_DO_MAIL_DELETESMAIL,            this.RecvDeleteSMail,       this); 
    }

    //获取邮件列表
    public GetMailList()
    {
        this.mMailList.Clear();
        let ValueArray = this.mMailTable.GetValuesArray();
        for( let i = 0 ; i < this.mMailTable.Size() ; i++ )
        {
            this.mMailList.Push( ValueArray[i] );
        }
        return this.mMailList;
    }

    //请求邮件列表
    public RequestMailList()
    {
        NetManager.SendMessage( EventName.NET_DO_MAIL_SYSTEM_REQUESTMAIL )
    }

    //接收邮件列表
    private RecvRequestMail( Message )
    {
        let ProtoBuf = NetManager.GetProtobuf();
        let msg = Message.detail.msg.ReadProtoBuf( ProtoBuf.MsgMailList );
        this.mMailTable.Clear();
        this.RecvCommonMailList( msg.commonList );
        this.RecvSystemMailList( msg.systemList );
        //刷新UI
        cc.systemEvent.emit( EventName.EVENT_UI_REFRESH_MAIL );
    }

    //通知显示红点
    private RecvMailCheck(Message)
    {
        cc.systemEvent.emit( EventName.EVENT_UI_REFRESH_MAIL_RED_POINT );
    }

    //接收普通邮件列表
    private RecvCommonMailList( msg_common_list )
    {
        if( null == msg_common_list ) return;
        let IsAutoType = false;

        for( let i = 0 ; i < msg_common_list.length ; i++ )
        {
            let MsgMail = msg_common_list[i];
            let MailData = new Mail();
            //初始化邮件信息
            MailData.MailID = MsgMail.mailid;
            MailData.SendTime = MsgMail.sendtime;
            MailData.Title = MsgMail.title;
            MailData.Content = MsgMail.content;
            MailData.MailKind = MsgMail.type;
            MailData.ItemID = MsgMail.template_id;
            MailData.ItemNums = MsgMail.item_count;
            MailData.IsPrivate = true;
            MailData.RecvState = false;

            if( MailData.IsAutoMailKind() )
            {
                IsAutoType = true;
            }

            this.mMailTable.Add( MailData.MailID , MailData );
        }

        //自动领取
        this.AutoRecvMail();

        //红点显示
        if( ( !IsAutoType ) && msg_common_list.length > 0 )
        {
            cc.systemEvent.emit( EventName.EVENT_UI_REFRESH_MAIL_RED_POINT );
        }
    }

    //接收系统邮件列表
    private RecvSystemMailList( msg_system_list )
    {
        if( null == msg_system_list ) return;

        for( let i = 0 ; i < msg_system_list.length ; i++ )
        {
            let MsgMail = msg_system_list[i];
            let MailData = new Mail();
            //初始化邮件信息
            MailData.MailID = MsgMail.mailid;
            MailData.SendTime = MsgMail.sendtime;
            MailData.Title = MsgMail.title;
            MailData.Content = MsgMail.content;
            MailData.MailKind = MsgMail.type;
            MailData.ItemID = MsgMail.template_id;
            MailData.ItemNums = MsgMail.item_count;
            MailData.IsPrivate = false;
            MailData.RecvState = false;
            this.mMailTable.Add( MailData.MailID , MailData );
        }

        //红点显示
        if(  msg_system_list.length > 0 )
        {
            cc.systemEvent.emit( EventName.EVENT_UI_REFRESH_MAIL_RED_POINT );
        }
    }

    //发送请求领取普通奖励
    public SendRecvCommonReward( MailID )
    {
        let ProtoBuf = NetManager.GetProtobuf();
        let msg = new ProtoBuf.MsgGainReward();
        msg.idx = MailID;
        NetManager.SendMessage( EventName.NET_DO_MAIL_COMMON_REWARD , msg );
    }

    //发送请求领取系统奖励
    public SendRecvSystemReward( MailID )
    {
        let ProtoBuf = NetManager.GetProtobuf();
        let msg = new ProtoBuf.MsgGainReward();
        msg.idx = MailID;
        NetManager.SendMessage( EventName.NET_DO_MAIL_SYSTEM_REWARD , msg );
    }

    //接收普通礼物
    private RecvCommonReward( Message )
    {
        let ProtoBuf = NetManager.GetProtobuf();
        let msg = Message.detail.msg.ReadProtoBuf( ProtoBuf.MsgGainReward );
        let MailData = this.mMailTable.GetItem( msg.idx );
        if( null == MailData ) return;
        //刷新背包
        ItemModule.RefreshItemList( msg.msg_item );
        //刷新领取按钮
        MailData.RecvState = true;
        cc.systemEvent.emit( EventName.EVENT_UI_REFRESH_MAIL_REWARD_STATE , msg.idx );
    }

    //接收系统礼物
    private RecvSystemReward( Message )
    {
        let ProtoBuf = NetManager.GetProtobuf();
        let msg = Message.detail.msg.ReadProtoBuf( ProtoBuf.MsgGainReward );
        let MailData = this.mMailTable.GetItem( msg.idx );
        if( null == MailData ) return;
        //刷新背包
        //刷新领取按钮
        MailData.RecvState = true;
        cc.systemEvent.emit( EventName.EVENT_UI_REFRESH_MAIL_REWARD_STATE , msg.idx );
    }

    //请求删除普通邮件
    public SendDeleteCMail( MailID )
    {
        let ProtoBuf = NetManager.GetProtobuf();
        let msg = new ProtoBuf.MsgDeleteMail();
        msg.idx = MailID;
        NetManager.SendMessage( EventName.NET_DO_MAIL_DELETECMAIL,msg );
    }

    //请求删除系统邮件
    public SendDeleteSMail( MailID )
    {
        let ProtoBuf = NetManager.GetProtobuf();
        let msg = new ProtoBuf.MsgDeleteMail();
        msg.idx = MailID;
        NetManager.SendMessage( EventName.NET_DO_MAIL_DELETESMAIL,msg );
    }

    //删除普通邮件
    private RecvDeleteCMail( Message )
    {
        let MailID = Message.detail.msg.ReadUINT();
        //删除列表中对应邮件
        this.mMailTable.Remove( MailID );
        //刷新UI
        cc.systemEvent.emit(EventName.EVENT_UI_REFRESH_MAIL);
    }   
    
    //删除系统邮件
    private RecvDeleteSMail( Message )
    {
        let MailID = Message.detail.msg.ReadUINT();
        //删除列表中对应邮件
        this.mMailTable.Remove( MailID );
        //刷新UI
        cc.systemEvent.emit(EventName.EVENT_UI_REFRESH_MAIL);
    }

    //获取邮件信息
    public GetMailData( MailID )
    {
        return this.mMailTable.GetItem( MailID );
    }

    //自动领取邮件
    public AutoRecvMail()
    {
        for( let i = 0 ; i <　this.mMailTable.Size() ;i++)
        {
            let MailData = this.mMailTable.GetItem(i);
            if(MailData != null)
            {
                if(MailData.IsPrivate)
                {
                    if( (MailData.IsAutoMailKind()) && (!MailData.RecvState) )
                    {
                        this.SendRecvCommonReward( MailData.MailID );
                    }
                }
            }
        }
    }
}
export default MailModule.GetInstance();
