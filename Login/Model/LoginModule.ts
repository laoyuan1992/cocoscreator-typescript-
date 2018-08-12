import EventName from "../../Common/Event/EventName"
import simple_state_machine from "../../Common/StateMachine/StateMachine"
import MessageConfig from "../../Config/MessageConfig"
import LoginAuthAccountModule from "./LoginAuthAccountModule"
import Singleton  from "../../Common/Function/Singleton"
import NetManager from "../../Common/Net/NetManager"
import { Message } from "../../Common/Net/Message"
import LoginCreateRoleModule from "./LoginCreateRoleModule"
import SceneManager from "../../Scene/SceneManager";
import PlayerDataModule from "../../Player/Model/PlayerDataModule";
import PrivateRoomModule from "../../PrivateRoom/Model/PrivateRoomModule";
import MessageBox from "../../Common/UI/MessageBox";
import ChrysanthemumModule from "../../Chrysanthemum/Model/ChrysanthemumModule";

class LoginModule extends Singleton
{
    private _FSM :simple_state_machine = new simple_state_machine();
    private mTimeID : number           = null;
    private mConnectCount : number     = 0;
    
    // 初始化
    public Init()
    {
        cc.systemEvent.on( EventName.EVENT_DO_LOGIN             , this.DoFSMEvent               , this  );
        cc.systemEvent.on( EventName.NET_DO_LOGIN               , this.DoRevcLogin              , this  );
        cc.systemEvent.on( EventName.NET_DO_S_SYNCLOGINPLAYER   , this.DoRevcSyncLoginPlayer    , this  );
        cc.systemEvent.on( EventName.NET_DO_S_CREATEROLE        , this.DoRevcCreateRole         , this  );
        this.InitFSM();
    }

    // 初始化状态机
    private InitFSM()
    {
        var fsm_param: { [key: string]: any;} = 
        {
            "events" : ["AuthAccount", 
                        "CreateRole", 
                        "LoginGame",
                        "ConnectionService",
                        "SyncData",
                        "EnterHall"],
            "callbacks" : {
                      "onAuthAccount"           : this.DoFSMAuthAccount.bind( this ),
                      "onCreateRole"            : this.DoFSMCreateRole.bind( this ),
                      "onLoginGame"             : this.DoFSMLoginGame.bind( this ),
                      "onConnectionService"     : this.DoFSMConnectionService.bind( this ),
                      "onSyncData"              : this.DoFSMSyncData.bind( this ),
                      "onEnterHall"             : this.DoFSMEnterHall.bind( this )
            }
        }

        this._FSM.setup_state(fsm_param);
    }

    // 切换状态
    private DoFSMEvent( LoginEvent )
    {
        var EventName = LoginEvent.detail.msg;
        this._FSM.do_event(EventName);
    }

    // 状态机回调
    private DoFSMAuthAccount()
    {
        cc.systemEvent.emit( EventName.EVENT_UI_REFRESH_LOGIN_PLAN , { msg : MessageConfig.GetMessage( 5 ) } );
        LoginAuthAccountModule.AuthAccount();
    }

    //请求创建角色
    private DoFSMCreateRole()
    {
        cc.systemEvent.emit( EventName.EVENT_UI_REFRESH_LOGIN_PLAN , { msg : MessageConfig.GetMessage( 6 ) } )
        LoginCreateRoleModule.CreateRole();
    }
    
    //请求登录游戏
    private DoFSMLoginGame()
    {
        cc.systemEvent.emit( EventName.EVENT_UI_REFRESH_LOGIN_PLAN , { msg : MessageConfig.GetMessage( 7 ) })
        let ProtoBuf = NetManager.GetProtobuf();
        let MessageLoginAuth = new ProtoBuf.MessageLoginAuth();
        MessageLoginAuth.account_id    = LoginAuthAccountModule.GetAccountID();
        MessageLoginAuth.client_host   = LoginAuthAccountModule.GetClientHost();
        MessageLoginAuth.client_token  = LoginAuthAccountModule.GetClientToken();
        MessageLoginAuth.user_name     = LoginAuthAccountModule.GetWeChatOpenID();
        NetManager.SendMessage( EventName.NET_DO_LOGIN , MessageLoginAuth );
    }

    //请求连接服务器
    private DoFSMConnectionService()
    {
        let Host = LoginAuthAccountModule.GetConnectHost();
        if( Host == "" ) return;
        NetManager.ConnectServer( Host );
        // 打开定时器
        this.StartTimer();
    }

    //请求同步角色数据
    private DoFSMSyncData()
    {
        cc.systemEvent.emit( EventName.EVENT_UI_REFRESH_LOGIN_PLAN , { msg : MessageConfig.GetMessage( 8 ) } )
        NetManager.SendMessage( EventName.NET_DO_SYNCDATA );
    }

    //进入大厅
    private DoFSMEnterHall()
    {
        cc.systemEvent.emit( EventName.EVENT_UI_REFRESH_LOGIN_PLAN , { msg : MessageConfig.GetMessage( 9 ) } )
        let RoomName = PlayerDataModule.GetRoomName();
        if( RoomName != null )
        {
            //进入游戏
            PrivateRoomModule.GoBackGame( RoomName );
            window["InvitaRoomNum"] = null;
        }
        else if(  window["InvitaRoomNum"] != null )
        {
            //被邀请进入游戏
            PrivateRoomModule.SendJoinRoom( parseInt(window["InvitaRoomNum"] ) );
            window["InvitaRoomNum"] = null;
        }
        else
        {
            // 切换场景
            SceneManager.LoadScene( "Hall" );
        }
    }

    //执行登录消息
    private DoRevcLogin( Stream )
    {
        // 测试例子;
        //let ProtoBuf  = NetManager.GetProtobuf();
        //let MSG       = Stream.detail.msg.ReadProtoBuf( ProtoBuf.MessageLoginAuth );
        //let accountid = MSG.account_id;
        // 服务器当前时间;
        let ServerTime = Stream.detail.msg.ReadInt();
        // 请求用户信息;
        cc.systemEvent.emit(EventName.EVENT_DO_LOGIN ,  {msg : "SyncData"});
    }

    //执行创建角色
    private DoRevcCreateRole( Stream )
    {
        cc.systemEvent.emit(EventName.EVENT_DO_LOGIN,  {msg : "CreateRole"});
    }

    //执行接收登录玩家基础信息
    private DoRevcSyncLoginPlayer( Stream )
    {
        let ProtoBuf = NetManager.GetProtobuf();
        let MsgPlayerInfo = Stream.detail.msg.ReadProtoBuf( ProtoBuf.MsgPlayerInfo );
        //停止计时器
        this.StopTimer();
        ChrysanthemumModule.CloseChrysanthemum();
        // 保存玩家数据;
        PlayerDataModule.RefreshData( MsgPlayerInfo );
        // 切换游戏状态;
        cc.systemEvent.emit( EventName.EVENT_DO_LOGIN , {msg : "EnterHall"} );
    }

    //创建登录定时器
    private StartTimer()
    {
        if( null == this.mTimeID )
        {
            this.mTimeID = setInterval( this.CallBackTimer.bind(this) , 8000 );
        }
    }

    //停止定时器
    private StopTimer()
    {
        this.mConnectCount = 0;
        if( null != this.mTimeID )
        {
            clearInterval(this.mTimeID);
            this.mTimeID = null;
        }
    }

    //定时器执行回调时间
    private CallBackTimer()
    {
        cc.systemEvent.emit( EventName.EVENT_DO_LOGIN , {msg : "ConnectionService"} );
        this.mConnectCount++;
        if(this.mConnectCount >= 3)
        {
            this.StopTimer();
            MessageBox.Instance.Show(1,MessageConfig.GetMessage(36),()=>{
                this.DoFSMConnectionService();
            } , null );
        }
    }
}
export default LoginModule.GetInstance();